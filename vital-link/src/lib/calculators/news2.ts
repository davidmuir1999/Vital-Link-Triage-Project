type Vitals = {
  respiratoryRate: number;
  oxygenSat: number;
  isOnOxygen: boolean;
  hypercapnicFailure: boolean;
  temperature: number;
  bpSystolic: number;
  heartRate: number;
  consciousness: "ALERT" | "CONFUSION" | "VOICE" | "PAIN" | "UNRESPONSIVE";
};

export function calculateNEWS2(v: Vitals): number {
  let score = 0;

  if (v.respiratoryRate <= 8 || v.respiratoryRate >= 25) score += 3;
  else if (v.respiratoryRate >= 21 && v.respiratoryRate <= 24) score += 2;
  else if (v.respiratoryRate >= 9 && v.respiratoryRate <= 11) score += 1;

  if (!v.hypercapnicFailure) {
    if (v.oxygenSat <= 91) score += 3;
    else if (v.oxygenSat >= 92 && v.oxygenSat <= 93) score += 2;
    else if (v.oxygenSat >= 94 && v.oxygenSat <= 95) score += 1;
  }

  if (v.hypercapnicFailure) {
    if (v.oxygenSat <= 83 || v.oxygenSat >= 97) score += 3;
    else if (v.oxygenSat >= 95 && v.oxygenSat <= 96) score += 2;
    else if (v.oxygenSat >= 93 && v.oxygenSat <= 94) score += 1;
    else if (v.oxygenSat >= 84 && v.oxygenSat <= 85) score += 2;
    else if (v.oxygenSat >= 86 && v.oxygenSat <= 87) score += 1;
  }

  if (v.isOnOxygen) score += 2;

  if (v.temperature <= 35.0) score += 3;
  else if (v.temperature >= 39.1) score += 2;
  else if (v.temperature >= 35.1 && v.temperature <= 36.0) score += 1;
  else if (v.temperature >= 38.1 && v.temperature <= 39.0) score += 1;

  if (v.bpSystolic <= 90 || v.bpSystolic >= 220) score += 3;
  else if (v.bpSystolic >= 91 && v.bpSystolic <= 100) score += 2;
  else if (v.bpSystolic >= 101 && v.bpSystolic <= 110) score += 1;

  if (v.heartRate <= 40 || v.heartRate >= 131) score += 3;
  else if (v.heartRate >= 111 && v.heartRate <= 130) score += 2;
  else if (v.heartRate >= 41 && v.heartRate <= 50) score += 1;
  else if (v.heartRate >= 91 && v.heartRate <= 110) score += 1;

  if (v.consciousness === "ALERT") score += 0;
  else score += 3;

  return score;
}

export function getRiskColor(score: number): string {
  if (score >= 7) return "bg-red-500 text-white";

  if (score >= 5) return "bg-orange-500 text-white";

  if (score >= 1) return "bg-yellow-400 text-black";

  return "bg-green-500 text-white";
}
