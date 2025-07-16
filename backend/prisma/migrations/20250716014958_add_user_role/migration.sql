-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "email_verification_token_expiry" DATETIME,
    "password_reset_token" TEXT,
    "password_reset_token_expiry" DATETIME
);
INSERT INTO "new_users" ("created_at", "email", "email_verification_token", "email_verification_token_expiry", "email_verified", "id", "password_hash", "password_reset_token", "password_reset_token_expiry", "updated_at", "username") SELECT "created_at", "email", "email_verification_token", "email_verification_token_expiry", "email_verified", "id", "password_hash", "password_reset_token", "password_reset_token_expiry", "updated_at", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
