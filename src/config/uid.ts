/** A per build counter for ids that must be unique on a page (BrandArcs' masks). */
let n = 0;
export const uid = (prefix: string) => `${prefix}-${(++n).toString(36)}`;
