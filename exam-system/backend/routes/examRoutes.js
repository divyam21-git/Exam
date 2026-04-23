const express = require('express');
const router = express.Router();
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  submitExam,
  getExamResults,
  getMyResults
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getExams)
  .post(protect, authorize('Admin', 'Sub-Admin'), createExam);

router.get('/my-results', protect, authorize('Student'), getMyResults);

router.route('/:id')
  .get(protect, getExamById)
  .put(protect, authorize('Admin', 'Sub-Admin'), updateExam)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteExam);

router.post('/:id/submit', protect, authorize('Student'), submitExam);
router.get('/:id/results', protect, getExamResults);

module.exports = router;
