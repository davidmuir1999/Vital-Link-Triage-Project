"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriageSchema, TriageFormData } from "../lib/validations/triage";
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
// import { createPatient } from "@/app/actions/triage"
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function NewPatientForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    // 1. Initialize Form with Zod Resolver
    const form = useForm({
      resolver: zodResolver(TriageSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        nhsNumber: "",
        complaintDetails: "",
        complaintCategory: undefined,
        gender: undefined,
        dob: undefined,
        heartRate: undefined, 
        bpSystolic: undefined,
        bpDiastolic: undefined,
        temperature: undefined,
        oxygenSat: undefined,
      } as any,
    });
  
    // 2. Handle Submission
    async function onSubmit(data: TriageFormData) {
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
                          <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                      control={form.control}
                      name="heartRate"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Heart Rate (bpm)</FormLabel>
                          <FormControl>
                          <Input type="number" {...field} />
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
                          <FormLabel>O2 Saturation (%)</FormLabel>
                          <FormControl>
                          <Input type="number" {...field} />
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
                          <Input type="number" step="0.1" min="0" {...field} />
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
                          <FormLabel>BP Systolic</FormLabel>
                          <FormControl>
                          <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
  
                  <FormField
                      control={form.control}
                      name="bpDiastolic"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>BP Diastolic</FormLabel>
                          <FormControl>
                          <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
              </div>
          </div>
          
          {/* --- SECTION 3: COMPLAINT --- */}
          <div className="space-y-4">
              <FormField
                  control={form.control}
                  name="complaintCategory"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Presenting Complaint</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger>
                          <SelectValue placeholder="Select primary complaint" />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {/* Just a few examples to keep code short, map the full list later */}
                          <SelectItem value="CHEST_PAIN">Chest Pain</SelectItem>
                          <SelectItem value="SHORTNESS_OF_BREATH">Shortness of Breath</SelectItem>
                          <SelectItem value="ABDOMINAL_PAIN">Abdominal Pain</SelectItem>
                          <SelectItem value="HEADACHE">Headache</SelectItem>
                          <SelectItem value="TRAUMA_FALL">Trauma (Fall)</SelectItem>
                      </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
  
              <FormField
                  control={form.control}
                  name="complaintDetails"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Clinical Notes</FormLabel>
                      <FormControl>
                      <Input placeholder="Additional context (e.g. 'Patient states pain started 2 hours ago...')" {...field} />
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