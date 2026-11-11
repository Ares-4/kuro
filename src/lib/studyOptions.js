// Shared study-plan options: onboarding (/welcome) and the dashboard "Your plan" card.

export const STUDY_LEVELS = ['Foundation / Pre-university', "Bachelor's", "Master's"];
export const INTAKES = ['February 2027', 'September 2027', 'February 2028', 'September 2028', 'Not sure yet'];
export const NOT_SURE = 'Not sure yet';

/** Destination the student picked at onboarding, or null when unset / "Not sure yet". */
export const planDestination = (student) => {
  const d = student?.preferences?.destination;
  return d && d !== NOT_SURE ? d : null;
};

/** programs.degree_level prefix for a study level ("Bachelor", "Master", "Foundation"). */
export const programLevelPrefix = (level) => {
  if (!level) return null;
  if (level.startsWith('Bachelor')) return 'Bachelor';
  if (level.startsWith('Master')) return 'Master';
  if (level.startsWith('Foundation')) return 'Foundation';
  return null;
};

/** scholarships.levels value for a study level. */
export const scholarshipLevel = (level) => {
  if (!level) return null;
  if (level.startsWith('Master')) return 'Masters';
  return 'Undergraduate';
};

/** "September 2027" -> Date(2027-09-01), or null. */
export const intakeDate = (intake) => {
  if (!intake || intake === NOT_SURE) return null;
  const d = new Date(`1 ${intake}`);
  return Number.isNaN(d.getTime()) ? null : d;
};
