const SavingsChallenge = require('../models/SavingsChallenge');
const User = require('../models/User');

exports.getChallenges = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status === 'active') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    }
    if (status === 'ended') {
      query.endDate = { $lt: new Date() };
    }

    const challenges = await SavingsChallenge.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const challengesWithParticipation = challenges.map(challenge => {
      const isParticipant = challenge.participants.some(
        p => p.user.toString() === req.userId.toString()
      );
      return { ...challenge.toJSON(), isParticipant };
    });

    res.json({ success: true, challenges: challengesWithParticipation });
  } catch (error) {
    console.error('GetChallenges error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await SavingsChallenge.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('participants.user', 'firstName lastName');
    
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const userParticipation = challenge.participants.find(
      p => p.user._id.toString() === req.userId.toString()
    );

    res.json({ success: true, challenge, userParticipation });
  } catch (error) {
    console.error('GetChallengeById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    const { title, description, type, targetAmount, durationDays, rewardPoints, category, rules, startDate, endDate, isPublic, icon, color } = req.body;

    const challenge = await SavingsChallenge.create({
      title,
      description,
      type: type || 'daily_saving',
      targetAmount,
      durationDays,
      rewardPoints: rewardPoints || 100,
      category: category || 'general',
      rules: rules || [],
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: req.userId,
      icon: icon || 'Trophy',
      color: color || '#f59e0b',
      participants: [{
        user: req.userId,
        currentAmount: 0,
        streak: 0
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('CreateChallenge error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await SavingsChallenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const isAlreadyParticipant = challenge.participants.some(
      p => p.user.toString() === req.userId.toString()
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ success: false, message: 'You are already in this challenge' });
    }

    challenge.participants.push({
      user: req.userId,
      currentAmount: 0,
      streak: 0
    });

    await challenge.save();

    res.json({ success: true, message: 'Joined challenge successfully', challenge });
  } catch (error) {
    console.error('JoinChallenge error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { amount } = req.body;
    const challenge = await SavingsChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const participant = challenge.participants.find(
      p => p.user.toString() === req.userId.toString()
    );

    if (!participant) {
      return res.status(400).json({ success: false, message: 'You have not joined this challenge' });
    }

    participant.currentAmount += amount;
    participant.completedDays.push(new Date());
    participant.streak += 1;

    await challenge.save();

    if (participant.currentAmount >= challenge.targetAmount) {
      const user = await User.findById(req.userId);
      user.softLifeScore += challenge.rewardPoints;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      participant
    });
  } catch (error) {
    console.error('UpdateProgress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await SavingsChallenge.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found or you are not the creator' });
    }

    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('DeleteChallenge error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
