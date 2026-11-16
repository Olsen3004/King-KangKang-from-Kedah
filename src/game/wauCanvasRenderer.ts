import { WauGameState } from './wauFlightRules';

function drawWauKangkang(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tilt: number,
  time: number,
  flashWhite: boolean,
  invulnBlink: boolean,
  busurPulseRatio: number,
): void {
  if (invulnBlink) {
    ctx.globalAlpha = 0.45;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  const scale = 0.95;
  ctx.scale(scale, scale);

  // Busur humming bow at top/neck
  const bowVib = busurPulseRatio > 0 ? Math.sin(time * 55) * 3 : Math.sin(time * 18) * 0.8;
  ctx.beginPath();
  ctx.moveTo(-24, -18);
  ctx.quadraticCurveTo(0, -32 + bowVib, 24, -18);
  ctx.strokeStyle = flashWhite ? '#FFFFFF' : '#92400E';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-23, -18);
  ctx.quadraticCurveTo(0, -19 + bowVib * 1.4, 23, -18);
  ctx.strokeStyle = flashWhite ? '#FFFFFF' : '#FDE68A';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Main Wau Kangkang Body (broad upper wings + pinched waist + splayed twin legs)
  ctx.beginPath();
  ctx.moveTo(0, -34); // Kepala
  ctx.lineTo(6, -16);
  ctx.bezierCurveTo(26, -20, 46, -10, 48, 0); // Right sayap
  ctx.bezierCurveTo(46, 10, 22, 14, 6, 13); // Right pinggang
  ctx.bezierCurveTo(8, 22, 20, 32, 30, 44); // Right kaki kangkang outer
  ctx.bezierCurveTo(18, 39, 8, 30, 0, 22); // Inner crotch
  ctx.bezierCurveTo(-8, 30, -18, 39, -30, 44); // Left kaki kangkang outer
  ctx.bezierCurveTo(-20, 32, -8, 22, -6, 13); // Left pinggang
  ctx.bezierCurveTo(-22, 14, -46, 10, -48, 0); // Left sayap
  ctx.bezierCurveTo(-46, -10, -26, -20, -6, -16);
  ctx.closePath();

  ctx.fillStyle = flashWhite ? '#FFFFFF' : '#B91C1C';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = flashWhite ? '#FFFFFF' : '#78350F';
  ctx.stroke();

  if (!flashWhite) {
    // Sobek golden & teal floral fields
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.strokeStyle = '#115E59';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-26, 0, 9, 6, -0.1, 0, Math.PI * 2);
    ctx.ellipse(26, 0, 9, 6, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#0F766E';
    ctx.fill();

    // Central spine & wing rib detail
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(0, 22);
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Subtle fluttering tail ribbons at the splayed kaki kangkang tips
    const flutter = Math.sin(time * 12) * 3.5;
    ctx.beginPath();
    ctx.moveTo(-29, 43);
    ctx.quadraticCurveTo(-34, 52 + flutter * 0.5, -39, 59 + flutter);
    ctx.moveTo(29, 43);
    ctx.quadraticCurveTo(34, 52 - flutter * 0.5, 39, 59 - flutter);
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

export function renderWauScene(
  ctx: CanvasRenderingContext2D,
  state: WauGameState,
  worldClockSeconds: number,
): void {
  const { width, height } = state;

  // Apply decaying trauma*trauma screen shake
  const shakeMag = state.trauma * state.trauma * 14;
  const shakeX = shakeMag > 0.2 ? (Math.random() - 0.5) * 2 * shakeMag : 0;
  const shakeY = shakeMag > 0.2 ? (Math.random() - 0.5) * 2 * shakeMag : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // 1. Morning Kedah Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#BAE6FD');
  skyGrad.addColorStop(0.58, '#FEF3C7');
  skyGrad.addColorStop(1, '#FDE68A');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-20, -20, width + 40, height + 40);

  // Warm sun disc in upper right sky
  const sunX = width * 0.78;
  const sunY = height * 0.2;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 90);
  sunGrad.addColorStop(0, 'rgba(255, 251, 235, 0.95)');
  sunGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.45)');
  sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
  ctx.fill();

  const panOffset = state.phase === 'playing' ? state.distance * 4 : worldClockSeconds * 28;

  // 2. Parallax Clouds (separate paths per puff so zero chord notch artifacts)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 290 - panOffset * 0.35) % (width + 260) + (width + 260)) % (width + 260) - 130;
    const cy = 72 + (i % 3) * 56;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 56, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 28, cy - 9, 36, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - 28, cy - 5, 32, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Distant Gunung Jerai Mountain Silhouette (organic Kedah ridge)
  const groundY = height - 84;
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(-40, groundY);
  const ridgeCycle = 560;
  const ridgeShift = (panOffset * 0.22) % ridgeCycle;
  for (let px = -ridgeCycle; px <= width + ridgeCycle; px += ridgeCycle) {
    const rx = px - ridgeShift;
    ctx.quadraticCurveTo(rx + 85, groundY - 72, rx + 170, groundY - 46);
    ctx.quadraticCurveTo(rx + 265, groundY - 118, rx + 355, groundY - 52);
    ctx.quadraticCurveTo(rx + 455, groundY - 82, rx + 560, groundY - 22);
  }
  ctx.lineTo(width + 40, groundY);
  ctx.closePath();
  ctx.fill();

  // 4. Midground Green Paddy Hills & Kampung Trees
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.moveTo(-40, groundY);
  for (let px = -120; px <= width + 240; px += 140) {
    const shifted = px - (panOffset * 0.55) % 280;
    const hillH = (Math.abs(px / 140) % 2 === 0) ? 34 : 24;
    ctx.quadraticCurveTo(shifted + 70, groundY - hillH, shifted + 140, groundY - 6);
  }
  ctx.lineTo(width + 40, groundY);
  ctx.closePath();
  ctx.fill();

  // 5. Golden-Green Kedah Bendang Foreground
  const paddyGrad = ctx.createLinearGradient(0, groundY, 0, height);
  paddyGrad.addColorStop(0, '#65A30D');
  paddyGrad.addColorStop(0.55, '#CA8A04');
  paddyGrad.addColorStop(1, '#854D0E');
  ctx.fillStyle = paddyGrad;
  ctx.fillRect(-20, groundY, width + 40, height - groundY + 20);

  // Organic swaying rice stalks
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.44)';
  ctx.lineWidth = 1.8;
  for (let i = 0; i * 24 < width + 48; i++) {
    const sx = i * 24;
    const scrollX = ((sx - panOffset * 1.35) % (width + 48) + (width + 48)) % (width + 48) - 24;
    const sway = Math.sin(worldClockSeconds * 3.2 + i * 0.9) * 7;
    const topY = groundY + 10 + (i % 3) * 8;
    ctx.beginPath();
    ctx.moveTo(scrollX, height);
    ctx.quadraticCurveTo(scrollX + sway * 0.55, groundY + 46, scrollX + sway, topY);
    ctx.stroke();
  }

  // Compute player Wau Kangkang display coordinates first so string & flyer connect accurately in all phases
  const kiteDisplayY =
    state.phase === 'title'
      ? height * 0.44 + Math.sin(worldClockSeconds * 2.1) * 18
      : state.kiteY;
  const kiteDisplayX = state.phase === 'title' ? width * 0.66 : state.kiteX;
  const kiteTilt = state.phase === 'title' ? Math.sin(worldClockSeconds * 1.6) * 0.08 : state.kiteTilt;

  // 6. Dynamic Curved Tali Teraju (Kite String) anchored to ground flyer
  const anchorX = Math.max(54, kiteDisplayX - 190);
  const anchorY = groundY + 18;
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  ctx.quadraticCurveTo(
    (anchorX + kiteDisplayX) * 0.52,
    (anchorY + kiteDisplayY) * 0.58 + 26,
    kiteDisplayX,
    kiteDisplayY + 4,
  );
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Village kite flyer silhouette at anchor
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(anchorX, anchorY - 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(anchorX - 4, anchorY - 9, 8, 15);

  // 7. Busur Acoustic Shockwave Ring
  if (state.busurWaveTimer > 0) {
    const alpha = state.busurWaveTimer / 0.42;
    ctx.beginPath();
    ctx.arc(state.kiteX, state.kiteY, state.busurWaveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(217, 119, 6, ${alpha.toFixed(2)})`;
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }

  // 8. Pickups (Golden Padi Orbs & Angin Timur Wind Rings)
  for (const p of state.pickups) {
    if (!p.active) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.kind === 'ring') {
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#0F766E';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, p.radius - 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#99F6E4';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#78350F';
      ctx.stroke();
      // Rice sheaf icon detail
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 8);
      ctx.moveTo(-5, -2);
      ctx.lineTo(0, -6);
      ctx.lineTo(5, -2);
      ctx.strokeStyle = '#FEF3C7';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 9. Hazards (3 distinct visual silhouettes + telegraphs)
  for (const h of state.hazards) {
    if (!h.active) continue;
    ctx.save();
    ctx.translate(h.x, h.y);

    if (h.kind === 'squall') {
      // Swirling dark storm cloud vortex (clean outline + inner fill puffs, no chord artifact)
      ctx.fillStyle = '#1E293B';
      for (const [ox, oy, rScale] of [
        [-13, 6, 0.68],
        [13, 4, 0.68],
        [0, 0, 1],
      ] as const) {
        ctx.beginPath();
        ctx.arc(ox, oy, h.radius * rScale + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#334155';
      for (const [ox, oy, rScale] of [
        [-13, 6, 0.68],
        [13, 4, 0.68],
        [0, 0, 1],
      ] as const) {
        ctx.beginPath();
        ctx.arc(ox, oy, h.radius * rScale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Lightning/wind swirl
      ctx.beginPath();
      ctx.moveTo(-5, -11);
      ctx.lineTo(4, -2);
      ctx.lineTo(-3, 2);
      ctx.lineTo(5, 12);
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    } else if (h.kind === 'hawk') {
      // Swooping paddy hawk silhouette + dive telegraph ring when alerted
      if (h.telegraphed) {
        ctx.beginPath();
        ctx.arc(0, 0, h.radius + 9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      const flap = Math.sin(worldClockSeconds * 16 + h.id) * 8;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.quadraticCurveTo(-8, -14 + flap, 0, -2);
      ctx.quadraticCurveTo(10, -16 + flap, 22, 2);
      ctx.lineTo(4, 7);
      ctx.lineTo(-14, 6);
      ctx.closePath();
      ctx.fillStyle = '#451A03';
      ctx.fill();
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else {
      // Rising bamboo / palm gust column
      ctx.fillStyle = '#14532D';
      ctx.beginPath();
      ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4ADE80';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(0, -10);
      ctx.lineTo(8, 8);
      ctx.strokeStyle = '#DCFCE7';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // 10. Pooled Particles
  for (const pt of state.particles) {
    if (!pt.active) continue;
    const alpha = Math.max(0, pt.life / pt.maxLife);
    ctx.globalAlpha = alpha;
    if (pt.kind === 'wind') {
      ctx.strokeStyle = pt.color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + 28, pt.y);
      ctx.stroke();
    } else if (pt.kind === 'petal') {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // 11. Draw Player Wau Kangkang Kite
  const blink = state.invulnTimer > 0 && Math.floor(state.invulnTimer * 16) % 2 === 0;

  drawWauKangkang(
    ctx,
    kiteDisplayX,
    kiteDisplayY,
    kiteTilt,
    worldClockSeconds,
    state.hitFlashTimer > 0,
    blink,
    state.busurWaveTimer,
  );

  ctx.restore();
}
