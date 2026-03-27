import { useState } from "react";
import { CarGame } from "./game/CarGame";

export default function App() {
  const [started, setStarted] = useState(false);
  const [bestLevel, setBestLevel] = useState(() => {
    const s = localStorage.getItem("carRushBestLevel");
    return s ? Number.parseInt(s) : 1;
  });

  const handleBestLevel = (level: number) => {
    if (level > bestLevel) {
      setBestLevel(level);
      localStorage.setItem("carRushBestLevel", String(level));
    }
  };

  if (!started) {
    return <MenuScreen bestLevel={bestLevel} onPlay={() => setStarted(true)} />;
  }

  return (
    <CarGame onBestLevel={handleBestLevel} onMenu={() => setStarted(false)} />
  );
}

function MenuScreen({
  bestLevel,
  onPlay,
}: { bestLevel: number; onPlay: () => void }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0E1014",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Poppins', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(138,63,252,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(138,63,252,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "30%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(138,63,252,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "25%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,230,255,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            fontSize: 13,
            letterSpacing: 6,
            color: "#22E6FF",
            marginBottom: 16,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          OBSTACLE COURSE
        </div>
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: 900,
            color: "#F3F6FA",
            margin: 0,
            letterSpacing: 4,
            textTransform: "uppercase",
            textShadow:
              "0 0 40px rgba(138,63,252,0.8), 0 0 80px rgba(138,63,252,0.4)",
          }}
        >
          CAR RUSH
        </h1>
        <div
          style={{
            fontSize: "clamp(20px, 3vw, 32px)",
            fontWeight: 800,
            color: "#B84BFF",
            letterSpacing: 8,
            textShadow: "0 0 20px rgba(184,75,255,0.8)",
            marginBottom: 8,
          }}
        >
          3D
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#A7AFBB",
            letterSpacing: 3,
            marginBottom: 48,
            textTransform: "uppercase",
          }}
        >
          1000 LEVELS
        </div>

        {bestLevel > 1 && (
          <div
            style={{
              display: "inline-block",
              padding: "8px 20px",
              border: "1px solid rgba(57,255,136,0.4)",
              borderRadius: 8,
              color: "#39FF88",
              fontSize: 13,
              letterSpacing: 2,
              marginBottom: 32,
              background: "rgba(57,255,136,0.05)",
            }}
          >
            BEST: LEVEL {bestLevel}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={onPlay}
            style={{
              padding: "18px 64px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #7A2CF4, #D04BFF)",
              border: "none",
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow:
                "0 0 30px rgba(138,63,252,0.6), 0 0 60px rgba(138,63,252,0.3)",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1)";
            }}
          >
            PLAY
          </button>
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 32,
            justifyContent: "center",
            color: "#A7AFBB",
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          <span>⬆ ⬇ ⬅ ➡ / WASD to steer</span>
          <span>•</span>
          <span>Avoid obstacles</span>
          <span>•</span>
          <span>Reach the finish</span>
        </div>
      </div>
    </div>
  );
}
