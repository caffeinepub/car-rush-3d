import type { LevelConfig } from "./levelConfig";
import { getTierColor } from "./levelConfig";

interface HUDProps {
  stats: {
    score: number;
    level: number;
    lives: number;
    speed: number;
    timeLeft: number | null;
  };
  config: LevelConfig;
  level: number;
}

export function HUD({ stats, config, level }: HUDProps) {
  const tierColor = getTierColor(config.tier);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "'Inter', 'Poppins', sans-serif",
      }}
    >
      {/* Top left: Level */}
      <Chip top={16} left={16} color={tierColor}>
        LEVEL {level}
      </Chip>

      {/* Top right: Score */}
      <Chip top={16} right={16} color="#22E6FF">
        {stats.score.toLocaleString()}
      </Chip>

      {/* Top center: Lives */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ fontSize: 20, opacity: i < stats.lives ? 1 : 0.25 }}
          >
            ❤️
          </span>
        ))}
      </div>

      {/* Bottom center: Speed */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#FF4FD8",
            textShadow: "0 0 20px rgba(255,79,216,0.7)",
            lineHeight: 1,
          }}
        >
          {Math.round(stats.speed * 18)}
        </div>
        <div style={{ fontSize: 11, color: "#A7AFBB", letterSpacing: 3 }}>
          KPH
        </div>
      </div>

      {/* Timer for hard levels */}
      {stats.timeLeft !== null && (
        <Chip
          bottom={110}
          right={16}
          color={stats.timeLeft < 10 ? "#FF4444" : "#FF8C00"}
        >
          ⏱ {Math.ceil(stats.timeLeft)}s
        </Chip>
      )}

      {/* Tier badge */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 16,
          fontSize: 10,
          letterSpacing: 3,
          color: tierColor,
          opacity: 0.7,
          textTransform: "uppercase",
        }}
      >
        {config.tier}
      </div>
    </div>
  );
}

function Chip({
  children,
  color,
  top,
  bottom,
  left,
  right,
}: {
  children: React.ReactNode;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        bottom,
        left,
        right,
        padding: "8px 16px",
        borderRadius: 10,
        background: "rgba(14,16,20,0.75)",
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 12px ${color}55`,
        color,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        backdropFilter: "blur(4px)",
      }}
    >
      {children}
    </div>
  );
}
