"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateNEWS2 } from "../lib/calculators/news2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const vitalsSchema = z.object({
  heartRate: z.coerce.number().min(10, "HR too low").max(300, "HR too high"),
  bpSystolic: z.coerce.number().min(30, "BP too low").max(300, "BP too high"),
  respiratoryRate: z.coerce.number().min(0).max(100),
  oxygenSat: z.coerce.number().min(0).max(100),
  temperature: z.coerce.number().min(25).max(45),

  isOnOxygen: z.any().transform((val) => val === "on"),
  hypercapnicFailure: z.any().transform((val) => val === "on"),

  consciousness: z.enum(["ALERT", "CONFUSION", "VOICE", "PAIN", "UNRESPONSIVE"]),
});

export async function updatePatientVitals(patientId: string, formData: FormData) {

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "You must be logged in to update vitals." };
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
        const rawData = {
            heartRate: formData.get("heartRate"),
      bpSystolic: formData.get("bpSystolic"),
      respiratoryRate: formData.get("respiratoryRate"),
      oxygenSat: formData.get("oxygenSat"),
      temperature: formData.get("temperature"),
      isOnOxygen: formData.get("isOnOxygen"),
      hypercapnicFailure: formData.get("hypercapnicFailure"),
      consciousness: formData.get("consciousness"),
        }

        const validatedData = vitalsSchema.safeParse(rawData);

        if (!validatedData.success) {
            console.error("Validation Failed:", validatedData.error);
            return { error: validatedData.error.message };
        }

        const newVitals = validatedData.data;

        const newNews2Score = calculateNEWS2(newVitals);

        await prisma.$transaction(async (tx) => {
            const oldPatient = await tx.patient.findUnique({
                where: { id: patientId },
            });

            await tx.patient.update({
                where: {id: patientId},
                data: {
                    ...newVitals,
                    news2Score: newNews2Score,
                },
            });

            await tx.clinicalLog.create({
                data: {
                    patientId: patientId,
                    message: `Vitals updated automatically. NEWS2 score changed from ${oldPatient?.news2Score} to ${newNews2Score}. (HR: ${newVitals.heartRate}, BP: ${newVitals.bpSystolic}, O2: ${newVitals.oxygenSat}%)`,
                    authorId: user.id,
                }
            })
            })

            revalidatePath("/dashboard");
            return { success: true, news2Score: newNews2Score };
    } catch (error){
        console.error("Error updating vitals:", error);
        return { error: "Failed to update vitals. Please try again." };
    }
}
