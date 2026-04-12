"use client";

import { Prisma } from "@prisma/client";
import { Maximize2, EllipsisVertical, Activity, X, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { dischargePatient } from "../actions/bed-management";
import { updatePatientVitals } from "../actions/clinical-actions";
import ClinicalNotesFeed from "./ClinicalNotesFeed";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const clientVitalsSchema = z.object({
  heartRate: z.number().min(10, "Too low").max(300, "Too high"),
  bpSystolic: z.number().min(30, "Too low").max(300, "Too high"),
  respiratoryRate: z.number().min(0).max(100),
  oxygenSat: z.number().min(0).max(100),
  temperature: z.number().min(25).max(45),
  isOnOxygen: z.boolean(),
  hypercapnicFailure: z.boolean(),
  consciousness: z.enum([
    "ALERT",
    "CONFUSION",
    "VOICE",
    "PAIN",
    "UNRESPONSIVE",
  ]),
});

type VitalsFormValues = z.infer<typeof clientVitalsSchema>;

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
  const [isEditingVitals, setIsEditingVitals] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VitalsFormValues>({
    resolver: zodResolver(clientVitalsSchema),
    mode: "onChange", // Validates as the user types
    defaultValues: {
      heartRate: patient?.heartRate || 0,
      bpSystolic: patient?.bpSystolic || 0,
      respiratoryRate: patient?.respiratoryRate || 0,
      oxygenSat: patient?.oxygenSat || 0,
      temperature: patient?.temperature || 0,
      isOnOxygen: patient?.isOnOxygen || false,
      hypercapnicFailure: patient?.hypercapnicFailure || false,
      consciousness: (patient?.consciousness as any) || "ALERT",
    },
  });

  if (!patient) return null;

  const handleDischarge = () => {
    if (
      !window.confirm(
        `Are you sure you want to discharge ${patient.firstName} ${patient.lastName}?`
      )
    )
      return;
    startTransition(async () => {
      const result = await dischargePatient(bed.id, patient.id);
      if (result.error) toast.error(result.error);
      else
        toast.success(`${patient.firstName} ${patient.lastName} discharged.`);
    });
  };

  const onSubmit: SubmitHandler<VitalsFormValues> = (data) => {
    const formData = new FormData();
    formData.append("heartRate", data.heartRate.toString());
    formData.append("bpSystolic", data.bpSystolic.toString());
    formData.append("respiratoryRate", data.respiratoryRate.toString());
    formData.append("oxygenSat", data.oxygenSat.toString());
    formData.append("temperature", data.temperature.toString());
    formData.append("consciousness", data.consciousness);
    if (data.isOnOxygen) formData.append("isOnOxygen", "on");
    if (data.hypercapnicFailure) formData.append("hypercapnicFailure", "on");

    startTransition(async () => {
      const result = await updatePatientVitals(patient.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Vitals saved. New NEWS2 Score: ${result.news2Score}`);
        setIsEditingVitals(false);
      }
    });
  };

  return (
    <Dialog>
      {/* TRIGGER AND DROPDOWN STAYS THE SAME */}
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
            <DropdownMenuItem
              onClick={handleDischarge}
              disabled={isPending}
              className={`font-medium cursor-pointer focus:bg-red-50 focus:text-red-700 ${
                isPending ? "text-gray-400" : "text-red-600"
              }`}
            >
              {isPending ? "Discharging..." : "Discharge Patient"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DialogContent className="!max-w-[80vw] h-[90vh] flex flex-col p-6">
        <DialogHeader className="border-b pb-4 shrink-0">
          <DialogTitle className="text-2xl flex justify-between items-center pt-4">
            <span>
              {patient.lastName}, {patient.firstName}
            </span>
            <span
              className={`text-sm px-3 py-1 rounded-full font-bold ${
                patient.news2Score >= 7
                  ? "bg-red-100 text-red-800"
                  : patient.news2Score >= 5
                  ? "bg-orange-100 text-orange-800"
                  : patient.news2Score >= 1
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
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

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden mt-4">
          {/* LEFT COLUMN: OVERVIEW & VITALS */}
          <div className="border-r pr-6 overflow-y-auto flex flex-col pb-4">
            <h3 className="font-bold text-lg mb-3 text-gray-800">
              Clinical Overview
            </h3>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mb-6">
              <p className="font-semibold text-sm text-slate-800">
                Presenting Complaints:
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {patient.complaintCategory.join(", ").replace(/_/g, " ")}
              </p>
              {patient.complaintDetails && (
                <p className="text-sm text-slate-500 italic mt-2 border-l-2 border-slate-300 pl-2">
                  "{patient.complaintDetails}"
                </p>
              )}
            </div>

            <div className="flex justify-between items-end mb-3 border-b pb-2">
              <h4 className="font-semibold text-gray-800">Current Vitals</h4>
              {!isEditingVitals && (
                <button
                  onClick={() => setIsEditingVitals(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Activity size={14} /> Update Vitals
                </button>
              )}
            </div>

            {isEditingVitals ? (
              /* THE NEW UI-POLISHED FORM */
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <label className="flex flex-col text-sm font-medium text-gray-700">
                    <span className="flex justify-between">
                      Heart Rate
                      {errors.heartRate && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.heartRate.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("heartRate", { valueAsNumber: true })}
                      type="number"
                      className={`mt-1 h-9 px-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        errors.heartRate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />{" "}
                  </label>

                  <label className="flex flex-col text-sm font-medium text-gray-700">
                    <span className="flex justify-between">
                      BP (Systolic)
                      {errors.bpSystolic && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.bpSystolic.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("bpSystolic", { valueAsNumber: true })}
                      type="number"
                      className={`mt-1 h-9 px-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        errors.bpSystolic
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />{" "}
                  </label>

                  <label className="flex flex-col text-sm font-medium text-gray-700">
                    <span className="flex justify-between">
                      Resp Rate
                      {errors.respiratoryRate && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.respiratoryRate.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("respiratoryRate", { valueAsNumber: true })}
                      type="number"
                      className={`mt-1 h-9 px-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        errors.respiratoryRate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />{" "}
                  </label>

                  <label className="flex flex-col text-sm font-medium text-gray-700">
                    <span className="flex justify-between">
                      O2 Saturation %
                      {errors.oxygenSat && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.oxygenSat.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("oxygenSat", { valueAsNumber: true })}
                      type="number"
                      className={`mt-1 h-9 px-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        errors.oxygenSat
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />{" "}
                  </label>

                  <label className="flex flex-col text-sm font-medium text-gray-700">
                    <span className="flex justify-between">
                      Temperature °C
                      {errors.temperature && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.temperature.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("temperature", { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className={`mt-1 h-9 px-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        errors.temperature
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />{" "}
                  </label>

                  <label className="flex flex-col text-sm font-medium text-gray-700">
                    Consciousness
                    <select
                      {...register("consciousness")}
                      className="mt-1 h-9 px-3 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="ALERT">Alert</option>
                      <option value="CONFUSION">New Confusion</option>
                      <option value="VOICE">Responds to Voice</option>
                      <option value="PAIN">Responds to Pain</option>
                      <option value="UNRESPONSIVE">Unresponsive</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      {...register("isOnOxygen")}
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                        Supplemental Oxygen
                      </span>
                      <span className="text-xs text-gray-500">
                        Patient is currently receiving oxygen therapy
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      {...register("hypercapnicFailure")}
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                        Target SpO2 88-92%
                      </span>
                      <span className="text-xs text-gray-500">
                        COPD / Known hypercapnic respiratory failure
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingVitals(false)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !isValid}
                    className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />{" "}
                    {isPending ? "Calculating..." : "Save & Calculate"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500 font-medium">HR</span>
                  <span className="font-bold text-gray-900">
                    {patient.heartRate}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      bpm
                    </span>
                  </span>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500 font-medium">BP</span>
                  <span className="font-bold text-gray-900">
                    {patient.bpSystolic}
                  </span>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Resp</span>
                  <span className="font-bold text-gray-900">
                    {patient.respiratoryRate}
                  </span>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500 font-medium">SpO2</span>
                  <span className="font-bold text-gray-900">
                    {patient.oxygenSat}%{" "}
                    {patient.isOnOxygen && (
                      <span className="text-blue-500 text-xs font-bold ml-1">
                        O2
                      </span>
                    )}
                  </span>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Temp</span>
                  <span className="font-bold text-gray-900">
                    {patient.temperature}°
                  </span>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Conscious</span>
                  <span className="font-bold text-gray-900 truncate w-20 text-right">
                    {patient.consciousness}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CLINICAL NOTES */}
          <div className="h-full overflow-hidden flex flex-col bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="p-4 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-lg text-gray-800">
                Clinical Notes
              </h3>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ClinicalNotesFeed
                patientId={patient.id}
                initialNotes={[...patient.history].sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
