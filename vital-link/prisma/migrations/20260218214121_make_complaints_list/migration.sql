/*
  Warnings:

  - Changed the column `complaintCategory` on the `Patient` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "Patient" 
ALTER COLUMN "complaintCategory" TYPE "ComplaintCategory"[] 
USING ARRAY["complaintCategory"];
