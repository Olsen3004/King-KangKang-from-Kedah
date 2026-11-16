import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialGameState,
  resetForNewRun,
  spawnHazard,
  spawnPickup,
  stepSimulation,
} from './wauFlightRules';

test('createInitialGameState starts in title phase with full bamboo integrity', () => {
  const state = createInitialGameState(1200, 720, 500);
  assert.equal(state.phase, 'title');
  assert.equal(state.integrity, 3);
  assert.equal(state.bestScore, 500);
});

test('clamped dt prevents large jumps and responsive pitch moves kite up/down', () => {
  const state = createInitialGameState(1200, 720);
  resetForNewRun(state);
  const startY = state.kiteY;

  stepSimulation(state, 5.0, { upHeld: true, downHeld: false, pulseJustPressed: false }, () => 0.5);
  assert.ok(state.kiteY < startY);
  assert.ok(state.distance < 10); // Clamped to <= 0.05s so 5s spike doesn't teleport to victory
});

test('busur pulse fires on edge trigger and enters cooldown', () => {
  const state = createInitialGameState(1200, 720);
  resetForNewRun(state);

  const first = stepSimulation(state, 0.016, { upHeld: false, downHeld: false, pulseJustPressed: true }, () => 0.5);
  assert.equal(first.pulsedBusur, true);
  assert.ok(state.busurCooldown > 1.0);

  const second = stepSimulation(state, 0.016, { upHeld: false, downHeld: false, pulseJustPressed: true }, () => 0.5);
  assert.equal(second.pulsedBusur, false);
});

test('collecting golden padi orbs and wind rings increments score and streak', () => {
  const state = createInitialGameState(1200, 720);
  resetForNewRun(state);

  const ring = spawnPickup(state, 'ring', () => 0.5)!;
  ring.x = state.kiteX + 5;
  ring.y = state.kiteY;

  const ev = stepSimulation(state, 0.016, { upHeld: false, downHeld: false, pulseJustPressed: false }, () => 0.5);
  assert.equal(ev.pickedUpRing, true);
  assert.equal(state.streak, 2);
  assert.ok(state.score >= 360);
});

test('hazard collision deducts bamboo integrity, triggers hitstop, and reaches gameover at 0', () => {
  const state = createInitialGameState(1200, 720);
  resetForNewRun(state);
  state.integrity = 1;

  const squall = spawnHazard(state, 'squall', () => 0.5)!;
  squall.x = state.kiteX;
  squall.y = state.kiteY;
  squall.baseY = state.kiteY;

  const hitEv = stepSimulation(state, 0.016, { upHeld: false, downHeld: false, pulseJustPressed: false }, () => 0.5);
  assert.equal(hitEv.tookDamage, true);
  assert.equal(state.integrity, 0);
  assert.equal(state.pendingOutcome, 'gameover');
  assert.ok(state.hitstopTimer > 0);

  // Advance past hitstop and end delay
  for (let i = 0; i < 20; i++) {
    stepSimulation(state, 0.04, { upHeld: false, downHeld: false, pulseJustPressed: false }, () => 0.5);
  }
  assert.equal(state.phase, 'gameover');
});

test('reaching target distance transitions cleanly to victory', () => {
  const state = createInitialGameState(1200, 720);
  resetForNewRun(state);
  state.distance = state.targetDistance - 0.1;

  stepSimulation(state, 0.05, { upHeld: false, downHeld: false, pulseJustPressed: false }, () => 0.5);
  assert.equal(state.pendingOutcome, 'victory');

  for (let i = 0; i < 15; i++) {
    stepSimulation(state, 0.04, { upHeld: false, downHeld: false, pulseJustPressed: false }, () => 0.5);
  }
  assert.equal(state.phase, 'victory');
});
