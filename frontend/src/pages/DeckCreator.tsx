import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Mythology, CardType } from '../types/game';
import { apiService } from '../services/apiService';
import { useGameStore } from '../store/gameStore';
import CardImage from '../components/CardImage';
import './DeckCreator.css';

const DeckCreator: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedMythology,
    customDeck,
    setSelectedMythology,
    setCustomDeck,
    addCardToDeck,
    removeCardFromDeck
  } = useGameStore();

  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CardType | 'all'>('all');

  useEffect(() => {
    if (selectedMythology) {
      loadCards();
    }
  }, [selectedMythology]);

  const loadCards = async () => {
    if (!selectedMythology) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cards = await apiService.getCardsByMythology(selectedMythology);
      setAvailableCards(cards);
    } catch (err) {
      setError('Failed to load cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMythologySelect = (mythology: Mythology) => {
    setSelectedMythology(mythology);
    setCustomDeck([]); // Clear deck when switching mythology
  };

  const filteredCards = availableCards.filter(card => 
    filter === 'all' || card.type === filter
  );

  const getCardCount = (type: CardType) => {
    return customDeck.filter(card => card.type === type).length;
  };

  const canAddCard = (card: Card) => {
    if (customDeck.length >= 10) return false;
    
    // Check if we already have this specific card
    const existingCard = customDeck.find(deckCard => 
      deckCard.name === card.name && deckCard.type === card.type
    );
    
    return !existingCard;
  };

  const handleStartBattle = () => {
    if (customDeck.length === 10) {
      navigate('/combat');
    }
  };

  const renderCard = (card: Card, inDeck: boolean = false) => (
    <div key={card.id} className={`card ${card.type} ${inDeck ? 'in-deck' : ''}`}>
      <CardImage card={card} className="deck-creator-card-image" />
      
      <div className="card-header">
        <h3 className="card-name">{card.name}</h3>
        <span className="card-type">{card.type.toUpperCase()}</span>
      </div>
      
      <div className="card-description">
        {card.description}
      </div>
      
      {card.type === CardType.BEAST && (
        <div className="beast-stats">
          <div className="hp">HP: {card.hp}</div>
          {card.attacks && (
            <div className="attacks">
              <strong>Attacks:</strong>
              {card.attacks.map((attack, index) => (
                <div key={index} className="attack">
                  • <strong>{attack.name}</strong>: {attack.damage} damage
                  {attack.description && <span className="attack-desc"> - {attack.description}</span>}
                </div>
              ))}
            </div>
          )}
          {card.passiveEffect && (
            <div className="passive">
              <strong>{card.passiveEffect.name}</strong>: {card.passiveEffect.description}
            </div>
          )}
        </div>
      )}
      
      {card.type === CardType.TECHNIQUE && card.techniqueEffect && (
        <div className="technique-effect">
          <strong>Effect:</strong> {JSON.parse(card.techniqueEffect).type}
        </div>
      )}
      
      {card.type === CardType.ARTIFACT && card.artifactEffect && (
        <div className="artifact-effect">
          <strong>Buff:</strong> {JSON.parse(card.artifactEffect).type}
        </div>
      )}
      
      <div className="card-actions">
        {inDeck ? (
          <button 
            className="remove-button"
            onClick={() => removeCardFromDeck(card.id)}
          >
            Remove
          </button>
        ) : (
          <button 
            className="add-button"
            onClick={() => addCardToDeck(card)}
            disabled={!canAddCard(card)}
          >
            {canAddCard(card) ? 'Add to Deck' : 'Already in Deck'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="deck-creator">
      <header className="deck-creator-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Deck Creator</h1>
        <div className="deck-progress">
          Deck: {customDeck.length}/10 cards
        </div>
      </header>

      {!selectedMythology ? (
        <div className="mythology-selection">
          <h2>Choose Your Mythology</h2>
          <div className="mythology-options">
            {Object.values(Mythology).map(mythology => (
              <button
                key={mythology}
                className={`mythology-button ${mythology}`}
                onClick={() => handleMythologySelect(mythology)}
              >
                <h3>{mythology.charAt(0).toUpperCase() + mythology.slice(1)}</h3>
                <p>Command the {mythology} pantheon</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="deck-builder">
          <div className="deck-section">
            <div className="deck-header">
              <h2>Your {selectedMythology.charAt(0).toUpperCase() + selectedMythology.slice(1)} Deck</h2>
              <div className="deck-composition">
                <span>Beasts: {getCardCount(CardType.BEAST)}</span>
                <span>Techniques: {getCardCount(CardType.TECHNIQUE)}</span>
                <span>Artifacts: {getCardCount(CardType.ARTIFACT)}</span>
              </div>
              <button 
                className="change-mythology"
                onClick={() => setSelectedMythology(null)}
              >
                Change Mythology
              </button>
            </div>
            
            <div className="current-deck">
              {customDeck.length === 0 ? (
                <div className="empty-deck">
                  <p>Your deck is empty. Add cards from the collection below.</p>
                </div>
              ) : (
                <div className="deck-cards">
                  {customDeck.map(card => renderCard(card, true))}
                </div>
              )}
            </div>
            
            {customDeck.length === 10 && (
              <button className="start-battle-button" onClick={handleStartBattle}>
                Ready for Battle!
              </button>
            )}
          </div>

          <div className="collection-section">
            <div className="collection-header">
              <h2>Card Collection</h2>
              <div className="filter-buttons">
                <button 
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={filter === CardType.BEAST ? 'active' : ''}
                  onClick={() => setFilter(CardType.BEAST)}
                >
                  Beasts
                </button>
                <button 
                  className={filter === CardType.TECHNIQUE ? 'active' : ''}
                  onClick={() => setFilter(CardType.TECHNIQUE)}
                >
                  Techniques
                </button>
                <button 
                  className={filter === CardType.ARTIFACT ? 'active' : ''}
                  onClick={() => setFilter(CardType.ARTIFACT)}
                >
                  Artifacts
                </button>
              </div>
            </div>

            {loading && <div className="loading">Loading cards...</div>}
            {error && <div className="error">{error}</div>}
            
            <div className="available-cards">
              {filteredCards.map(card => renderCard(card, false))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckCreator;
