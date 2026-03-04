"use server";

import { prisma } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function assignBed(patientId: string, bedId: string) {
  // 1. Verify bed is available (Don't trust the client!)
  const bed = await prisma.bed.findUnique({ where: { id: bedId } });
  
  if (!bed || bed.status !== "AVAILABLE") {
    return { error: "Bed is no longer available. Refresh the board." };
  }

  // 2. Perform the assignment
  try {
    await prisma.bed.update({
      where: { id: bedId },
      data: {
        status: "OCCUPIED",
        patientId: patientId,
      }
    });

    revalidatePath("/dashboard/ops");
    return { success: true };
  } catch (error) {
    return { error: "Database transaction failed." };
  }
}