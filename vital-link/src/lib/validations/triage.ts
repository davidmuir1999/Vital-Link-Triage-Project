import { z } from "zod";

// We mirror the Prisma Enum here for validation
const ComplaintCategoryEnum = z.enum([
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
]);

export const TriageSchema = z.object({
  // --- Demographics ---
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),

  // HTML Date inputs return strings (e.g. "1990-01-01"), so we coerce them to Date objects
  dob: z.preprocess(
    (val) =>
      val === "" || val === undefined ? undefined : new Date(val as string),
    z.date({ error: "Date of birth is required" })
  ),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    error: () => "Please select a gender",
  }),
  nhsNumber: z
    .string()
    .length(10, "NHS Number must be exactly 10 digits")
    .regex(/^\d+$/, "NHS Number must contain only numbers"),

  // --- Clinical Info ---
  respiratoryRate: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ error: "Resrpiratory rate is required" }).min(0).max(100)
  ),
  oxygenSat: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ error: "Oxygen saturation is required" }).min(0).max(100)
  ),
  isOnOxygen: z.boolean().default(false), // Checkbox
  hypercapnicFailure: z.boolean().default(false), // Checkbox (Risk of Type 2 failure)

  temperature: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ error: "Temperature is required" }).min(20).max(45)
  ),
  bpSystolic: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ error: "Systolic blood pressure is required" }).min(0).max(300)
  ),
  heartRate: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ error: "Heart rate is required" }).min(0).max(300)
  ),

  // ACVPU Scale
  consciousness: z.enum([
    "ALERT",
    "CONFUSION",
    "VOICE",
    "PAIN",
    "UNRESPONSIVE",
  ]),

  complaintCategory: z
    .array(z.string())
    .min(1, "Select at least one complaint"),
  complaintDetails: z.string().optional(),
});

// Export the type so we can use it in our React Form
export type TriageFormData = z.infer<typeof TriageSchema>;
