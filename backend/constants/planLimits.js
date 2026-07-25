export const PLAN_LIMITS = {
  free: {
    linksPerMonth: 50,
    customBackHalvesPerMonth: 5,
    qrCodesPerMonth: 10,
    analyticsRetentionDays: 7,
    qrCustomization: 'basic',       // color only
    utmBuilder: false,
  },
  core: {
    linksPerMonth: 100,
    customBackHalvesPerMonth: null, // unlimited within the 100-link cap
    qrCodesPerMonth: 50,
    analyticsRetentionDays: 30,
    qrCustomization: 'advanced',    // color, pattern, corner style, frame
    utmBuilder: true,
  }
};

export default PLAN_LIMITS;
