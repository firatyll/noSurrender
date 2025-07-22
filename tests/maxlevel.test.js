const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Maximum Level Constraints', () => {
  describe('Level 3 Restrictions', () => {
    test('should prevent progress on level 3 cards via single step', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "1" })
        .expect(400);

      expect(response.body.error).toBe('Card has reached maximum level (3)');
    });

    test('should prevent progress on level 3 cards via bulk update', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 1,
          amount: 5,
          userId: 1
        })
        .expect(400);

      expect(response.body.error).toBe('Card has reached maximum level (3)');
    });

    test('should prevent level up on level 3 cards', async () => {
      const response = await request(app)
        .post(apiEndpoints.levelUp)
        .send({ cardId: "1" })
        .expect(400);

      expect(response.body.error).toBe('Card has already reached maximum level (3)');
    });

    test('should stop auto level up at level 3', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 6,
          amount: 50,
          userId: 2
        })
        .expect(200);

      expect(response.body.level).toBeLessThanOrEqual(3);
      if (response.body.level === 3) {
        expect(response.body.maxLevelReached).toBe(true);
      }
    });

    test('should identify max level cards in cards list', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.cards}?userId=1`)
        .expect(200);

      const maxLevelCards = response.body.cards.filter(card => card.level === 3);
      expect(maxLevelCards.length).toBeGreaterThan(0);
      
      const atesCard = response.body.cards.find(card => card.name === 'Ateş Uzun Kılıcı');
      expect(atesCard.level).toBe(3);
    });
  });

  describe('Level Progression Validation', () => {
    test('should not exceed level 3 in any scenario', async () => {
      const cardsResponse = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      const allCards = cardsResponse.body.cards;
      const invalidCards = allCards.filter(card => card.level > 3);
      expect(invalidCards).toHaveLength(0);
    });

    test('should return maxLevel in API responses', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      expect(response.body.maxLevel).toBe(3);
    });

    test('should include maxLevelReached in bulk progress response', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 1,
          userId: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('maxLevelReached');
      expect(typeof response.body.maxLevelReached).toBe('boolean');
    });
  });
}); 