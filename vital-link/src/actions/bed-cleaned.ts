"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const cleanBedSchema = z.object({
  bedId: z.string().min(1, "Bed ID is required"),
});

export async function bedCleaned(rawBedId: string) {
  const validateFields = cleanBedSchema.safeParse({bedId: rawBedId});

  if (!validateFields.success) {
    return { error: validateFields.error.message };
  }

  const { bedId } = validateFields.data;

  try {
    await prisma.bed.update({
      where: {
        id: bedId,
      },
      data: {
        status: "AVAILABLE",
      },
    });
    revalidatePath("/dashboard/cleaning");
    revalidatePath("/dashboard/ward");
    revalidatePath("/dashboard/ward/[wardId]", 'page');
    revalidatePath("/dashboard/ops");
    return { success: true };
  } catch (error) {
    return { error: "Failed to clean beds." };
  }
}
