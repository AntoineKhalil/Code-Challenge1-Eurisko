const express = require('express');
const { body } = require('express-validator');

const noteController = require('../controllers/notes');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/notes', isAuth, noteController.getNotes);

router.post(
    '/note',
    isAuth,
    [
      body('title')
        .trim()
        .isLength({ min: 5 }),
      body('content')
        .trim()
        .isLength({ min: 5 })
    ],
    noteController.createNote
);

router.get('/note/:noteId', isAuth, noteController.getNote);

router.put(
    '/note/:noteId',
    isAuth,
    [
      body('title')
        .trim()
        .isLength({ min: 5 }),
      body('content')
        .trim()
        .isLength({ min: 5 })
    ],
    noteController.updateNote
);

router.delete('/note/:noteId', isAuth, noteController.deleteNote);

module.exports = router;






