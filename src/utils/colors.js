const PATCH_COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEAA7', // yellow
  '#DDA0DD', // plum
  '#98D8C8', // mint
  '#F7DC6F', // gold
  '#BB8FCE', // lavender
  '#85C1E9', // light blue
  '#F0B27A', // peach
  '#82E0AA', // emerald
  '#F1948A', // salmon
  '#AED6F1', // powder blue
  '#D7BDE2', // lilac
  '#A3E4D7', // aquamarine
  '#FAD7A0', // apricot
  '#A9CCE3', // steel blue
  '#D5F5E3', // honeydew
  '#FADBD8', // misty rose
];

export function getPatchColor(index) {
  return PATCH_COLORS[index % PATCH_COLORS.length];
}
