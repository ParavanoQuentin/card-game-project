import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardImage from '../components/CardImage';
import { Card, CardType, Mythology } from '../types/game';

// Mock card pour les tests
const mockBeastCard: Card = {
  id: 'test_harpie',
  name: 'Harpie',
  type: CardType.BEAST,
  mythology: Mythology.GREEK,
  description: 'Créature ailée aux griffes acérées',
  imageUrl: 'https://example.com/harpie.jpg',
  hp: 5,
  maxHp: 5,
  attacks: [
    { name: 'Griffes tourbillonnantes', damage: 3, description: 'Attaque rapide' },
    { name: 'Cri perçant', damage: 4, description: 'Cri strident' }
  ]
};

const mockTechniqueCard: Card = {
  id: 'test_technique',
  name: 'Éclair de Zeus',
  type: CardType.TECHNIQUE,
  mythology: Mythology.GREEK,
  description: 'Lightning bolt from the king of gods',
  imageUrl: 'https://example.com/zeus.jpg',
  techniqueEffect: '{"type": "damage", "amount": 5}'
};

describe('CardImage Component', () => {
  test('renders card image with correct props', () => {
    render(<CardImage card={mockBeastCard} alt="Test card" />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test card');
    expect(image).toHaveAttribute('src', mockBeastCard.imageUrl);
  });

  test('uses card name as alt text when no alt prop provided', () => {
    render(<CardImage card={mockBeastCard} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', mockBeastCard.name);
  });

  test('applies custom className', () => {
    render(<CardImage card={mockBeastCard} className="custom-class" />);
    
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  test('handles image load error for beast card', () => {
    render(<CardImage card={mockBeastCard} />);
    
    const image = screen.getByRole('img');
    
    // Simuler une erreur de chargement d'image
    fireEvent.error(image);
    
    // Vérifier que l'image de fallback est utilisée
    expect(image).toHaveAttribute('src', '/images/cards/placeholder/beast.svg');
  });

  test('handles image load error for technique card', () => {
    render(<CardImage card={mockTechniqueCard} />);
    
    const image = screen.getByRole('img');
    
    // Simuler une erreur de chargement d'image
    fireEvent.error(image);
    
    // Vérifier que l'image de fallback est utilisée
    expect(image).toHaveAttribute('src', '/images/cards/placeholder/technique.svg');
  });

  test('shows loading state initially', () => {
    render(<CardImage card={mockBeastCard} />);
    
    // Vérifier que l'état de chargement est affiché
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('loading');
  });

  test('removes loading state after image loads', () => {
    render(<CardImage card={mockBeastCard} />);
    
    const image = screen.getByRole('img');
    const container = image.parentElement;
    
    // Simuler le chargement de l'image
    fireEvent.load(image);
    
    // Vérifier que l'état de chargement est retiré
    expect(container).not.toHaveClass('loading');
  });

  test('displays card type in data attribute', () => {
    render(<CardImage card={mockBeastCard} />);
    
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveAttribute('data-card-type', CardType.BEAST);
  });

  test('displays mythology in data attribute', () => {
    render(<CardImage card={mockBeastCard} />);
    
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveAttribute('data-mythology', Mythology.GREEK);
  });
});
