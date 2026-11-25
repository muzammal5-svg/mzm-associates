/**
 * Centralized Case Type & Dynamic Party ("vs") Mapping Configuration.
 *
 * Add or edit case type definitions and party role mappings here so
 * New Case, Edit Case, and shared helpers stay in sync.
 */

export interface PartyRoleConfig {
  /** Primary / first party label in English (maps to plaintiff_name field) */
  primaryEn: string;
  /** Primary / first party label in Urdu */
  primaryUr: string;
  /** Opposing / second party label in English (maps to defendant_name field) */
  secondaryEn: string;
  /** Opposing / second party label in Urdu */
  secondaryUr: string;
  /** Optional input placeholders */
  primaryPlaceholder?: string;
  secondaryPlaceholder?: string;
}

export interface CaseTypeDefinition {
  /** Standardized canonical name */
  name: string;
  /** Urdu display name */
  nameUr: string;
  /** Lowercased aliases / legacy names that resolve to this definition */
  aliases: string[];
  /** Whether the Offence field is required/shown */
  requiresOffence: boolean;
  /** Party ("vs") role mapping */
  parties: PartyRoleConfig;
}

export const CASE_TYPE_DEFINITIONS: readonly CaseTypeDefinition[] = [
  {
    name: "Civil Case",
    nameUr: "دیوانی مقدمہ",
    aliases: ["civil case", "civil court", "civil"],
    requiresOffence: false,
    parties: {
      primaryEn: "Plaintiff",
      primaryUr: "مدعی",
      secondaryEn: "Defendant",
      secondaryUr: "مدعا علیہ",
      primaryPlaceholder: "Muhammad Aslam Khan",
      secondaryPlaceholder: "Province of Punjab",
    },
  },
  {
    name: "Criminal Case",
    nameUr: "فوجداری مقدمہ",
    aliases: ["criminal case", "criminal court", "criminal"],
    requiresOffence: true,
    parties: {
      primaryEn: "State",
      primaryUr: "ریاست",
      secondaryEn: "Accused",
      secondaryUr: "ملزم",
      primaryPlaceholder: "The State",
      secondaryPlaceholder: "Accused Name",
    },
  },
  {
    name: "Constitutional Case",
    nameUr: "آئینی مقدمہ",
    aliases: ["constitutional case", "constitutional court", "constitutional", "writ"],
    requiresOffence: false,
    parties: {
      primaryEn: "Petitioner",
      primaryUr: "درخواست گزار",
      secondaryEn: "Respondent",
      secondaryUr: "جواب دہندہ",
      primaryPlaceholder: "Petitioner Name",
      secondaryPlaceholder: "Federation of Pakistan",
    },
  },
  {
    name: "Appeal",
    nameUr: "اپیل",
    aliases: ["appeal"],
    requiresOffence: false,
    parties: {
      primaryEn: "Appellant",
      primaryUr: "اپیل کنندہ",
      secondaryEn: "Respondent",
      secondaryUr: "جواب دہندہ",
      primaryPlaceholder: "Appellant Name",
      secondaryPlaceholder: "Respondent Name",
    },
  },
  {
    name: "Execution",
    nameUr: "اجراء ڈگری",
    aliases: ["execution"],
    requiresOffence: false,
    parties: {
      primaryEn: "Decree-holder",
      primaryUr: "ڈگری یافتہ",
      secondaryEn: "Judgment-debtor",
      secondaryUr: "ڈگری کا پابند",
      primaryPlaceholder: "Decree-holder Name",
      secondaryPlaceholder: "Judgment-debtor Name",
    },
  },
  {
    name: "Arbitration",
    nameUr: "ثالثی",
    aliases: ["arbitration"],
    requiresOffence: false,
    parties: {
      primaryEn: "Claimant",
      primaryUr: "دعوئ کرنے والا",
      secondaryEn: "Respondent",
      secondaryUr: "جواب دہندہ",
      primaryPlaceholder: "Claimant Name",
      secondaryPlaceholder: "Respondent Name",
    },
  },
] as const;

export const DEFAULT_PARTY_CONFIG: PartyRoleConfig = {
  primaryEn: "Plaintiff",
  primaryUr: "مدعی",
  secondaryEn: "Defendant",
  secondaryUr: "مدعا علیہ",
  primaryPlaceholder: "Muhammad Aslam Khan",
  secondaryPlaceholder: "Province of Punjab",
};

/**
 * Modular / extensible list of "From" (representing) role suggestions.
 */
export const FROM_ROLE_SUGGESTIONS: readonly string[] = [
  "Plaintiff",
  "Defendant",
  "State",
  "Accused",
  "Petitioner",
  "Respondent",
  "Appellant",
  "Decree-holder",
  "Judgment-debtor",
  "Claimant",
  "Complainant",
  "Applicant",
] as const;

const SECONDARY_PARTY_ROLE_SET = new Set([
  "defendant",
  "respondent",
  "accused",
  "judgment-debtor",
  "judgment debtor",
]);

/**
 * Look up a centralized CaseTypeDefinition by raw case type name or alias.
 */
export function getCaseTypeDefinition(rawName?: string | null): CaseTypeDefinition | undefined {
  if (!rawName) return undefined;
  const normalized = rawName.trim().toLowerCase();
  return CASE_TYPE_DEFINITIONS.find(
    (def) => def.name.toLowerCase() === normalized || def.aliases.includes(normalized)
  );
}

/**
 * Returns the standardized display name for a case type (e.g. "Civil" -> "Civil Case").
 */
export function getCaseTypeDisplayName(rawName: string, lang?: string): string {
  const def = getCaseTypeDefinition(rawName);
  if (!def) return rawName;
  return lang === "ur" ? `${def.nameUr} (${def.name})` : def.name;
}

/**
 * Returns the party ("vs") role configuration for a given case type name.
 */
export function getPartyConfigForCaseType(caseTypeName?: string | null): PartyRoleConfig {
  return getCaseTypeDefinition(caseTypeName)?.parties ?? DEFAULT_PARTY_CONFIG;
}

/**
 * Returns true if the given "From" role corresponds to the opposing/secondary party.
 */
export function isSecondaryPartyRole(role?: string | null): boolean {
  if (!role) return false;
  return SECONDARY_PARTY_ROLE_SET.has(role.trim().toLowerCase());
}

/**
 * Returns modular From-role suggestions with the selected case type's roles prioritized first.
 */
export function getFromRoleSuggestions(caseTypeName?: string | null): string[] {
  const parties = getPartyConfigForCaseType(caseTypeName);
  return Array.from(
    new Set([parties.primaryEn, parties.secondaryEn, ...FROM_ROLE_SUGGESTIONS])
  );
}

/**
 * Maps the current "From" role to the corresponding primary/secondary role when
 * switching case types, if the current role was one of the previous case type's roles
 * or a standard default role.
 */
export function getMappedFromRole(
  currentFrom: string,
  prevCaseTypeName?: string | null,
  nextCaseTypeName?: string | null
): string {
  const nextParties = getPartyConfigForCaseType(nextCaseTypeName);
  const trimmed = currentFrom.trim();
  if (!trimmed) return nextParties.primaryEn;

  const prevParties = getPartyConfigForCaseType(prevCaseTypeName);
  const lower = trimmed.toLowerCase();

  if (lower === prevParties.primaryEn.toLowerCase() || lower === DEFAULT_PARTY_CONFIG.primaryEn.toLowerCase()) {
    return nextParties.primaryEn;
  }
  if (lower === prevParties.secondaryEn.toLowerCase() || lower === DEFAULT_PARTY_CONFIG.secondaryEn.toLowerCase()) {
    return nextParties.secondaryEn;
  }

  return currentFrom;
}
