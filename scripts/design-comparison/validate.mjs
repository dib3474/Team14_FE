export function validateReport(report, requestedUrl) {
  const geometry = report.audits?.['comparison-content']?.details?.geometry;
  if (!geometry?.ready) return { valid: false, reason: 'Expected page content is missing' };
  try {
    const requested = new URL(requestedUrl),
      rendered = new URL(report.finalDisplayedUrl);
    if (requested.origin !== rendered.origin || requested.pathname !== rendered.pathname)
      return {
        valid: false,
        reason: `Requested ${requested.pathname}, rendered ${rendered.pathname}`,
      };
    for (const [name, value] of requested.searchParams) {
      if (rendered.searchParams.get(name) !== value)
        return { valid: false, reason: `Comparison parameter changed: ${name}` };
    }
    if (geometry.path && geometry.path !== rendered.pathname)
      return { valid: false, reason: 'Rendered DOM and final URL disagree' };
    return { valid: true, reason: 'Requested route and rendered content match' };
  } catch {
    return { valid: false, reason: 'Missing or invalid navigation URL' };
  }
}
