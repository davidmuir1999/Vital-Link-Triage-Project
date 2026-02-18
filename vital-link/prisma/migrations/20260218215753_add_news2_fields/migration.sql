/*
  Warnings:

  - You are about to drop the column `bpDiastolic` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `oxygenSat` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `consciousness` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oxygenSaturation` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `respiratoryRate` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Made the column `heartRate` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bpSystolic` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `temperature` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "bpDiastolic",
DROP COLUMN "oxygenSat",
ADD COLUMN     "consciousness" TEXT NOT NULL,
ADD COLUMN     "hypercapnicFailure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnOxygen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oxygenSaturation" INTEGER NOT NULL,
ADD COLUMN     "respiratoryRate" INTEGER NOT NULL,
ALTER COLUMN "news2Score" DROP DEFAULT,
ALTER COLUMN "heartRate" SET NOT NULL,
ALTER COLUMN "bpSystolic" SET NOT NULL,
ALTER COLUMN "temperature" SET NOT NULL;
