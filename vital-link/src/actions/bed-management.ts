"use server";

import { prisma } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bedManagementSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  bedId: z.string().min(1, "Bed ID is required"),
});

export async function assignBed(rawPatientId: string, rawBedId: string) {
  const validateFields = bedManagementSchema.safeParse({
    patientId: rawPatientId,
    bedId: rawBedId,
  });

  if (!validateFields.success) {
    return { error: validateFields.error.message };
  }

  const { patientId, bedId } = validateFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      const targetBed = await prisma.bed.findUnique({ where: { id: bedId } });

      if (!targetBed || targetBed.status !== "AVAILABLE") {
        return { error: "Bed is no longer available. Refresh the board." };
      }

      const currentBed = await prisma.bed.findFirst({
        where: { patientId: patientId },
      });

      if (currentBed) {
        await tx.bed.update({
          where: { id: currentBed.id },
          data: {
            status: "CLEANING_REQUIRED",
            patient: { disconnect: true },
          },
        });
      }

      await tx.bed.update({
        where: { id: bedId },
        data: {
          status: "OCCUPIED",
          patientId: patientId,
        },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Transaction failed:", error);
    return { error: "Database transaction failed." };
  }
}

export async function dischargePatient(rawPatientId: string, rawBedId: string) {
  const validateFields = bedManagementSchema.safeParse({
    patientId: rawPatientId,
    bedId: rawBedId,
  });

  if (!validateFields.success) {
    return { error: validateFields.error.message };
  }

  const { patientId, bedId } = validateFields.data;

  try {
    await prisma.$transaction([
      prisma.bed.update({
        where: { id: bedId },
        data: {
          status: "CLEANING_REQUIRED",
          patient: { disconnect: true },
        },
      }),
      
      prisma.patient.update({
        where: {id: patientId},
        data: {
          status: "DISCHARGED"
        }
      })
    ]);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Discharge failed:", error);
    return { error: "Failed to discharge patient." };
  }
}
