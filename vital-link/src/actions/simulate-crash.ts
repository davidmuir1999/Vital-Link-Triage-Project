"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const simulateCrashSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
});

export async function simulatePatientCrash(rawPatientId: string) {
  const validateFields = simulateCrashSchema.safeParse({
    patientId: rawPatientId,
  });

  if (!validateFields.success) {
    return { error: validateFields.error.message };
  }

  const { patientId } = validateFields.data;

  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        heartRate: 145,
        news2Score: 9,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    console.error("Failed to simulate patient crash");
    return { error: "Failed to simulate patient crash" };
  }
}
