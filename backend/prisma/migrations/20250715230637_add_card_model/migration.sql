-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mythology" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "hp" INTEGER,
    "max_hp" INTEGER,
    "attacks" TEXT,
    "passive_effect" TEXT,
    "technique_effect" TEXT,
    "artifact_effect" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
