import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  status: { type: String, enum: ['needs_practice', 'mastered'], default: 'needs_practice' }
});

const studyTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  summary: { type: String, required: true },
  notes: { type: String, required: true },
  content: { type: String, required: true },
  flashcards: [flashcardSchema],
  summaryCompleted: { type: Boolean, default: false },
  notesCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const StudyTopic = mongoose.model('StudyTopic', studyTopicSchema);

export default StudyTopic;
