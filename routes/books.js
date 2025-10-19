const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  updateProgress
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(getBooks)
  .post(createBook);

router
  .route('/:id')
  .get(getBook)
  .put(updateBook)
  .delete(deleteBook);

router.patch('/:id/progress', updateProgress);

module.exports = router;
