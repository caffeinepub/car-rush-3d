import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { LevelConfig } from "./levelConfig";

const SEGMENT_LENGTH = 20;
const NUM_SEGMENTS = 6;
const CAR_WIDTH = 0.8;
const CAR_HEIGHT = 0.5;
const CAR_DEPTH = 1.4;
const OBSTACLE_SIZE = 0.9;

interface Obstacle {
  id: number;
  x: number;
  z: number;
  mesh: THREE.Mesh;
  active: boolean;
}

interface GameSceneProps {
  config: LevelConfig;
  onLevelComplete: (score: number) => void;
  onGameOver: (score: number) => void;
  onStatsUpdate: (stats: {
    score?: number;
    lives?: number;
    speed?: number;
    timeLeft?: number | null;
  }) => void;
  active: boolean;
}

export function GameScene({
  config,
  onLevelComplete,
  onGameOver,
  onStatsUpdate,
  active,
}: GameSceneProps) {
  const { scene, camera } = useThree();

  const carRef = useRef<THREE.Group>(null);
  const carX = useRef(0);
  const carZ = useRef(0);
  const lives = useRef(3);
  const score = useRef(0);
  const distance = useRef(0);
  const timeLeft = useRef<number | null>(config.timeLimit);
  const invincibleTimer = useRef(0);
  const levelDone = useRef(false);
  const gameOverRef = useRef(false);
  const frameCount = useRef(0);
  const obstacleIdCounter = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const trackTotal = useRef(config.trackLength * SEGMENT_LENGTH);
  const keys = useRef<Record<string, boolean>>({});

  const roadSegments = useRef<THREE.Mesh[]>([]);
  const roadGroup = useRef<THREE.Group>(null);
  const obstacleGroup = useRef<THREE.Group>(null);
  const finishLineRef = useRef<THREE.Mesh | null>(null);
  const lastSegmentZ = useRef(-(NUM_SEGMENTS - 1) * SEGMENT_LENGTH);

  // Key listeners
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Setup scene lighting
  useEffect(() => {
    scene.background = new THREE.Color("#0E1014");
    scene.fog = new THREE.Fog("#0E1014", 30, 80);
    const ambient = new THREE.AmbientLight("#ffffff", 0.3);
    const cyanLight = new THREE.PointLight("#22E6FF", 2, 30);
    cyanLight.position.set(-5, 5, -10);
    const purpleLight = new THREE.PointLight("#8A3FFC", 2, 30);
    purpleLight.position.set(5, 5, -10);
    scene.add(ambient, cyanLight, purpleLight);
    return () => {
      scene.remove(ambient, cyanLight, purpleLight);
      scene.background = null;
      scene.fog = null;
    };
  }, [scene]);

  const roadMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1A1E25", roughness: 0.9 }),
    [],
  );
  const laneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FF4FD8",
        emissive: "#FF4FD8",
        emissiveIntensity: 0.8,
      }),
    [],
  );
  const finishMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#39FF88",
        emissive: "#39FF88",
        emissiveIntensity: 1,
      }),
    [],
  );
  const obstacleMats = useMemo(
    () => [
      new THREE.MeshStandardMaterial({
        color: "#FF4FD8",
        emissive: "#FF4FD8",
        emissiveIntensity: 0.5,
      }),
      new THREE.MeshStandardMaterial({
        color: "#22E6FF",
        emissive: "#22E6FF",
        emissiveIntensity: 0.5,
      }),
      new THREE.MeshStandardMaterial({
        color: "#8A3FFC",
        emissive: "#8A3FFC",
        emissiveIntensity: 0.5,
      }),
      new THREE.MeshStandardMaterial({
        color: "#FF8C00",
        emissive: "#FF8C00",
        emissiveIntensity: 0.5,
      }),
    ],
    [],
  );

  const spawnObstaclesForSegment = (segmentZ: number) => {
    if (!obstacleGroup.current) return;
    const rw = config.roadWidth;
    const count = config.obstaclesPerSegment;
    const geo = new THREE.BoxGeometry(
      OBSTACLE_SIZE,
      OBSTACLE_SIZE,
      OBSTACLE_SIZE,
    );
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * (rw - OBSTACLE_SIZE * 1.2);
      const z = segmentZ - Math.random() * (SEGMENT_LENGTH - 4) - 2;
      const mat = obstacleMats[Math.floor(Math.random() * obstacleMats.length)];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, OBSTACLE_SIZE / 2, z);
      obstacleGroup.current.add(mesh);
      obstacles.current.push({
        id: obstacleIdCounter.current++,
        x,
        z,
        mesh,
        active: true,
      });
    }
  };

  // Build road + initial obstacles
  useEffect(() => {
    const rg = roadGroup.current;
    const og = obstacleGroup.current;
    if (!rg || !og) return;
    const rw = config.roadWidth;
    const roadGeo = new THREE.PlaneGeometry(rw, SEGMENT_LENGTH);
    const laneGeo = new THREE.PlaneGeometry(0.12, SEGMENT_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    laneGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const mesh = new THREE.Mesh(roadGeo, roadMat);
      mesh.position.z = -i * SEGMENT_LENGTH;
      rg.add(mesh);
      roadSegments.current.push(mesh);
      const left = new THREE.Mesh(laneGeo, laneMat);
      left.position.set(-rw / 2 + 0.06, 0.01, -i * SEGMENT_LENGTH);
      rg.add(left);
      const right = new THREE.Mesh(laneGeo, laneMat);
      right.position.set(rw / 2 - 0.06, 0.01, -i * SEGMENT_LENGTH);
      rg.add(right);
    }

    const finGeo = new THREE.PlaneGeometry(rw, 1.5);
    finGeo.rotateX(-Math.PI / 2);
    const fin = new THREE.Mesh(finGeo, finishMat);
    fin.position.set(0, 0.02, -trackTotal.current);
    scene.add(fin);
    finishLineRef.current = fin;

    for (let i = 1; i < NUM_SEGMENTS; i++) {
      spawnObstaclesForSegment(-i * SEGMENT_LENGTH);
    }

    return () => {
      roadSegments.current = [];
      obstacles.current = [];
      scene.remove(fin);
    };
    // intentionally omit deps -- run once on mount
    // biome-ignore lint/correctness/useExhaustiveDependencies: run once
  }, []);

  useFrame((_, delta) => {
    if (!active || levelDone.current || gameOverRef.current) return;
    const dt = Math.min(delta, 0.05);

    if (timeLeft.current !== null) {
      timeLeft.current -= dt;
      if (timeLeft.current <= 0) {
        timeLeft.current = 0;
        gameOverRef.current = true;
        onGameOver(score.current);
        return;
      }
    }

    const steerSpeed = 5;
    const k = keys.current;
    if (k.ArrowLeft || k.a || k.A) carX.current -= steerSpeed * dt;
    if (k.ArrowRight || k.d || k.D) carX.current += steerSpeed * dt;
    const halfRoad = config.roadWidth / 2 - CAR_WIDTH / 2;
    carX.current = Math.max(-halfRoad, Math.min(halfRoad, carX.current));

    const spd = config.speed;
    const moveZ = spd * dt;
    carZ.current -= moveZ;
    distance.current += moveZ;
    score.current = Math.floor(distance.current * 10);

    if (carRef.current) {
      carRef.current.position.x = carX.current;
      carRef.current.position.z = carZ.current;
    }

    const camZ = carZ.current;
    for (const seg of roadSegments.current) {
      if (seg.position.z - camZ > SEGMENT_LENGTH * 1.5) {
        seg.position.z -= NUM_SEGMENTS * SEGMENT_LENGTH;
        const newZ = seg.position.z;
        if (-newZ < trackTotal.current - SEGMENT_LENGTH) {
          spawnObstaclesForSegment(newZ);
          lastSegmentZ.current = newZ;
        }
      }
    }

    if (roadGroup.current) roadGroup.current.position.z = -carZ.current;
    if (obstacleGroup.current) obstacleGroup.current.position.z = -carZ.current;
    if (finishLineRef.current)
      finishLineRef.current.position.z = -carZ.current + -trackTotal.current;

    camera.position.set(carX.current * 0.5, 4, 8);
    camera.lookAt(carX.current * 0.2, 1, -4);

    if (invincibleTimer.current > 0) {
      invincibleTimer.current -= dt;
    } else {
      for (const obs of obstacles.current) {
        if (!obs.active) continue;
        const dx = Math.abs(carX.current - obs.x);
        const dz = Math.abs(carZ.current - obs.z);
        if (
          dx < (CAR_WIDTH / 2 + OBSTACLE_SIZE / 2) * 0.85 &&
          dz < (CAR_DEPTH / 2 + OBSTACLE_SIZE / 2) * 0.85
        ) {
          obs.active = false;
          obs.mesh.visible = false;
          lives.current -= 1;
          invincibleTimer.current = 1.5;
          onStatsUpdate({ lives: lives.current });
          if (lives.current <= 0) {
            gameOverRef.current = true;
            onGameOver(score.current);
            return;
          }
        }
      }
    }

    if (distance.current >= trackTotal.current) {
      levelDone.current = true;
      const bonus =
        timeLeft.current !== null ? Math.floor(timeLeft.current * 100) : 0;
      onLevelComplete(score.current + bonus);
      return;
    }

    frameCount.current++;
    if (frameCount.current % 10 === 0) {
      onStatsUpdate({
        score: score.current,
        speed: spd,
        timeLeft: timeLeft.current,
      });
    }
  });

  return (
    <>
      <group ref={roadGroup as React.RefObject<THREE.Group>} />
      <group ref={obstacleGroup as React.RefObject<THREE.Group>} />
      <group ref={carRef} position={[0, 0, 0]}>
        <mesh position={[0, CAR_HEIGHT / 2, 0]}>
          <boxGeometry args={[CAR_WIDTH, CAR_HEIGHT, CAR_DEPTH]} />
          <meshStandardMaterial
            color="#22E6FF"
            emissive="#22E6FF"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, CAR_HEIGHT + 0.18, 0.1]}>
          <boxGeometry args={[CAR_WIDTH * 0.7, 0.35, CAR_DEPTH * 0.5]} />
          <meshStandardMaterial
            color="#8A3FFC"
            emissive="#8A3FFC"
            emissiveIntensity={0.5}
          />
        </mesh>
        {([-1, 1] as const).map((sx) =>
          ([-1, 1] as const).map((sz) => (
            <mesh
              key={`${sx}${sz}`}
              position={[sx * CAR_WIDTH * 0.55, 0.12, sz * CAR_DEPTH * 0.32]}
            >
              <cylinderGeometry args={[0.18, 0.18, 0.15, 8]} />
              <meshStandardMaterial color="#2B313B" />
            </mesh>
          )),
        )}
        <pointLight
          position={[0, 0.3, -CAR_DEPTH / 2 - 0.1]}
          color="#22E6FF"
          intensity={3}
          distance={10}
        />
      </group>
    </>
  );
}
