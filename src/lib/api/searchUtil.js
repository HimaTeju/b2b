// Strip characters that would corrupt PostgREST's or-filter grammar
// (`,` separates conditions, `()` wraps in-lists) or behave as ilike
// wildcards (`%`) rather than literal search text.
export function sanitizeTerm(term) {
  return term.trim().replace(/[,()%]/g, ' ').replace(/\s+/g, ' ').trim()
}
