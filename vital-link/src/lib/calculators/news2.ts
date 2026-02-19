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
  
    // 1. Respiratory Rate
    if (v.respiratoryRate <= 8 || v.respiratoryRate >= 25) score += 3;
    else if (v.respiratoryRate >= 21) score += 2;
    else if (v.respiratoryRate >= 9 && v.respiratoryRate <= 11) score += 1;
  
    // 2. SpO2 (The Fork)
    if (v.hypercapnicFailure) {
      // SCALE 2 (For COPD/Hypercapnic patients)
      if (v.oxygenSat <= 83 || (v.oxygenSat >= 97 && v.isOnOxygen)) score += 3; // Too low OR too high on O2
      else if (v.oxygenSat >= 95 && v.isOnOxygen) score += 2;
      else if (v.oxygenSat >= 93 && v.isOnOxygen) score += 1;
      else if (v.oxygenSat >= 84 && v.oxygenSat <= 85) score += 2;
      else if (v.oxygenSat >= 86 && v.oxygenSat <= 87) score += 1;
    } else {
      // SCALE 1 (Standard)
      if (v.oxygenSat <= 91) score += 3;
      else if (v.oxygenSat <= 93) score += 2;
      else if (v.oxygenSat <= 95) score += 1;
    }
  
    // 3. Air or Oxygen?
    if (v.isOnOxygen) score += 2;
  
    // 4. Systolic BP
    if (v.bpSystolic <= 90 || v.bpSystolic >= 220) score += 3;
    else if (v.bpSystolic <= 100) score += 2;
    else if (v.bpSystolic <= 110) score += 1;
  
    // 5. Pulse
    if (v.heartRate <= 40 || v.heartRate >= 131) score += 3;
    else if (v.heartRate >= 111) score += 2;
    else if (v.heartRate <= 50 || v.heartRate >= 91) score += 1;
  
    // 6. Consciousness (ACVPU)
    if (v.consciousness === "ALERT") score += 0;
    else score += 3; // Any confusion, voice, pain, or unresponsive is automatic +3
    
    // 7. Temperature
    if (v.temperature <= 35.0) score += 3;
    else if (v.temperature >= 39.1) score += 2;
    else if (v.temperature <= 36.0 || v.temperature >= 38.1) score += 1;
  
    return score;
  }

  export function getRiskColor(score: number): string {
    // High Risk: 7 or more
    if (score >= 7) return "bg-red-500 text-white"; 
    
    // Medium Risk: 5 to 6
    if (score >= 5) return "bg-orange-500 text-white"; 
    
    // Low Risk: 1 to 4
    if (score >= 1) return "bg-yellow-400 text-black"; 
    
    // Zero Risk: 0
    return "bg-green-500 text-white"; 
  }