/**
 * Deterministic color generator based on the first character of a name.
 */
const COLOR_PALETTE = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#0891b2', // Cyan
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#e11d48', // Rose
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#475569'  // Slate
];

export function getInitialColor(name = 'User') {
  if (!name || typeof name !== 'string') return COLOR_PALETTE[0];
  const charCode = name.trim().toUpperCase().charCodeAt(0) || 65;
  const index = charCode % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

export function getInitialLetter(name = 'User') {
  if (!name || typeof name !== 'string') return 'U';
  return name.trim().charAt(0).toUpperCase() || 'U';
}
