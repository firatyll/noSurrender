const db = require('../lib/db');

exports.getEnergyLevels = async (req, res) => {
  try {
    // Default userId (mock authentication için)
    const userId = req.query.userId ? parseInt(req.query.userId) : 1;

    const energy = await db.energy.findFirst({ where: { userId } });
    if (!energy) return res.status(404).json({ error: 'Energy not found' });

    const now = new Date();
    const minutesPassed = Math.floor((now - energy.lastRefillAt) / 60000);
    const energyToAdd = Math.floor(minutesPassed / 5);

    let updatedAmount = energy.amount;
    let lastRefillAt = energy.lastRefillAt;

    if (energyToAdd > 0) {
      updatedAmount = Math.min(100, energy.amount + energyToAdd);
      lastRefillAt = new Date(energy.lastRefillAt.getTime() + energyToAdd * 5 * 60000);

      await db.energy.update({
        where: { userId },
        data: {
          amount: updatedAmount,
          lastRefillAt
        }
      });
    }

    res.json({ energy: updatedAmount });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
