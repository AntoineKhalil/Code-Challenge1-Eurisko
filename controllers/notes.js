const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Note = require('../models/note');
const Category = require('../models/category');
const User = require('../models/user');

exports.getNotes = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 4;
    try {
      const totalItems = await Note.find().countDocuments();
      const notes = await Note.find()
        .populate('creator')
        .populate('category')
        .sort({ dateAdded: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      res.status(200).json({
        message: 'Fetched notes successfully.',
        notes: notes,
        totalItems: totalItems
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.createNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const note = new Note({
      title: title,
      content: content,
      dateAdded: new Date(),
      creator: req.userId,
      category: req.categoryId,
      tags: findTags(content)
    });
    try {
      await note.save();
      const user = await User.findById(req.userId);
      const category = await Category.findById(req.categoryId);
      user.notes.push(note);
      category.notes.push(note);
      await user.save();
      await category.save();
      io.getIO().emit('notes', {
        action: 'create',
        note: { ...note._doc, creator: { _id: req.userId, name: user.name }, category: { _id: req.categoryId, name: category.name}}
      });
      res.status(201).json({
        message: 'Note created successfully!',
        note: note,
        creator: { _id: user._id, name: user.name },
        category: { _id: category._id, name: category.name }
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
    

};

exports.getNote = async (req, res, next) => {
    const noteId = req.params.noteId;
    const note = await Note.findById(noteId);
    try {
      if (!note) {
        const error = new Error('Could not find the note.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Note fetched.', note: note });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.updateNote = async (req, res, next) => {
    const noteId = req.params.noteId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    try {
      const note = await Note.findById(noteId).populate('creator').populate('category');
      if (!note) {
        const error = new Error('Could not find note.');
        error.statusCode = 404;
        throw error;
      }
      if (note.creator._id.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      note.title = title;
      note.content = content;
      note.dateAdded = new Date();
      note.tags = findTags(content);
      const result = await note.save();
      io.getIO().emit('notes', { action: 'update', note: result });
      res.status(200).json({ message: 'Note updated!', note: result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.deleteNote = async (req, res, next) => {
    const noteId = req.params.noteId;
    try {
      const note = await Note.findById(noteId);
  
      if (!note) {
        const error = new Error('Could not find the note.');
        error.statusCode = 404;
        throw error;
      }
      if (note.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      await Note.findByIdAndRemove(noteId);
  
      const user = await User.findById(req.userId);
      const category = await Category.findById(req.categoryId);
      user.notes.pull(noteId);
      category.notes.pull(noteId);
      await user.save();
      await category.save();
      io.getIO().emit('notes', { action: 'delete', note: noteId });
      res.status(200).json({ message: 'Deleted the note.' });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

function findTags(note) {
  return note.match(/#\w+/g).map(v => v.replace('#', ''));
}




