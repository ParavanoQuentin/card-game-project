import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { CARD_DATABASE, getCardsByMythology } from '../models/cards';
import { Mythology } from '../models/types';

// Configuration de l'app Express pour les tests d'intégration
const createTestApp = () => {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  // Route de santé
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      cardsCount: CARD_DATABASE.length 
    });
  });
  
  // Route des cartes par mythologie
  app.get('/api/cards/:mythology', (req, res) => {
    const mythology = req.params.mythology.toUpperCase() as Mythology;
    
    if (!Object.values(Mythology).includes(mythology)) {
      return res.status(400).json({ error: 'Invalid mythology' });
    }
    
    const cards = getCardsByMythology(mythology);
    res.json(cards);
  });
  
  // Route pour toutes les cartes
  app.get('/api/cards', (req, res) => {
    res.json(CARD_DATABASE);
  });
  
  return app;
};

describe('Cards API Integration Tests', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/health', () => {
    test('should return health status with cards count', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('cardsCount');
      expect(typeof response.body.cardsCount).toBe('number');
      expect(response.body.cardsCount).toBeGreaterThan(0);
    });
  });

  describe('GET /api/cards/greek', () => {
    test('should return all Greek mythology cards', async () => {
      const response = await request(app)
        .get('/api/cards/greek')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Vérifier que toutes les cartes sont de mythologie grecque
      response.body.forEach((card: any) => {
        expect(card.mythology).toBe('greek');
      });
    });

    test('should include new Greek mythology cards', async () => {
      const response = await request(app)
        .get('/api/cards/greek')
        .expect(200);
      
      const cardNames = response.body.map((card: any) => card.name);
      
      // Vérifier que les nouvelles cartes sont présentes
      expect(cardNames).toContain('Harpie');
      expect(cardNames).toContain('Chimère');
      expect(cardNames).toContain('Satyre');
      expect(cardNames).toContain('Cyclope');
    });

    test('should return cards with correct structure', async () => {
      const response = await request(app)
        .get('/api/cards/greek')
        .expect(200);
      
      response.body.forEach((card: any) => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('mythology');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('imageUrl');
        
        // Les cartes beast doivent avoir hp et attacks
        if (card.type === 'beast') {
          expect(card).toHaveProperty('hp');
          expect(card).toHaveProperty('maxHp');
          expect(card).toHaveProperty('attacks');
          expect(Array.isArray(card.attacks)).toBe(true);
        }
      });
    });

    test('should return correct HP values for new Greek beasts', async () => {
      const response = await request(app)
        .get('/api/cards/greek')
        .expect(200);
      
      const beasts = response.body.filter((card: any) => card.type === 'beast');
      
      const harpie = beasts.find((card: any) => card.name === 'Harpie');
      const chimere = beasts.find((card: any) => card.name === 'Chimère');
      const satyre = beasts.find((card: any) => card.name === 'Satyre');
      const cyclope = beasts.find((card: any) => card.name === 'Cyclope');
      
      expect(harpie?.hp).toBe(5);
      expect(chimere?.hp).toBe(8);
      expect(satyre?.hp).toBe(6);
      expect(cyclope?.hp).toBe(9);
    });
  });

  describe('GET /api/cards/egyptian', () => {
    test('should return Egyptian mythology cards', async () => {
      const response = await request(app)
        .get('/api/cards/egyptian')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach((card: any) => {
          expect(card.mythology).toBe('egyptian');
        });
      }
    });
  });

  describe('GET /api/cards/norse', () => {
    test('should return Norse mythology cards', async () => {
      const response = await request(app)
        .get('/api/cards/norse')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach((card: any) => {
          expect(card.mythology).toBe('norse');
        });
      }
    });
  });

  describe('Error handling', () => {
    test('should return 400 for invalid mythology', async () => {
      const response = await request(app)
        .get('/api/cards/invalid')
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Invalid mythology');
    });

    test('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });
  });

  describe('GET /api/cards', () => {
    test('should return all cards from database', async () => {
      const response = await request(app)
        .get('/api/cards')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(CARD_DATABASE.length);
      
      // Vérifier qu'on a des cartes de différentes mythologies
      const mythologies = [...new Set(response.body.map((card: any) => card.mythology))];
      expect(mythologies.length).toBeGreaterThan(1);
    });
  });
});
