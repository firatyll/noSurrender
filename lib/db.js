// MOCK DATABASE FILE

class MockDatabase {
  constructor() {
    // Mock users
    this.users = [
      {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        createdAt: new Date('2024-01-02')
      }
    ];

    // Mock energy data
    this.energies = [
      {
        id: 1,
        userId: 1,
        amount: 75,
        lastRefillAt: new Date(Date.now() - 10 * 60000), // 10 minutes ago
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        userId: 2,
        amount: 100,
        lastRefillAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        createdAt: new Date('2024-01-02')
      }
    ];

    // Mock cards data
    this.cards = [
      {
        id: 1,
        userId: 1,
        name: 'Fire Dragon',
        level: 3,
        progress: 60,
        type: 'legendary',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        userId: 1,
        name: 'Ice Wizard',
        level: 2,
        progress: 100,
        type: 'rare',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 3,
        userId: 2,
        name: 'Lightning Bolt',
        level: 1,
        progress: 25,
        type: 'common',
        createdAt: new Date('2024-01-02')
      },
      {
        id: 4,
        userId: 2,
        name: 'Earth Guardian',
        level: 4,
        progress: 80,
        type: 'epic',
        createdAt: new Date('2024-01-02')
      }
    ];
  }

  // Energy operations
  energy = {
    findFirst: (options) => {
      const { where } = options;
      return this.energies.find(energy => {
        if (where.userId) return energy.userId === where.userId;
        if (where.id) return energy.id === where.id;
        return false;
      });
    },

    update: async (options) => {
      const { where, data } = options;
      const energyIndex = this.energies.findIndex(energy => {
        if (where.userId) return energy.userId === where.userId;
        if (where.id) return energy.id === where.id;
        return false;
      });

      if (energyIndex !== -1) {
        this.energies[energyIndex] = {
          ...this.energies[energyIndex],
          ...data,
          updatedAt: new Date()
        };
        return this.energies[energyIndex];
      }
      return null;
    }
  };

  // Card operations
  card = {
    findFirst: (options) => {
      const { where } = options;
      return this.cards.find(card => {
        let match = true;
        if (where.id && card.id !== where.id) match = false;
        if (where.userId && card.userId !== where.userId) match = false;
        return match;
      });
    },

    findMany: (options) => {
      if (!options || !options.where) return this.cards;
      
      const { where } = options;
      return this.cards.filter(card => {
        let match = true;
        if (where.userId && card.userId !== where.userId) match = false;
        if (where.type && card.type !== where.type) match = false;
        return match;
      });
    },

    update: async (options) => {
      const { where, data } = options;
      const cardIndex = this.cards.findIndex(card => {
        let match = true;
        if (where.id && card.id !== where.id) match = false;
        if (where.userId && card.userId !== where.userId) match = false;
        return match;
      });

      if (cardIndex !== -1) {
        this.cards[cardIndex] = {
          ...this.cards[cardIndex],
          ...data,
          updatedAt: new Date()
        };
        return this.cards[cardIndex];
      }
      return null;
    }
  };

  // User operations
  user = {
    findFirst: (options) => {
      const { where } = options;
      return this.users.find(user => {
        if (where.id) return user.id === where.id;
        if (where.username) return user.username === where.username;
        if (where.email) return user.email === where.email;
        return false;
      });
    },

    findMany: () => {
      return this.users;
    }
  };

  // Transaction support for bulk operations
  $transaction = async (operations) => {
    const results = [];
    for (const operation of operations) {
      results.push(await operation);
    }
    return results;
  };
}

// Export a single instance
const db = new MockDatabase();
module.exports = db;
