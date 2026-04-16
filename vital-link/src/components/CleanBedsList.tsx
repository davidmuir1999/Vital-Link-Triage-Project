"use client";

import { Prisma } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { CheckCircle, Sparkles } from "lucide-react"; // <-- Added Sparkles
import { bedCleaned } from "../actions/bed-cleaned";
import { toast } from "sonner";
import { useState } from "react"; // <-- Required for Optimistic UI

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
  const [cleanedBedIds, setCleanedBedIds] = useState<Set<string>>(new Set());

  const handleMarkClean = async (bedId: string) => {
    setCleanedBedIds((prev) => new Set(prev).add(bedId));
    const toastId = toast.loading("Updating database...");
    
    try {
      const result = await bedCleaned(bedId);
      
      if (result.error) {
        setCleanedBedIds((prev) => {
          const next = new Set(prev);
          next.delete(bedId);
          return next;
        });
        toast.error(result.error, { id: toastId });
        return;
      }
      
      toast.success("Bed marked as available", { id: toastId });
    } catch (error) {
      setCleanedBedIds((prev) => {
        const next = new Set(prev);
        next.delete(bedId);
        return next;
      });
      toast.error("Network error. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {dirtyWards.map((ward) => {
        const visibleBeds = ward.beds.filter((b) => !cleanedBedIds.has(b.id));

        if (visibleBeds.length === 0) return null;

        return (
          <Card
            key={ward.id}
            className="border-t-4 border-t-yellow-400 shadow-sm border-slate-200"
          >
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex justify-between items-center">
                {ward.name}
                <span className="text-center text-xs font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-md shadow-sm">
                  {visibleBeds.length} {visibleBeds.length === 1 ? 'Bed' : 'Beds'} Pending
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 bg-slate-50/50 rounded-b-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleBeds.map((bed) => (
                  <div
                    key={bed.id}
                    className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-50 p-2.5 rounded-lg border border-yellow-100">
                        <Sparkles className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="font-bold text-xl text-slate-900">
                        {bed.label}
                      </span>
                    </div>
                    
                    <button
                      className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md px-5 py-2.5 rounded-lg font-bold transition-all active:scale-95 cursor-pointer"
                      onClick={() => handleMarkClean(bed.id)}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Clean
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {dirtyWards.every(w => w.beds.filter(b => !cleanedBedIds.has(b.id)).length === 0) && (
        <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-lg">All wards are completely sanitized.</p>
          <p className="text-slate-400 text-sm mt-1">Great job! Take a well-deserved break.</p>
        </div>
      )}
    </div>
  );
}