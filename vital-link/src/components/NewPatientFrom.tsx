"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriageSchema } from "../lib/validations/triage";
import { calculateNEWS2, getRiskColor } from "../lib/calculators/news2";
import { createPatient } from "../actions/triage";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import SelectSearch from "react-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

export default function NewPatientForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<
    z.input<typeof TriageSchema>,
    any,
    z.output<typeof TriageSchema>
  >({
    resolver: zodResolver(TriageSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      nhsNumber: "",
      complaintDetails: "",
      complaintCategory: [],
      gender: undefined,
      dob: undefined,
      respiratoryRate: "",
      isOnOxygen: false,
      hypercapnicFailure: false,
      consciousness: undefined,
      heartRate: "",
      bpSystolic: "",
      temperature: "",
      oxygenSat: "",
    },
  });

  async function onSubmit(data: z.output<typeof TriageSchema>) {
    setIsSubmitting(true);

    const sanitizedData = {
      ...data,
      nhsNumber: data.nhsNumber.replace(/\s/g, ""),
    };

    const result = await createPatient(sanitizedData);

    setIsSubmitting(false);

    if (result?.error) {
      toast.error("Failed to save patient. Please try again.");
    } else {
      toast.success("Patient Admitted");
      router.push("/dashboard");
    }
  }

  const watchedVitals = form.watch([
    "respiratoryRate",
    "hypercapnicFailure",
    "oxygenSat",
    "isOnOxygen",
    "temperature",
    "bpSystolic",
    "heartRate",
    "consciousness",
  ]);

  const currentScore = calculateNEWS2({
    respiratoryRate: Number(watchedVitals[0]) || 16,
    hypercapnicFailure: Boolean(watchedVitals[1]),
    oxygenSat: Number(watchedVitals[2]) || 96,
    isOnOxygen: Boolean(watchedVitals[3]),
    temperature: Number(watchedVitals[4]) || 36.5,
    bpSystolic: Number(watchedVitals[5]) || 160,
    heartRate: Number(watchedVitals[6]) || 70,
    consciousness:
      (watchedVitals[7] as
        | "ALERT"
        | "CONFUSION"
        | "VOICE"
        | "PAIN"
        | "UNRESPONSIVE") || "ALERT",
  });

  const scoreColor = getRiskColor(currentScore);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 p-5 border rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900">Patient Demographics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nhsNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NHS Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 456 7890"
                      {...field}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const formatted =
                          rawValue.length > 6
                            ? `${rawValue.slice(0, 3)} ${rawValue.slice(
                                3,
                                6
                              )} ${rawValue.slice(6, 10)}`
                            : rawValue.length > 3
                            ? `${rawValue.slice(0, 3)} ${rawValue.slice(3, 6)}`
                            : rawValue;
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      name={field.name}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      value={
                        field.value
                          ? new Date(field.value as string)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 p-5 border border-blue-100 rounded-xl bg-blue-50/50 shadow-sm">
          <div className="pb-2 border-b border-blue-100">
            <h3 className="font-semibold text-blue-900 m-0">
              Vital Signs (NEWS2)
            </h3>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mt-2">
              Protocol: Adult (16+)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 pt-2">
            <FormField
              control={form.control}
              name="respiratoryRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resp Rate (bpm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="oxygenSat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SpO₂ (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temp (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bpSystolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic BP</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="heartRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heart Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consciousness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consciousness</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALERT">Alert</SelectItem>
                      <SelectItem value="CONFUSION">Confusion</SelectItem>
                      <SelectItem value="VOICE">Voice</SelectItem>
                      <SelectItem value="PAIN">Pain</SelectItem>
                      <SelectItem value="UNRESPONSIVE">Unresponsive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4">
            <FormField
              control={form.control}
              name="hypercapnicFailure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 border border-blue-200 bg-white p-4 rounded-lg shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-blue-600 border-blue-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-medium">
                      Use SpO₂ Scale 2
                    </FormLabel>
                    <p className="text-xs text-gray-500">
                      Known COPD / Type 2 Respiratory Failure (Target 88-92%)
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isOnOxygen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 border border-blue-200 bg-white p-4 rounded-lg shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-blue-600 border-blue-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-medium">
                      Patient is on O₂
                    </FormLabel>
                    <p className="text-xs text-gray-500">
                      Check if patient is currently receiving Air/O₂ therapy
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div
            className={`mt-6 p-5 rounded-xl flex items-center justify-between border-2 shadow-sm transition-colors ${
              scoreColor.includes("red")
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                Live NEWS2 Score
              </h3>
              <p className="text-sm text-gray-500">
                Calculated automatically from vital signs
              </p>
            </div>
            <div
              className={`text-4xl font-black px-6 py-2 rounded-lg shadow-inner ${scoreColor}`}
            >
              {currentScore}
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 border rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            Clinical Presentation
          </h3>

          <FormField
            control={form.control}
            name="complaintCategory"
            render={({ field }) => {
              const complaintOptions = [
                "CHEST_PAIN",
                "PALPITATIONS",
                "HYPERTENSION",
                "CARDIAC_ARREST",
                "SHORTNESS_OF_BREATH",
                "ASTHMA_COPD_FLARE",
                "RESPIRATORY_ARREST",
                "COUGH_HEMOPTYSIS",
                "HEADACHE",
                "SEIZURE",
                "STROKE_CVA",
                "LOSS_OF_CONSCIOUSNESS",
                "CONFUSION_ALTERED_STATE",
                "DIZZINESS_VERTIGO",
                "ABDOMINAL_PAIN",
                "NAUSEA_VOMITING",
                "GI_BLEED",
                "DIARRHEA",
                "TRAUMA_FALL",
                "TRAUMA_ROAD_ACCIDENT",
                "TRAUMA_ASSAULT",
                "BURN",
                "LACERATION_CUT",
                "HEAD_INJURY",
                "FRACTURE_DISLOCATION",
                "SUICIDAL_IDEATION",
                "SELF_HARM",
                "PSYCHOSIS_MANIA",
                "ANXIETY_PANIC",
                "AGGRESSIVE_BEHAVIOR",
                "FEVER_SEPSIS",
                "ALLERGIC_REACTION",
                "OVERDOSE_POISONING",
                "PREGNANCY_COMPLICATION",
                "GENERAL_MALAISE",
                "OTHER",
              ].map((item) => ({
                value: item,
                label: item.replace(/_/g, " "),
              }));

              const selectedValues =
                field.value?.map((val: string) =>
                  complaintOptions.find((opt) => opt.value === val)
                ) || [];

              return (
                <FormItem>
                  <FormLabel>Presenting Complaints</FormLabel>
                  <FormControl>
                    <SelectSearch
                      isMulti
                      placeholder="Search and select complaints..."
                      options={complaintOptions}
                      value={selectedValues}
                      onChange={(selectedOptions) => {
                        field.onChange(
                          selectedOptions
                            ? selectedOptions.map((opt) => opt?.value)
                            : []
                        );
                      }}
                      className="text-sm"
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #3b82f6"
                            : "none",
                          borderRadius: "0.5rem",
                          padding: "2px",
                        }),
                        multiValue: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: "#eff6ff",
                          borderRadius: "6px",
                        }),
                        multiValueLabel: (baseStyles) => ({
                          ...baseStyles,
                          color: "#1d4ed8",
                          fontWeight: 500,
                        }),
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    You can search and select multiple conditions.
                  </p>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="complaintDetails"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FormLabel>Clinical Notes</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-25 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Provide additional context (e.g. 'Patient states pain started 2 hours ago. Radiating to left arm.')"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="w-5 h-5 text-white" /> Processing Admission...
            </span>
          ) : (
            "Complete Triage Admission"
          )}
        </Button>
      </form>
    </Form>
  );
}
