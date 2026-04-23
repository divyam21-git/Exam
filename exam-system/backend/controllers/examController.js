const Exam = require('../models/Exam');
const Result = require('../models/Result');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res) => {
  try {
    let exams;
    if (req.user.role === 'Admin') {
      exams = await Exam.find().populate('creator', 'name email');
    } else if (req.user.role === 'Sub-Admin') {
      exams = await Exam.find({ creator: req.user.id }).populate('creator', 'name email');
    } else {
      // Students only see published exams
      exams = await Exam.find({ status: 'Published' }).select('-questions.correctAnswer');
    }
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single exam by ID
// @route   GET /api/exams/:id
// @access  Private
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Hide correct answers for students
    if (req.user.role === 'Student') {
      if (exam.status !== 'Published') {
        return res.status(403).json({ message: 'Exam is not available' });
      }
      
      const studentExam = exam.toObject();
      studentExam.questions.forEach(q => delete q.correctAnswer);
      return res.status(200).json(studentExam);
    }

    // Sub-Admin can only view their own exams
    if (req.user.role === 'Sub-Admin' && exam.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this exam' });
    }

    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an exam
// @route   POST /api/exams
// @access  Private (Admin, Sub-Admin)
exports.createExam = async (req, res) => {
  try {
    const { title, description, duration, questions, status } = req.body;

    const exam = new Exam({
      title,
      description,
      duration,
      questions,
      status,
      creator: req.user.id,
    });

    const createdExam = await exam.save();
    res.status(201).json(createdExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an exam
// @route   PUT /api/exams/:id
// @access  Private (Admin, Sub-Admin)
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check authorization
    if (req.user.role === 'Sub-Admin' && exam.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin, Sub-Admin)
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check authorization
    if (req.user.role === 'Sub-Admin' && exam.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    await exam.deleteOne();
    res.status(200).json({ message: 'Exam removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an exam
// @route   POST /api/exams/:id/submit
// @access  Private (Student)
exports.submitExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.status !== 'Published') {
      return res.status(400).json({ message: 'Cannot submit to an unpublished exam' });
    }

    // Check if student already submitted
    const existingResult = await Result.findOne({ exam: req.params.id, student: req.user.id });
    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted this exam' });
    }

    const studentAnswers = req.body.answers; // Expected: [{ questionId, selectedOption }]
    
    let score = 0;
    let totalPoints = 0;
    const processedAnswers = [];

    exam.questions.forEach(question => {
      totalPoints += question.points;
      
      const studentAnswer = studentAnswers.find(a => a.questionId === question._id.toString());
      let isCorrect = false;
      let selectedOption = -1;

      if (studentAnswer) {
        selectedOption = studentAnswer.selectedOption;
        if (selectedOption === question.correctAnswer) {
          isCorrect = true;
          score += question.points;
        }
      }

      processedAnswers.push({
        questionId: question._id,
        selectedOption,
        isCorrect
      });
    });

    const result = new Result({
      student: req.user.id,
      exam: exam._id,
      score,
      totalPoints,
      answers: processedAnswers
    });

    await result.save();
    
    res.status(201).json({
      message: 'Exam submitted successfully',
      score,
      totalPoints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exam results
// @route   GET /api/exams/:id/results
// @access  Private
exports.getExamResults = async (req, res) => {
  try {
    const examId = req.params.id;

    if (req.user.role === 'Student') {
      const result = await Result.findOne({ exam: examId, student: req.user.id }).populate('exam', 'title');
      return res.status(200).json(result ? [result] : []);
    } else {
      // Admin/SubAdmin viewing all results for this exam
      const results = await Result.find({ exam: examId }).populate('student', 'name email');
      return res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in student's results
// @route   GET /api/exams/my-results
// @access  Private (Student)
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id }).populate('exam', 'title description');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
