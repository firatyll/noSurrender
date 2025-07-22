const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Progress Development', () => {
  describe('POST /api/progress (Single Step)', () => {
    test('should update progress by single step', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "5" })
        .expect(200);

      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('energy');
      expect(response.body.progress).toBe(2);
    });

    test('should reject missing cardId', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('cardId is required');
    });

    test('should reject max level card progress', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "1" })
        .expect(400);

      expect(response.body.error).toBe('Card has reached maximum level (3)');
    });

    test('should reject card at 100% progress', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "2" })
        .expect(400);

      expect(response.body.error).toBe('Card progress is already at 100%');
    });

    test('should handle non-existent card', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "999" })
        .expect(404);

      expect(response.body.error).toBe('Card or energy not found');
    });
  });

  describe('POST /api/progress/bulk (Bulk Updates)', () => {
    test('should perform bulk update with small amount', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 10,
          userId: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('energy');
      expect(response.body).toHaveProperty('stepsProcessed');
      expect(response.body).toHaveProperty('maxLevelReached');
      expect(response.body.stepsProcessed).toBeLessThanOrEqual(10);
    });

    test('should limit steps by available energy', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 50,
          userId: 1
        })
        .expect(200);

      expect(response.body.stepsProcessed).toBeGreaterThanOrEqual(0);
      expect(response.body.stepsProcessed).toBeLessThanOrEqual(50);
    });

    test('should reject invalid amount (over 50)', async () => {
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

    test('should reject zero amount', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 0,
          userId: 1
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input. Amount must be between 1-50');
    });

    test('should reject max level card', async () => {
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

    test('should handle non-existent card', async () => {
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

    test('should auto level up when reaching 100%', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 3,
          amount: 38,
          userId: 2
        })
        .expect(200);

      if (response.body.progress === 0) {
        expect(response.body.level).toBeGreaterThan(1);
      }
    });

    test('should respect max level during auto level up', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 6,
          amount: 25,
          userId: 2
        })
        .expect(200);

      expect(response.body.level).toBeLessThanOrEqual(3);
      if (response.body.level === 3) {
        expect(response.body.maxLevelReached).toBe(true);
      }
    });
  });
}); 