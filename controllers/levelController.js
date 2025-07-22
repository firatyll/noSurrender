const db = require('../lib/db');

exports.levelUpCard = async (req, res) => {
  try {
    const { cardId, userId } = req.body;
    
    const validUserId = userId || 1;

    if (!cardId) {
      return res.status(400).json({ error: 'cardId is required' });
    }

    const card = await db.card.findFirst({ where: { id: parseInt(cardId), userId: validUserId } });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    if (card.progress < 100) {
      return res.status(400).json({ error: 'Card progress must be 100% to level up' });
    }

    const updatedCard = await db.card.update({
      where: { id: parseInt(cardId) },
      data: {
        progress: 0,
        level: card.level + 1
      }
    });

    res.json({ 
      level: updatedCard.level, 
      progress: updatedCard.progress,
      cardId: parseInt(cardId)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.levelUpCardCaseStudy = async (req, res) => {
  try {
    const { cardId } = req.body;
    
    if (!cardId) {
      return res.status(400).json({ error: 'cardId is required' });
    }

    const card = await db.card.findFirst({ where: { id: parseInt(cardId), userId } });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    if (card.progress < 100) {
      return res.status(400).json({ error: 'Card progress must be 100% to level up' });
    }

    const updatedCard = await db.card.update({
      where: { id: parseInt(cardId) },
      data: {
        progress: 0,
        level: card.level + 1
      }
    });

    res.json({ 
      level: updatedCard.level, 
      progress: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserCards = async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId) : 1;

    const cards = await db.card.findMany({ where: { userId } });
    
    res.json({ 
      cards: cards,
      total: cards.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
