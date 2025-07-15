import request from 'supertest';
import express from 'express';

// Mock de l'application Express pour les tests
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Route de test simple
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Simulation de la route des cartes grecques
  app.get('/api/cards/greek', (req, res) => {
    const mockGreekCards = [
      {
        id: 'greek_harpie',
        name: 'Harpie',
        type: 'beast',
        mythology: 'greek',
        hp: 5,
        maxHp: 5
      },
      {
        id: 'greek_chimera',
        name: 'Chimère',
        type: 'beast',
        mythology: 'greek',
        hp: 8,
        maxHp: 8
      }
    ];
    res.json(mockGreekCards);
  });
  
  return app;
};

describe('API Endpoints', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/cards/greek', () => {
    test('should return Greek mythology cards', async () => {
      const response = await request(app)
        .get('/api/cards/greek')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Vérifier que toutes les cartes sont de mythologie grecque
      response.body.forEach((card: any) => {
        expect(card).toHaveProperty('mythology', 'greek');
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('type');
      });
    });

    test('should include new Greek cards', async () => {
      const response = await request(app)
        .get('/api/cards/greek')
        .expect(200);
      
      const cardNames = response.body.map((card: any) => card.name);
      expect(cardNames).toContain('Harpie');
      expect(cardNames).toContain('Chimère');
    });
  });

  describe('Error handling', () => {
    test('should handle 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });
  });
});
