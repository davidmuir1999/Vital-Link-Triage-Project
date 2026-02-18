import { z } from "zod";

// We mirror the Prisma Enum here for validation
const ComplaintCategoryEnum = z.enum([
  "CHEST_PAIN", "PALPITATIONS", "HYPERTENSION", "CARDIAC_ARREST", "SHORTNESS_OF_BREATH",
  "ASTHMA_COPD_FLARE", "RESPIRATORY_ARREST", "COUGH_HEMOPTYSIS", "HEADACHE", "SEIZURE",
  "STROKE_CVA", "LOSS_OF_CONSCIOUSNESS", "CONFUSION_ALTERED_STATE", "DIZZINESS_VERTIGO",
  "ABDOMINAL_PAIN", "NAUSEA_VOMITING", "GI_BLEED", "DIARRHEA", "TRAUMA_FALL",
  "TRAUMA_ROAD_ACCIDENT", "TRAUMA_ASSAULT", "BURN", "LACERATION_CUT", "HEAD_INJURY",
  "FRACTURE_DISLOCATION", "SUICIDAL_IDEATION", "SELF_HARM", "PSYCHOSIS_MANIA",
  "ANXIETY_PANIC", "AGGRESSIVE_BEHAVIOR", "FEVER_SEPSIS", "ALLERGIC_REACTION",
  "OVERDOSE_POISONING", "PREGNANCY_COMPLICATION", "GENERAL_MALAISE", "OTHER"
]);

export const TriageSchema = z.object({
    // --- Demographics ---
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    
    // HTML Date inputs return strings (e.g. "1990-01-01"), so we coerce them to Date objects
    dob: z.coerce.date({
        error: (issue) => {
            if (issue.input === undefined) return "Date of Birth is required";
            return "Invalid date format";
        },
    }),
    
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
        error: () =>  "Please select a gender",
    }),
    
    nhsNumber: z.string()
        .length(10, "NHS Number must be exactly 10 digits")
        .regex(/^\d+$/, "NHS Number must contain only numbers"),

    // --- Clinical Info ---
    complaintDetails: z.string().optional(), // Optional: Nurse might just pick a category
    complaintCategory: ComplaintCategoryEnum,

    // --- Vital Signs (Inputs for Risk Calculation) ---
    // We use coerce to handle the string-to-number conversion from HTML inputs
    heartRate: z.coerce.number().min(0).max(300, "Invalid HR"),
    bpSystolic: z.coerce.number().min(0).max(300, "Invalid BP"),
    bpDiastolic: z.coerce.number().min(0).max(200, "Invalid BP"),
    temperature: z.coerce.number().min(20).max(45, "Invalid Temp"),
    oxygenSat: z.coerce.number().min(0).max(100, "Invalid O2"),
});

// Export the type so we can use it in our React Form
export type TriageFormData = z.infer<typeof TriageSchema>;