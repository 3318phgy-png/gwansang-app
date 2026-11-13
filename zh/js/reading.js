// =====================================================================
//  reading.js — 把测量值（z 分数）转换成温暖正向的面相解读（简体中文版）。
//  同一张照片 → 永远同样的结果（不是随机的）。
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
    return { key, name: part.name, organ: part.organ, emoji: part.emoji, tags, text: [part.intro, ...lines, part.outro].join("") };
  });
  // Ears
  const ear = EAR_TYPES[earKey];
  parts.push({
    key: "ear", name: "耳朵", organ: "采听官 · 先天福气", emoji: "👂",
    tags: [earKey === "auto" ? "根据整体比例推测" : ear.label],
    text: (earKey === "auto"
      ? "在正面照片中，耳朵常被头发或角度挡住，所以我们根据你整体的面部比例推测了耳相。在经典里，耳朵是“采听官”——显示与生俱来的福气和健康长寿。你的下庭和鼻子" + (z.ear > 0.4 ? "饱满有肉，所以你的耳朵很可能是结实、有福的“福耳”类型。" : "精巧利落，所以你的耳朵很可能是小巧端正的类型——代表判断迅速、很有主见。")
      : ear.text) + "耳朵是五官中最先长成、最后改变的，所以它既显示童年运（1–14岁），也显示一生的福气根基。想要更准确的耳相解读？在上方选择你的耳形吧。既然是“采听官”，经典说只要做一个善于倾听的人，耳朵的福气就会越来越旺！",
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
    const who = gender ? `${ageInfo.phrase}的${genderNoun(gender)}` : `${ageInfo.phrase}的人`;
    ageText = `作为${who}，根据《麻衣神相》的“流年运气”，你现在的运势正走到${ageInfo.place}（${ageInfo.years}）。${ageInfo[level(az)]}`;
  }
  const summary =
    `${shape.emoji} 你拥有经典所说的${shape.name}——“${shape.alias}”。${shape.text}` +
    `在你的测量数据中，最突出的是你的${strongParts[0]}和${strongParts[1]}。` +
    `${zones}` + ageText +
    `正因如此，在${fortunes.length}种运势中，你的${best.emoji}${best.name}（${best.score}分）和${second.emoji}${second.name}（${second.score}分）格外强。` +
    `也请记住《柳庄相法》的话：“相由心生。”让你的优势继续发光，再用笑容和好习惯提升其余部分——你的脸，和你的命运，永远都可以变得更好。`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [gender ? GENDERS[gender] + "性" : "", ageInfo.keys ? ageInfo.label : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 型男打理" : "💄 开运妆容",
    gender,
    figures: matchFigures(z, gender),
    metricsView: metricsView(z, m),
  };
}

function zoneText(z) {
  const arr = [["上停（额头 · 早年运）", z.upper, "upper"], ["中停（眉到鼻 · 中年运）", z.middle, "middle"], ["下停（鼻到下巴 · 晚年运）", z.lower, "lower"]];
  if (z.balance >= 0.8) return "你的三停——《麻衣神相》的核心——非常均衡，经典称之为难得的珍贵之相：运势在早年、中年和晚年都流动顺畅。";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[2] === "upper" ? "你往往在人生早期就崭露头角" : top[2] === "middle" ? "你最大的绽放会在充满活力的30到40多岁" : "年纪越大，人生越丰富饱满";
  return `在你的三停中，${top[0]}最为发达——意味着${when}。`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name}：${score}分——这个绝对值得炫耀！`,
    good: `${f.emoji} ${f.name}：${score}分——一股强劲而稳定的力量正在帮你。`,
    hidden: `${f.emoji} ${f.name}：${score}分——这是你的“隐藏王牌”，还有很多未开发的潜力。`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && FEATURE_NAMES[c.k]) s = `你的${FEATURE_NAMES[c.k]}恰好处在均衡的最佳区间，为你的${f.short}运势打下稳定的基础。`;
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
    top: "这份运气是与生俱来的——再加上坚持和谦逊，这股好运会持续很久很久。",
    good: "你的根基很扎实，只要改变一个小习惯，这份运势就能再上一个台阶。",
    hidden: "在面相里，分数较低只代表成长空间更大。这正是你的笑容和习惯最能改变运势的地方。",
  }[tier];

  const ageLine = opt.stage && AGE_LINES[f.id] ? AGE_LINES[f.id][opt.stage] : "";
  let body = `${lines.join("")}${ageLine.trim()}${close}`;
  if (body.length < 150) body += f.classic;
  return { open, body, classic: f.classic, tip: f.tip, makeup, tier };
}

function metricsView(z, m) {
  const keys = ["upper", "middle", "lower", "browLen", "browThick", "browTilt", "glabella", "eyeOpen", "eyeTilt", "eyeGap",
    "noseWidth", "noseLen", "mouthWidth", "mouthCorner", "lipThick", "philtrum", "chinLen", "jawWidth", "faceRatio", "symmetry"];
  return keys.map((k) => ({
    k, label: METRIC_LABELS[k], z: z[k], value: m[k],
    word: z[k] >= 0.8 ? "鲜明" : z[k] <= -0.8 ? "秀气" : "均衡",
  }));
}

// 选择了性别时，只与同性别的名人比较。
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
