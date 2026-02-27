/*
  Warnings:

  - You are about to drop the column `oxygenSaturation` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `triageColor` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `triageScore` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `oxygenSat` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "oxygenSaturation",
DROP COLUMN "triageColor",
DROP COLUMN "triageScore",
ADD COLUMN     "oxygenSat" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "TriageColor";
