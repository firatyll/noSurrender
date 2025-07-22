const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Energy Management', () => {
  describe('GET /api/energy', () => {
    test('should get energy level for default user', async () => {
      const response = await request(app)
        .get(apiEndpoints.energy)
        .expect(200);

      expect(response.body).toHaveProperty('energy');
      expect(typeof response.body.energy).toBe('number');
      expect(response.body.energy).toBeGreaterThanOrEqual(0);
      expect(response.body.energy).toBeLessThanOrEqual(100);
    });

    test('should get energy level for specific user', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.energy}?userId=1`)
        .expect(200);

      expect(response.body).toHaveProperty('energy');
      expect(response.body.energy).toBeGreaterThanOrEqual(75);
      expect(response.body.energy).toBeLessThanOrEqual(100);
    });

    test('should get energy level for user 2', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.energy}?userId=2`)
        .expect(200);

      expect(response.body).toHaveProperty('energy');
      expect(response.body.energy).toBe(100);
    });

    test('should handle invalid userId gracefully', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.energy}?userId=999`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Energy not found');
    });

    test('should return energy as number when userId is string', async () => {
      const response = await request(app)
        .get(`${apiEndpoints.energy}?userId=1`)
        .expect(200);

      expect(typeof response.body.energy).toBe('number');
    });
  });
}); 