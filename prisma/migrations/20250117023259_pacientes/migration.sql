/*
  Warnings:

  - You are about to drop the column `edad` on the `Pacientes` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pacientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "email" TEXT,
    "fechaNacimiento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obraSocial" TEXT,
    "numeroObraSocial" TEXT,
    "antecedentes" TEXT,
    "medicacionHabitual" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Pacientes" ("antecedentes", "createdAt", "direccion", "documento", "id", "medicacionHabitual", "nombre", "numeroObraSocial", "telefono", "updatedAt") SELECT "antecedentes", "createdAt", "direccion", "documento", "id", "medicacionHabitual", "nombre", "numeroObraSocial", "telefono", "updatedAt" FROM "Pacientes";
DROP TABLE "Pacientes";
ALTER TABLE "new_Pacientes" RENAME TO "Pacientes";
CREATE UNIQUE INDEX "Pacientes_documento_key" ON "Pacientes"("documento");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
