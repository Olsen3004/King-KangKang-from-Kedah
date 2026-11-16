export type GamePhase = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

export type HazardKind = 'squall' | 'hawk' | 'trellis';

export interface HazardEntity {
  active: boolean;
  id: number;
  kind: HazardKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phaseTimer: number;
  baseY: number;
  telegraphed: boolean;
  hitAlready: boolean;
}

export interface PickupEntity {
  active: boolean;
  id: number;
  kind: 'padi' | 'ring';
  x: number;
  y: number;
  vx: number;
  radius: number;
  bobPhase: number;
}

export interface ParticleSlot {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'petal' | 'wind' | 'ring';
}

export interface InputState {
  upHeld: boolean;
  downHeld: boolean;
  pulseJustPressed: boolean;
}

export interface SimulationSnapshot {
  phase: GamePhase;
  score: number;
  bestScore: number;
  distance: number;
  targetDistance: number;
  integrity: number;
  maxIntegrity: number;
  streak: number;
  busurCooldown: number;
  busurMaxCooldown: number;
  elapsedSeconds: number;
  phaseLabel: string;
}

export interface WauGameState {
  phase: GamePhase;
  width: number;
  height: number;
  kiteX: number;
  kiteY: number;
  kiteVy: number;
  kiteTilt: number;
  integrity: number;
  maxIntegrity: number;
  invulnTimer: number;
  hitFlashTimer: number;
  hitstopTimer: number;
  trauma: number;
  score: number;
  bestScore: number;
  distance: number;
  targetDistance: number;
  elapsedSeconds: number;
  streak: number;
  busurCooldown: number;
  busurMaxCooldown: number;
  busurWaveTimer: number;
  busurWaveRadius: number;
  spawnHazardTimer: number;
  spawnPickupTimer: number;
  nextEntityId: number;
  hazards: HazardEntity[];
  pickups: PickupEntity[];
  particles: ParticleSlot[];
  particleCursor: number;
  endDelayTimer: number;
  pendingOutcome: 'victory' | 'gameover' | null;
}

export interface StepEvents {
  pickedUpPadi: boolean;
  pickedUpRing: boolean;
  pulsedBusur: boolean;
  tookDamage: boolean;
  hawkTelegraphed: boolean;
  outcomeReached: 'victory' | 'gameover' | null;
}

export const TARGET_FLIGHT_DISTANCE = 1500;
export const MAX_INTEGRITY = 3;
export const BUSUR_COOLDOWN_SECONDS = 1.8;
const PARTICLE_POOL_SIZE = 96;
const HAZARD_POOL_SIZE = 16;
const PICKUP_POOL_SIZE = 16;

export function createInitialGameState(width = 1200, height = 720, bestScore = 0): WauGameState {
  const hazards: HazardEntity[] = Array.from({ length: HAZARD_POOL_SIZE }, (_, idx) => ({
    active: false,
    id: idx,
    kind: 'squall',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 26,
    phaseTimer: 0,
    baseY: 0,
    telegraphed: false,
    hitAlready: false,
  }));

  const pickups: PickupEntity[] = Array.from({ length: PICKUP_POOL_SIZE }, (_, idx) => ({
    active: false,
    id: idx,
    kind: 'padi',
    x: 0,
    y: 0,
    vx: 0,
    radius: 18,
    bobPhase: 0,
  }));

  const particles: ParticleSlot[] = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 1,
    size: 4,
    color: '#F59E0B',
    kind: 'petal',
  }));

  return {
    phase: 'title',
    width,
    height,
    kiteX: Math.round(width * 0.24),
    kiteY: Math.round(height * 0.44),
    kiteVy: 0,
    kiteTilt: 0,
    integrity: MAX_INTEGRITY,
    maxIntegrity: MAX_INTEGRITY,
    invulnTimer: 0,
    hitFlashTimer: 0,
    hitstopTimer: 0,
    trauma: 0,
    score: 0,
    bestScore,
    distance: 0,
    targetDistance: TARGET_FLIGHT_DISTANCE,
    elapsedSeconds: 0,
    streak: 1,
    busurCooldown: 0,
    busurMaxCooldown: BUSUR_COOLDOWN_SECONDS,
    busurWaveTimer: 0,
    busurWaveRadius: 0,
    spawnHazardTimer: 1.4,
    spawnPickupTimer: 0.7,
    nextEntityId: 1,
    hazards,
    pickups,
    particles,
    particleCursor: 0,
    endDelayTimer: 0,
    pendingOutcome: null,
  };
}

export function resetForNewRun(state: WauGameState): void {
  state.phase = 'playing';
  state.kiteX = Math.round(state.width * 0.24);
  state.kiteY = Math.round(state.height * 0.44);
  state.kiteVy = 0;
  state.kiteTilt = 0;
  state.integrity = state.maxIntegrity;
  state.invulnTimer = 0;
  state.hitFlashTimer = 0;
  state.hitstopTimer = 0;
  state.trauma = 0;
  state.score = 0;
  state.distance = 0;
  state.elapsedSeconds = 0;
  state.streak = 1;
  state.busurCooldown = 0;
  state.busurWaveTimer = 0;
  state.busurWaveRadius = 0;
  state.spawnHazardTimer = 1.25;
  state.spawnPickupTimer = 0.6;
  state.endDelayTimer = 0;
  state.pendingOutcome = null;

  for (const h of state.hazards) h.active = false;
  for (const p of state.pickups) p.active = false;
  for (const pt of state.particles) pt.active = false;
}

export function getDifficultyProfile(distance: number): {
  scrollSpeed: number;
  spawnInterval: number;
  phaseLabel: string;
  hawkChance: number;
  trellisChance: number;
} {
  if (distance < 500) {
    return {
      scrollSpeed: 245,
      spawnInterval: 1.55,
      phaseLabel: 'Morning Breeze',
      hawkChance: 0.2,
      trellisChance: 0.2,
    };
  }
  if (distance < 1000) {
    return {
      scrollSpeed: 305,
      spawnInterval: 1.2,
      phaseLabel: 'Angin Timur Surge',
      hawkChance: 0.34,
      trellisChance: 0.28,
    };
  }
  return {
    scrollSpeed: 365,
    spawnInterval: 0.92,
    phaseLabel: 'Harvest Monsoon Peak',
    hawkChance: 0.42,
    trellisChance: 0.3,
  };
}

export function emitParticle(
  state: WauGameState,
  x: number,
  y: number,
  vx: number,
  vy: number,
  maxLife: number,
  size: number,
  color: string,
  kind: 'petal' | 'wind' | 'ring',
): void {
  const slot = state.particles[state.particleCursor];
  state.particleCursor = (state.particleCursor + 1) % state.particles.length;
  slot.active = true;
  slot.x = x;
  slot.y = y;
  slot.vx = vx;
  slot.vy = vy;
  slot.life = maxLife;
  slot.maxLife = maxLife;
  slot.size = size;
  slot.color = color;
  slot.kind = kind;
}

export function spawnHazard(
  state: WauGameState,
  forcedKind?: HazardKind,
  rng: () => number = Math.random,
): HazardEntity | null {
  const slot = state.hazards.find((h) => !h.active);
  if (!slot) return null;

  const diff = getDifficultyProfile(state.distance);
  const roll = rng();
  const kind: HazardKind =
    forcedKind ??
    (roll < diff.hawkChance
      ? 'hawk'
      : roll < diff.hawkChance + diff.trellisChance
        ? 'trellis'
        : 'squall');

  const topBound = 84;
  const bottomBound = Math.max(200, state.height - 130);

  slot.active = true;
  slot.id = state.nextEntityId++;
  slot.kind = kind;
  slot.hitAlready = false;
  slot.phaseTimer = 0;
  slot.telegraphed = false;

  if (kind === 'squall') {
    slot.x = state.width + 48;
    slot.baseY = topBound + rng() * (bottomBound - topBound);
    slot.y = slot.baseY;
    slot.vx = -(diff.scrollSpeed * 1.05);
    slot.vy = 0;
    slot.radius = 28;
  } else if (kind === 'hawk') {
    slot.x = state.width + 48;
    slot.baseY = topBound + rng() * ((bottomBound - topBound) * 0.72);
    slot.y = slot.baseY;
    slot.vx = -(diff.scrollSpeed * 1.38);
    slot.vy = 0;
    slot.radius = 22;
  } else {
    // Rising bamboo/palm gust column from lower paddy edge
    slot.x = state.width + 48;
    slot.baseY = state.height - 80;
    slot.y = slot.baseY;
    slot.vx = -(diff.scrollSpeed * 0.96);
    slot.vy = -85 - rng() * 55;
    slot.radius = 25;
  }

  return slot;
}

export function spawnPickup(
  state: WauGameState,
  forcedKind?: 'padi' | 'ring',
  rng: () => number = Math.random,
): PickupEntity | null {
  const slot = state.pickups.find((p) => !p.active);
  if (!slot) return null;

  const diff = getDifficultyProfile(state.distance);
  const topBound = 92;
  const bottomBound = Math.max(220, state.height - 150);

  slot.active = true;
  slot.id = state.nextEntityId++;
  slot.kind = forcedKind ?? (rng() < 0.22 ? 'ring' : 'padi');
  slot.x = state.width + 36;
  slot.y = topBound + rng() * (bottomBound - topBound);
  slot.vx = -diff.scrollSpeed;
  slot.radius = slot.kind === 'ring' ? 24 : 17;
  slot.bobPhase = rng() * Math.PI * 2;
  return slot;
}

export function stepSimulation(
  state: WauGameState,
  rawDt: number,
  input: InputState,
  rng: () => number = Math.random,
): StepEvents {
  const events: StepEvents = {
    pickedUpPadi: false,
    pickedUpRing: false,
    pulsedBusur: false,
    tookDamage: false,
    hawkTelegraphed: false,
    outcomeReached: null,
  };

  const dt = Math.min(Math.max(rawDt, 0), 0.05);

  // Decay visual trauma and hit flash in real time even during hitstop
  state.hitFlashTimer = Math.max(0, state.hitFlashTimer - dt);
  state.trauma = Math.max(0, state.trauma - dt * 1.9);

  // Update pooled particles in real time
  for (const pt of state.particles) {
    if (!pt.active) continue;
    pt.life -= dt;
    if (pt.life <= 0) {
      pt.active = false;
      continue;
    }
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
  }

  if (state.phase !== 'playing') {
    return events;
  }

  // Handle brief defeat/victory slow-beat before showing modal
  if (state.pendingOutcome) {
    state.endDelayTimer -= dt;
    state.kiteVy += 380 * dt;
    state.kiteY = Math.min(state.height - 70, state.kiteY + state.kiteVy * dt);
    state.kiteTilt += 2.2 * dt;
    if (state.endDelayTimer <= 0) {
      state.phase = state.pendingOutcome;
      state.bestScore = Math.max(state.bestScore, Math.round(state.score));
      events.outcomeReached = state.pendingOutcome;
      state.pendingOutcome = null;
    }
    return events;
  }

  // Hitstop freeze pauses simulation physics briefly on impact
  if (state.hitstopTimer > 0) {
    state.hitstopTimer = Math.max(0, state.hitstopTimer - dt);
    return events;
  }

  const diff = getDifficultyProfile(state.distance);

  state.elapsedSeconds += dt;
  state.invulnTimer = Math.max(0, state.invulnTimer - dt);
  state.busurCooldown = Math.max(0, state.busurCooldown - dt);

  if (state.busurWaveTimer > 0) {
    state.busurWaveTimer = Math.max(0, state.busurWaveTimer - dt);
    state.busurWaveRadius += 420 * dt;
  }

  // Kite vertical aerodynamics + responsive pitch control
  const accelY = (input.upHeld ? -860 : 0) + (input.downHeld ? 860 : 0);
  // Subtle natural buoyancy drift upward in steady harvest wind when neutral
  const neutralLift = !input.upHeld && !input.downHeld ? -22 * Math.sin(state.elapsedSeconds * 2.1) : 0;
  state.kiteVy = (state.kiteVy + (accelY + neutralLift) * dt) * Math.pow(0.06, dt);
  state.kiteVy = Math.max(-360, Math.min(360, state.kiteVy));
  state.kiteY += state.kiteVy * dt;

  const minKiteY = 74;
  const maxKiteY = Math.max(180, state.height - 108);
  if (state.kiteY < minKiteY) {
    state.kiteY = minKiteY;
    state.kiteVy = Math.max(0, state.kiteVy);
  } else if (state.kiteY > maxKiteY) {
    state.kiteY = maxKiteY;
    state.kiteVy = Math.min(0, state.kiteVy);
  }

  const targetTilt = (state.kiteVy / 360) * 0.36;
  state.kiteTilt += (targetTilt - state.kiteTilt) * Math.min(1, dt * 10);

  // Busur Pulse Action (edge-triggered)
  if (input.pulseJustPressed && state.busurCooldown <= 0) {
    state.busurCooldown = state.busurMaxCooldown;
    state.busurWaveTimer = 0.42;
    state.busurWaveRadius = 24;
    events.pulsedBusur = true;

    emitParticle(state, state.kiteX, state.kiteY, 0, 0, 0.42, 26, '#D97706', 'ring');
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6;
      emitParticle(
        state,
        state.kiteX,
        state.kiteY,
        Math.cos(ang) * 140,
        Math.sin(ang) * 140,
        0.45,
        4,
        '#F59E0B',
        'petal',
      );
    }
  }

  // Distance & passive wind survival score
  const distanceDelta = (diff.scrollSpeed * dt) / 10;
  state.distance = Math.min(state.targetDistance, state.distance + distanceDelta);
  state.score += distanceDelta * 2;

  // Ambient wind streak particles
  if (rng() < dt * 7) {
    emitParticle(
      state,
      state.width + 10,
      70 + rng() * (state.height - 160),
      -(diff.scrollSpeed * 1.45),
      0,
      0.7,
      2,
      'rgba(255, 255, 255, 0.45)',
      'wind',
    );
  }

  // Spawn hazards and pickups
  state.spawnHazardTimer -= dt;
  if (state.spawnHazardTimer <= 0) {
    spawnHazard(state, undefined, rng);
    state.spawnHazardTimer = diff.spawnInterval * (0.82 + rng() * 0.36);
  }

  state.spawnPickupTimer -= dt;
  if (state.spawnPickupTimer <= 0) {
    spawnPickup(state, undefined, rng);
    state.spawnPickupTimer = 0.85 + rng() * 0.55;
  }

  // Update Pickups + Busur pulse magnet pull
  const kiteRadius = 24;
  for (const p of state.pickups) {
    if (!p.active) continue;
    p.bobPhase += dt * 4;
    p.x += p.vx * dt;
    p.y += Math.sin(p.bobPhase) * 28 * dt;

    if (state.busurWaveTimer > 0) {
      const dx = state.kiteX - p.x;
      const dy = state.kiteY - p.y;
      const d = Math.hypot(dx, dy);
      if (d > 1 && d < 250) {
        p.x += (dx / d) * 380 * dt;
        p.y += (dy / d) * 380 * dt;
      }
    }

    if (p.x < -50) {
      p.active = false;
      continue;
    }

    const distToKite = Math.hypot(p.x - state.kiteX, p.y - state.kiteY);
    if (distToKite <= kiteRadius + p.radius) {
      p.active = false;
      if (p.kind === 'ring') {
        events.pickedUpRing = true;
        state.streak = Math.min(4, state.streak + 1);
        state.score += 180 * state.streak;
        if (state.integrity < state.maxIntegrity && state.streak >= 3) {
          state.integrity += 1;
        }
        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI * 2 * i) / 8;
          emitParticle(state, p.x, p.y, Math.cos(ang) * 110, Math.sin(ang) * 110, 0.45, 5, '#0D9488', 'petal');
        }
      } else {
        events.pickedUpPadi = true;
        state.score += 100 * state.streak;
        for (let i = 0; i < 5; i++) {
          emitParticle(
            state,
            p.x,
            p.y,
            -60 + rng() * 120,
            -80 + rng() * 160,
            0.4,
            4,
            '#F59E0B',
            'petal',
          );
        }
      }
    }
  }

  // Update Hazards across 3 distinct movement policies
  for (const h of state.hazards) {
    if (!h.active) continue;
    h.phaseTimer += dt;

    if (h.kind === 'squall') {
      h.x += h.vx * dt;
      h.y = h.baseY + Math.sin(h.phaseTimer * 3.1) * 44;
    } else if (h.kind === 'hawk') {
      // Hawk enters, telegraphs briefly when approaching mid-right, then swoops toward kite height
      if (!h.telegraphed && h.x < state.width * 0.72) {
        h.telegraphed = true;
        h.vy = Math.max(-175, Math.min(175, (state.kiteY - h.y) * 1.15));
        events.hawkTelegraphed = true;
      }
      h.x += h.vx * dt;
      h.y += h.vy * dt;
    } else {
      // Rising bamboo/palm gust column
      h.x += h.vx * dt;
      h.y += h.vy * dt;
    }

    // Busur shockwave deflects nearby squalls slightly outward
    if (state.busurWaveTimer > 0 && h.kind === 'squall') {
      const dx = h.x - state.kiteX;
      const dy = h.y - state.kiteY;
      const d = Math.hypot(dx, dy);
      if (d > 1 && d < state.busurWaveRadius + 30) {
        h.x += (dx / d) * 180 * dt;
        h.baseY += (dy / d) * 160 * dt;
      }
    }

    if (h.x < -70 || h.y < -70) {
      h.active = false;
      continue;
    }

    // Collision check
    if (!h.hitAlready && state.invulnTimer <= 0) {
      const distToKite = Math.hypot(h.x - state.kiteX, h.y - state.kiteY);
      if (distToKite <= kiteRadius + h.radius - 4) {
        h.hitAlready = true;
        h.active = false;
        state.integrity = Math.max(0, state.integrity - 1);
        state.streak = 1;
        state.invulnTimer = 1.15;
        state.hitFlashTimer = 0.06;
        state.hitstopTimer = 0.05;
        state.trauma = Math.min(1, state.trauma + 0.65);
        events.tookDamage = true;

        for (let i = 0; i < 14; i++) {
          const ang = (Math.PI * 2 * i) / 14;
          emitParticle(
            state,
            state.kiteX,
            state.kiteY,
            Math.cos(ang) * (90 + rng() * 90),
            Math.sin(ang) * (90 + rng() * 90),
            0.5,
            5,
            '#DC2626',
            'petal',
          );
        }

        if (state.integrity <= 0) {
          state.pendingOutcome = 'gameover';
          state.endDelayTimer = 0.45;
          return events;
        }
      }
    }
  }

  // Victory check
  if (state.distance >= state.targetDistance) {
    state.score += state.integrity * 250;
    state.pendingOutcome = 'victory';
    state.endDelayTimer = 0.35;
  }

  return events;
}

export function getSnapshot(state: WauGameState): SimulationSnapshot {
  const diff = getDifficultyProfile(state.distance);
  return {
    phase: state.phase,
    score: Math.round(state.score),
    bestScore: Math.round(Math.max(state.bestScore, state.score)),
    distance: Math.round(state.distance),
    targetDistance: state.targetDistance,
    integrity: state.integrity,
    maxIntegrity: state.maxIntegrity,
    streak: state.streak,
    busurCooldown: Number(state.busurCooldown.toFixed(1)),
    busurMaxCooldown: state.busurMaxCooldown,
    elapsedSeconds: Math.round(state.elapsedSeconds),
    phaseLabel: diff.phaseLabel,
  };
}
