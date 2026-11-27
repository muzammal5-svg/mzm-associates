import { describe, it, expect } from "vitest";
import {
  CASE_TYPE_DEFINITIONS,
  getCaseTypeDefinition,
  getCaseTypeDisplayName,
  getPartyConfigForCaseType,
  getFromRoleSuggestions,
  isSecondaryPartyRole,
  getMappedFromRole,
} from "@/lib/caseTypeConfig";

describe("Case Type & Dynamic Party Mapping", () => {
  it("includes all 6 standardized case types", () => {
    const names = CASE_TYPE_DEFINITIONS.map(d => d.name);
    expect(names).toEqual([
      "Civil Case",
      "Criminal Case",
      "Constitutional Case",
      "Appeal",
      "Execution",
      "Arbitration",
    ]);
  });

  it("correctly maps parties for Civil Case (from Civil Court)", () => {
    const def = getCaseTypeDefinition("Civil Court");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Civil Case");
    expect(def?.parties.primaryEn).toBe("Plaintiff");
    expect(def?.parties.primaryUr).toBe("مدعی");
    expect(def?.parties.secondaryEn).toBe("Defendant");
    expect(def?.parties.secondaryUr).toBe("مدعا علیہ");
    expect(def?.defaultFrom).toBe("Plaintiff");
  });

  it("correctly maps parties for Criminal Case (from Criminal Court)", () => {
    const def = getCaseTypeDefinition("Criminal Court");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Criminal Case");
    expect(def?.requiresOffence).toBe(true);
    expect(def?.parties.primaryEn).toBe("State");
    expect(def?.parties.primaryUr).toBe("ریاست");
    expect(def?.parties.secondaryEn).toBe("Accused");
    expect(def?.parties.secondaryUr).toBe("ملزم");
    expect(def?.defaultFrom).toBe("Accused");
  });

  it("correctly maps parties for Constitutional Case (from Constitutional Court / Writ)", () => {
    const def = getCaseTypeDefinition("Constitutional Court");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Constitutional Case");
    expect(def?.parties.primaryEn).toBe("Petitioner");
    expect(def?.parties.primaryUr).toBe("درخواست گزار");
    expect(def?.parties.secondaryEn).toBe("Respondent");
    expect(def?.parties.secondaryUr).toBe("جواب دہندہ");
    expect(def?.defaultFrom).toBe("Petitioner");

    // Also checks writ alias
    const writDef = getCaseTypeDefinition("Writ");
    expect(writDef?.name).toBe("Constitutional Case");
  });

  it("correctly maps parties for Appeal", () => {
    const def = getCaseTypeDefinition("Appeal");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Appeal");
    expect(def?.parties.primaryEn).toBe("Appellant");
    expect(def?.parties.primaryUr).toBe("اپیل کنندہ");
    expect(def?.parties.secondaryEn).toBe("Respondent");
    expect(def?.parties.secondaryUr).toBe("جواب دہندہ");
    expect(def?.defaultFrom).toBe("Appellant");
  });

  it("correctly maps parties for Execution", () => {
    const def = getCaseTypeDefinition("Execution");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Execution");
    expect(def?.parties.primaryEn).toBe("Decree-holder");
    expect(def?.parties.primaryUr).toBe("ڈگری یافتہ");
    expect(def?.parties.secondaryEn).toBe("Judgment-debtor");
    expect(def?.parties.secondaryUr).toBe("ڈگری کا پابند");
    expect(def?.defaultFrom).toBe("Decree-holder");
  });

  it("correctly maps parties for Arbitration", () => {
    const def = getCaseTypeDefinition("Arbitration");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Arbitration");
    expect(def?.parties.primaryEn).toBe("Claimant");
    expect(def?.parties.primaryUr).toBe("دعوئ کرنے والا");
    expect(def?.parties.secondaryEn).toBe("Respondent");
    expect(def?.parties.secondaryUr).toBe("جواب دہندہ");
    expect(def?.defaultFrom).toBe("Claimant");
  });

  it("returns localized display names", () => {
    expect(getCaseTypeDisplayName("Civil Court", "en")).toBe("Civil Case");
    expect(getCaseTypeDisplayName("Civil Court", "ur")).toBe("دیوانی مقدمہ (Civil Case)");
    expect(getCaseTypeDisplayName("Criminal Court", "ur")).toBe("فوجداری مقدمہ (Criminal Case)");
  });

  it("prioritizes suggestions based on active case type", () => {
    const civilSuggestions = getFromRoleSuggestions("Civil Case");
    expect(civilSuggestions[0]).toBe("Plaintiff");
    expect(civilSuggestions[1]).toBe("Defendant");

    const criminalSuggestions = getFromRoleSuggestions("Criminal Case");
    expect(criminalSuggestions).toContain("State");
    expect(criminalSuggestions).toContain("Accused");

    const executionSuggestions = getFromRoleSuggestions("Execution");
    expect(executionSuggestions[0]).toBe("Decree-holder");
    expect(executionSuggestions[1]).toBe("Judgment-debtor");
  });

  it("correctly identifies secondary party roles", () => {
    expect(isSecondaryPartyRole("Defendant")).toBe(true);
    expect(isSecondaryPartyRole("Accused")).toBe(true);
    expect(isSecondaryPartyRole("Respondent")).toBe(true);
    expect(isSecondaryPartyRole("Judgment-debtor")).toBe(true);

    expect(isSecondaryPartyRole("Plaintiff")).toBe(false);
    expect(isSecondaryPartyRole("State")).toBe(false);
    expect(isSecondaryPartyRole("Petitioner")).toBe(false);
    expect(isSecondaryPartyRole("Appellant")).toBe(false);
    expect(isSecondaryPartyRole("Decree-holder")).toBe(false);
    expect(isSecondaryPartyRole("Claimant")).toBe(false);
  });

  it("intelligently remaps From role when switching case types", () => {
    // Primary to primary
    expect(getMappedFromRole("Plaintiff", "Civil Case", "Constitutional Case")).toBe("Petitioner");
    expect(getMappedFromRole("Plaintiff", "Civil Case", "Appeal")).toBe("Appellant");
    expect(getMappedFromRole("Plaintiff", "Civil Case", "Execution")).toBe("Decree-holder");
    expect(getMappedFromRole("Plaintiff", "Civil Case", "Arbitration")).toBe("Claimant");

    // Secondary to secondary
    expect(getMappedFromRole("Defendant", "Civil Case", "Criminal Case")).toBe("Accused");
    expect(getMappedFromRole("Defendant", "Civil Case", "Constitutional Case")).toBe("Respondent");
    expect(getMappedFromRole("Defendant", "Civil Case", "Execution")).toBe("Judgment-debtor");
  });
});
