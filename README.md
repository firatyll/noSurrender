# NoSurrender - Card Game API

[![CI](https://github.com/firatyll/nosurrender/actions/workflows/ci.yml/badge.svg)](https://github.com/firatyll/nosurrender/actions/workflows/ci.yml)

A high-performance, secure REST API for card development gameplay with bulk update capabilities and real-time user interface.

## Key Features

### Core Gameplay
- **Card Development System**: Players can increase card progress through development actions
- **Energy Management**: Limited energy system with automatic regeneration over time
- **Level Progression**: Cards automatically level up when reaching 100% progress
- **Maximum Level Cap**: All items are capped at level 3 for balanced gameplay

### Performance Optimizations
- **Bulk Update Operations**: Process multiple development steps in a single request
- **Atomic Transactions**: Ensure data consistency across all operations
- **Smart Resource Calculation**: Server-side validation prevents resource exploitation
- **Concurrent Request Handling**: Optimized for multiple simultaneous users

### User Interface
- **Interactive Web Interface**: Modern HTML5 interface with glassmorphism design
- **Long Press Functionality**: Hold buttons for 1-10 seconds to perform bulk actions
- **Real-time Feedback**: Live progress bars, timers, and visual indicators
- **Mobile Optimized**: Touch-friendly interface with responsive design

### Security & Validation
- **Input Validation**: Comprehensive server-side validation for all inputs
- **Type Checking**: Strict data type validation for API requests
- **Resource Constraints**: Server-enforced limits on energy and progress

## API Documentation

### Core Endpoints
```bash
POST /api/progress      # Single step progress update (+2%, -1 energy)
POST /api/level-up      # Level up card (requires 100% progress)
GET  /api/energy        # Get current energy level
```

### Enhanced Endpoints
```bash
POST /api/progress/bulk # Bulk progress update (1-50 steps)
GET  /api/levels/cards  # Get user cards
POST /api/levels        # Enhanced level up with detailed response
```

### Example Requests
```javascript
// Single step progress
POST /api/progress
{ "cardId": "5" }

// Bulk progress update
POST /api/progress/bulk
{ "cardId": 5, "amount": 25, "userId": 1 }

// Level up card
POST /api/level-up
{ "cardId": "2" }
```

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: Mock Database (production-ready structure)
- **Testing**: Jest + Supertest
- **CI/CD**: GitHub Actions
- **Frontend**: Vanilla HTML5 + CSS3 + JavaScript

## Testing

The project includes comprehensive testing with 108 test cases across 10 test suites:

```bash
Test Suites: 10 passed, 10 total
Tests:       108 passed, 108 total
Coverage:    96% (controllers, routes, lib, index.js)
```

### Test Categories
- **Application Setup** (20 tests): Server configuration, CORS, routing
- **Progress Development** (14 tests): Single and bulk progress operations
- **Level Management** (6 tests): Level up mechanics and validation
- **Energy Management** (5 tests): Energy regeneration and limits
- **Card Management** (6 tests): Card CRUD operations
- **Security & Edge Cases** (19 tests): Input validation and attack prevention
- **Maximum Level** (8 tests): Level 3 constraint enforcement
- **Item Categories** (11 tests): Category integrity validation
- **Integration Tests** (10 tests): Full user workflow testing
- **Performance Tests** (9 tests): Benchmarking and optimization validation

### Test Types
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end workflow validation
- **Performance Tests**: Benchmark comparisons and optimization verification
- **Security Tests**: Input validation and edge case handling
- **Load Tests**: Concurrent operation testing

## Future Enhancements

### Security Improvements
- **NextAuth.js Integration**: Modern authentication and session management
- **OAuth Providers**: Support for Google, GitHub, Discord authentication
- **Role-based Access Control**: Admin, user, and moderator role management

### Redis Caching
- To improve user experience and reduce latency cache user data with redis while playing game and sync it with database with regular intervals


## Installation

### Requirements
- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup
```bash
# Clone repository
git clone https://github.com/firatyll/nosurrender.git
cd nosurrender

# Install dependencies
npm install

# Setup environment
echo "PORT=3000" > .env
echo "NODE_ENV=development" >> .env
```

### Development
```bash
# Start server
npm start

# Run tests
npm test

# Test with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Development server
npm run dev
```

### Usage
1. **API Server**: `http://localhost:PORT`
2. **Test UI**: directly open index.html ifle after running server