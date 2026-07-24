import type { AccountProfile } from "../domain/types";

// Fictional sample account. No real personal data.
export const SAMPLE_ACCOUNT: AccountProfile = {
  id: "harbor-community-health",
  organization: "Harbor Community Health Center",
  organizationType: "Community Health Center",
  highValue: true,
  primaryPersonaId: "jordan-lee",
  secondPersonaId: "morgan-patel",
  context: [
    "Four care sites",
    "Home-health coordination",
    "Document and signature follow-up",
    "Staff capacity pressure",
    "Possible completed-work revenue leakage",
    "Moderate LinkedIn activity",
    "Verified executive emails",
    "High-value account",
  ],
  personas: [
    {
      id: "jordan-lee",
      name: "Jordan Lee",
      role: "operations",
      title: "Chief Operations Officer",
      contactPressureLimit: 5,
    },
    {
      id: "morgan-patel",
      name: "Morgan Patel",
      role: "finance",
      title: "Chief Financial Officer",
      contactPressureLimit: 5,
    },
    {
      id: "taylor-brooks",
      name: "Taylor Brooks",
      role: "executive",
      title: "Chief Executive Officer",
      contactPressureLimit: 3,
    },
    {
      id: "avery-chen",
      name: "Dr. Avery Chen",
      role: "physician",
      title: "Medical Director",
      contactPressureLimit: 3,
    },
  ],
};
