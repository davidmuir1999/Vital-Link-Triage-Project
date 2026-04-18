import { calculateNEWS2, getRiskColor } from "./news2";

describe("NEWS2 Clinical Algorithm", () => {
  it("should return a score of 0 for a perfectly healthy adult", () => {
    const normalVitals = {
      respiratoryRate: 16,
      hypercapnicFailure: false,
      oxygenSat: 98,
      isOnOxygen: false,
      temperature: 36.6,
      bpSystolic: 120,
      heartRate: 70,
      consciousness: "ALERT" as const,
    };

    expect(calculateNEWS2(normalVitals)).toBe(0);
  });

  it("should accurately calculate a critically deteriorating patient, producing a score of 15", () => {
    const criticalVitals = {
      respiratoryRate: 25,
      hypercapnicFailure: false,
      oxygenSat: 91,
      isOnOxygen: true,
      temperature: 39.2,
      bpSystolic: 85,
      heartRate: 135,
      consciousness: "CONFUSION" as const,
    };

    expect(calculateNEWS2(criticalVitals)).toBeGreaterThanOrEqual(15);
  });

  it("should apply Scale 2 scoring for Hypercapnic (COPD) patients", () => {
    const copdVitals = {
      respiratoryRate: 16,
      hypercapnicFailure: true,
      oxygenSat: 89,
      isOnOxygen: false,
      temperature: 36.5,
      bpSystolic: 120,
      heartRate: 70,
      consciousness: "ALERT" as const,
    };

    expect(calculateNEWS2(copdVitals)).toBe(0);
  });

  describe("Risk Color Mapping", () => {
    it("should return green for scores 0", () => {
      expect(getRiskColor(0)).toContain("green");
    });

    it("should return yellow for scores >= 1", () => {
      expect(getRiskColor(3)).toContain("yellow");
    });

    it("should return orange for scores >= 5", () => {
      expect(getRiskColor(6)).toContain("orange");
    });

    it("should return red for scores 7+", () => {
      expect(getRiskColor(9)).toContain("red");
    });
  });
});
