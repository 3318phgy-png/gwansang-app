// =====================================================================
//  reading.js — 測定値（zスコア）を前向きな人相リーディングに変換します（日本語版）。
//  同じ写真 → いつも同じ結果（ランダムではありません）。
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
    key: "ear", name: "耳", organ: "採聴官 · 生まれ持った福", emoji: "👂",
    tags: [earKey === "auto" ? "顔全体のバランスから推定" : ear.label],
    text: (earKey === "auto"
      ? "正面の写真では髪や角度で耳が隠れやすいので、顔全体のバランスから耳の相を推定しました。古典では耳は「採聴官」——生まれ持った福と健康長寿を表します。あなたの下停と鼻は" + (z.ear > 0.4 ? "ふっくらと豊かなので、耳はしっかりした幸運の「福耳」タイプである可能性が高いです。" : "すっきりと整っているので、耳は小ぶりで形のよいタイプである可能性が高いです——判断が早く、自分の軸がしっかりしているしるしです。")
      : ear.text) + "耳は五官の中でいちばん早く形ができ、いちばん最後まで変わらないので、子ども時代の運（1〜14歳）と一生の福の土台の両方を表します。もっと詳しく知りたいときは、上で耳の形を選んでください。「採聴官」なので、聞き上手になるだけで耳の運が育つと古典はいいます！",
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
    const who = gender ? `${ageInfo.phrase}の${genderNoun(gender)}` : `${ageInfo.phrase}の方`;
    ageText = `${who}であるあなたの場合、『麻衣神相』の「流年運気」によると、今の運は${ageInfo.place}（${ageInfo.years}）にあります。${ageInfo[level(az)]}`;
  }
  const summary =
    `${shape.emoji} あなたは古典でいう「${shape.name}」——「${shape.alias}」タイプです。${shape.text}` +
    `測定でいちばん際立っていたのは、あなたの${strongParts[0]}と${strongParts[1]}でした。` +
    `${zones}` + ageText +
    `だからこそ、${fortunes.length}の運の中でも${best.emoji}${best.name}（${best.score}点）と${second.emoji}${second.name}（${second.score}点）が特に強く出ています。` +
    `そして『柳荘相法』の言葉を忘れないでください。「相は心に従う」。長所はそのまま輝かせ、ほかは笑顔と習慣で伸ばしていけば、あなたの顔も運命も、いつだってもっとよくなります。`;

  return {
    seed, z, shapeKey, shape, fortunes, ranked, total, parts, hook, summary,
    profileLabel: [gender ? GENDERS[gender] : "", ageInfo.keys ? ageInfo.label : ""].filter(Boolean).join(" · "),
    tipLabel: gender === "m" ? "💈 身だしなみアドバイス" : "💄 開運メイク",
    gender,
    figures: matchFigures(z, gender),
    metricsView: metricsView(z, m),
  };
}

function zoneText(z) {
  const arr = [["上停（額・若年の運）", z.upper, "upper"], ["中停（眉〜鼻・働き盛りの運）", z.middle, "middle"], ["下停（鼻〜あご・晩年の運）", z.lower, "lower"]];
  if (z.balance >= 0.8) return "『麻衣神相』の核心である三停が、とても均等に整っています。古典はこれを珍しく貴重な相とし、若いころ、働き盛り、晩年と、運がなめらかに流れるとしています。";
  const top = [...arr].sort((a, b) => b[1] - a[1])[0];
  const when = top[2] === "upper" ? "人生の早い時期から頭角を現しやすい" : top[2] === "middle" ? "いちばん大きく花開くのは活躍の30〜40代" : "年を重ねるほど人生が豊かに満ちていく";
  return `三停の中では${top[0]}がいちばん発達しています——つまり、${when}タイプです。`;
}

function fortuneText(f, score, contrib, seed, opt = {}) {
  const tier = score >= 88 ? "top" : score >= 78 ? "good" : "hidden";
  const open = {
    top: `${f.emoji} ${f.name}：${score}点——これは自慢していいレベルです！`,
    good: `${f.emoji} ${f.name}：${score}点——力強く安定した流れがあなたの味方をしています。`,
    hidden: `${f.emoji} ${f.name}：${score}点——これはあなたの「隠し札」。まだ眠っている可能性がたっぷりあります。`,
  }[tier];

  const lines = [];
  const sorted = [...contrib].sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const c of sorted) {
    if (lines.length >= 3) break;
    const L = FORTUNE_LINES[f.id][c.k];
    if (!L) continue;
    const lv = level(c.z);
    let s = lv === "hi" ? L.hi : lv === "lo" ? L.lo : "";
    if (!s && lv === "mid" && FEATURE_NAMES[c.k]) s = `あなたの${FEATURE_NAMES[c.k]}はちょうどバランスのよいところにあり、${f.name}の安定した土台になっています。`;
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
    top: "これは生まれ持った運です。続けること、謙虚でいることを忘れなければ、この好調は長く続きます。",
    good: "土台はしっかりしているので、小さな習慣をひとつ変えるだけで、この運はもう一段上がります。",
    hidden: "人相学では、点数が低めなのは伸びしろが大きいということ。笑顔と習慣で、いちばん運を変えられる分野です。",
  }[tier];

  const ageLine = opt.stage && AGE_LINES[f.id] ? AGE_LINES[f.id][opt.stage] : "";
  let body = `${lines.join("")}${ageLine}${close}`;
  if (body.length < 170) body += f.classic;
  return { open, body, classic: f.classic, tip: f.tip, makeup, tier };
}

function metricsView(z, m) {
  const keys = ["upper", "middle", "lower", "browLen", "browThick", "browTilt", "glabella", "eyeOpen", "eyeTilt", "eyeGap",
    "noseWidth", "noseLen", "mouthWidth", "mouthCorner", "lipThick", "philtrum", "chinLen", "jawWidth", "faceRatio", "symmetry"];
  return keys.map((k) => ({
    k, label: METRIC_LABELS[k], z: z[k], value: m[k],
    word: z[k] >= 0.8 ? "はっきり" : z[k] <= -0.8 ? "すっきり" : "バランス",
  }));
}

// 性別が選ばれているときは、同じ性別の有名人とだけ比べます。
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
