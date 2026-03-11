"use server"

import { prisma } from "@/src/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function addClientNote(patientId: string, message: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "You must be logged in to add notes."}
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (!user) {
        return { error: "User not found in database."}
    }

    try {
        await prisma.clinicalLog.create({
            data: {
                patientId,
                message,
                authorId: user.id
            },
        });
        revalidatePath("/ward/[wardId]", "page");
        return { success: true };
    } catch (error) {
        return { error: "Failed to save clinical note."}
    }
}