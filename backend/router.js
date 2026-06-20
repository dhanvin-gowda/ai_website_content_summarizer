import { Router } from 'express';
import { getTopics, createTopic, summarizeUrl, updateTopic, deleteTopic, chatWithTutor } from './collector.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

router.get('/topics', getTopics);
router.post('/topics', createTopic);
router.post('/summarize', summarizeUrl);
router.put('/topics/:id', updateTopic);
router.delete('/topics/:id', deleteTopic);
router.post('/topics/:id/chat', chatWithTutor);

export default router;
