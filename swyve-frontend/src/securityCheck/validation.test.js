import {
    validateEmail,
    passwordRules,
    passwordStrength,
  } from "./validation";
  
  describe("validateEmail", () => {
    it("aksept valid email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
    });
    it("invalid email", () => {
      expect(validateEmail("foo@bar")).toBe(false);
      expect(validateEmail("not-an-email")).toBe(false);
    });
  });
  
  describe("passwordRules", () => {
    const good = passwordRules("Abcdef1!");
    expect(Object.values(good).every(v => v)).toBe(true);
  
    it("check rules", () => {
      const r = passwordRules("Ab1!");
      expect(r.length).toBe(false);
      expect(r.upper).toBe(true);
      expect(r.lower).toBe(true);
      expect(r.digit).toBe(true);
      expect(r.symbol).toBe(true);
    });
  });
  
  describe("passwordStrength", () => {
    it("gir lav score for svakt passord", () => {
      expect(passwordStrength("123")).toBeLessThan(2);
    });
    it("gir høyere score for sterkt passord", () => {
      expect(passwordStrength("CorrectHorseBatteryStaple!1")).toBeGreaterThanOrEqual(3);
    });
  });