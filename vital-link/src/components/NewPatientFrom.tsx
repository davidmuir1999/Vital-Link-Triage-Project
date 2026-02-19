"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriageSchema} from "../lib/validations/triage";
import { calculateNEWS2, getRiskColor } from "../lib/calculators/news2";
import { Button } from "./ui/button";
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
// import { createPatient } from "@/app/actions/triage"
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function NewPatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Initialize Form with Zod Resolver
  const form = useForm<
    z.input<typeof TriageSchema>,
    any,
    z.output<typeof TriageSchema>
  >({
    resolver: zodResolver(TriageSchema),
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

  // 2. Handle Submission
  async function onSubmit(data: z.output<typeof TriageSchema>) {
    setIsSubmitting(true);

    // We use FormData to pass to Server Action, or just pass the JSON object
    // Passing the raw object is often cleaner if not uploading files
    const result = await createPatient(data);

    setIsSubmitting(false);

    if (result?.error) {
      // Handle server-side errors (e.g. database offline)
      console.error(result.error);
      alert("Failed to save patient. Check console.");
    } else {
      form.reset(); // Clear form on success
    }
  }

  const watchedVitals = form.watch([
    "respiratoryRate",
    "isOnOxygen",
    "hypercapnicFailure",
    "consciousness",
    "heartRate",
    "bpSystolic",
    "temperature",
    "oxygenSat",
  ]);

  const currentScore = calculateNEWS2({
    respiratoryRate: Number(watchedVitals[0]) || 0,
    oxygenSat: Number(watchedVitals[1]) || 0,
    isOnOxygen: Boolean(watchedVitals[2]),
    hypercapnicFailure: Boolean(watchedVitals[3]),
    temperature: Number(watchedVitals[4]) || 0,
    bpSystolic: Number(watchedVitals[5]) || 0,
    heartRate: Number(watchedVitals[6]) || 0,
    consciousness: (watchedVitals[7] as any) || "ALERT", 
  });

  const scoreColor = getRiskColor(currentScore);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- SECTION 1: DEMOGRAPHICS --- */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-900">Patient Demographics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Input placeholder="10-digit number" {...field} />
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

        {/* --- SECTION 2: CLINICAL VITALS --- */}
        <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
          <h3 className="font-medium text-blue-900">Vital Signs (NEWS2)</h3>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="respiratoryRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Respiratory Rate (bpm)</FormLabel>
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
              name="hypercapnicFailure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 border p-4 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use SpO₂ Scale 2</FormLabel>
                    <p className="text-sm text-gray-500">
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 border p-4 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Patient is on O₂</FormLabel>
                    <p className="text-sm text-gray-500">
                      Check if patient is on Air/O₂
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="oxygenSat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oxygen Saturation (SpO₂)</FormLabel>
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
                  <FormLabel>Temperature (°C)</FormLabel>
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
                  <FormLabel>Systolic BP (mmHg)</FormLabel>
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
                  <FormLabel>Heart Rate (bpm)</FormLabel>
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
                  <FormLabel>Level of Consciousness</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consciousness" />
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
          {/* --- LIVE SCORE BANNER --- */}
          <div
            className={`mt-6 p-4 rounded-lg flex items-center justify-between border-2 ${
              scoreColor.includes("red")
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div>
              <h3 className="font-bold text-lg">Live NEWS2 Score</h3>
              <p className="text-sm opacity-80">
                Calculated automatically from vital signs
              </p>
            </div>
            <div
              className={`text-3xl font-black px-6 py-2 rounded-lg shadow-inner ${scoreColor}`}
            >
              {currentScore}
            </div>
          </div>
        </div>

        {/* --- SECTION 3: COMPLAINT --- */}
        <div className="space-y-4">
          <FormLabel>Presenting Complaints (Select all that apply)</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md h-64 overflow-y-auto bg-gray-50">
            {/* We map over an array of your Enum values. 
      You can add all 30+ of them here, or import the list from a constants file. 
    */}
            {[
              "CHEST_PAIN",
              "SHORTNESS_OF_BREATH",
              "HEADACHE",
              "ABDOMINAL_PAIN",
              "TRAUMA_FALL",
              "FEVER_SEPSIS",
              "HYPERTENSION",
              "NAUSEA_VOMITING",
            ].map((item) => (
              <FormField
                key={item}
                control={form.control}
                name="complaintCategory"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={item}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          // 1. Is this specific item in the array? If yes, check the box.
                          checked={field.value?.includes(item)}
                          // 2. When clicked, add or remove it from the array
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), item])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== item
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {/* Makes "CHEST_PAIN" look like "CHEST PAIN" */}
                        {item.replace(/_/g, " ")}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />

          <FormField
            control={form.control}
            name="complaintDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinical Notes</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Additional context (e.g. 'Patient states pain started 2 hours ago...')"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Admit to Triage
        </Button>
      </form>
    </Form>
  );
}
