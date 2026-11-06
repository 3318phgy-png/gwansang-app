// =====================================================================
//  reading.js — 측정값(z-점수)을 관상 풀이 문장으로 엮습니다.
//  같은 사진이면 언제나 같은 결과가 나옵니다(랜덤 아님).
// =====================================================================
import {
  FACE_SHAPES, PART_READINGS, FORTUNES, FORTUNE_LINES, MAKEUP_TIPS,
  EAR_TYPES, HOOKS, METRIC_LABELS, FIVE_ORGANS,
  AGE_GROUPS, AGE_LINES, GROOMING_TIPS, GENDERS,
} from "./content.js?v=10";
import { FIGURES } from "./figures.js?v=10";

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
  const ageKey = profile.age || "";
  const ageInfo = AGE_GROUPS[ageKey] || AGE_GROUPS[""];
  const stage = ageInfo.stage || "";
  const z = { ...analysis.z };
  const m = analysis.metrics;
  const seed = hashOf(Object.values(m).map((v) => +v.toFixed(3)));

  // 파생 지표
  z.smile = clamp((m.smile - 0.35) / 0.25, -2, 2.5);
  const devs = [z.upper, z.middle, z.lower].map(Math.abs);
  z.balance = clamp(1.6 - (devs[0] + devs[1] + devs[2]) / 1.5, -2, 2);
  z.ear = earKey === "auto" ? clamp(0.2 + 0.25 * z.lower + 0.2 * z.noseWidth, -0.5, 0.8) : EAR_TYPES[earKey].score;

  const shapeKey = faceShapeOf(z);
  const shape = FACE_SHAPES[shapeKey];

  // ── 운세 점수 ─────────────────────────────────
  const fortunes = FORTUNES.map((f, i) => {
    let sum = 0, wsum = 0;
    const contrib = [];
    for (const [k, w] of Object.entries(f.weights)) {
      const zz = z[k] ?? 0;
      sum += w * zz; wsum += Math.abs(w);
      contrib.push({ k, w, z: zz, c: w * zz });
    }
    const jitter = ((seed >> (i * 3)) % 5) - 2; // 사진마다 고정된 ±2 개성치
    const score = Math.round(clamp(76 + (sum / wsum) * 14 + jitter, 62, 98));
    const name = f.id === "career" && ageInfo.career ? ageInfo.career
      : f.id === "children" && ageInfo.children ? ageInfo.children : f.name;
    const ff = { ...f, name };
    return { ...ff, score, contrib, text: fortuneText(ff, score, contrib, seed + i, { stage, gender }) };
  });

  const ranked = [...fortunes].sort((a, b) => b.score - a.score);
  const total = Math.round(fortunes.reduce((s, f) => s + f.score, 0) / fortunes.length);

  // ── 부위별 풀이 ───────────────────────────────
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
  // 귀
  const ear = EAR_TYPES[earKey];
  parts.push({
    key: "ear", name: "귀", organ: "채청관 · 타고난 복", emoji: "👂",
    tags: [earKey === "auto" ? "얼굴 균형 기반 추정" : ear.label],
    text: (earKey === "auto"
      ? "정면 사진에서는 귀가 머리카락에 가려지거나 각도 때문에 정확히 보이지 않는 경우가 많아, 얼굴 전체의 균형으로 귀의 기운을 추정했어요. 마의상법에서 귀는 '채청관(採聽官)'이라 하여 타고난 복과 수명을 보는 곳인데, 하정과 콧방울이 " + (z.ear > 0.4 ? "넉넉한 편이라 귀 역시 두툼한 '복귀'일 가능성이 높아요. " : "단정한 편이라 귀도 야무지고 단정한 형일 가능성이 높아요. 이런 분은 판단이 빠르고 주관이 뚜렷합니다. ")
      : ear.text + " ") + "귀는 오관 중 가장 먼저 생기고 가장 늦게까지 변하지 않는 부위라, 어린 시절(1~14세)의 운과 평생의 기본 복을 함께 본답니다. 더 정확한 귀 풀이가 궁금하다면 위에서 내 귀 모양을 직접 골라 보세요. 채청관은 '듣는 복'이니, 남의 말을 잘 들어 주는 것만으로도 귀의 복이 커진다고 해요!",
  });

  // ── 총평 ──────────────────────────────────────
  const best = ranked[0], second = ranked[1];
  const hookList = HOOKS[best.id];
  const hook = hookList[seed % hookList.length];
  const strongParts = Object.entries(z)
    .filter(([k]) => METRIC_LABELS[k] && !["middle", "eyeSize", "faceRatio"].includes(k))
    .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => METRIC_LABELS[k]);
  const sanjeong = sanjeongText(z);
  let ageText = "";
  if (ageInfo.keys) {
    const az = ageInfo.keys.reduce((a, k) => a + (z[k] ?? 0), 0) / ageInfo.keys.length;
    const who = `${ageInfo.label}${gender ? " " + GENDERS[gender] : ""}`;
    ageText = `특히 지금 ${who}이신 당신은, 마의상법의 '유년운기(流年運氣)'로 보면 운이 '${ageInfo.place}'에 머무는 시기(${ageInfo.years})예요. ${ageInfo[level(az)]} `;
  }
  const summary =
    `${shape.emoji} 당신의 얼굴은 ${shape.alias}, 신상전편으로 치면 '${shape.name}'입니다. ${shape.text} ` +
    `실제 측정에서 가장 돋보인 부위는 '${strongParts[0]}'와(과) '${strongParts[1]}'였어요. ` +
    `${sanjeong} ` + ageText +
    `그래서 8가지 운 중 ${best.emoji}${best.name}(${best.score}점)과 ${second.emoji}${second.name}(${second.score}점)이 특히 강하게 나왔습니다. ` +
    `유장상법은 '얼굴은 마음 따라 변한다'고 했어요. 지금의 좋은 기운을 살리고 아쉬운 곳은 표정과 습관으로 채우면, 관상은 얼마든지 더 좋아질 수 있답니다.`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [ageInfo.keys ? ageInfo.label : "", gender ? GENDERS[gender] : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 그루밍 · 인상 팁" : "💄 메이크업 · 인상 팁",
    figures: matchFigures(z, gender),
    gender,
    metricsView: metricsView(z, m),
  };
}

function sanjeongText(z) {
  const arr = [["상정(이마·초년운)", z.upper], ["중정(눈썹~코·중년운)", z.middle], ["하정(코밑~턱·말년운)", z.lower]];
  if (z.balance >= 0.8) return "마의상법의 핵심인 삼정(三停)이 고르게 나뉘어 있어 초년·중년·말년의 운이 고르게 흐르는 귀한 상이에요.";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[0].includes("초년") ? "젊을 때부터 일찍 두각을 나타내는" : top[0].includes("중년") ? "30~40대 활동기에 크게 꽃피는" : "나이 들수록 점점 더 풍성해지는";
  return `삼정(三停) 중에서는 ${top[0]}이 가장 발달해, ${when} 흐름을 가졌어요.`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name} ${score}점, 이건 자랑해도 되는 점수예요!`,
    good: `${f.emoji} ${f.name} ${score}점, 탄탄하게 받쳐 주는 좋은 흐름이에요.`,
    hidden: `${f.emoji} ${f.name} ${score}점, 아직 덜 꺼낸 '숨은 카드'가 있는 운이에요.`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    // 가중치가 음수인 지표(예: 연애운의 눈꼬리)는 방향만 반대로 해석하지 않고 그대로 특징을 설명
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && METRIC_LABELS[c.k]) s = `${METRIC_LABELS[c.k]}이(가) 평균적으로 균형 잡혀 있어 ${f.name}의 흐름을 안정적으로 받쳐 줍니다.`;
    if (s) lines.push(s);
  }

  // 보완 포인트 → 메이크업/인상 팁
  const TIPS = opt.gender === "m" ? GROOMING_TIPS : MAKEUP_TIPS;
  const weakest = [...contrib].filter((c) => TIPS[c.k]).sort((a, b) => a.c - b.c)[0];
  let makeup = "";
  if (weakest) {
    const t = TIPS[weakest.k];
    makeup = weakest.z < 0 ? t.lo : t.hi;
  }

  const close = {
    top: "이미 좋은 운을 타고났으니, 자만하지 않고 꾸준함만 더하면 '대길(大吉)'의 흐름이 오래 이어집니다.",
    good: "타고난 기본기가 좋으니, 작은 습관 하나만 바꿔도 운의 그래프가 한 단계 더 올라갈 거예요.",
    hidden: "관상에서 점수가 조금 낮다는 건 '변화의 여지가 크다'는 뜻이에요. 표정과 습관으로 가장 크게 운을 바꿀 수 있는 분야랍니다.",
  }[tier];

  const ageLine = opt.stage && AGE_LINES[f.id] ? " " + AGE_LINES[f.id][opt.stage] : "";
  let body = `${lines.join(" ")}${ageLine} ${close}`;
  if (body.length < 220) body += " " + f.classic;
  return { open, body, classic: f.classic, tip: f.tip, makeup, tier };
}

function metricsView(z, m) {
  const keys = ["upper", "middle", "lower", "browLen", "browThick", "browTilt", "glabella", "eyeOpen", "eyeTilt", "eyeGap",
    "noseWidth", "noseLen", "mouthWidth", "mouthCorner", "lipThick", "philtrum", "chinLen", "jawWidth", "faceRatio", "symmetry"];
  return keys.map((k) => ({
    k, label: METRIC_LABELS[k], z: z[k], value: m[k],
    word: z[k] >= 0.8 ? "큰 편" : z[k] <= -0.8 ? "작은 편" : "평균",
  }));
}

// gender가 정해지면 같은 성별의 인물끼리만 비교합니다.
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
