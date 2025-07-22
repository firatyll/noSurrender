const request = require('supertest');
const app = require('../index');

const baseURL = 'http://localhost:3000';

const testData = {
  users: {
    user1: { id: 1, energy: 75 },
    user2: { id: 2, energy: 100 }
  },
  cards: {
    maxLevelCard: { id: 1, name: 'Ateş Uzun Kılıcı', level: 3, progress: 60, userId: 1 },
    fullProgressCard: { id: 2, name: 'Buz Büyü Asası', level: 2, progress: 100, userId: 1 },
    lowLevelCard: { id: 5, name: 'Rüzgar Savaş Baltası', level: 1, progress: 0, userId: 1 },
    midProgressCard: { id: 3, name: 'Şimşek Eğri Kılıcı', level: 1, progress: 25, userId: 2 },
    maxLevelCard2: { id: 4, name: 'Toprak Kalkanı', level: 3, progress: 80, userId: 2 },
    bookCard: { id: 6, name: 'Karanlık Büyü Kitabı', level: 2, progress: 50, userId: 2 }
  }
};

const apiEndpoints = {
  progress: '/api/progress',
  progressBulk: '/api/progress/bulk',
  levelUp: '/api/level-up',
  energy: '/api/energy',
  cards: '/api/levels/cards'
};

module.exports = {
  testData,
  apiEndpoints,
  baseURL
}; 