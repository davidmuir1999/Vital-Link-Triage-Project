"use client";

import { Prisma } from "@prisma/client";
import { Maximize2, EllipsisVertical } from "lucide-react";
import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
// 1. Add the Dropdown Menu imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import ClinicalNotesFeed from "./ClinicalNotesFeed";
import { toast } from "sonner";
import { dischargePatient } from "../actions/bed-management";

type BedWithPatientData = Prisma.BedGetPayload<{
  include: {
    patient: {
      include: {
        history: {
          include: { author: true };
        };
      };
    };
  };
}>;

export default function BedOptions({ bed }: { bed: BedWithPatientData }) {
  const patient = bed.patient;

  const [isPending, startTransition] = useTransition();

  if (!patient) return null;

  const handleDischarge = () => {
    if (
      !window.confirm(
        `Are you sure you want to discharge ${patient.firstName} ${patient.lastName}?`
      )
    )
      return;

    startTransition(async () => {
      const result = await dischargePatient(patient.id, bed.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `${patient.firstName} ${patient.lastName} has been discharged.`
        );
      }
    });
  };

  return (
    <Dialog>
      <div className="text-gray-400 flex gap-2 z-10">
        <DialogTrigger asChild>
          <button className="hover:text-black hover:bg-gray-100 p-1 rounded transition duration-200">
            <Maximize2 className="w-4 h-4" />
          </button>
        </DialogTrigger>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:text-black hover:bg-gray-100 p-1 rounded transition duration-200">
              <EllipsisVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Bed Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-orange-600 font-medium cursor-pointer">
              Flag Cleaning Required
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleDischarge} disabled={isPending} className={`font-medium cursor-pointer focus:bg-red-50 focus:text-red-700 ${isPending ? "text-gray-400" : "text-red-600"}`}>
              {isPending ? "Discharging..." : "Discharge Patient"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl flex justify-between items-center">
            <span>
              {patient.lastName}, {patient.firstName}
            </span>
            <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">
              NEWS2: {patient.news2Score}
            </span>
          </DialogTitle>
          <div className="text-sm text-gray-500 flex gap-4 mt-2">
            <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
            <span>NHS: {patient.nhsNumber}</span>
            <span>
              Admitted: {new Date(patient.admissionDate).toLocaleString()}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden mt-4">
          <div className="border-r pr-6 overflow-y-auto">
            <h3 className="font-bold text-lg mb-3">Clinical Overview</h3>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="font-semibold text-sm">Presenting Complaints:</p>
              <p className="text-sm text-gray-700">
                {patient.complaintCategory.join(", ").replace(/_/g, " ")}
              </p>
              {patient.complaintDetails && (
                <p className="text-sm text-gray-600 italic mt-1">
                  "{patient.complaintDetails}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="border p-2 rounded">
                ❤️ HR: {patient.heartRate} bpm
              </div>
              <div className="border p-2 rounded">
                🩸 BP: {patient.bpSystolic}
              </div>
              <div className="border p-2 rounded">
                🫁 RR: {patient.respiratoryRate}
              </div>
              <div className="border p-2 rounded">
                O2: {patient.oxygenSat}% {patient.isOnOxygen && "(Supp)"}
              </div>
              <div className="border p-2 rounded">
                🌡️ Temp: {patient.temperature}°C
              </div>
              <div className="border p-2 rounded">
                🧠 Alert: {patient.consciousness}
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden">
            <ClinicalNotesFeed
              patientId={patient.id}
              initialNotes={patient.history}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
