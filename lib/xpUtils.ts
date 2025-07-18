// XP table for levels 1–50
export const xpTable = [
  300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
  1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200,
  2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200,
  3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200,
  4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100
];

export function getLevelInfo(totalXp: number) {
  let level = 1;
  let xpForNext = xpTable[0];
  let xpSum = 0;
  for (let i = 0; i < xpTable.length; i++) {
    if (totalXp < xpSum + xpTable[i]) {
      xpForNext = xpTable[i];
      break;
    }
    xpSum += xpTable[i];
    level = i + 2;
  }
  const xpThisLevel = totalXp - xpSum;
  const progress = xpForNext ? xpThisLevel / xpForNext : 1;
  return { level, xpThisLevel, xpForNext, progress };
} 