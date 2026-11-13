// =====================================================================
//  reading.js — transforme les mesures (scores z) en lecture positive (édition française).
//  Même photo → même résultat, à chaque fois (pas de hasard).
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
    key: "ear", name: "Oreilles", organ: "L'Écoutant · Bénédictions de naissance", emoji: "👂",
    tags: [earKey === "auto" ? "Estimées d'après l'équilibre du visage" : ear.label],
    text: (earKey === "auto"
      ? "Sur une photo de face, les oreilles sont souvent cachées par les cheveux ou l'angle ; nous avons donc estimé leur énergie d'après l'équilibre général de ton visage. Dans les classiques, les oreilles sont « l'Écoutant » : elles montrent les bénédictions avec lesquelles tu es né et une longue vie en bonne santé. Le bas de ton visage et ton nez sont " + (z.ear > 0.4 ? "bien pleins, donc tes oreilles sont sans doute du type solide et chanceux des « oreilles de la fortune ». " : "nets et raffinés, donc tes oreilles sont sans doute du type net et bien dessiné : signe d'un jugement rapide et d'une forte personnalité. ")
      : ear.text + " ") + "Les oreilles sont le premier des Cinq Officiers à se former et le dernier à changer : elles montrent à la fois ta chance d'enfance (de 1 à 14 ans) et le socle de bénédictions de toute ta vie. Envie d'une lecture plus précise ? Choisis la forme de tes oreilles plus haut. Et puisqu'il s'agit de « l'Écoutant », les classiques disent qu'être simplement à l'écoute fait grandir la chance de tes oreilles !",
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
    const who = gender ? `${genderNoun(gender)} ${ageInfo.phrase}` : `personne ${ageInfo.phrase}`;
    ageText = `En tant que ${who}, selon les « Années qui s'écoulent » du Ma Yi Shen Xiang, ta chance se trouve en ce moment au niveau de ${ageInfo.place} (${ageInfo.years}). ${ageInfo[level(az)]} `;
  }
  const summary =
    `${shape.emoji} Tu as ce que les classiques appellent un ${shape.name} : « ${shape.alias} ». ${shape.text} ` +
    `Dans tes mesures, ce qui ressort le plus, c'est ${strongParts[0]} et ${strongParts[1]}. ` +
    `${zones} ` + ageText +
    `Voilà pourquoi, parmi les ${fortunes.length} chances, ${best.emoji} ${best.name} (${best.score}) et ${second.emoji} ${second.name} (${second.score}) ressortent particulièrement fort chez toi. ` +
    `Et souviens-toi de ce que dit le Liu Zhuang Xiang Fa : « Le visage suit le cœur. » Fais briller tes forces et booste le reste avec ton sourire et tes habitudes : ton visage, et ton destin, peuvent toujours s'embellir.`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [gender ? GENDERS[gender] : "", ageInfo.keys ? ageInfo.label : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 Conseil soin" : "💄 Conseil beauté",
    gender,
    figures: matchFigures(z, gender),
    metricsView: metricsView(z, m),
  };
}

function zoneText(z) {
  const arr = [["Zone supérieure (front · chance de jeunesse)", z.upper, "upper"], ["Zone médiane (sourcils au nez · années fortes)", z.middle, "middle"], ["Zone inférieure (nez au menton · chance d'héritage)", z.lower, "lower"]];
  if (z.balance >= 0.8) return "Tes Trois Zones — le cœur du Ma Yi Shen Xiang — sont merveilleusement égales, ce que les classiques considèrent comme un signe rare et précieux : une chance qui coule sans heurts de la jeunesse aux années fortes, puis à la maturité.";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[2] === "upper" ? "tu as tendance à te démarquer tôt dans la vie" : top[2] === "middle" ? "ton plus bel épanouissement arrive dans tes actives trentaine et quarantaine" : "la vie devient plus riche et plus pleine avec les années";
  return `De tes Trois Zones, c'est ta ${top[0]} qui est la plus développée : cela signifie que ${when}.`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name} : ${score}. Celle-là, tu peux t'en vanter !`,
    good: `${f.emoji} ${f.name} : ${score}. Un courant fort et régulier qui joue en ta faveur.`,
    hidden: `${f.emoji} ${f.name} : ${score}. C'est ta « carte cachée », avec beaucoup de potentiel encore inexploité.`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && FEATURE_NAMES[c.k]) s = `Pour ${FEATURE_NAMES[c.k]}, on est pile dans la zone d'équilibre idéale : une base solide pour cette chance.`;
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
    top: "Tu es né avec cette chance : ajoute de la régularité, reste humble, et cette belle série durera longtemps.",
    good: "Ta base est solide : changer une seule petite habitude pourrait faire monter cette chance d'un cran.",
    hidden: "En lecture du visage, un score plus bas signifie simplement plus de marge pour grandir. C'est le domaine où ton sourire et tes habitudes peuvent le plus changer ta chance.",
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
    word: z[k] >= 0.8 ? "Marqué" : z[k] <= -0.8 ? "Raffiné" : "Équilibré",
  }));
}

// Si un genre est choisi, on compare seulement avec des visages célèbres du même genre.
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
