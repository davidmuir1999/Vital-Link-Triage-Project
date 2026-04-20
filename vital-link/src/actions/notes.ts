"use server";

import { prisma } from "@/src/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const noteSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  message: z.string().min(1, "Note is required"),
});

export async function addClientNote(rawPatientId: string, rawMessage: string) {
  const validateFields = noteSchema.safeParse({
    patientId: rawPatientId,
    message: rawMessage,
  });

  if (!validateFields.success) {
    return { error: validateFields.error.message };
  }

  const { patientId, message } = validateFields.data;

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "You must be logged in to add notes." };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return { error: "User not found in database." };
  }

  try {
    await prisma.clinicalLog.create({
      data: {
        patientId,
        message,
        authorId: user.id,
      },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to save clinical note." };
  }
}
