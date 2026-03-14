"use client";

import { Prisma } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { CheckCircle } from "lucide-react";
import { bedCleaned } from "../actions/bed-cleaned";
import { toast } from "sonner";

type WardWithDirtyBeds = Prisma.WardGetPayload<{
  include: {
    beds: {
      where: { status: "CLEANING_REQUIRED" };
    };
  };
}>;

type CleanBedsListProps = {
  dirtyWards: WardWithDirtyBeds[];
};

export default function CleanBedsList({ dirtyWards }: CleanBedsListProps) {

    const handleMarkClean = async (bedId: string) => {
        const toastId = toast.loading("Updating database...");
        try {
            const result = await bedCleaned(bedId);
            if (result.error){
                toast.error(result.error, {id: toastId});
                return;
            }
            toast.success("Bed marked as available", {id: toastId});
        } catch (error) {
            toast.error("Network error. Please try again.", {id: toastId});
        }
    }

  return (
    <div className="space-y-6">
      {dirtyWards.map((ward) => (
        <Card
          key={ward.id}
          className="border-t-4 border-t-yellow-400 shadow-sm"
        >
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl text-gray-800 flex justify-between items-center">
              {ward.name}
              <span className="text-center text-sm font-normal bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                {ward.beds.length} Beds Pending
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
              {ward.beds.map((bed) => (
                <div
                  key={bed.id}
                  className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-sm hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-900">
                      {bed.label}
                    </span>
                    <span className="text-xs font-mono text-yellow-600">
                      Cleaning Required
                    </span>
                  </div>
                  <button
                    className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-500 hover:text-green-700 px-4 py-2 rounded-md font-medium transition-all"
                    onClick={async () => handleMarkClean(bed.id)}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark Clean
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
