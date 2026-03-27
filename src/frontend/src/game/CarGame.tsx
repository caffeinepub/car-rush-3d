import { Canvas } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import { GameScene } from "./GameScene";
import { HUD } from "./HUD";
import { getLevelConfig, getTierColor } from "./levelConfig";

type GameState = "playing" | "levelComplete" | "gameOver";

interface GameStats {
  score: number;
  level: number;
  lives: number;
  speed: number;
  timeLeft: number | null;
}

interface CarGameProps {
  onBestLevel: (level: number) => void;
  onMenu: () => void;
}

export function CarGame({ onBestLevel, onMenu }: CarGameProps) {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    speed: 0,
    timeLeft: null,
  });
  const [totalScore, setTotalScore] = useState(0);
  const gameKey = useRef(0);

  const handleLevelComplete = useCallback(
    (score: number) => {
      const newTotal = totalScore + score;
      setTotalScore(newTotal);
      onBestLevel(level + 1);
      setGameState("levelComplete");
      setStats((s) => ({ ...s, score: newTotal }));
    },
    [level, totalScore, onBestLevel],
  );

  const handleGameOver = useCallback((score: number) => {
    setTotalScore((prev) => prev + score);
    setGameState("gameOver");
  }, []);

  const handleStatsUpdate = useCallback((s: Partial<GameStats>) => {
    setStats((prev) => ({ ...prev, ...s }));
  }, []);

  const nextLevel = () => {
    if (level >= 1000) return;
    const newLevel = level + 1;
    setLevel(newLevel);
    gameKey.current++;
    setGameState("playing");
    setStats((s) => ({ ...s, level: newLevel, lives: 3 }));
  };

  const retry = () => {
    gameKey.current++;
    setGameState("playing");
    setStats((s) => ({ ...s, lives: 3 }));
  };

  const config = getLevelConfig(level);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#0E1014",
        overflow: "hidden",
      }}
    >
      <Canvas
        key={gameKey.current}
        camera={{ fov: 60, near: 0.1, far: 1000 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true }}
      >
        <GameScene
          config={config}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          onStatsUpdate={handleStatsUpdate}
          active={gameState === "playing"}
        />
      </Canvas>

      {gameState === "playing" && (
        <HUD stats={stats} config={config} level={level} />
      )}

      {gameState === "levelComplete" && (
        <Overlay>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 13,
                letterSpacing: 6,
                color: "#39FF88",
                marginBottom: 12,
              }}
            >
              SUCCESS
            </div>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#F3F6FA",
                margin: "0 0 8px",
                textShadow: "0 0 30px rgba(57,255,136,0.6)",
              }}
            >
              LEVEL COMPLETE
            </h2>
            <div style={{ fontSize: 18, color: "#A7AFBB", marginBottom: 8 }}>
              Level {level} cleared!
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#22E6FF",
                fontWeight: 700,
                marginBottom: 40,
              }}
            >
              Score: {totalScore.toLocaleString()}
            </div>
            {level < 1000 ? (
              <button
                type="button"
                onClick={nextLevel}
                style={btnStyle("#7A2CF4", "#D04BFF")}
              >
                NEXT LEVEL
              </button>
            ) : (
              <div style={{ color: "#FFD700", fontSize: 24, fontWeight: 800 }}>
                YOU BEAT ALL 1000 LEVELS!
              </div>
            )}
            <br />
            <button
              type="button"
              onClick={onMenu}
              style={{
                ...btnStyle("#1A1E25", "#2B313B"),
                marginTop: 16,
                boxShadow: "none",
                border: "1px solid #2B313B",
              }}
            >
              MENU
            </button>
          </div>
        </Overlay>
      )}

      {gameState === "gameOver" && (
        <Overlay>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 13,
                letterSpacing: 6,
                color: "#FF4FD8",
                marginBottom: 12,
              }}
            >
              CRASHED
            </div>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#F3F6FA",
                margin: "0 0 8px",
                textShadow: "0 0 30px rgba(255,79,216,0.6)",
              }}
            >
              GAME OVER
            </h2>
            <div style={{ fontSize: 18, color: "#A7AFBB", marginBottom: 8 }}>
              Level {level}
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#22E6FF",
                fontWeight: 700,
                marginBottom: 40,
              }}
            >
              Score: {totalScore.toLocaleString()}
            </div>
            <button
              type="button"
              onClick={retry}
              style={btnStyle("#7A2CF4", "#D04BFF")}
            >
              RETRY
            </button>
            <br />
            <button
              type="button"
              onClick={onMenu}
              style={{
                ...btnStyle("#1A1E25", "#2B313B"),
                marginTop: 16,
                boxShadow: "none",
                border: "1px solid #2B313B",
              }}
            >
              MENU
            </button>
          </div>
        </Overlay>
      )}

      <MobileControls />
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(14,16,20,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Poppins', sans-serif",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  );
}

function btnStyle(from: string, to: string): React.CSSProperties {
  return {
    padding: "16px 48px",
    borderRadius: 999,
    background: `linear-gradient(135deg, ${from}, ${to})`,
    border: "none",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: "uppercase" as const,
    cursor: "pointer",
    boxShadow: "0 0 24px rgba(138,63,252,0.5)",
  };
}

function MobileControls() {
  const fireKey = (key: string, down: boolean) => {
    const type = down ? "keydown" : "keyup";
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
  };

  const btnBase: React.CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: 12,
    background: "rgba(26,30,37,0.9)",
    border: "2px solid rgba(138,63,252,0.5)",
    color: "#F3F6FA",
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 16,
        pointerEvents: "auto",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        style={btnBase}
        onPointerDown={() => fireKey("ArrowLeft", true)}
        onPointerUp={() => fireKey("ArrowLeft", false)}
        onPointerLeave={() => fireKey("ArrowLeft", false)}
      >
        ◀
      </div>
      <div
        role="button"
        tabIndex={0}
        style={btnBase}
        onPointerDown={() => fireKey("ArrowRight", true)}
        onPointerUp={() => fireKey("ArrowRight", false)}
        onPointerLeave={() => fireKey("ArrowRight", false)}
      >
        ▶
      </div>
    </div>
  );
}
