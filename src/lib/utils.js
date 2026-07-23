import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount with the correct symbol.
 * @param {string|number} amount - The amount to format.
 * @param {string} currencyCode - The currency code (e.g., 'EUR', 'USD').
 * @returns {string} - The formatted currency string (e.g., "€3800").
 */
export function formatCurrency(amount, currencyCode) {
  if (!amount) return "N/A";
  
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'PLN': 'zł',
    'ZAR': 'R'
  };

  const code = currencyCode ? currencyCode.toUpperCase() : 'USD';
  const symbol = symbols[code] || code;
  
  return `${symbol}${amount}`;
}

/**
 * Formats a duration value by appending "Years" if needed.
 * @param {string|number} duration - The duration value.
 * @returns {string} - The formatted duration string (e.g., "3.5 Years").
 */
export function formatDuration(duration) {
  if (!duration) return "N/A";
  
  const strDuration = String(duration).trim();
  
  // If it already contains text indicating time, return as is
  if (/[a-zA-Z]/.test(strDuration)) {
    return strDuration;
  }
  
  // Otherwise append "Years"
  return `${strDuration} Years`;
}

/**
 * Readiness scoring logic
 * 8 factors, 0–2 points each (max score: 16)
 * Returns: { score, max, percent, verdict, blockers[] }
 */
export function scoreReadiness(answers) {
  let score = 0;
  const blockers = [];

  // 1) Passport validity
  const passportMonths = Number(answers.passportMonthsRemaining || 0);
  if (passportMonths >= 12) score += 2;
  else if (passportMonths >= 6) score += 1;
  else blockers.push("Passport validity is below 6 months.");

  // 2) Education level (Bachelor programs only)
  if (answers.educationLevel === "alevel" || answers.educationLevel === "bachelor") {
    score += 2;
  } else if (answers.educationLevel === "highschool") {
    score += 1;
  } else if (answers.educationLevel === "master") {
    blockers.push("You selected Master’s level, but we currently process Bachelor programs only.");
  } else {
    blockers.push("Education level may not meet bachelor entry requirements.");
  }

  // 3) Documents readiness
  if (answers.documentsReady === "YES_ALL") score += 2;
  else if (answers.documentsReady === "SOME") score += 1;
  else blockers.push("Required documents are not ready.");

  // 4) Intake timeline
  if (answers.intakeTimeline === "0_3" || answers.intakeTimeline === "3_6") score += 2;
  else if (answers.intakeTimeline === "6_12") score += 1;
  else blockers.push("Your intended intake timeline is unclear or too far.");

  // 5) Finances
  if (answers.finances === "READY") score += 2;
  else if (answers.finances === "PARTIAL") score += 1;
  else blockers.push("Finances are not ready for tuition and living costs.");

  // 6) English level
  if (answers.englishLevel === "B2_PLUS") score += 2;
  else if (answers.englishLevel === "B1") score += 1;
  else blockers.push("English level may be insufficient for most programs.");

  // 7) Bachelor-only confirmation
  if (answers.bachelorOnlyConfirm === true) score += 2;
  else blockers.push("You must confirm that you are applying for Bachelor programs only.");

  // 8) Residence
  if (typeof answers.residence === "string" && answers.residence.trim().length >= 2) {
    score += 2;
  } else {
    blockers.push("Country of residence is missing.");
  }

  const max = 16;
  const percent = Math.round((score / max) * 100);

  let verdict = "Not ready";
  if (percent >= 80) verdict = "Ready";
  else if (percent >= 50) verdict = "Almost ready";

  return {
    score,
    max,
    percent,
    verdict,
    blockers: blockers.slice(0, 3), // show only top 3
  };
}

/**
 * Premium-only extras
 */
export function buildPremiumAddOns(answers, scoring) {
  const checklist = [
    "Valid passport (12 months recommended)",
    "Education certificates and transcripts (clear scans + originals)",
    "Proof of funds plan (tuition + living costs)",
    "Accommodation plan in destination country",
    "Travel insurance and visa preparation plan",
  ];

  const risks = [];

  const passportMonths = Number(answers.passportMonthsRemaining || 0);
  if (passportMonths < 6) risks.push("High risk: passport validity under 6 months.");

  if (answers.finances === "NOT_READY") {
    risks.push("High risk: finances not ready for visa requirements.");
  }

  if (answers.documentsReady === "NO") {
    risks.push("High risk: required documents not prepared.");
  }

  if (answers.englishLevel === "A2_OR_LOWER") {
    risks.push("Medium risk: English level may limit available programs.");
  }

  let suggestedWindow = "Recommended intake: plan 3–6 months in advance.";
  if (scoring.percent >= 80) {
    suggestedWindow = "You may target the next intake (0–3 months) if documents and funds are confirmed.";
  } else if (scoring.percent < 50) {
    suggestedWindow = "Recommended intake: 6–12 months while addressing key readiness gaps.";
  }

  return {
    checklist,
    risks,
    suggestedWindow,
  };
}