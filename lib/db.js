// MOCK DATABASE
class MockDatabase {
  constructor() {
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

    this.energies = [
      {
        id: 1,
        userId: 1,
        amount: 75,
        lastRefillAt: new Date(Date.now() - 10 * 60000),
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        userId: 2,
        amount: 100,
        lastRefillAt: new Date(Date.now() - 30 * 60000),
        createdAt: new Date('2024-01-02')
      }
    ];

    this.cards = [
      {
        id: 1,
        userId: 1,
        name: 'Ateş Uzun Kılıcı',
        level: 3,
        progress: 60,
        category: 'Uzun Kılıç',
        rarity: 'legendary',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        userId: 1,
        name: 'Buz Büyü Asası',
        level: 2,
        progress: 100,
        category: 'Büyü Asası',
        rarity: 'rare',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 3,
        userId: 2,
        name: 'Şimşek Eğri Kılıcı',
        level: 1,
        progress: 25,
        category: 'Eğri Kılıç',
        rarity: 'common',
        createdAt: new Date('2024-01-02')
      },
      {
        id: 4,
        userId: 2,
        name: 'Toprak Kalkanı',
        level: 3,
        progress: 80,
        category: 'Kalkan',
        rarity: 'epic',
        createdAt: new Date('2024-01-02')
      },
      {
        id: 5,
        userId: 1,
        name: 'Rüzgar Savaş Baltası',
        level: 1,
        progress: 0,
        category: 'Savaş Baltası',
        rarity: 'uncommon',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 6,
        userId: 2,
        name: 'Karanlık Büyü Kitabı',
        level: 2,
        progress: 50,
        category: 'Büyü Kitabı',
        rarity: 'legendary',
        createdAt: new Date('2024-01-02')
      }
    ];

    this.MAX_LEVEL = 3;
  }

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
        if (where.category && card.category !== where.category) match = false;
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

  $transaction = async (operations) => {
    const results = [];
    for (const operation of operations) {
      results.push(await operation);
    }
    return results;
  };
}

const db = new MockDatabase();
module.exports = db;
