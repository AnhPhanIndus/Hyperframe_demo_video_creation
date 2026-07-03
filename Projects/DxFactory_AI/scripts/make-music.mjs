// make-music.mjs — synthesize an exciting, futuristic electronic BGM bed as a
// 16-bit stereo WAV. Pure Node, no ffmpeg / no ML models. Deterministic.
//
//   node scripts/make-music.mjs            -> assets/bgm/track.wav (20s)
//
// Arrangement: four-on-the-floor kick, sub bass, bright trance arpeggio,
// atmospheric pad, hats; uplifting i-VI-III-VII (Am-F-C-G) progression at
// 124 BPM. Beat enters after a 2s atmospheric intro (under the title fade-in),
// builds, and lands a final impact.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const SR = 44100;
const DUR = 20.0;
const N = Math.round(SR * DUR);
const BPM = 124;
const beat = 60 / BPM; // 0.4839s
const bar = beat * 4;
const nBars = Math.ceil(DUR / bar); // ~10.3
const KICK_IN = 2.0; // beat enters after intro

const L = new Float32Array(N);
const R = new Float32Array(N);

// deterministic PRNG (mulberry32) for noise voices
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0x1a2b3c4d);

const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);

// add a stereo voice rendered by fn(t) -> [l, r], for `dur` seconds from `start`
function add(start, dur, fn) {
  let i0 = Math.round(start * SR);
  const len = Math.round(dur * SR);
  for (let i = 0; i < len; i++) {
    const idx = i0 + i;
    if (idx < 0 || idx >= N) continue;
    const t = i / SR;
    const s = fn(t);
    L[idx] += s[0];
    R[idx] += s[1];
  }
}

// ── voices ──────────────────────────────────────────────────────────────────
function kick(start) {
  add(start, 0.42, (t) => {
    const fenv = 48 + 95 * Math.exp(-t * 38);
    const aenv = Math.exp(-t * 8.5);
    const click = Math.exp(-t * 220) * 0.5;
    const v = (Math.sin(2 * Math.PI * fenv * t) * aenv + click) * 0.95;
    return [v, v];
  });
}

function bass(start, dur, midi) {
  const f = mf(midi);
  add(start, dur, (t) => {
    const env = Math.min(1, t / 0.008) * Math.exp(-t * 2.6);
    // sine + soft 2nd/3rd harmonic for a warm synth sub
    let v =
      Math.sin(2 * Math.PI * f * t) +
      0.28 * Math.sin(2 * Math.PI * 2 * f * t) +
      0.12 * Math.sin(2 * Math.PI * 3 * f * t);
    v *= env * 0.42;
    return [v, v];
  });
}

function pluck(start, midi, gain, panShimmer) {
  const f = mf(midi);
  add(start, 0.34, (t) => {
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 9);
    // bright detuned saw-ish via stacked sines
    const det = 1.004;
    let mono =
      Math.sin(2 * Math.PI * f * t) +
      0.6 * Math.sin(2 * Math.PI * 2 * f * t) +
      0.3 * Math.sin(2 * Math.PI * 3 * f * t) +
      0.15 * Math.sin(2 * Math.PI * 4 * f * t);
    let detv =
      Math.sin(2 * Math.PI * f * det * t) +
      0.5 * Math.sin(2 * Math.PI * 2 * f * det * t);
    mono *= env * gain;
    detv *= env * gain * 0.7;
    // shimmer: lean detuned voice into one side, alternating per step
    const l = mono + (panShimmer ? detv : detv * 0.3);
    const r = mono + (panShimmer ? detv * 0.3 : detv);
    return [l, r];
  });
}

function pad(start, dur, midis) {
  const fs = midis.map(mf);
  add(start, dur, (t) => {
    const atk = Math.min(1, t / 0.4);
    const rel = Math.min(1, (dur - t) / 0.5);
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.7 * t);
    let v = 0;
    for (const f of fs) {
      v += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
    }
    v *= (atk * rel * lfo * 0.07) / fs.length;
    // slight stereo spread via phase
    const v2 = v * 0.96;
    return [v, v2];
  });
}

function hat(start, gain) {
  add(start, 0.06, (t) => {
    const env = Math.exp(-t * 90);
    const n = rand() * 2 - 1;
    const v = n * env * gain;
    return [v * 0.9, v];
  });
}

function impact(start) {
  // crash-ish noise swell + low boom for the finale
  add(start, 2.2, (t) => {
    const env = Math.exp(-t * 1.6);
    const n = rand() * 2 - 1;
    const boom = Math.sin(2 * Math.PI * (40 + 30 * Math.exp(-t * 6)) * t) * Math.exp(-t * 3);
    const v = n * env * 0.16 + boom * 0.5;
    return [v, v];
  });
}

// ── progression ───────────────────────────────────────────────────────────────
// chord = { bassMidi, tones:[6 two-octave arp tones], pad:[3 tones] }
const A = { bass: 33, tones: [57, 60, 64, 69, 72, 76], pad: [57, 60, 64] }; // Am
const F = { bass: 29, tones: [53, 57, 60, 65, 69, 72], pad: [53, 57, 60] }; // F
const C = { bass: 36, tones: [60, 64, 67, 72, 76, 79], pad: [60, 64, 67] }; // C
const G = { bass: 31, tones: [55, 59, 62, 67, 71, 74], pad: [55, 59, 62] }; // G
const prog = [A, F, C, G];

// 16-step arp path through the 6 two-octave tones (up then down)
const arpPath = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 1, 2, 3, 5, 4];
const sixteenth = beat / 4;

for (let b = 0; b < nBars; b++) {
  const chord = prog[b % 4];
  const barStart = b * bar;
  if (barStart >= DUR) break;

  // pad covers the whole bar
  pad(barStart, bar + 0.05, chord.pad);

  const energetic = barStart >= KICK_IN - 0.001;
  // arp brightens as the track builds
  const arpGain = energetic ? 0.32 : 0.16;

  // arpeggio 16th notes
  for (let s = 0; s < 16; s++) {
    const tt = barStart + s * sixteenth;
    if (tt >= DUR) break;
    // skip first bar's first beats to ease the intro in
    if (!energetic && s < 4) continue;
    pluck(tt, chord.tones[arpPath[s]], arpGain, s % 2 === 0);
  }

  if (!energetic) continue;

  // four-on-the-floor kick + bass on each beat
  for (let bt = 0; bt < 4; bt++) {
    const tt = barStart + bt * beat;
    if (tt >= DUR) break;
    kick(tt);
    bass(tt, beat * 0.95, chord.bass);
    // hats on the off-beat 8ths
    if (tt + beat / 2 < DUR) hat(tt + beat / 2, bt === 3 ? 0.16 : 0.11);
    // extra 16th hats for drive in later half
    if (barStart > DUR / 2 && tt + beat * 0.75 < DUR) hat(tt + beat * 0.75, 0.07);
  }
}

// finale impact on the last accessible downbeat
impact(Math.max(0, DUR - 2.1));

// ── normalize + soft clip, then write 16-bit PCM WAV ──────────────────────────
let peak = 0;
for (let i = 0; i < N; i++) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = peak > 0 ? 0.89 / peak : 1;
// global fade-in / fade-out to avoid clicks at boundaries
const fadeN = Math.round(0.04 * SR);
const outFadeN = Math.round(0.6 * SR);

const bytesPerSample = 2;
const numCh = 2;
const dataLen = N * numCh * bytesPerSample;
const buf = Buffer.alloc(44 + dataLen);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + dataLen, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); // PCM
buf.writeUInt16LE(numCh, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * numCh * bytesPerSample, 28);
buf.writeUInt16LE(numCh * bytesPerSample, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(dataLen, 40);

const tanh = Math.tanh;
let off = 44;
for (let i = 0; i < N; i++) {
  let fade = 1;
  if (i < fadeN) fade = i / fadeN;
  else if (i > N - outFadeN) fade = Math.max(0, (N - i) / outFadeN);
  for (const ch of [L, R]) {
    let v = tanh(ch[i] * norm * 1.05) * fade; // soft saturation glue
    let s = Math.max(-1, Math.min(1, v));
    buf.writeInt16LE((s * 32767) | 0, off);
    off += 2;
  }
}

const outDir = join(ROOT, "assets", "bgm");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "track.wav");
writeFileSync(outPath, buf);
console.log(`wrote ${outPath} — ${DUR}s, ${SR}Hz stereo, peak ${peak.toFixed(2)} -> norm ${norm.toFixed(3)}`);
