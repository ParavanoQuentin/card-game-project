import { Card, Mythology } from '../types/game';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const apiService = {
  async getAllCards(): Promise<Card[]> {
    const response = await fetch(`${API_BASE_URL}/api/cards`);
    if (!response.ok) {
      throw new Error('Failed to fetch cards');
    }
    return response.json();
  },

  async getCardsByMythology(mythology: Mythology): Promise<Card[]> {
    const response = await fetch(`${API_BASE_URL}/api/cards/${mythology}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cards for ${mythology}`);
    }
    return response.json();
  },

  async getMythologies(): Promise<Mythology[]> {
    const response = await fetch(`${API_BASE_URL}/api/mythologies`);
    if (!response.ok) {
      throw new Error('Failed to fetch mythologies');
    }
    return response.json();
  },

  async checkHealth(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }
};
