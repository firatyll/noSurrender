const db = require('../lib/db');

exports.bulkUpdateProgress = async (req, res) => {
  try {
    const { cardId, amount, userId } = req.body;
    
    const validUserId = userId || 1;

    if (!cardId || typeof amount !== 'number' || amount <= 0 || amount > 50) {
      return res.status(400).json({ error: 'Invalid input. Amount must be between 1-50' });
    }

    const card = await db.card.findFirst({ where: { id: parseInt(cardId), userId: validUserId } });
    const energy = await db.energy.findFirst({ where: { userId: validUserId } });

    if (!card || !energy) {
      return res.status(404).json({ error: 'Card or energy not found' });
    }

    const maxSteps = Math.min(
      amount,
      Math.floor(energy.amount),
      Math.floor((100 - card.progress) / 2)
    );

    if (maxSteps <= 0) {
      return res.status(400).json({ error: 'Not enough energy or card already at 100% progress' });
    }

    const newProgress = card.progress + maxSteps * 2;
    const newEnergy = energy.amount - maxSteps;

    await db.$transaction([
      db.card.update({
        where: { id: parseInt(cardId) },
        data: {
          progress: newProgress >= 100 ? 0 : newProgress,
          level: newProgress >= 100 ? card.level + 1 : card.level
        }
      }),
      db.energy.update({
        where: { userId: validUserId },
        data: { amount: newEnergy }
      })
    ]);

    return res.json({
      progress: newProgress >= 100 ? 0 : newProgress,
      level: newProgress >= 100 ? card.level + 1 : card.level,
      energy: newEnergy,
      stepsProcessed: maxSteps
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { cardId } = req.body;
    
    const userId = 1;

    if (!cardId) {
      return res.status(400).json({ error: 'cardId is required' });
    }

    const card = await db.card.findFirst({ where: { id: parseInt(cardId), userId } });
    const energy = await db.energy.findFirst({ where: { userId } });

    if (!card || !energy) {
      return res.status(404).json({ error: 'Card or energy not found' });
    }

    if (energy.amount < 1) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    if (card.progress >= 100) {
      return res.status(400).json({ error: 'Card progress is already at 100%' });
    }

    const newProgress = card.progress + 2;
    const newEnergy = energy.amount - 1; 

    await db.$transaction([
      db.card.update({
        where: { id: parseInt(cardId) },
        data: { progress: newProgress }
      }),
      db.energy.update({
        where: { userId },
        data: { amount: newEnergy }
      })
    ]);

    return res.json({
      progress: newProgress,
      energy: newEnergy
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};