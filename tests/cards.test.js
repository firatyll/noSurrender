const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Card Management', () => {
  describe('GET /api/levels/cards', () => {
    test('should get all cards for default user', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      expect(response.body).toHaveProperty('cards');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('maxLevel');
      expect(Array.isArray(response.body.cards)).toBe(true);
      expect(response.body.maxLevel).toBe(3);
    });

    test('should get cards for user 1', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.cards}?userId=1`)
        .expect(200);

      expect(response.body.cards).toHaveLength(3);
      expect(response.body.total).toBe(3);
      
      const cardNames = response.body.cards.map(card => card.name);
      expect(cardNames).toContain('Ateş Uzun Kılıcı');
      expect(cardNames).toContain('Buz Büyü Asası');
      expect(cardNames).toContain('Rüzgar Savaş Baltası');
    });

    test('should get cards for user 2', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.cards}?userId=2`)
        .expect(200);

      expect(response.body.cards).toHaveLength(3);
      expect(response.body.total).toBe(3);
      
      const cardNames = response.body.cards.map(card => card.name);
      expect(cardNames).toContain('Şimşek Eğri Kılıcı');
      expect(cardNames).toContain('Toprak Kalkanı');
      expect(cardNames).toContain('Karanlık Büyü Kitabı');
    });

    test('should return empty array for non-existent user', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.cards}?userId=999`)
        .expect(200);

      expect(response.body.cards).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    test('should return cards with correct structure', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.cards}?userId=1`)
        .expect(200);

      const card = response.body.cards[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('userId');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('level');
      expect(card).toHaveProperty('progress');
      expect(card).toHaveProperty('category');
      expect(card).toHaveProperty('rarity');
    });

    test('should have max level cards at level 3', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.cards}?userId=1`)
        .expect(200);

      const maxLevelCard = response.body.cards.find(card => card.name === 'Ateş Uzun Kılıcı');
      expect(maxLevelCard.level).toBe(3);
    });
  });
}); 