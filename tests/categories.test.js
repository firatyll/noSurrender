const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Item Categories', () => {
  describe('Category Coverage', () => {
    test('should have all expected item categories', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      const categories = [...new Set(response.body.cards.map(card => card.category))];
      
      const existingCategories = [
        'Uzun Kılıç',
        'Büyü Asası', 
        'Savaş Baltası',
        'Eğri Kılıç',
        'Kalkan',
        'Büyü Kitabı'
      ];

      categories.forEach(category => {
        expect(existingCategories).toContain(category);
      });

      expect(categories.length).toBeGreaterThanOrEqual(3);
    });

    test('should have different rarity levels', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      const rarities = [...new Set(response.body.cards.map(card => card.rarity))];
      
      const expectedRarities = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      const foundRarities = rarities.filter(rarity => expectedRarities.includes(rarity));
      
      expect(foundRarities.length).toBeGreaterThan(2);
    });
  });

  describe('Category-Specific Progress Tests', () => {
    test('should progress Uzun Kılıç category (max level should fail)', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "1" })
        .expect(400);

      expect(response.body.error).toBe('Card has reached maximum level (3)');
    });

    test('should progress Büyü Asası category (100% progress should fail)', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "2" })
        .expect(400);

      expect(response.body.error).toBe('Card progress is already at 100%');
    });

    test('should successfully progress Savaş Baltası category', async () => {
      const response = await request(app)
        .post(apiEndpoints.progress)
        .send({ cardId: "5" })
        .expect(200);

      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('energy');
      expect(response.body.progress).toBeGreaterThan(0);
    });

    test('should progress Eğri Kılıç category with bulk update', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 3,
          amount: 10,
          userId: 2
        })
        .expect(200);

      expect(response.body.stepsProcessed).toBeGreaterThan(0);
    });

    test('should handle Kalkan category (max level)', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 4,
          amount: 5,
          userId: 2
        })
        .expect(400);

      expect(response.body.error).toBe('Card has reached maximum level (3)');
    });

    test('should progress Büyü Kitabı category', async () => {
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 6,
          amount: 5,
          userId: 2
        })
        .expect(200);

      expect(response.body.stepsProcessed).toBeGreaterThan(0);
    });
  });

  describe('Category Data Integrity', () => {
    test('should have valid category names for all cards', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      response.body.cards.forEach(card => {
        expect(card.category).toBeTruthy();
        expect(typeof card.category).toBe('string');
        expect(card.category.length).toBeGreaterThan(0);
      });
    });

    test('should have valid rarity for all cards', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      const validRarities = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      
      response.body.cards.forEach(card => {
        expect(validRarities).toContain(card.rarity);
      });
    });

    test('should have Turkish category names', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      const turkishCategories = [
        'Uzun Kılıç', 'Büyü Asası', 'Savaş Baltası', 
        'Eğri Kılıç', 'Kalkan', 'Büyü Kitabı'
      ];

      response.body.cards.forEach(card => {
        expect(turkishCategories).toContain(card.category);
      });
    });
  });
}); 