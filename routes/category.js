const express = require('express');
const { body } = require('express-validator');

const category = require('../models/category')
const categoryController = require('../controllers/category');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/categories', isAuth, categoryController.getCategories);

router.post(
    '/category',
    isAuth,
    [
      body('title')
        .trim()
        .isLength({ min: 5 }),
      body('description')
        .trim()
        .isLength({ min: 5 })
    ],
    categoryController.createCategory
);

router.get('/category/:categoryId', isAuth, categoryController.getCategory);

router.put(
    '/category/:categoryId',
    isAuth,
    [
      body('title')
        .trim()
        .isLength({ min: 5 }),
      body('description')
        .trim()
        .isLength({ min: 5 })
    ],
    categoryController.updateCategory
);

router.delete('/category/:categoryId', isAuth, categoryController.deleteCategory);

module.exports = router;


