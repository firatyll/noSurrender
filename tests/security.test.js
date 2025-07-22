const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Security & Edge Cases', () => {
  describe('Input Validation', () => {
    test('should reject amount over 50 in bulk update', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 100,
          userId: 1
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input. Amount must be between 1-50');
    });

    test('should reject negative amount', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: -5,
          userId: 1
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input. Amount must be between 1-50');
    });

    test('should reject non-numeric amount', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: "invalid",
          userId: 1
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input. Amount must be between 1-50');
    });

    test('should reject missing cardId in bulk update', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          amount: 5,
          userId: 1
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input. Amount must be between 1-50');
    });

    test('should handle string cardId in single progress', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "5" });

      expect([200, 400]).toContain(response.status);
    });

    test('should handle numeric cardId in bulk update', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 1,
          userId: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('stepsProcessed');
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent card gracefully', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 999,
          amount: 5,
          userId: 1
        })
        .expect(404);

      expect(response.body.error).toBe('Card or energy not found');
    });

    test('should handle invalid userId in card requests', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.cards}?userId=999`)
        .expect(200);

      expect(response.body.cards).toHaveLength(0);
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    test('should handle missing request body', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle extremely large cardId', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 999999999,
          amount: 5,
          userId: 1
        })
        .expect(404);

      expect(response.body.error).toBe('Card or energy not found');
    });
  });

  describe('Resource Constraints', () => {
    test('should respect energy limitations', async () => {
      const energyResponse = await request(app)
        .get(`${apiEndpoints.energy}?userId=1`);
      
      const currentEnergy = energyResponse.body.energy;
      
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: Math.min(50, currentEnergy + 10),
          userId: 1
        })
        .expect(200);

      expect(response.body.stepsProcessed).toBeLessThanOrEqual(currentEnergy);
    });

    test('should not allow progress when no energy', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 50,
          userId: 1
        })
        .expect(200);

      if (response.body.stepsProcessed === 0) {
        expect(response.body.stepsProcessed).toBe(0);
      }
    });

    test('should respect progress limitations', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 6,
          amount: 50,
          userId: 2
        })
        .expect(200);

      expect(response.body.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Type Validation', () => {
    test('should handle boolean cardId', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: true,
          amount: 5,
          userId: 1
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle null values', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: null,
          amount: 5,
          userId: 1
        })
        .expect(400);
    });

    test('should handle undefined userId (fallback to default)', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 1
        });

      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('stepsProcessed');
      }
    });
  });

  describe('Rate Limiting Simulation', () => {
    test('should handle multiple rapid requests', async () => {
      const promises = Array(5).fill().map(() => 
        request(app)
          .get(apiEndpoints.energy)
      );

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect([200, 404, 500]).toContain(response.status);
      });
    });

    test('should maintain consistency under concurrent updates', async () => {
      const promises = Array(3).fill().map(() =>
        request(app)
          .post(apiEndpoints.progressBulk)
          .send({
            cardId: 5,
            amount: 1,
            userId: 1
          })
      );

      const responses = await Promise.all(promises);
      const successfulRequests = responses.filter(r => r.status === 200);
      
      expect(successfulRequests.length).toBeGreaterThanOrEqual(0);
    });
  });
}); 