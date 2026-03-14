"use server";

import { prisma } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function assignBed(patientId: string, bedId: string) {
  const targetBed = await prisma.bed.findUnique({ where: { id: bedId } });
  
  if (!targetBed || targetBed.status !== "AVAILABLE") {
    return { error: "Bed is no longer available. Refresh the board." };
  }

  try {
    // 2. Check if the patient is already assigned to a bed
    // We look for any bed that currently holds this specific patientId
    const currentBed = await prisma.bed.findFirst({
      where: { patientId: patientId }
    });

    // 3. Execute a Prisma Transaction
    // Everything inside this block must succeed, or it all gets rolled back
    await prisma.$transaction(async (tx) => {
      
      // If they are moving from an existing bed, empty it out
      if (currentBed) {
        await tx.bed.update({
          where: { id: currentBed.id },
          data: {
            status: "CLEANING_REQUIRED",
            patient: { disconnect: true } // Safely unlinks the patient from this bed
          }
        });
      }

      // Assign the patient to the new bed
      await tx.bed.update({
        where: { id: bedId },
        data: {
          status: "OCCUPIED",
          patientId: patientId,
        }
      });
      
    });

    // 4. Update the UI cache
    revalidatePath("/dashboard/ops");
    return { success: true };
    
  } catch (error) {
    console.error("Transaction failed:", error);
    return { error: "Database transaction failed." };
  }
}