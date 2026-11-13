// =====================================================================
//  reading.js — verwandelt Messwerte (z-Werte) in eine positive Deutung (deutsche Ausgabe).
//  Gleiches Foto → gleiches Ergebnis, jedes Mal (kein Zufall).
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
    key: "ear", name: "Ohren", organ: "Der Zuhörer · Angeborener Segen", emoji: "👂",
    tags: [earKey === "auto" ? "Aus der Gesichtsbalance geschätzt" : ear.label],
    text: (earKey === "auto"
      ? "Auf einem Frontalfoto sind die Ohren oft durch Haare oder den Winkel verdeckt, deshalb haben wir ihre Energie aus der Gesamtbalance deines Gesichts geschätzt. In den Klassikern sind die Ohren „der Zuhörer“: Sie zeigen den Segen, mit dem du geboren wurdest, und ein langes, gesundes Leben. Dein Untergesicht und deine Nase sind " + (z.ear > 0.4 ? "schön voll, also gehören deine Ohren wahrscheinlich zum kräftigen, glücklichen Typ der „Glücksohren“. " : "fein und klar, also gehören deine Ohren wahrscheinlich zum ordentlichen, wohlgeformten Typ: ein Zeichen für schnelles Urteilen und ein klares Selbstbild. ")
      : ear.text + " ") + "Die Ohren bilden sich als Erste der Fünf Beamten und verändern sich als Letzte, deshalb zeigen sie sowohl dein Kindheitsglück (1–14 Jahre) als auch das Segensfundament deines ganzen Lebens. Du willst eine genauere Ohren-Deutung? Wähl oben deine Ohrform. Und weil es „der Zuhörer“ ist, sagen die Klassiker: Einfach gut zuzuhören lässt dein Ohrenglück wachsen!",
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
    const who = gender ? `${genderNoun(gender)} ${ageInfo.phrase}` : `Mensch ${ageInfo.phrase}`;
    ageText = `Als ${who} liegt dein Glück laut den „fließenden Jahren“ des Ma Yi Shen Xiang gerade im Bereich ${ageInfo.place} (${ageInfo.years}). ${ageInfo[level(az)]} `;
  }
  const summary =
    `${shape.emoji} Du hast, was die Klassiker ein ${shape.name} nennen: „${shape.alias}“. ${shape.text} ` +
    `In deinen Messwerten stachen diese Merkmale am meisten hervor: ${strongParts[0]} und ${strongParts[1]}. ` +
    `${zones} ` + ageText +
    `Deshalb sind von den ${fortunes.length} Glücksbereichen ${best.emoji} ${best.name} (${best.score}) und ${second.emoji} ${second.name} (${second.score}) bei dir besonders stark. ` +
    `Und denk daran, was das Liu Zhuang Xiang Fa sagt: „Das Gesicht folgt dem Herzen.“ Lass deine Stärken strahlen und stärke den Rest mit deinem Lächeln und deinen Gewohnheiten: Dein Gesicht, und dein Schicksal, können immer noch besser werden.`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [gender ? GENDERS[gender] : "", ageInfo.keys ? ageInfo.label : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 Pflegetipp" : "💄 Glow-up-Tipp",
    gender,
    figures: matchFigures(z, gender),
    metricsView: metricsView(z, m),
  };
}

function zoneText(z) {
  const arr = [["die obere Zone (Stirn · Jugendglück)", z.upper, "upper"], ["die mittlere Zone (Brauen bis Nase · beste Jahre)", z.middle, "middle"], ["die untere Zone (Nase bis Kinn · Glück des Vermächtnisses)", z.lower, "lower"]];
  if (z.balance >= 0.8) return "Deine Drei Zonen — das Herzstück des Ma Yi Shen Xiang — sind wunderbar gleichmäßig, was die Klassiker für ein seltenes und kostbares Zeichen halten: Glück, das sanft durch Jugend, beste Jahre und späteres Leben fließt.";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[2] === "upper" ? "du fällst meist schon früh im Leben auf" : top[2] === "middle" ? "deine größte Blüte kommt in deinen aktiven 30ern und 40ern" : "das Leben wird reicher und voller, je älter du wirst";
  return `Von deinen Drei Zonen ist ${top[0]} am stärksten ausgeprägt. Das heißt: ${when}.`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name}: ${score}. Damit darfst du ruhig angeben!`,
    good: `${f.emoji} ${f.name}: ${score}. Eine starke, stetige Strömung, die für dich arbeitet.`,
    hidden: `${f.emoji} ${f.name}: ${score}. Das ist deine „verdeckte Karte“ mit viel ungenutztem Potenzial.`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && FEATURE_NAMES[c.k]) s = `Beim Merkmal „${FEATURE_NAMES[c.k]}“ liegst du genau im idealen Gleichgewicht: eine solide Basis für dieses Glück.`;
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
    top: "Mit diesem Glück wurdest du geboren: Bleib dran, bleib bescheiden, und diese Glückssträhne hält noch lange an.",
    good: "Deine Basis ist solide, also könnte schon eine kleine neue Gewohnheit dieses Glück eine Stufe höher bringen.",
    hidden: "In der Gesichtslesekunst bedeutet ein niedrigerer Wert einfach mehr Raum zum Wachsen. Hier können dein Lächeln und deine Gewohnheiten dein Glück am meisten verändern.",
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
    word: z[k] >= 0.8 ? "Markant" : z[k] <= -0.8 ? "Fein" : "Ausgewogen",
  }));
}

// Ist ein Geschlecht gewählt, vergleichen wir nur mit berühmten Gesichtern desselben Geschlechts.
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
