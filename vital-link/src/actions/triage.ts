"use server";

import { revalidatePath } from "next/cache";
import {prisma} from "@/src/lib/db";
import { TriageSchema } from "@/src/lib/validations/triage";
import { calculateNEWS2 } from "@/src/lib/calculators/news2";
import { ComplaintCategory } from "@prisma/client";

export async function createPatient(rawData: unknown) {
  const validatedFields = TriageSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Failed:", validatedFields.error);
    return {
      error: "Invalid patient data submitted.",
    };
  }

  const data = validatedFields.data;

  const serverGeneratedScore = calculateNEWS2({
    respiratoryRate: Number(data.respiratoryRate),
    oxygenSat: Number(data.oxygenSat),
    isOnOxygen: data.isOnOxygen,
    hypercapnicFailure: data.hypercapnicFailure,
    temperature: Number(data.temperature),
    bpSystolic: Number(data.bpSystolic),
    heartRate: Number(data.heartRate),
    consciousness: data.consciousness,
  });

  try {
    const newPatient = await prisma.patient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        nhsNumber: data.nhsNumber,
        dob: new Date(data.dob),
        gender: data.gender,

        // Vitals
        respiratoryRate: Number(data.respiratoryRate),
        oxygenSat: Number(data.oxygenSat),
        isOnOxygen: data.isOnOxygen,
        hypercapnicFailure: data.hypercapnicFailure,
        temperature: Number(data.temperature),
        bpSystolic: Number(data.bpSystolic),
        heartRate: Number(data.heartRate),
        consciousness: data.consciousness,

        // Calculated Server-Side
        news2Score: serverGeneratedScore,

        // Complaints
        complaintCategory: data.complaintCategory as ComplaintCategory[], 
        complaintDetails: data.complaintDetails,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, id: newPatient.id };
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to save patient to database." };
  }
}
