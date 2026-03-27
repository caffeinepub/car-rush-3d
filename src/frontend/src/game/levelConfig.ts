export interface LevelConfig {
  speed: number;
  obstaclesPerSegment: number;
  roadWidth: number;
  trackLength: number; // in road segments
  timeLimit: number | null; // seconds, null = no limit
  tier: "easy" | "medium" | "hard";
}

export function getLevelConfig(level: number): LevelConfig {
  const l = Math.max(1, Math.min(1000, level));

  if (l <= 333) {
    const p = (l - 1) / 332;
    return {
      speed: 5 + p * 4,
      obstaclesPerSegment: Math.floor(1 + p * 2.5),
      roadWidth: 8 - p * 1,
      trackLength: 15 + Math.floor(p * 10),
      timeLimit: null,
      tier: "easy",
    };
  }
  if (l <= 666) {
    const p = (l - 334) / 332;
    return {
      speed: 10 + p * 5,
      obstaclesPerSegment: Math.floor(3 + p * 3),
      roadWidth: 7 - p * 1.5,
      trackLength: 25 + Math.floor(p * 15),
      timeLimit: null,
      tier: "medium",
    };
  }
  const p = (l - 667) / 333;
  return {
    speed: 16 + p * 10,
    obstaclesPerSegment: Math.floor(6 + p * 6),
    roadWidth: 5.5 - p * 1.5,
    trackLength: 40 + Math.floor(p * 20),
    timeLimit: 60 - Math.floor(p * 20),
    tier: "hard",
  };
}

export function getTierColor(tier: LevelConfig["tier"]) {
  if (tier === "easy") return "#39FF88";
  if (tier === "medium") return "#22E6FF";
  return "#FF4FD8";
}
