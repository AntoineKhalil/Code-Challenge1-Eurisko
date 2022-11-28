const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const noteRoutes = require('./routes/note');
const categoryRoutes = require('./routes/category');
const authRoutes = require('./routes/auth');
const note = require('./models/note');
const category = require('./models/category');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
  
app.use('/note', noteRoutes);
app.use('/category', categoryRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

mongoose
  .connect(
    'mongodb+srv://antoinekhalil:Aei46kms@cluster0.jqnxkmr.mongodb.net/test?retryWrites=true&w=majority'
  )
  .then(result => {
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch(err => console.log(err));

searchTags = async(req, res) => {
  key = req.key;
  db.notes.find({tags: {$all: [key]}});
  res.status(200).json({ message: 'Found Tags', notes: note});
};

app.use('/search/:key', searchTags);

  


