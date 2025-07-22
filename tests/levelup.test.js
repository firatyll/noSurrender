const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Level Management', () => {
  describe('POST /api/level-up (Case Study Compatible)', () => {
    test('should level up card with 100% progress', async () => {
      const response = await request(app)
        .post(apiEndpoints.levelUp)
        .send({ cardId: "2" })
        .expect(200);

      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('progress');
      expect(response.body.level).toBe(3);
      expect(response.body.progress).toBe(0);
    });

    test('should reject level up without 100% progress', async () => {
      const response = await request(app)
        .post(apiEndpoints.levelUp)
        .send({ cardId: "5" })
        .expect(400);

      expect(response.body.error).toBe('Card progress must be 100% to level up');
    });

    test('should reject level up for max level card', async () => {
      const response = await request(app)
        .post(apiEndpoints.levelUp)
        .send({ cardId: "1" })
        .expect(400);

      expect(response.body.error).toBe('Card has already reached maximum level (3)');
    });

    test('should reject missing cardId', async () => {
      const response = await request(app)
        .post(apiEndpoints.levelUp)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('cardId is required');
    });

    test('should handle non-existent card', async () => {
      const response = await request(app)
        .post(apiEndpoints.levelUp)
        .send({ cardId: "999" })
        .expect(404);

      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('POST /api/levels (Enhanced Level Up)', () => {
    test('should provide detailed level up response for valid card', async () => {
      const cardsResponse = await request(app)
        .get('/api/levels/cards?userId=2')
        .expect(200);

      const cardWith100Progress = cardsResponse.body.cards.find(card => 
        card.progress === 100 && card.level < 3
      );

      if (cardWith100Progress) {
        const response = await request(app)
          .post('/api/levels')
          .send({ cardId: cardWith100Progress.id, userId: 2 })
          .expect(200);

        expect(response.body).toHaveProperty('level');
        expect(response.body).toHaveProperty('progress');
        expect(response.body).toHaveProperty('cardId');
        expect(response.body).toHaveProperty('maxLevelReached');
      } else {
        const response = await request(app)
          .post('/api/levels')
          .send({ cardId: 6, userId: 2 })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });
}); 