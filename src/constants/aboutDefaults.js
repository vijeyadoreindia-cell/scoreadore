/** Default SCORE bullet rows (icon = emoji or short symbol). */
export const DEFAULT_SCORE_BULLETS = [
  { icon: "🎓", text: "Connecting with colleges for organizing free online Workshops & Webinars" },
  { icon: "🤝", text: "Connecting colleges with Internship Fairs" },
  { icon: "🎤", text: "Onboarding Guest Speakers from diverse industries" },
  { icon: "🏢", text: "Collaboration with Corporates for youth development" },
];

/**
 * Normalizes Firestore `scoreBullets` to `{ icon, text }[]`.
 * Invalid or empty arrays fall back to defaults.
 */
export function normalizeScoreBullets(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_SCORE_BULLETS.map((b) => ({ ...b }));
  }
  const mapped = raw.map((item, i) => ({
    icon:
      typeof item?.icon === "string" && item.icon.trim()
        ? item.icon.trim().slice(0, 12)
        : DEFAULT_SCORE_BULLETS[i]?.icon || "•",
    text: typeof item?.text === "string" ? item.text : "",
  }));
  const withText = mapped.filter((b) => b.text.trim());
  return withText.length > 0 ? withText : DEFAULT_SCORE_BULLETS.map((b) => ({ ...b }));
}

/** Default About page copy when Firestore `siteContent/about` is missing or fields are absent. */
export const ABOUT_PAGE_DEFAULTS = {
  adoreParagraph1:
    "Founded in 2014, ADORE is a worldwide voluntary organization comprised of college students and professionals working collaboratively to inspire and guide the youth towards positive action. ADORE India carries this mission forward with volunteers across the country, contributing time and expertise without financial transactions — emphasizing selfless service.",
  adoreParagraph2:
    "The interactive sessions span diverse topics, encompassing areas such as Cleanliness, Soft Skills, Career Orientation, and Self-Development. Through these sessions, we aspire to empower and motivate young individuals to make impactful and positive contributions to society.",
  scoreParagraph1:
    "SCORE stands for Speaker College Corporate Outreach — a dedicated team within ADORE India focused on building meaningful bridges between educational institutions and the corporate world.",
  scoreParagraph2: "",
};

/** Full default state for About page UI (includes cloned bullets). */
export function getDefaultAboutState() {
  return {
    ...ABOUT_PAGE_DEFAULTS,
    scoreBullets: normalizeScoreBullets(null),
  };
}
