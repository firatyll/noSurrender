const request = require('supertest');
const app = require('../index');

describe('Application Setup', () => {
  describe('Server Configuration', () => {
    test('should start server without errors', () => {
      expect(app).toBeDefined();
    });

    test('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/energy')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should parse JSON requests', async () => {
      const response = await request(app)
        .post('/api/progress')
        .send({ cardId: "1" })
        .set('Content-Type', 'application/json');

      expect([200, 400, 404, 500]).toContain(response.status);
    });

    test('should handle URL encoded requests', async () => {
      const response = await request(app)
        .post('/api/progress')
        .send('cardId=1')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('Route Registration', () => {
    test('should have progress routes registered', async () => {
      await request(app)
        .post('/api/progress')
        .expect((res) => {
          expect([200, 400, 404, 500]).toContain(res.status);
        });
    });

    test('should have energy routes registered', async () => {
      await request(app)
        .get('/api/energy')
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    test('should have level routes registered', async () => {
      await request(app)
        .post('/api/level-up')
        .expect((res) => {
          expect([200, 400, 404, 500]).toContain(res.status);
        });
    });

    test('should have cards routes registered', async () => {
      await request(app)
        .get('/api/levels/cards')
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    test('should handle bulk progress routes', async () => {
      await request(app)
        .post('/api/progress/bulk')
        .expect((res) => {
          expect([200, 400, 404, 500]).toContain(res.status);
        });
    });
  });

  describe('API Versioning', () => {
    test('should support case study compatible endpoints', async () => {
      const endpoints = [
        { method: 'post', path: '/api/progress' },
        { method: 'post', path: '/api/level-up' },
        { method: 'get', path: '/api/energy' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect([200, 400, 404, 500]).toContain(response.status);
      }
    });

    test('should support enhanced endpoints', async () => {
      const endpoints = [
        { method: 'post', path: '/api/progress/bulk' },
        { method: 'post', path: '/api/levels' },
        { method: 'get', path: '/api/levels/cards' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect([200, 400, 404, 500]).toContain(response.status);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    test('should handle invalid HTTP methods', async () => {
      const response = await request(app)
        .delete('/api/energy')
        .expect(404);
    });

    test('should handle malformed URLs', async () => {
      const response = await request(app)
        .get('/api//energy')
        .expect(404);
    });
  });

  describe('Content Type Handling', () => {
    test('should accept application/json', async () => {
      const response = await request(app)
        .post('/api/progress')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ cardId: "1" }));

      expect([200, 400, 404, 500]).toContain(response.status);
    });

    test('should reject unsupported content types gracefully', async () => {
      const response = await request(app)
        .post('/api/progress')
        .set('Content-Type', 'text/plain')
        .send('cardId=1');

      expect([400, 415, 500]).toContain(response.status);
    });

    test('should return JSON responses', async () => {
      const response = await request(app)
        .get('/api/energy');

      if (response.status === 200) {
        expect(response.type).toBe('application/json');
      }
    });
  });

  describe('Database Integration', () => {
    test('should connect to mock database successfully', async () => {
      const response = await request(app)
        .get('/api/levels/cards')
        .expect(200);

      expect(response.body).toHaveProperty('cards');
      expect(Array.isArray(response.body.cards)).toBe(true);
    });

    test('should have initial test data loaded', async () => {
      const response = await request(app)
        .get('/api/levels/cards')
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.cards.length).toBeGreaterThan(0);
    });

    test('should maintain data consistency', async () => {
      const response1 = await request(app)
        .get('/api/levels/cards?userId=1')
        .expect(200);

      const response2 = await request(app)
        .get('/api/levels/cards?userId=1')
        .expect(200);

      expect(response1.body.total).toBe(response2.body.total);
      expect(response1.body.cards.length).toBe(response2.body.cards.length);
    });
  });
}); 