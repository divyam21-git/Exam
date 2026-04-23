const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: mongoose.Schema.ObjectId,
      ref: 'Exam',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        selectedOption: {
          type: Number, // Index of the option selected by the student (-1 if skipped)
          default: -1,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Result', resultSchema);
