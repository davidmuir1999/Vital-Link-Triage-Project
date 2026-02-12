-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRIAGE_NURSE', 'DOCTOR', 'SITE_MANAGER', 'CLEANER', 'WARD_NURSE');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'CLEANING_REQUIRED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "TriageColor" AS ENUM ('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('CHEST_PAIN', 'PALPITATIONS', 'HYPERTENSION', 'CARDIAC_ARREST', 'SHORTNESS_OF_BREATH', 'ASTHMA_COPD_FLARE', 'RESPIRATORY_ARREST', 'COUGH_HEMOPTYSIS', 'HEADACHE', 'SEIZURE', 'STROKE_CVA', 'LOSS_OF_CONSCIOUSNESS', 'CONFUSION_ALTERED_STATE', 'DIZZINESS_VERTIGO', 'ABDOMINAL_PAIN', 'NAUSEA_VOMITING', 'GI_BLEED', 'DIARRHEA', 'TRAUMA_FALL', 'TRAUMA_ROAD_ACCIDENT', 'TRAUMA_ASSAULT', 'BURN', 'LACERATION_CUT', 'HEAD_INJURY', 'FRACTURE_DISLOCATION', 'SUICIDAL_IDEATION', 'SELF_HARM', 'PSYCHOSIS_MANIA', 'ANXIETY_PANIC', 'AGGRESSIVE_BEHAVIOR', 'FEVER_SEPSIS', 'ALLERGIC_REACTION', 'OVERDOSE_POISONING', 'PREGNANCY_COMPLICATION', 'GENERAL_MALAISE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TRIAGE_NURSE',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" "BedStatus" NOT NULL DEFAULT 'AVAILABLE',
    "wardId" TEXT NOT NULL,
    "patientId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "nhsNumber" TEXT NOT NULL,
    "triageColor" "TriageColor" NOT NULL,
    "triageScore" INTEGER NOT NULL,
    "complaintDetails" TEXT,
    "complaintCategory" "ComplaintCategory" NOT NULL,
    "news2Score" INTEGER NOT NULL DEFAULT 0,
    "heartRate" INTEGER,
    "bpSystolic" INTEGER,
    "bpDiastolic" INTEGER,
    "temperature" DOUBLE PRECISION,
    "oxygenSat" INTEGER,
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "ClinicalLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_patientId_key" ON "Bed"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_nhsNumber_key" ON "Patient"("nhsNumber");

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalLog" ADD CONSTRAINT "ClinicalLog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalLog" ADD CONSTRAINT "ClinicalLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
