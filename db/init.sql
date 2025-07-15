-- Initialize Aether Beasts Database
CREATE DATABASE IF NOT EXISTS aether_beasts;

-- Users table for player accounts (future feature)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table for game history and statistics
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY,
    player1_id UUID,
    player2_id UUID,
    player1_name VARCHAR(50) NOT NULL,
    player2_name VARCHAR(50) NOT NULL,
    player1_mythology VARCHAR(20) NOT NULL,
    player2_mythology VARCHAR(20) NOT NULL,
    winner_id UUID,
    game_data JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    turn_count INTEGER DEFAULT 0
);

-- Game actions table for replay functionality
CREATE TABLE IF NOT EXISTS game_actions (
    id SERIAL PRIMARY KEY,
    game_id UUID REFERENCES games(id),
    player_id UUID,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB,
    turn_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);
CREATE INDEX IF NOT EXISTS idx_games_started_at ON games(started_at);
CREATE INDEX IF NOT EXISTS idx_game_actions_game_id ON game_actions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_turn ON game_actions(turn_number);

-- Insert some sample data (optional)
INSERT INTO games (id, player1_id, player2_id, player1_name, player2_name, player1_mythology, player2_mythology, winner_id, started_at, ended_at, turn_count)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002', 'Zeus_Master', 'Anubis_Guardian', 'greek', 'egyptian', '123e4567-e89b-12d3-a456-426614174001', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 15),
    ('223e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174002', 'Thor_Wielder', 'Dragon_Emperor', 'norse', 'chinese', '223e4567-e89b-12d3-a456-426614174002', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 12)
ON CONFLICT DO NOTHING;
