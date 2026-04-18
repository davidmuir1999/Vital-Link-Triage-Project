"use client";

import { Prisma } from "@prisma/client";
import { Maximize2, EllipsisVertical, Activity, Save } from "lucide-react";
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
    mode: "onChange",
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
      <div className="text-gray-400 flex gap-2 z-10 p-2">
        <DialogTrigger asChild>
          <button className="hover:text-black hover:bg-gray-100 p-1.5 rounded-md transition duration-200">
            <Maximize2 className="w-4 h-4" />
          </button>
        </DialogTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:text-black hover:bg-gray-100 p-1.5 rounded-md transition duration-200">
              <EllipsisVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Bed Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-amber-600 font-medium cursor-pointer">
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

      <DialogContent className="max-w-[80vw]! h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="border-b pb-4 shrink-0 pr-8">
          <DialogTitle className="text-2xl flex items-center gap-4 pt-2">
            <span className="font-bold text-slate-900">
              {patient.lastName}, {patient.firstName}
            </span>
            <span
              className={`text-sm px-3 py-1 rounded-md font-bold shadow-sm ${
                patient.news2Score >= 7
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : patient.news2Score >= 5
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : patient.news2Score >= 1
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              NEWS2: {patient.news2Score}
            </span>
          </DialogTitle>
          <div className="text-sm text-slate-500 flex flex-wrap gap-x-6 gap-y-1 mt-2">
            <span className="font-mono">NHS: {patient.nhsNumber}</span>
            <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
            <span>
              Admitted:{" "}
              {new Date(patient.admissionDate).toLocaleString([], {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden mt-4">
          <div className="lg:border-r pr-2 lg:pr-6 overflow-y-auto flex flex-col pb-4">
            <h3 className="font-bold text-lg mb-3 text-slate-800">
              Clinical Overview
            </h3>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 shadow-sm">
              <p className="font-semibold text-sm text-slate-800">
                Presenting Complaints:
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {patient.complaintCategory.join(", ").replace(/_/g, " ")}
              </p>
              {patient.complaintDetails && (
                <p className="text-sm text-slate-500 italic mt-3 border-l-2 border-slate-300 pl-3">
                  "{patient.complaintDetails}"
                </p>
              )}
            </div>

            <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800">Current Vitals</h4>

              {!isEditingVitals && (
                <button
                  onClick={() => setIsEditingVitals(true)}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 shadow-sm"
                >
                  <Activity size={14} /> Update Vitals
                </button>
              )}
            </div>

            {isEditingVitals ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* ... (Numerical inputs remain the same logic, but with tightened UI classes) ... */}
                  <label className="flex flex-col text-sm font-medium text-slate-700">
                    <span className="flex justify-between mb-1">
                      Heart Rate{" "}
                      {errors.heartRate && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.heartRate.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("heartRate", { valueAsNumber: true })}
                      type="number"
                      className={`h-10 px-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        errors.heartRate
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      }`}
                    />
                  </label>

                  <label className="flex flex-col text-sm font-medium text-slate-700">
                    <span className="flex justify-between mb-1">
                      BP (Systolic){" "}
                      {errors.bpSystolic && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.bpSystolic.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("bpSystolic", { valueAsNumber: true })}
                      type="number"
                      className={`h-10 px-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        errors.bpSystolic
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      }`}
                    />
                  </label>

                  <label className="flex flex-col text-sm font-medium text-slate-700">
                    <span className="flex justify-between mb-1">
                      Resp Rate{" "}
                      {errors.respiratoryRate && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.respiratoryRate.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("respiratoryRate", { valueAsNumber: true })}
                      type="number"
                      className={`h-10 px-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        errors.respiratoryRate
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      }`}
                    />
                  </label>

                  <label className="flex flex-col text-sm font-medium text-slate-700">
                    <span className="flex justify-between mb-1">
                      SpO2 %{" "}
                      {errors.oxygenSat && (
                        <span className="text-red-500 text-[10px] uppercase font-bold">
                          {errors.oxygenSat.message}
                        </span>
                      )}
                    </span>
                    <input
                      {...register("oxygenSat", { valueAsNumber: true })}
                      type="number"
                      className={`h-10 px-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        errors.oxygenSat
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      }`}
                    />
                  </label>

                  <label className="flex flex-col text-sm font-medium text-slate-700">
                    <span className="flex justify-between mb-1">
                      Temp °C{" "}
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
                      className={`h-10 px-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        errors.temperature
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200"
                      }`}
                    />
                  </label>

                  <label className="flex flex-col text-sm font-medium text-slate-700">
                    <span className="mb-1">Consciousness</span>
                    <select
                      {...register("consciousness")}
                      className="h-10 px-3 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="ALERT">Alert</option>
                      <option value="CONFUSION">New Confusion</option>
                      <option value="VOICE">Responds to Voice</option>
                      <option value="PAIN">Responds to Pain</option>
                      <option value="UNRESPONSIVE">Unresponsive</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                    <input
                      {...register("isOnOxygen")}
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        Supplemental Oxygen
                      </span>
                      <span className="text-xs text-slate-500">
                        Patient is currently receiving air/oxygen therapy
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                    <input
                      {...register("hypercapnicFailure")}
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        Target SpO2 88-92%
                      </span>
                      <span className="text-xs text-slate-500">
                        COPD / Known hypercapnic respiratory failure
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingVitals(false)}
                    disabled={isPending}
                    className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !isValid}
                    className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />{" "}
                    {isPending ? "Calculating..." : "Save Vitals"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    HR
                  </span>
                  <span className="font-black text-slate-900 text-lg">
                    {patient.heartRate}{" "}
                    <span className="text-xs font-medium text-slate-400">
                      bpm
                    </span>
                  </span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    BP
                  </span>
                  <span className="font-black text-slate-900 text-lg">
                    {patient.bpSystolic}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    Resp
                  </span>
                  <span className="font-black text-slate-900 text-lg">
                    {patient.respiratoryRate}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    SpO2
                  </span>
                  <span className="font-black text-slate-900 text-lg">
                    {patient.oxygenSat}%{" "}
                    {patient.isOnOxygen && (
                      <span className="text-blue-500 text-xs font-bold ml-1 bg-blue-50 px-1 py-0.5 rounded">
                        O2
                      </span>
                    )}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    Temp
                  </span>
                  <span className="font-black text-slate-900 text-lg">
                    {patient.temperature}°
                  </span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    ACVPU
                  </span>
                  <span className="font-black text-slate-900 truncate w-24 text-right">
                    {patient.consciousness}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="h-full overflow-hidden flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200 shadow-inner">
            <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
              <h3 className="font-bold text-lg text-slate-800">
                Clinical Notes Log
              </h3>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ClinicalNotesFeed
                patientId={patient.id}
                initialNotes={[...patient.history]
                  .map((note) => ({
                    ...note,
                    author: note.author || { name: "System", role: "System" },
                  }))
                  .sort(
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
