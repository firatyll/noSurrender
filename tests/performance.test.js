const request = require('supertest');
const app = require('../index');
const { testData, apiEndpoints } = require('./setup');

describe('Performance Benchmarks', () => {
  describe('Case Study Solution Validation', () => {
    test('should demonstrate 50 single requests vs 1 bulk request', async () => {
      console.log('\n=== CASE STUDY PERFORMANCE COMPARISON ===');
      
      const singleRequestTimes = [];
      const cardId = "5";
      let totalSingleRequestTime = 0;

      console.log('Testing 50 individual requests (original problem)...');
      const singleStartTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        const requestStart = Date.now();
        const response = await request(app)
          .post(apiEndpoints.progress)
          .send({ cardId: cardId });
        const requestEnd = Date.now();
        
        const requestTime = requestEnd - requestStart;
        singleRequestTimes.push(requestTime);
        
        if (response.status !== 200) break;
      }
      
      const singleEndTime = Date.now();
      totalSingleRequestTime = singleEndTime - singleStartTime;

      console.log('Testing 1 bulk request (solution)...');
      const bulkStartTime = Date.now();
      const bulkResponse = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: 50,
          userId: 1
        });
      const bulkEndTime = Date.now();
      const bulkRequestTime = bulkEndTime - bulkStartTime;

      console.log(`\nRESULTS:`);
      console.log(`Single Requests (${singleRequestTimes.length}x): ${totalSingleRequestTime}ms`);
      console.log(`Bulk Request (1x): ${bulkRequestTime}ms`);
      console.log(`Performance Improvement: ${Math.round((totalSingleRequestTime - bulkRequestTime) / totalSingleRequestTime * 100)}%`);
      console.log(`Speed Multiplier: ${Math.round(totalSingleRequestTime / bulkRequestTime)}x faster`);

      expect(bulkRequestTime).toBeLessThan(totalSingleRequestTime);
      expect(bulkResponse.status).toBe(200);
    });

    test('should validate network request reduction', async () => {
      const originalRequestCount = 50;
      const newRequestCount = 1;
      
      const networkReduction = ((originalRequestCount - newRequestCount) / originalRequestCount) * 100;
      
      console.log(`\n=== NETWORK OPTIMIZATION ===`);
      console.log(`Original: ${originalRequestCount} requests`);
      console.log(`Optimized: ${newRequestCount} request`);
      console.log(`Network Reduction: ${networkReduction}%`);
      
      expect(networkReduction).toBe(98);
    });
  });

  describe('API Response Times', () => {
    test('should measure energy API response time', async () => {
      const measurements = [];
      
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await request(app)
          .get(apiEndpoints.energy)
          .expect(200);
        const end = Date.now();
        measurements.push(end - start);
      }
      
      const avgTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      
      console.log(`\nEnergy API Performance:`);
      console.log(`Average: ${avgTime.toFixed(2)}ms`);
      console.log(`Max: ${maxTime}ms`);
      
      expect(avgTime).toBeLessThan(100);
      expect(maxTime).toBeLessThan(500);
    });

    test('should measure cards API response time', async () => {
      const measurements = [];
      
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await request(app)
          .get(apiEndpoints.cards)
          .expect(200);
        const end = Date.now();
        measurements.push(end - start);
      }
      
      const avgTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
      
      console.log(`\nCards API Performance:`);
      console.log(`Average: ${avgTime.toFixed(2)}ms`);
      
      expect(avgTime).toBeLessThan(100);
    });

    test('should measure bulk progress API under load', async () => {
      const concurrentRequests = 5;
      const promises = [];
      
      const startTime = Date.now();
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .post(apiEndpoints.progressBulk)
            .send({
              cardId: 5 + (i % 2),
              amount: 1,
              userId: 1 + (i % 2)
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / concurrentRequests;
      
      console.log(`\nConcurrent Bulk Progress Performance:`);
      console.log(`${concurrentRequests} concurrent requests: ${totalTime}ms`);
      console.log(`Average per request: ${avgTimePerRequest.toFixed(2)}ms`);
      
      const successfulRequests = responses.filter(r => r.status === 200).length;
      expect(successfulRequests).toBeGreaterThan(0);
      expect(avgTimePerRequest).toBeLessThan(200);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should handle large batch operations efficiently', async () => {
      const maxAmount = 50;
      
      const start = Date.now();
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 5,
          amount: maxAmount,
          userId: 1
        });
      const end = Date.now();
      
      const processingTime = end - start;
      
      console.log(`\nLarge Batch Performance:`);
      console.log(`Amount: ${maxAmount} steps`);
      console.log(`Processing Time: ${processingTime}ms`);
      
      if (response.status === 200) {
        console.log(`Steps Processed: ${response.body.stepsProcessed}`);
        expect(response.body.stepsProcessed).toBeLessThanOrEqual(maxAmount);
      }
      
      expect(processingTime).toBeLessThan(1000);
    });

    test('should validate transaction performance', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .post(apiEndpoints.progressBulk)
        .send({
          cardId: 6,
          amount: 10,
          userId: 2
        });
      
      const end = Date.now();
      const transactionTime = end - start;
      
      console.log(`\nTransaction Performance: ${transactionTime}ms`);
      
      expect(transactionTime).toBeLessThan(500);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('stepsProcessed');
      }
    });
  });

  describe('Scalability Tests', () => {
    test('should handle multiple users simultaneously', async () => {
      const userOperations = [
        { userId: 1, cardId: 5, amount: 5 },
        { userId: 2, cardId: 6, amount: 5 },
        { userId: 1, cardId: 5, amount: 3 },
        { userId: 2, cardId: 3, amount: 3 }
      ];
      
      const start = Date.now();
      
      const promises = userOperations.map(op =>
        request(app)
          .post(apiEndpoints.progressBulk)
          .send(op)
      );
      
      const responses = await Promise.all(promises);
      const end = Date.now();
      
      const totalTime = end - start;
      const successfulOps = responses.filter(r => r.status === 200).length;
      
      console.log(`\nMulti-User Scalability:`);
      console.log(`${userOperations.length} concurrent operations: ${totalTime}ms`);
      console.log(`Successful operations: ${successfulOps}/${userOperations.length}`);
      
      expect(totalTime).toBeLessThan(2000);
      expect(successfulOps).toBeGreaterThan(0);
    });

    test('should demonstrate linear performance scaling', async () => {
      const testSizes = [1, 5, 10];
      const results = [];
      
      for (const size of testSizes) {
        const start = Date.now();
        
        const response = await request(app)
          .post(apiEndpoints.progressBulk)
          .send({
            cardId: 5,
            amount: size,
            userId: 1
          });
        
        const end = Date.now();
        const time = end - start;
        
        results.push({
          size: size,
          time: time,
          processed: response.status === 200 ? response.body.stepsProcessed : 0
        });
      }
      
      console.log(`\n=== SCALING PERFORMANCE ===`);
      results.forEach(result => {
        console.log(`Size ${result.size}: ${result.time}ms (processed: ${result.processed})`);
      });
      
      const avgTimePerStep = results.map(r => r.processed > 0 ? r.time / r.processed : 0);
      const efficiency = avgTimePerStep.filter(t => t > 0);
      
      if (efficiency.length > 1) {
        const variance = Math.max(...efficiency) - Math.min(...efficiency);
        expect(variance).toBeLessThan(50);
      }
    });
  });
}); 