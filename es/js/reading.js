// =====================================================================
//  reading.js — convierte las medidas (puntuaciones z) en una lectura positiva (edición en español).
//  Misma foto → mismo resultado, siempre (no es aleatorio).
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
    key: "ear", name: "Orejas", organ: "El Oyente · Bendiciones de nacimiento", emoji: "👂",
    tags: [earKey === "auto" ? "Estimadas por el equilibrio facial" : ear.label],
    text: (earKey === "auto"
      ? "En una foto frontal, las orejas suelen quedar ocultas por el pelo o el ángulo, así que estimamos su energía a partir del equilibrio general de tu rostro. En los clásicos, las orejas son \"El Oyente\": muestran las bendiciones con las que naciste y una vida larga y sana. Tu rostro inferior y tu nariz son " + (z.ear > 0.4 ? "bastante llenos, así que tus orejas probablemente sean del tipo firme y afortunado de las \"orejas de la fortuna\". " : "definidos y refinados, así que tus orejas probablemente sean del tipo ordenado y bien formado: señal de juicio rápido y un claro sentido de ti. ")
      : ear.text + " ") + "Las orejas son el primero de los Cinco Oficiales en formarse y el último en cambiar, así que muestran tanto tu suerte en la infancia (de 1 a 14 años) como la base de bendiciones de toda tu vida. ¿Quieres una lectura más precisa? Elige arriba la forma de tus orejas. Y como este es \"El Oyente\", los clásicos dicen que simplemente saber escuchar hace crecer la suerte de tus orejas.",
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
    const who = gender ? `${genderNoun(gender)} ${ageInfo.phrase}` : `persona ${ageInfo.phrase}`;
    ageText = `Como ${who}, según los "Años que fluyen" del Ma Yi Shen Xiang, tu suerte se encuentra ahora en ${ageInfo.place} (${ageInfo.years}). ${ageInfo[level(az)]} `;
  }
  const summary =
    `${shape.emoji} Tienes lo que los clásicos llaman un ${shape.name}: "${shape.alias}". ${shape.text} ` +
    `En tus medidas, lo que más destacó fue ${strongParts[0]} y ${strongParts[1]}. ` +
    `${zones} ` + ageText +
    `Por eso, de las ${fortunes.length} suertes, tu ${best.emoji} ${best.name} (${best.score}) y tu ${second.emoji} ${second.name} (${second.score}) salieron especialmente fuertes. ` +
    `Y recuerda lo que dice el Liu Zhuang Xiang Fa: "El rostro sigue al corazón". Haz brillar tus fortalezas e impulsa el resto con tu sonrisa y tus hábitos: tu rostro, y tu destino, siempre pueden ir a mejor.`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [gender ? GENDERS[gender] : "", ageInfo.keys ? ageInfo.label : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 Consejo de cuidado" : "💄 Consejo de belleza",
    gender,
    figures: matchFigures(z, gender),
    metricsView: metricsView(z, m),
  };
}

function zoneText(z) {
  const arr = [["Zona Superior (frente · suerte de juventud)", z.upper, "upper"], ["Zona Media (cejas a nariz · años de plenitud)", z.middle, "middle"], ["Zona Inferior (nariz a barbilla · suerte de legado)", z.lower, "lower"]];
  if (z.balance >= 0.8) return "Tus Tres Zonas —el corazón del Ma Yi Shen Xiang— son maravillosamente uniformes, algo que los clásicos consideran una señal rara y valiosa: suerte que fluye sin tropiezos por la juventud, la plenitud y la madurez.";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[2] === "upper" ? "sueles destacar pronto en la vida" : top[2] === "middle" ? "tu gran florecimiento llega en tus activos 30 y 40" : "la vida se vuelve más rica y plena cuanto más años cumples";
  return `De tus Tres Zonas, la más desarrollada es tu ${top[0]}: eso significa que ${when}.`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name}: ${score}. ¡Vale, de esta sí puedes presumir!`,
    good: `${f.emoji} ${f.name}: ${score}. Una corriente fuerte y constante que juega a tu favor.`,
    hidden: `${f.emoji} ${f.name}: ${score}. Esta es tu "carta oculta", con mucho potencial por descubrir.`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && FEATURE_NAMES[c.k]) s = `En ${FEATURE_NAMES[c.k]} encontramos el punto justo de equilibrio, una base firme para tu ${f.name.toLowerCase()}.`;
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
    top: "Naciste con esta suerte: suma constancia, mantén la humildad y esta buena racha seguirá durante mucho tiempo.",
    good: "Tu base es sólida, así que cambiar un solo hábito pequeño podría subir esta suerte otro nivel.",
    hidden: "En la lectura del rostro, una puntuación más baja solo significa más margen para crecer. Es el área donde tu sonrisa y tus hábitos pueden cambiar más tu suerte.",
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
    word: z[k] >= 0.8 ? "Marcado" : z[k] <= -0.8 ? "Refinado" : "Equilibrado",
  }));
}

// Si se elige un género, compara solo con rostros famosos del mismo género.
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
