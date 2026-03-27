# Car Rush 3D

## Current State
New project -- no existing application files.

## Requested Changes (Diff)

### Add
- Full 3D obstacle-course car game with 1000 procedurally generated levels
- Levels 1-333: easy (slow speed, few obstacles, wide road)
- Levels 334-666: medium (moderate speed, more obstacles, narrower road)
- Levels 667-1000: hard (fast speed, dense obstacles, tight turns, time limits)
- Third-person camera following the car
- Keyboard (WASD / arrow keys) + mobile touch controls
- HUD: level counter, score, speed, lives/health
- Start screen, level complete screen, game over screen
- Procedural road and obstacle generation per level
- Neon/arcade visual theme

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: minimal (no persistent data needed, game is client-side)
2. Frontend: React Three Fiber 3D scene
   - Car mesh with keyboard/touch controls
   - Procedural road segments and obstacle spawning based on level
   - Third-person camera (useFrame follow)
   - Collision detection (car vs obstacles)
   - HUD overlay (level, score, speed, lives)
   - Game state machine: menu -> playing -> level-complete -> game-over
   - 1000 levels with difficulty scaling formula
   - Touch joystick for mobile
