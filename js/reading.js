// =====================================================================
//  reading.js — turns measurements (z-scores) into a feel-good reading.
//  Same photo → same result, every time (not random).
// =====================================================================
import {
  FACE_SHAPES, PART_READINGS, FORTUNES, FORTUNE_LINES, MAKEUP_TIPS,
  EAR_TYPES, HOOKS, METRIC_LABELS, FEATURE_NAMES, FIVE_ORGANS,
  AGE_GROUPS, AGE_LINES, GROOMING_TIPS, GENDERS, genderNoun,
} from "./content.js";
import { FIGURES } from "./figures.js";

export const level = (z) => (z >= 0.8 ? "hi" : z <= -0.8 ? "lo" : "mid");
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function hashOf(obj) {
  const s = JSON.stringify(obj);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

export function faceShapeOf(z) {
  if (z.faceRatio >= 0.9) return "wood";
  if (z.jawWidth >= 0.9 && z.noseWidth >= 0.5 && z.lower >= 0.3) return "earth";
  if (z.jawWidth >= 0.9) return "metal";
  if (z.faceRatio <= -0.9) return "water";
  if (z.jawWidth <= -0.9) return "fire";
  if (z.noseWidth >= 1 && z.lower >= 0.8) return "earth";
  return "balance";
}

// profile: { gender: "" | "f" | "m", age: "" | "20" | "30" | "40" | "50" | "60" }
export function buildReading(analysis, earKey = "auto", profile = {}) {
  const gender = profile.gender || "";
  const ageInfo = AGE_GROUPS[profile.age || ""] || AGE_GROUPS[""];
  const stage = ageInfo.stage || "";
  const z = { ...analysis.z };
  const m = analysis.metrics;
  const seed = hashOf(Object.values(m).map((v) => +v.toFixed(3)));

  // Derived measurements
  z.smile = clamp((m.smile - 0.35) / 0.25, -2, 2.5);
  const devs = [z.upper, z.middle, z.lower].map(Math.abs);
  z.balance = clamp(1.6 - (devs[0] + devs[1] + devs[2]) / 1.5, -2, 2);
  z.ear = earKey === "auto" ? clamp(0.2 + 0.25 * z.lower + 0.2 * z.noseWidth, -0.5, 0.8) : EAR_TYPES[earKey].score;

  const shapeKey = faceShapeOf(z);
  const shape = FACE_SHAPES[shapeKey];

  // ── Luck scores ─────────────────────────────────
  const fortunes = FORTUNES.map((f, i) => {
    let sum = 0, wsum = 0;
    const contrib = [];
    for (const [k, w] of Object.entries(f.weights)) {
      const zz = z[k] ?? 0;
      sum += w * zz; wsum += Math.abs(w);
      contrib.push({ k, w, z: zz, c: w * zz });
    }
    const jitter = ((seed >> (i * 3)) % 5) - 2; // fixed ±2 personality per photo
    const score = Math.round(clamp(76 + (sum / wsum) * 14 + jitter, 62, 98));
    const name = f.id === "career" && ageInfo.career ? ageInfo.career
      : f.id === "children" && ageInfo.children ? ageInfo.children : f.name;
    const ff = { ...f, name };
    return { ...ff, score, contrib, text: fortuneText(ff, score, contrib, seed + i, { stage, gender }) };
  });

  const ranked = [...fortunes].sort((a, b) => b.score - a.score);
  const total = Math.round(fortunes.reduce((s, f) => s + f.score, 0) / fortunes.length);

  // ── Feature readings ───────────────────────────
  const parts = Object.entries(PART_READINGS).map(([key, part]) => {
    const lines = [];
    const tags = [];
    for (const [mk, texts] of Object.entries(part)) {
      if (typeof texts !== "object") continue;
      const lv = level(z[mk] ?? 0);
      lines.push(texts[lv]);
      tags.push(`${METRIC_LABELS[mk]} ${lv === "hi" ? "▲" : lv === "lo" ? "▼" : "●"}`);
    }
    return { key, name: part.name, organ: part.organ, emoji: part.emoji, tags, text: [part.intro, ...lines, part.outro].join(" ") };
  });
  // Ears
  const ear = EAR_TYPES[earKey];
  parts.push({
    key: "ear", name: "Ears", organ: "The Listener · Inborn Blessings", emoji: "👂",
    tags: [earKey === "auto" ? "Estimated from facial balance" : ear.label],
    text: (earKey === "auto"
      ? "Ears are often hidden by hair or angle in a front-facing photo, so we estimated their energy from your overall facial balance. In the classics, the ears are 'The Listener' — they show the blessings you were born with and a long, healthy life. Your lower face and nose are " + (z.ear > 0.4 ? "nicely full, so your ears are likely the sturdy, lucky 'fortune ear' type. " : "neat and refined, so your ears are likely the tidy, well-shaped type — a sign of quick judgment and a clear sense of self. ")
      : ear.text + " ") + "The ears are the first of the Five Officials to form and the last to change, so they show both your childhood luck (ages 1–14) and your lifelong foundation of blessings. Want a more precise ear reading? Pick your ear shape above. And since this is 'The Listener,' the classics say simply being a great listener makes your ear luck grow!",
  });

  // ── Summary ──────────────────────────────────────
  const best = ranked[0], second = ranked[1];
  const hookList = HOOKS[best.id];
  const hook = hookList[seed % hookList.length];
  const strongParts = Object.entries(z)
    .filter(([k]) => FEATURE_NAMES[k] && !["middle", "eyeSize", "faceRatio"].includes(k))
    .sort((a, b) => b[1] - a[1]).map(([k]) => FEATURE_NAMES[k])
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 2);
  const zones = zoneText(z);
  let ageText = "";
  if (ageInfo.keys) {
    const az = ageInfo.keys.reduce((a, k) => a + (z[k] ?? 0), 0) / ageInfo.keys.length;
    const who = gender ? `a ${genderNoun(gender)} ${ageInfo.phrase}` : `someone ${ageInfo.phrase}`;
    ageText = `As ${who}, Ma Yi Shen Xiang's "Flowing Years" say your luck is currently sitting in ${ageInfo.place} (${ageInfo.years}). ${ageInfo[level(az)]} `;
  }
  const summary =
    `${shape.emoji} You have what the classics call a ${shape.name} — "${shape.alias}." ${shape.text} ` +
    `In your measurements, the features that stood out most were your ${strongParts[0]} and your ${strongParts[1]}. ` +
    `${zones} ` + ageText +
    `That's why, out of the ${fortunes.length} lucks, your ${best.emoji} ${best.name} (${best.score}) and ${second.emoji} ${second.name} (${second.score}) came out especially strong. ` +
    `And remember what Liu Zhuang Xiang Fa says: "The face follows the heart." Keep your strengths shining and boost the rest with your smile and your habits — your face, and your fate, can always get even better.`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [gender ? GENDERS[gender] : "", ageInfo.keys ? ageInfo.label : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 Grooming tip" : "💄 Glow-up tip",
    gender,
    figures: matchFigures(z, gender),
    metricsView: metricsView(z, m),
  };
}

function zoneText(z) {
  const arr = [["Upper Zone (forehead · youth luck)", z.upper, "upper"], ["Middle Zone (brows to nose · prime years)", z.middle, "middle"], ["Lower Zone (nose to chin · legacy luck)", z.lower, "lower"]];
  if (z.balance >= 0.8) return "Your Three Zones — the heart of Ma Yi Shen Xiang — are beautifully even, which the classics call a rare and precious sign: luck that flows smoothly through youth, prime years and later life.";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[2] === "upper" ? "you tend to stand out early in life" : top[2] === "middle" ? "your biggest bloom comes in your active 30s and 40s" : "life gets richer and fuller the older you get";
  return `Of your Three Zones, your ${top[0]} is the most developed — meaning ${when}.`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name}: ${score} — okay, this one's worth bragging about!`,
    good: `${f.emoji} ${f.name}: ${score} — a strong, steady current working in your favor.`,
    hidden: `${f.emoji} ${f.name}: ${score} — this is your "hidden card," with lots of untapped potential.`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && FEATURE_NAMES[c.k]) s = `Your ${FEATURE_NAMES[c.k]} sits right in the balanced sweet spot, giving your ${f.short.toLowerCase()} luck a steady foundation.`;
    if (s) lines.push(s);
  }

  // Area to enhance → glow-up tip
  const TIPS = opt.gender === "m" ? GROOMING_TIPS : MAKEUP_TIPS;
  const weakest = [...contrib].filter((c) => TIPS[c.k]).sort((a, b) => a.c - b.c)[0];
  let makeup = "";
  if (weakest) {
    const t = TIPS[weakest.k];
    makeup = weakest.z < 0 ? t.lo : t.hi;
  }

  const close = {
    top: "You were born with this luck — add consistency, stay humble, and this lucky streak keeps running for a long time.",
    good: "Your foundation is solid, so changing just one small habit could push this luck up another level.",
    hidden: "In face reading, a lower score simply means more room to grow. This is the area where your smile and habits can change your luck the most.",
  }[tier];

  const ageLine = opt.stage && AGE_LINES[f.id] ? " " + AGE_LINES[f.id][opt.stage] : "";
  let body = `${lines.join(" ")}${ageLine} ${close}`;
  if (body.length < 380) body += " " + f.classic;
  return { open, body, classic: f.classic, tip: f.tip, makeup, tier };
}

function metricsView(z, m) {
  const keys = ["upper", "middle", "lower", "browLen", "browThick", "browTilt", "glabella", "eyeOpen", "eyeTilt", "eyeGap",
    "noseWidth", "noseLen", "mouthWidth", "mouthCorner", "lipThick", "philtrum", "chinLen", "jawWidth", "faceRatio", "symmetry"];
  return keys.map((k) => ({
    k, label: METRIC_LABELS[k], z: z[k], value: m[k],
    word: z[k] >= 0.8 ? "Bold" : z[k] <= -0.8 ? "Refined" : "Balanced",
  }));
}

// When a gender is chosen, compare only with famous faces of the same gender.
export function matchFigures(z, gender = "") {
  return FIGURES.filter((f) => !gender || f.gender === gender).map((f) => {
    const keys = Object.keys(f.profile);
    let s = 0;
    for (const k of keys) s += 1 - Math.min(1, Math.abs((z[k] ?? 0) - f.profile[k]) / 3.5);
    const sim = s / keys.length;
    return { fig: f, pct: Math.round(clamp(45 + sim * 55, 50, 97)) };
  }).sort((a, b) => b.pct - a.pct).slice(0, 3);
}

export { FIVE_ORGANS };
