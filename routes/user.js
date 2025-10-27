import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';
import mongoose from 'mongoose';

const router = express.Router();
router.use(authenticate);

// list active elections
router.get('/elections', async (req, res) => {
  const list = await Election.find({ active: true });
  res.json(list);
});

// list candidates for an election
router.get('/elections/:id/candidates', async (req, res) => {
  const candidates = await Candidate.find({ election: req.params.id });
  res.json(candidates);
});

// vote - ensures one vote per user per election
router.post('/elections/:id/vote', async (req, res) => {
  const electionId = req.params.id;
  const { candidateId } = req.body;
  try {
    // create vote - unique index prevents duplicates; catch duplicate key error
    const vote = new Vote({
      election: electionId,
      candidate: candidateId,
      voter: req.user._id
    });
    await vote.save();
    return res.json({ message: 'Vote recorded' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You already voted in this election' });
    console.error(err);
    return res.status(500).json({ message: 'Error' });
  }
});

// view results for an election, broken down by gender
router.get('/elections/:id/results', async (req, res) => {
  const electionId = mongoose.Types.ObjectId(req.params.id);

  // Aggregate votes grouped by candidate and voter gender
  const pipeline = [
    { $match: { election: electionId } },
    // join voter to get gender
    { $lookup: {
        from: 'users',
        localField: 'voter',
        foreignField: '_id',
        as: 'voterInfo'
    }},
    { $unwind: '$voterInfo' },
    // group by candidate and gender
    { $group: {
        _id: { candidate: '$candidate', gender: '$voterInfo.gender' },
        count: { $sum: 1 }
    }},
    // reshape
    { $group: {
        _id: '$_id.candidate',
        byGender: { $push: { gender: '$_id.gender', count: '$count' } },
        total: { $sum: '$count' }
    }},
    // lookup candidate info
    { $lookup: {
        from: 'candidates',
        localField: '_id',
        foreignField: '_id',
        as: 'candidate'
    }},
    { $unwind: '$candidate' },
    { $project: {
        candidateId: '$_id',
        candidateName: '$candidate.name',
        total: 1,
        byGender: 1
    }}
  ];

  const results = await Vote.aggregate(pipeline);
  res.json(results);
});

export default router;
