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

export interface FromRolePair {
  /** Label when selected as FROM role for primary (left) party */
  primaryEn: string;
  primaryUr: string;
  /** Label when selected as FROM role for secondary (right) party */
  secondaryEn: string;
  secondaryUr: string;
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
  /** Default FROM / representing role when this case type is selected */
  defaultFrom: string;
  /** Prioritized suggestion chips for this case type */
  suggestions?: readonly string[];
}

/**
 * Standardized case type definitions and party ("vs") mappings.
 *
 * 1. Civil Case (from Civil Court) -> Plaintiff vs Defendant (مدعی بمقابلہ مدعا علیہ)
 * 2. Criminal Case (from Criminal Court) -> State vs Accused (ریاست بمقابلہ ملزم)
 * 3. Constitutional Case (from Constitutional Court) -> Petitioner vs Respondent (درخواست گزار بمقابلہ جواب دہندہ)
 * 4. Appeal -> Appellant vs Respondent (اپیل کنندہ بمقابلہ جواب دہندہ)
 * 5. Execution -> Decree-holder vs Judgment-debtor (ڈگری یافتہ بمقابلہ ڈگری کا پابند)
 * 6. Arbitration -> Claimant vs Respondent (دعوئ کرنے والا بمقابلہ جواب دہندہ)
 */
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
    defaultFrom: "Plaintiff",
    suggestions: ["Plaintiff", "Defendant", "Petitioner", "Respondent", "Appellant", "Accused"],
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
    defaultFrom: "Accused",
    suggestions: ["Accused", "State", "Complainant", "Appellant", "Petitioner", "Respondent"],
  },
  {
    name: "Constitutional Case",
    nameUr: "آئینی مقدمہ",
    aliases: ["constitutional case", "constitutional court", "constitutional", "writ", "writ petition"],
    requiresOffence: false,
    parties: {
      primaryEn: "Petitioner",
      primaryUr: "درخواست گزار",
      secondaryEn: "Respondent",
      secondaryUr: "جواب دہندہ",
      primaryPlaceholder: "Petitioner Name",
      secondaryPlaceholder: "Federation of Pakistan",
    },
    defaultFrom: "Petitioner",
    suggestions: ["Petitioner", "Respondent", "Appellant", "Plaintiff", "Defendant", "Accused"],
  },
  {
    name: "Appeal",
    nameUr: "اپیل",
    aliases: ["appeal", "civil appeal", "criminal appeal"],
    requiresOffence: false,
    parties: {
      primaryEn: "Appellant",
      primaryUr: "اپیل کنندہ",
      secondaryEn: "Respondent",
      secondaryUr: "جواب دہندہ",
      primaryPlaceholder: "Appellant Name",
      secondaryPlaceholder: "Respondent Name",
    },
    defaultFrom: "Appellant",
    suggestions: ["Appellant", "Respondent", "Petitioner", "Accused", "Plaintiff", "Defendant"],
  },
  {
    name: "Execution",
    nameUr: "اجراء ڈگری",
    aliases: ["execution", "execution petition", "execution court"],
    requiresOffence: false,
    parties: {
      primaryEn: "Decree-holder",
      primaryUr: "ڈگری یافتہ",
      secondaryEn: "Judgment-debtor",
      secondaryUr: "ڈگری کا پابند",
      primaryPlaceholder: "Decree-holder Name",
      secondaryPlaceholder: "Judgment-debtor Name",
    },
    defaultFrom: "Decree-holder",
    suggestions: ["Decree-holder", "Judgment-debtor", "Plaintiff", "Defendant", "Petitioner", "Respondent"],
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
    defaultFrom: "Claimant",
    suggestions: ["Claimant", "Respondent", "Petitioner", "Appellant", "Plaintiff", "Defendant"],
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
 * Keep the primary 6 suggestions ("Plaintiff", "Defendant", "Petitioner", "Respondent", "Appellant", "Accused")
 * first, with additional roles accessible as chips and via the autocomplete datalist.
 */
export const FROM_ROLE_SUGGESTIONS: readonly string[] = [
  "Plaintiff",
  "Defendant",
  "Petitioner",
  "Respondent",
  "Appellant",
  "Accused",
  "State",
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
 * FROM Role Pair Mapping — maps a selected role to its corresponding party pair labels.
 */
export const FROM_ROLE_PAIR_MAP: Record<string, FromRolePair> = {
  "Plaintiff": {
    primaryEn: "Plaintiff",
    primaryUr: "مدعی",
    secondaryEn: "Defendant",
    secondaryUr: "مدعا علیہ",
  },
  "Defendant": {
    primaryEn: "Defendant",
    primaryUr: "مدعا علیہ",
    secondaryEn: "Plaintiff",
    secondaryUr: "مدعی",
  },
  "State": {
    primaryEn: "State",
    primaryUr: "ریاست",
    secondaryEn: "Accused",
    secondaryUr: "ملزم",
  },
  "Accused": {
    primaryEn: "Accused",
    primaryUr: "ملزم",
    secondaryEn: "State",
    secondaryUr: "ریاست",
  },
  "Petitioner": {
    primaryEn: "Petitioner",
    primaryUr: "درخواست گزار",
    secondaryEn: "Respondent",
    secondaryUr: "جواب دہندہ",
  },
  "Respondent": {
    primaryEn: "Respondent",
    primaryUr: "جواب دہندہ",
    secondaryEn: "Petitioner",
    secondaryUr: "درخواست گزار",
  },
  "Appellant": {
    primaryEn: "Appellant",
    primaryUr: "اپیل کنندہ",
    secondaryEn: "Respondent",
    secondaryUr: "جواب دہندہ",
  },
  "Decree-holder": {
    primaryEn: "Decree-holder",
    primaryUr: "ڈگری یافتہ",
    secondaryEn: "Judgment-debtor",
    secondaryUr: "ڈگری کا پابند",
  },
  "Judgment-debtor": {
    primaryEn: "Judgment-debtor",
    primaryUr: "ڈگری کا پابند",
    secondaryEn: "Decree-holder",
    secondaryUr: "ڈگری یافتہ",
  },
  "Claimant": {
    primaryEn: "Claimant",
    primaryUr: "دعوئ کرنے والا",
    secondaryEn: "Respondent",
    secondaryUr: "جواب دہندہ",
  },
  "Complainant": {
    primaryEn: "Complainant",
    primaryUr: "شاکی",
    secondaryEn: "Accused",
    secondaryUr: "ملزم",
  },
  "Applicant": {
    primaryEn: "Applicant",
    primaryUr: "درخواست گزار",
    secondaryEn: "Respondent",
    secondaryUr: "جواب دہندہ",
  },
};

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
 * Returns the standardized display name for a case type (e.g. "Civil Court" -> "Civil Case").
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
  const def = getCaseTypeDefinition(caseTypeName);
  if (def) {
    return Array.from(
      new Set([
        def.parties.primaryEn,
        def.parties.secondaryEn,
        ...(def.suggestions ?? []),
        ...FROM_ROLE_SUGGESTIONS,
      ])
    );
  }
  return [...FROM_ROLE_SUGGESTIONS];
}

/**
 * Maps the current "From" role to the corresponding primary/secondary role when
 * switching case types.
 */
export function getMappedFromRole(
  currentFrom: string,
  prevCaseTypeName?: string | null,
  nextCaseTypeName?: string | null
): string {
  const nextDef = getCaseTypeDefinition(nextCaseTypeName);
  const nextParties = nextDef?.parties ?? DEFAULT_PARTY_CONFIG;
  const trimmed = currentFrom.trim();
  if (!trimmed) return nextDef?.defaultFrom ?? nextParties.primaryEn;

  const prevDef = getCaseTypeDefinition(prevCaseTypeName);
  const prevParties = prevDef?.parties ?? DEFAULT_PARTY_CONFIG;
  const lower = trimmed.toLowerCase();

  if (
    lower === prevParties.primaryEn.toLowerCase() ||
    lower === DEFAULT_PARTY_CONFIG.primaryEn.toLowerCase()
  ) {
    return nextDef?.defaultFrom ?? nextParties.primaryEn;
  }
  if (
    lower === prevParties.secondaryEn.toLowerCase() ||
    lower === DEFAULT_PARTY_CONFIG.secondaryEn.toLowerCase()
  ) {
    return nextParties.secondaryEn;
  }

  return currentFrom;
}

/**
 * Returns the party pair configuration for a given FROM role.
 */
export function getPartyPairForFromRole(fromRole?: string | null): FromRolePair {
  if (!fromRole) {
    return (
      FROM_ROLE_PAIR_MAP["Plaintiff"] ?? {
        primaryEn: "Plaintiff",
        primaryUr: "مدعی",
        secondaryEn: "Defendant",
        secondaryUr: "مدعا علیہ",
      }
    );
  }

  const trimmed = fromRole.trim();
  return (
    FROM_ROLE_PAIR_MAP[trimmed] ?? {
      primaryEn: trimmed,
      primaryUr: trimmed,
      secondaryEn: "Other Party",
      secondaryUr: "دوسری فریق",
    }
  );
}
