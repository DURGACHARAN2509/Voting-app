import express from 'express';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

// create election
router.post('/elections', async (req, res) => {
  const e = new Election(req.body);
  await e.save();
  res.json(e);
});

// update election
router.put('/elections/:id', async (req, res) => {
  const e = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(e);
});

// delete election (and cascade delete candidates & votes optionally)
router.delete('/elections/:id', async (req, res) => {
  await Election.findByIdAndDelete(req.params.id);
  await Candidate.deleteMany({ election: req.params.id });
  // optionally remove votes: await Vote.deleteMany({ election: req.params.id });
  res.json({ message: 'Deleted' });
});

// candidates: add / edit / delete
router.post('/elections/:id/candidates', async (req, res) => {
  const c = new Candidate({ ...req.body, election: req.params.id });
  await c.save();
  res.json(c);
});

router.delete('/candidates/:id', async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.json({ message: 'deleted' });
});

export default router;
