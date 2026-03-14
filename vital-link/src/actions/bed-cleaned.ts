"use server"

import { prisma } from "../lib/db"
import { revalidatePath } from "next/cache";

export async function bedCleaned(bedId: string){

    try {
        await prisma.bed.update({
            where: {
                id: bedId
            },
            data: {
                status: "AVAILABLE"
            }
        });
        revalidatePath("/dashboard/cleaning");
        revalidatePath("/dashboard/ward");
        revalidatePath("/dashboard/ward/[wardId]");
        revalidatePath("/dashboard/ops");
        return { success: true };
    } catch (error) {
        return { error: "Failed to clean beds."}
    }
}