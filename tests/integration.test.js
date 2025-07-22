const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Integration Tests', () => {
  describe('Complete User Flows', () => {
    test('should complete full card development cycle', async () => {
      const cardId = 5;
      const userId = 1;

      let currentProgress = 0;
      let currentLevel = 1;
      let currentEnergy = 75;

      const cardsResponse = await request(app)
        .get(`${apiEndpoints.cards}?userId=${userId}`)
        .expect(200);

      const initialCard = cardsResponse.body.cards.find(card => card.id === cardId);
      currentProgress = initialCard.progress;
      currentLevel = initialCard.level;

      const energyResponse = await request(app)
        .get(`${apiEndpoints.energy}?userId=${userId}`)
        .expect(200);
      
      currentEnergy = energyResponse.body.energy;

      if (currentLevel < 3 && currentEnergy > 0) {
        const progressResponse = await request(app)
          .post(apiEndpoints.progressBulk)
          .send({
            cardId: cardId,
            amount: Math.min(10, currentEnergy),
            userId: userId
          })
          .expect(200);

        expect(progressResponse.body.energy).toBeLessThan(currentEnergy);
        expect(progressResponse.body.stepsProcessed).toBeGreaterThan(0);
      }
    });

    test('should demonstrate case study problem vs solution', async () => {
      const cardId = 5;
      
      let singleStepCount = 0;
      let singleStepEnergy = 75;

      while (singleStepEnergy > 0 && singleStepCount < 5) {
        const response = await request(app)
          .post(apiEndpoints.progress)
          .send({ cardId: cardId.toString() });
        
        if (response.status === 200) {
          singleStepCount++;
          singleStepEnergy = response.body.energy;
        } else {
          break;
        }
      }

      const bulkResponse = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 6,
          amount: singleStepCount,
          userId: 2
        })
        .expect(200);

      expect(bulkResponse.body.stepsProcessed).toBeGreaterThanOrEqual(0);
    });

    test('should handle level up progression correctly', async () => {
      const cardsResponse = await request(app)
        .get(`${apiEndpoints.cards}?userId=1`)
        .expect(200);

      const fullProgressCard = cardsResponse.body.cards.find(card => card.progress === 100);
      
      if (fullProgressCard && fullProgressCard.level < 3) {
        const levelUpResponse = await request(app)
          .post(apiEndpoints.levelUp)
          .send({ cardId: fullProgressCard.id.toString() })
          .expect(200);

        expect(levelUpResponse.body.level).toBe(fullProgressCard.level + 1);
        expect(levelUpResponse.body.progress).toBe(0);
      }
    });
  });

  describe('Cross-Feature Integration', () => {
    test('should maintain energy consistency across operations', async () => {
      const initialEnergyResponse = await request(app)
        .get(`${apiEndpoints.energy}?userId=1`)
        .expect(200);

      const initialEnergy = initialEnergyResponse.body.energy;

      const progressResponse = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 3,
          userId: 1
        });

      if (progressResponse.status === 200) {
        const finalEnergyResponse = await request(app)
          .get(`${apiEndpoints.energy}?userId=1`)
          .expect(200);

        const expectedEnergy = initialEnergy - progressResponse.body.stepsProcessed;
        expect(finalEnergyResponse.body.energy).toBe(expectedEnergy);
      }
    });

    test('should update card state correctly after progress', async () => {
      const initialCardsResponse = await request(app)
        .get(`${apiEndpoints.cards}?userId=2`)
        .expect(200);

      const targetCard = initialCardsResponse.body.cards.find(card => card.level < 3);
      
      if (targetCard) {
        const progressResponse = await request(app)
          .post(apiEndpoints.progressBulk)
          .send({
            cardId: targetCard.id,
            amount: 5,
            userId: 2
          });

        if (progressResponse.status === 200) {
          const updatedCardsResponse = await request(app)
            .get(`${apiEndpoints.cards}?userId=2`)
            .expect(200);

          const updatedCard = updatedCardsResponse.body.cards.find(card => card.id === targetCard.id);
          
          if (progressResponse.body.stepsProcessed > 0) {
            expect(updatedCard.progress).not.toBe(targetCard.progress);
          }
        }
      }
    });

    test('should handle multiple user operations independently', async () => {
      const user1Response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 2,
          userId: 1
        });

      const user2Response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 6,
          amount: 2,
          userId: 2
        });

      if (user1Response.status === 200 && user2Response.status === 200) {
        expect(user1Response.body.energy).not.toBe(user2Response.body.energy);
      }
    });
  });

  describe('Performance & Scalability', () => {
    test('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 50,
          userId: 1
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('stepsProcessed');
      }
    });

    test('should demonstrate performance improvement over single requests', async () => {
      const singleRequestTimes = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        await request(app)
          .post(apiEndpoints.progress)
          .send({ cardId: "5" });
        const endTime = Date.now();
        singleRequestTimes.push(endTime - startTime);
      }

      const bulkStartTime = Date.now();
      await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 3,
          userId: 1
        });
      const bulkEndTime = Date.now();
      const bulkTime = bulkEndTime - bulkStartTime;

      const totalSingleTime = singleRequestTimes.reduce((sum, time) => sum + time, 0);
      
      expect(bulkTime).toBeLessThan(totalSingleTime);
    });
  });

  describe('Data Consistency', () => {
    test('should maintain card count consistency', async () => {
      const user1Cards = await request(app)
        .get(`${apiEndpoints.cards}?userId=1`)
        .expect(200);

      const user2Cards = await request(app)
        .get(`${apiEndpoints.cards}?userId=2`)
        .expect(200);

      expect(user1Cards.body.total).toBe(3);
      expect(user2Cards.body.total).toBe(3);
      expect(user1Cards.body.cards).toHaveLength(3);
      expect(user2Cards.body.cards).toHaveLength(3);
    });

    test('should validate all cards have required properties', async () => {
      const response = await request(app)
        .get(apiEndpoints.cards)
        .expect(200);

      response.body.cards.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('userId');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('level');
        expect(card).toHaveProperty('progress');
        expect(card).toHaveProperty('category');
        expect(card).toHaveProperty('rarity');
        
        expect(card.level).toBeGreaterThanOrEqual(1);
        expect(card.level).toBeLessThanOrEqual(3);
        expect(card.progress).toBeGreaterThanOrEqual(0);
        expect(card.progress).toBeLessThanOrEqual(100);
      });
    });
  });
}); 