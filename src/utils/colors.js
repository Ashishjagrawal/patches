const PATCH_COLORS = [
  '#D4613E', // terracotta
  '#4A9D6E', // green
  '#3B7DD8', // blue
  '#C4A035', // gold
  '#9B59B6', // purple
  '#E67E22', // orange
  '#1ABC9C', // teal
  '#E84393', // pink
  '#6C5CE7', // indigo
  '#00B894', // mint
  '#FD79A8', // rose
];

// Slightly darker version for borders
const PATCH_BORDERS = [
  '#B8512F', '#3D8459', '#2E63AB', '#A3852B', '#7E4599',
  '#C4691B', '#15997E', '#C43479', '#5649C0', '#009B7A',
  '#D4638B',
];

export function getPatchColor(index) {
  return PATCH_COLORS[index % PATCH_COLORS.length];
}

export function getPatchBorder(index) {
  return PATCH_BORDERS[index % PATCH_BORDERS.length];
}
