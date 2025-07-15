import React, { useState } from 'react';
import { Card, CardType } from '../types/game';
import './CardImage.css';

interface CardImageProps {
  card: Card;
  alt?: string;
  className?: string;
}

const CardImage: React.FC<CardImageProps> = ({ card, alt, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get fallback image path based on card type
  const getFallbackImagePath = (card: Card): string => {
    switch (card.type) {
      case CardType.BEAST:
        return '/images/cards/placeholder/beast.svg';
      case CardType.TECHNIQUE:
        return '/images/cards/placeholder/technique.svg';
      case CardType.ARTIFACT:
        return '/images/cards/placeholder/artifact.svg';
      default:
        return '/images/cards/placeholder/beast.svg';
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Use the card's imageUrl if available and no error, otherwise use fallback
  const imageSrc = imageError || !card.imageUrl ? getFallbackImagePath(card) : card.imageUrl;

  return (
    <div className={`card-image-container ${className}`}>
      {isLoading && !imageError && (
        <div className="image-loading-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt || card.name}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`card-image ${isLoading ? 'loading' : ''}`}
        style={{ display: isLoading && !imageError ? 'none' : 'block' }}
      />
      {imageError && (
        <div className="image-error-overlay">
          <span>Image not available</span>
        </div>
      )}
    </div>
  );
};

export default CardImage;
