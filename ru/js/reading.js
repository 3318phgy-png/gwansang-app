// =====================================================================
//  reading.js — превращает измерения (z-оценки) в доброе толкование (русская версия).
//  Одно и то же фото → всегда один и тот же результат (не случайность).
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
    key: "ear", name: "Уши", organ: "Слушатель · Врождённое везение", emoji: "👂",
    tags: [earKey === "auto" ? "Оценено по балансу лица" : ear.label],
    text: (earKey === "auto"
      ? "На фото анфас уши часто скрыты волосами или ракурсом, поэтому мы оценили их энергию по общему балансу лица. В классике уши — это «Слушатель»: они показывают врождённое везение и долгую, здоровую жизнь. Нижняя часть твоего лица и нос " + (z.ear > 0.4 ? "приятно полные, так что твои уши, скорее всего, крепкого, счастливого типа «уши удачи». " : "аккуратные и изящные, так что твои уши, скорее всего, аккуратной, правильной формы — знак быстрого ума и ясного чувства себя. ")
      : ear.text + " ") + "Уши формируются первыми из Пяти чиновников и меняются последними, поэтому показывают и удачу детства (1–14 лет), и фундамент благословений на всю жизнь. Хочешь точнее? Выбери форму ушей выше. А раз это «Слушатель», классики говорят: просто умей слушать — и удача ушей будет расти!",
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
    const who = gender ? `${genderNoun(gender)} ${ageInfo.phrase}` : `человека ${ageInfo.phrase}`;
    ageText = `Для ${who} «Текущие годы» из Ма И Шэнь Сян говорят: сейчас твоя удача живёт здесь — ${ageInfo.place} (${ageInfo.years}). ${ageInfo[level(az)]} `;
  }
  const summary =
    `${shape.emoji} Твой тип по классикам — ${shape.name}, «${shape.alias}». ${shape.text} ` +
    `По измерениям сильнее всего выделились: ${strongParts[0]} и ${strongParts[1]}. ` +
    `${zones} ` + ageText +
    `Поэтому из ${fortunes.length} видов удачи особенно сильными вышли ${best.emoji} ${best.name} (${best.score}) и ${second.emoji} ${second.name} (${second.score}). ` +
    `И помни, что говорит Лю Чжуан Сян Фа: «Лицо следует за сердцем». Пусть сильные стороны сияют, а остальное подтягивай улыбкой и привычками — и лицо, и судьба всегда могут стать ещё лучше.`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [gender ? GENDERS[gender] : "", ageInfo.keys ? ageInfo.label : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 Совет по уходу" : "💄 Совет для сияния",
    gender,
    figures: matchFigures(z, gender),
    metricsView: metricsView(z, m),
  };
}

function zoneText(z) {
  const arr = [["Верхняя зона (лоб · удача юности)", z.upper, "upper"], ["Средняя зона (от бровей до носа · лучшие годы)", z.middle, "middle"], ["Нижняя зона (от носа до подбородка · удача наследия)", z.lower, "lower"]];
  if (z.balance >= 0.8) return "Твои Три зоны — сердце Ма И Шэнь Сян — удивительно ровные, и классики называют это редким, драгоценным знаком: удача плавно течёт через юность, лучшие годы и зрелость.";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[2] === "upper" ? "ты обычно рано заявляешь о себе" : top[2] === "middle" ? "твой главный расцвет приходится на активные 30–40 лет" : "с годами жизнь становится всё богаче и полнее";
  return `Из твоих Трёх зон сильнее всего развита ${top[0]} — а значит, ${when}.`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name}: ${score} — ну всё, этим точно можно хвастаться!`,
    good: `${f.emoji} ${f.name}: ${score} — сильное, ровное течение работает на тебя.`,
    hidden: `${f.emoji} ${f.name}: ${score} — это твой «козырь в рукаве» с огромным нераскрытым потенциалом.`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && FEATURE_NAMES[c.k]) s = `Показатель «${FEATURE_NAMES[c.k]}» — в золотой середине, и это даёт удаче в сфере «${f.short.toLowerCase()}» надёжную опору.`;
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
    top: "Эта удача у тебя врождённая — добавь постоянства, не задирай нос, и счастливая полоса продлится очень долго.",
    good: "Фундамент у тебя крепкий, так что одна маленькая новая привычка может поднять эту удачу ещё на уровень выше.",
    hidden: "В физиогномике балл пониже значит просто больше места для роста. Именно здесь улыбка и привычки могут изменить удачу сильнее всего.",
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
    word: z[k] >= 0.8 ? "Выразительно" : z[k] <= -0.8 ? "Изящно" : "Баланс",
  }));
}

// Если пол выбран, сравниваем только со знаменитостями того же пола.
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
