// Box-Muller transform for Normal Distribution
export const generateNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const val = z * stdDev + mean;
  return Math.max(0, Math.round(val * 10) / 10); // Ensure positive and 1 decimal
};

// Knuth's algorithm for Poisson Distribution
export const generatePoisson = (lambda: number): number => {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  
  return k - 1;
};

// Color palette generation - Soft Pastel Scheme
const COLORS = [
  '#958CE8', // Primary Purple
  '#ACD1FD', // Secondary Blue
  '#A0E8AF', // Soft Green
  '#FDE4CF', // Soft Orange
  '#F9C8D0', // Soft Pink
  '#D6C6F6', // Light Purple
  '#BAE6FD', // Light Blue
  '#C4F0C4', // Light Green
  '#FFD6A5', // Light Orange
  '#FFABAB', // Light Red
];

export const getProcessColor = (id: number): string => {
  return COLORS[(id - 1) % COLORS.length];
};