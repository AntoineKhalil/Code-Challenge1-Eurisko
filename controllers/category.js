const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Note = require('../models/note');
const Category = require('../models/category');
const User = require('../models/user');

exports.getCategories = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 8;
    try {
      const totalCategories = await category.find().countDocuments();
      const categories = await category.find()
        .populate('creator')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
  
      res.status(200).json({
        message: 'Fetched categories successfully.',
        categories: categories,
        totalCategories: totalCategories
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.createCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.description;
    const note = new Category({
      title: title,
      description: description,
      creator: req.userId
    });
    try {
        await category.save();
        const user = await User.findById(req.userId);
        user.categories.push(Category);
        await user.save();
        io.getIO().emit('categories', {
          action: 'create',
          category: { ...Category._doc, creator: { _id: req.userId, name: user.name } }
        });
        res.status(201).json({
          message: 'Post created successfully!',
          category: Category,
          creator: { _id: user._id, name: user.name }
        });
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
};

exports.getCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const category = await category.findById(categoryId);
    try {
      if (!category) {
        const error = new Error('Could not find the category.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Category fetched.', category: category });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.updateCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const title = req.body.title;
    const description = req.body.description;
    try {
      const catgeory = await category.findById(categoryId).populate('creator');
      if (!Category) {
        const error = new Error('Could not find category.');
        error.statusCode = 404;
        throw error;
      }
      if (Category.creator._id.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      post.title = title;
      post.description = description;
      const result = await category.save();
      io.getIO().emit('categories', { action: 'update', category: result });
      res.status(200).json({ message: 'Note updated!', category: result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.deleteCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    try {
      const category = await category.findById(categoryId);
  
      if (!category) {
        const error = new Error('Could not find the category.');
        error.statusCode = 404;
        throw error;
      }
      if (category.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      await category.findByIdAndRemove(categoryId);
  
      const user = await User.findById(req.userId);
      const note = await Note.findById(req.noteId);
      user.categories.pull(categoryId);
      note.categories.pull(categoryId);
      await user.save();
      await note.save();
      io.getIO().emit('categories', { action: 'delete', category: categoryId });
      res.status(200).json({ message: 'Deleted the category.' });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

