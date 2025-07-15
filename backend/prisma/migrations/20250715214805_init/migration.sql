-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player1_id" TEXT,
    "player2_id" TEXT,
    "player1_name" TEXT NOT NULL,
    "player2_name" TEXT NOT NULL,
    "player1_mythology" TEXT NOT NULL,
    "player2_mythology" TEXT NOT NULL,
    "winner_id" TEXT,
    "game_data" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    "turn_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "games_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "games_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "games_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_actions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_id" TEXT NOT NULL,
    "player_id" TEXT,
    "action_type" TEXT NOT NULL,
    "action_data" TEXT,
    "turn_number" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "game_actions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "game_actions_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "games_player1_id_idx" ON "games"("player1_id");

-- CreateIndex
CREATE INDEX "games_player2_id_idx" ON "games"("player2_id");

-- CreateIndex
CREATE INDEX "games_started_at_idx" ON "games"("started_at");

-- CreateIndex
CREATE INDEX "game_actions_game_id_idx" ON "game_actions"("game_id");

-- CreateIndex
CREATE INDEX "game_actions_turn_number_idx" ON "game_actions"("turn_number");
