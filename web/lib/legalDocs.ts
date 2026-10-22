export type LegalDocId = "terms" | "privacy" | "refund";

export interface LegalSection {
  /** DOM id used for table-of-contents anchors. */
  id:       string;
  titleKey: string;
  bodyKeys: string[];
}

/**
 * Structured legal documents rendered by the slide-over drawer and the
 * full-page legal routes. Every string is resolved through i18n so the
 * drawer is fully bilingual.
 */
export const LEGAL_DOCS: Record<
  LegalDocId,
  { titleKey: string; lastUpdatedKey: string; sections: LegalSection[] }
> = {
  terms: {
    titleKey:       "legal.termsTitle",
    lastUpdatedKey: "legal.lastUpdated",
    sections: [
      {
        id:       "terms-1",
        titleKey: "legal.termsS1Title",
        bodyKeys: ["legal.termsP1"],
      },
      {
        id:       "terms-2",
        titleKey: "legal.termsS2Title",
        bodyKeys: ["legal.termsLicense"],
      },
      {
        id:       "terms-3",
        titleKey: "legal.termsS3Title",
        bodyKeys: ["legal.termsP2", "legal.termsP3"],
      },
      {
        id:       "terms-4",
        titleKey: "legal.termsS4Title",
        bodyKeys: ["legal.termsEthical"],
      },
    ],
  },

  privacy: {
    titleKey:       "legal.privacyTitle",
    lastUpdatedKey: "legal.lastUpdated",
    sections: [
      {
        id:       "privacy-1",
        titleKey: "legal.privacyS1Title",
        bodyKeys: ["legal.privacyP1", "legal.privacyP2"],
      },
      {
        id:       "privacy-2",
        titleKey: "legal.privacyS2Title",
        bodyKeys: [
          "legal.privacyAccountInfo",
          "legal.privacyCaseRecords",
          "legal.privacyCaseDocuments",
          "legal.privacySessionData",
        ],
      },
      {
        id:       "privacy-3",
        titleKey: "legal.privacyS3Title",
        bodyKeys: ["legal.privacyRls"],
      },
      {
        id:       "privacy-4",
        titleKey: "legal.privacyS4Title",
        bodyKeys: ["legal.privacyRetention"],
      },
    ],
  },

  refund: {
    titleKey:       "legal.refundTitle",
    lastUpdatedKey: "legal.lastUpdated",
    sections: [
      {
        id:       "refund-1",
        titleKey: "legal.refundS1Title",
        bodyKeys: ["legal.refundTrial"],
      },
      {
        id:       "refund-2",
        titleKey: "legal.refundS2Title",
        bodyKeys: ["legal.refundP1"],
      },
      {
        id:       "refund-3",
        titleKey: "legal.refundS3Title",
        bodyKeys: ["legal.refundDuplicate"],
      },
    ],
  },
};

export const LEGAL_DOC_ORDER: LegalDocId[] = ["terms", "privacy", "refund"];
