import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialGameState,
  getSnapshot,
  resetForNewRun,
  SimulationSnapshot,
  stepSimulation,
  WauGameState,
} from '../game/wauFlightRules';
import { renderWauScene } from '../game/wauCanvasRenderer';
import { wauAudio } from '../game/wauAudio';

interface WauMinigameProps {
  autostart?: boolean;
  onExitToAtelier: () => void;
}

const BEST_SCORE_KEY = 'king_kangkang_minigame_best';

function BambooSocketIcon({ state }: { state: 'full' | 'empty' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect
        x="7"
        y="3"
        width="10"
        height="18"
        rx="3"
        fill={state === 'full' ? '#15803D' : '#1C1917'}
        fillOpacity={state === 'full' ? 1 : 0.35}
        stroke="#1C1917"
        strokeWidth="2"
      />
      <line x1="7" y1="9" x2="17" y2="9" stroke="#FDE68A" strokeWidth="1.5" />
      <line x1="7" y1="15" x2="17" y2="15" stroke="#FDE68A" strokeWidth="1.5" />
      {state === 'full' && (
        <rect x="9" y="5" width="2" height="14" rx="1" fill="#86EFAC" fillOpacity="0.65" />
      )}
    </svg>
  );
}

export function WauMinigame({ autostart = false, onExitToAtelier }: WauMinigameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bestStored = (() => {
    try {
      return Number(localStorage.getItem(BEST_SCORE_KEY) || 0) || 0;
    } catch {
      return 0;
    }
  })();

  const simRef = useRef<WauGameState>(createInitialGameState(1200, 720, bestStored));
  const inputRef = useRef({
    upHeld: false,
    downHeld: false,
    pulseQueued: false,
  });
  const pointerYRef = useRef<number | null>(null);

  const [hud, setHud] = useState<SimulationSnapshot>(() => getSnapshot(simRef.current));
  const [muted, setMuted] = useState<boolean>(false);

  const syncBodyState = useCallback((phase: WauGameState['phase']) => {
    if (typeof document !== 'undefined') {
      document.body.dataset.state = phase === 'victory' ? 'gameover' : phase;
    }
  }, []);

  const clearHeldInputs = useCallback(() => {
    inputRef.current.upHeld = false;
    inputRef.current.downHeld = false;
    inputRef.current.pulseQueued = false;
    pointerYRef.current = null;
  }, []);

  const handleStartOrRestart = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    clearHeldInputs();
    resetForNewRun(simRef.current);
    syncBodyState('playing');
    setHud(getSnapshot(simRef.current));
    canvasRef.current?.focus();
  }, [clearHeldInputs, syncBodyState]);

  const handleTogglePause = useCallback(() => {
    const sim = simRef.current;
    if (sim.phase === 'playing') {
      sim.phase = 'paused';
      clearHeldInputs();
      syncBodyState('paused');
      setHud(getSnapshot(sim));
    } else if (sim.phase === 'paused') {
      sim.phase = 'playing';
      clearHeldInputs();
      syncBodyState('playing');
      setHud(getSnapshot(sim));
      canvasRef.current?.focus();
    }
  }, [clearHeldInputs, syncBodyState]);

  const handleReturnTitle = useCallback(() => {
    const sim = simRef.current;
    sim.phase = 'title';
    clearHeldInputs();
    syncBodyState('title');
    setHud(getSnapshot(sim));
  }, [clearHeldInputs, syncBodyState]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      wauAudio.setMuted(next);
      return next;
    });
  }, []);

  // Support ?autostart=1
  useEffect(() => {
    if (autostart) {
      handleStartOrRestart();
    } else {
      syncBodyState('title');
    }
    return () => {
      if (typeof document !== 'undefined') {
        delete document.body.dataset.state;
      }
    };
  }, [autostart, handleStartOrRestart, syncBodyState]);

  // ResizeObserver for crisp canvas bounds
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, Math.round(rect.width));
      const h = Math.max(420, Math.round(rect.height));
      canvas.width = w;
      canvas.height = h;
      simRef.current.width = w;
      simRef.current.height = h;
      simRef.current.kiteX = Math.round(w * 0.24);
      if (simRef.current.phase === 'title' || simRef.current.elapsedSeconds < 0.05) {
        simRef.current.kiteY = Math.round(h * 0.44);
      } else {
        simRef.current.kiteY = Math.max(52, Math.min(h - 108, simRef.current.kiteY));
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Keyboard & Blur Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const phase = simRef.current.phase;
      if (phase === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleStartOrRestart();
        return;
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (phase === 'playing' || phase === 'paused') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        if (phase === 'playing' || phase === 'paused' || phase === 'gameover' || phase === 'victory') {
          handleStartOrRestart();
        }
        return;
      }

      if (phase !== 'playing') return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        inputRef.current.upHeld = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        inputRef.current.downHeld = true;
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!e.repeat) {
          inputRef.current.pulseQueued = true;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        inputRef.current.upHeld = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        inputRef.current.downHeld = false;
      }
    };

    const onFocusLoss = () => {
      clearHeldInputs();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onFocusLoss);
    document.addEventListener('visibilitychange', onFocusLoss);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onFocusLoss);
      document.removeEventListener('visibilitychange', onFocusLoss);
    };
  }, [clearHeldInputs, handleStartOrRestart, handleToggleMute, handleTogglePause]);

  // Isolated 60 FPS Simulation & Canvas Render Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let hudSyncAccum = 0;
    let worldClock = 0;

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      worldClock += Math.min(rawDt, 0.05);

      const sim = simRef.current;

      // Support pointer drag steering if user holds mouse/touch on canvas
      let pointerUp = false;
      let pointerDown = false;
      if (pointerYRef.current !== null && sim.phase === 'playing') {
        const diffY = pointerYRef.current - sim.kiteY;
        if (diffY < -14) pointerUp = true;
        else if (diffY > 14) pointerDown = true;
      }

      const events = stepSimulation(sim, rawDt, {
        upHeld: inputRef.current.upHeld || pointerUp,
        downHeld: inputRef.current.downHeld || pointerDown,
        pulseJustPressed: inputRef.current.pulseQueued,
      });
      inputRef.current.pulseQueued = false;

      if (events.pulsedBusur) wauAudio.playBusurPulse();
      if (events.pickedUpPadi) wauAudio.playPickup(false);
      if (events.pickedUpRing) wauAudio.playPickup(true);
      if (events.hawkTelegraphed) wauAudio.playHawkTelegraph();
      if (events.tookDamage) wauAudio.playDamage();
      if (events.outcomeReached === 'victory') {
        wauAudio.playVictory();
        syncBodyState('gameover');
        try {
          localStorage.setItem(BEST_SCORE_KEY, String(sim.bestScore));
        } catch {
          // Ignore storage error
        }
        setHud(getSnapshot(sim));
      } else if (events.outcomeReached === 'gameover') {
        syncBodyState('gameover');
        try {
          localStorage.setItem(BEST_SCORE_KEY, String(sim.bestScore));
        } catch {
          // Ignore storage error
        }
        setHud(getSnapshot(sim));
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { alpha: false, willReadFrequently: true });
      if (ctx) {
        renderWauScene(ctx, sim, worldClock);
      }

      // Throttle HUD React updates to ~12 Hz (or immediate on state change)
      hudSyncAccum += rawDt;
      if (sim.phase === 'playing' && hudSyncAccum >= 0.08) {
        hudSyncAccum = 0;
        setHud(getSnapshot(sim));
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [syncBodyState]);

  const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (simRef.current.phase !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerYRef.current = e.clientY - rect.top;
  };

  const busurReady = hud.busurCooldown <= 0;
  const busurFillPct = Math.max(
    0,
    Math.min(100, Math.round((1 - hud.busurCooldown / hud.busurMaxCooldown) * 100)),
  );
  const progressPct = Math.min(100, Math.round((hud.distance / hud.targetDistance) * 100));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden bg-[#FEF3C7] select-none"
    >
      {/* Full-Bleed Canvas2D Stage */}
      <canvas
        ref={canvasRef}
        tabIndex={0}
        data-testid="wau-game-canvas"
        aria-label="Wau Kangkang Sky Flight Minigame Canvas"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleCanvasPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0 || e.pointerType === 'touch') {
            handleCanvasPointer(e);
          }
        }}
        onPointerUp={() => {
          pointerYRef.current = null;
        }}
        onPointerCancel={() => {
          pointerYRef.current = null;
        }}
        className="block h-full w-full touch-none outline-none"
      />

      {/* TITLE SCREEN OVERLAY (Calm Sky Left-Third Negative Space + Hovering Wau Right) */}
      {hud.phase === 'title' && (
        <div className="pointer-events-none fixed inset-0 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div className="pointer-events-auto max-w-md space-y-6 pt-4 sm:pt-10">
            {/* Bespoke Inline SVG Title Emblem */}
            <svg viewBox="0 0 380 120" className="h-auto w-full max-w-[360px]" role="img" aria-label="Angin Timur Wau Kangkang">
              <path
                d="M 18 28 Q 95 6 172 28"
                fill="none"
                stroke="#B45309"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <text
                x="12"
                y="62"
                fontFamily="Fraunces, Georgia, serif"
                fontSize="36"
                fontWeight="700"
                fill="#1C1917"
              >
                Angin Timur
              </text>
              <text
                x="14"
                y="92"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontSize="16"
                fontWeight="700"
                letterSpacing="1.5"
                fill="#115E59"
              >
                WAU KANGKANG SKY FLIGHT
              </text>
            </svg>

            <p className="text-sm leading-relaxed text-[#292524]">
              Ride the post-harvest east monsoon winds across Kedah’s golden paddy fields. Gather
              rice sheaves, pulse your singing <em>busur</em> bow, and clear 1,500 meters without
              snapping your bamboo frame.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                data-start="true"
                onClick={handleStartOrRestart}
                className="rounded-lg bg-[#115E59] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0F4C48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
              >
                Launch Wau
              </button>
              <button
                type="button"
                onClick={onExitToAtelier}
                className="rounded-lg border border-[#78350F]/40 bg-[#FAF7F0] px-5 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:border-[#115E59] hover:text-[#115E59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
              >
                Back to Atelier
              </button>
            </div>

            <div className="inline-block rounded-lg border border-[#78350F]/25 bg-[#FAF7F0]/90 px-3.5 py-2 text-xs font-medium tracking-wide text-[#292524] shadow-sm">
              W / ↑ Climb · S / ↓ Dive · Space Busur Pulse · P Pause · Drag to Steer
            </div>
          </div>
        </div>
      )}

      {/* PLAYING HUD (3 Compact Perimeter Clusters, >= 85% Unobstructed Sky) */}
      {hud.phase !== 'title' && (
        <div className="pointer-events-none fixed inset-0 flex flex-col justify-between p-2.5 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap sm:gap-4">
            {/* Top-Left: Bamboo Integrity + Busur Pulse */}
            <div className="order-1 flex flex-col gap-1.5 rounded-xl border border-[#78350F]/30 bg-[#FAF7F0]/90 px-2.5 py-2 shadow-sm sm:gap-2 sm:px-3.5 sm:py-2.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] sm:text-[11px]">
                  Frame
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1" aria-label={`Bamboo integrity ${hud.integrity} of ${hud.maxIntegrity}`}>
                  {Array.from({ length: hud.maxIntegrity }).map((_, idx) => (
                    <BambooSocketIcon
                      key={idx}
                      state={idx < hud.integrity ? 'full' : 'empty'}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] whitespace-nowrap sm:text-[11px]">
                  Busur<span className="hidden sm:inline"> [Space]</span>
                </span>
                <div className="h-2 w-16 overflow-hidden rounded-full bg-[#E2D9C8] sm:w-24">
                  <div
                    className="h-full transition-transform duration-75"
                    style={{
                      width: '100%',
                      transform: `scaleX(${busurFillPct / 100})`,
                      transformOrigin: 'left',
                      backgroundColor: busurReady ? '#B45309' : '#78716C',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Top-Center: Distance Progress + Tabular Score */}
            <div className="order-3 mx-auto flex w-full items-center justify-between gap-3 rounded-xl border border-[#78350F]/30 bg-[#FAF7F0]/90 px-3 py-1.5 shadow-sm sm:order-2 sm:mx-0 sm:w-auto sm:justify-start sm:gap-5 sm:px-4 sm:py-2">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] whitespace-nowrap">
                  {hud.phaseLabel}
                </div>
                <div className="font-mono text-sm font-bold tabular-nums text-[#1C1917] whitespace-nowrap sm:text-lg">
                  {hud.distance} / {hud.targetDistance} m
                </div>
                <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-[#E2D9C8] sm:w-32">
                  <div
                    className="h-full bg-[#115E59]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="border-l border-[#E2D9C8] pl-3 sm:pl-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] whitespace-nowrap">
                  Score · {hud.streak}x
                </div>
                <div
                  data-testid="game-score"
                  className="font-mono text-xl font-bold leading-none tabular-nums text-[#B45309] sm:text-2xl"
                >
                  {hud.score}
                </div>
              </div>
            </div>

            {/* Top-Right: Compact Square Utility Controls */}
            <div className="order-2 pointer-events-auto flex items-center gap-1.5 sm:order-3">
              <button
                type="button"
                tabIndex={-1}
                aria-label={muted ? 'Unmute audio (M)' : 'Mute audio (M)'}
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleToggleMute();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#78350F]/30 bg-[#FAF7F0]/90 text-[#1C1917] hover:border-[#115E59] sm:h-10 sm:w-10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  {muted ? (
                    <path d="M23 9l-6 6M17 9l6 6" />
                  ) : (
                    <path d="M15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14" />
                  )}
                </svg>
              </button>

              <button
                type="button"
                tabIndex={-1}
                aria-label="Pause game (P)"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleTogglePause();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#78350F]/30 bg-[#FAF7F0]/90 text-[#1C1917] hover:border-[#115E59] sm:h-10 sm:w-10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>

              <button
                type="button"
                tabIndex={-1}
                aria-label="Restart flight (R)"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleStartOrRestart();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#78350F]/30 bg-[#FAF7F0]/90 text-[#1C1917] hover:border-[#115E59] sm:h-10 sm:w-10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Touch Busur Pulse Button */}
          {hud.phase === 'playing' && (
            <div className="pointer-events-auto flex justify-end sm:hidden">
              <button
                type="button"
                onClick={() => {
                  inputRef.current.pulseQueued = true;
                }}
                disabled={!busurReady}
                className="rounded-full bg-[#B45309] px-5 py-3 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                {busurReady ? 'Pulse Busur' : `Wait ${hud.busurCooldown}s`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PAUSE MODAL */}
      {hud.phase === 'paused' && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#1C1917]/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#D6CEBE] bg-[#FAF7F0] p-6 text-center shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-[#1C1917]">Flight Paused</h2>
            <p className="mt-1 text-xs text-[#57534E]">
              Holding altitude at {hud.distance} m · Score {hud.score}
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleTogglePause}
                className="rounded-lg bg-[#115E59] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4C48]"
              >
                Resume Flight
              </button>
              <button
                type="button"
                onClick={handleStartOrRestart}
                className="rounded-lg border border-[#D6CEBE] bg-white px-4 py-2.5 text-sm font-semibold text-[#1C1917] hover:border-[#B45309]"
              >
                Restart
              </button>
              <button
                type="button"
                onClick={handleReturnTitle}
                className="rounded-lg border border-[#D6CEBE] bg-white px-4 py-2.5 text-sm font-semibold text-[#57534E] hover:text-[#1C1917]"
              >
                Title Screen
              </button>
              <button
                type="button"
                onClick={onExitToAtelier}
                className="pt-1 text-xs font-medium text-[#115E59] underline underline-offset-4"
              >
                Return to King KangKang Atelier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY / GAME OVER MODAL */}
      {(hud.phase === 'victory' || hud.phase === 'gameover') && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#1C1917]/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#D6CEBE] bg-[#FAF7F0] p-6 text-center shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B45309]">
              {hud.phase === 'victory' ? 'Harvest Flight Complete' : 'Bamboo Frame Snapped'}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#1C1917]">
              {hud.phase === 'victory'
                ? 'Master of Angin Timur'
                : 'Down Over the Bendang'}
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-[#E2D9C8] bg-white p-3.5">
              <div>
                <div className="text-[11px] text-[#57534E]">Score</div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#115E59]">
                  {hud.score}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#57534E]">Distance</div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#1C1917]">
                  {hud.distance} m
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#57534E]">Best</div>
                <div className="font-mono text-lg font-bold tabular-nums text-[#B45309]">
                  {hud.bestScore}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                data-start="true"
                onClick={handleStartOrRestart}
                className="rounded-lg bg-[#115E59] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4C48]"
              >
                {hud.phase === 'victory' ? 'Fly Again' : 'Try Again'}
              </button>
              <button
                type="button"
                onClick={onExitToAtelier}
                className="rounded-lg border border-[#D6CEBE] bg-white px-5 py-2.5 text-sm font-semibold text-[#1C1917] hover:border-[#115E59]"
              >
                Back to Atelier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
