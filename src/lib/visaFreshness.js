// Visa rules change often. Entries older than this are flagged to students
// ("confirm on the official portal") and listed for admins to re-verify.
export const VISA_STALE_DAYS = 180;

export const daysSince = (isoDate) => {
  if (!isoDate) return Infinity;
  const then = new Date(`${String(isoDate).slice(0, 10)}T00:00:00`);
  return Math.floor((Date.now() - then.getTime()) / 86_400_000);
};

export const isVisaInfoStale = (isoDate) => daysSince(isoDate) > VISA_STALE_DAYS;

export const todayIso = () => new Date().toISOString().slice(0, 10);
