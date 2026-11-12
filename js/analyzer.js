// =====================================================================
//  analyzer.js — 얼굴 랜드마크(478점)로 실제 관상 지표를 측정합니다.
//  모든 처리는 브라우저 안에서만 이루어지며 사진은 서버로 전송되지 않습니다.
// =====================================================================
import { FaceLandmarker, FilesetResolver } from "../vendor/mediapipe/vision_bundle.mjs";

let landmarker = null;

export async function initAnalyzer(onProgress = () => {}) {
  if (landmarker) return landmarker;
  onProgress("Waking up the face-reading engine…");
  const fileset = await FilesetResolver.forVisionTasks("./vendor/mediapipe/wasm");
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: "./vendor/face_landmarker.task", delegate },
    runningMode: "IMAGE",
    numFaces: 1,
    outputFaceBlendshapes: true,
  });
  // 사진 한 장 분석에는 CPU로 충분하고, 사파리(맥·아이폰)에서도 가장 안정적입니다.
  landmarker = await FaceLandmarker.createFromOptions(fileset, opts("CPU"));
  return landmarker;
}

// 카메라 화면에서 얼굴이 잘 보이는지 빠르게 확인합니다.
// 반환: { ok, reason }  reason: "none" | "small" | "off" | "dark" | "good"
export async function quickCheck(canvas) {
  const lmk = await initAnalyzer();
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const px = ctx.getImageData(0, 0, W, H).data;
  let sum = 0; for (let i = 0; i < px.length; i += 16) sum += px[i] + px[i + 1] + px[i + 2];
  const bright = sum / (px.length / 16) / 3;
  const res = lmk.detect(canvas);
  if (!res.faceLandmarks || !res.faceLandmarks.length) return { ok: false, reason: bright < 40 ? "dark" : "none", bright };
  const pts = res.faceLandmarks[0];
  let x0 = 1, x1 = 0, y0 = 1, y1 = 0;
  for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (y1 - y0 < 0.28) return { ok: false, reason: "small", bright };
  if (y1 - y0 > 0.8) return { ok: false, reason: "big", bright };
  if (Math.abs(cx - 0.5) > 0.2 || Math.abs(cy - 0.48) > 0.22) return { ok: false, reason: "off", bright };
  if (bright < 45) return { ok: true, reason: "dark", bright };
  return { ok: true, reason: "good", bright };
}

// ---------------------------------------------------------------------
// 평균/표준편차(기준값) — 정면 사진 표본으로 보정한 값.
// z = (측정값 - mean) / sd  →  -1 이하 "작음/낮음", +1 이상 "큼/높음"
// ---------------------------------------------------------------------
export const BASELINE = {
  eyeSize:     { mean: 0.205, sd: 0.012 }, // 눈 가로 / 얼굴 폭
  eyeOpen:     { mean: 0.300, sd: 0.070 }, // 눈 세로 / 눈 가로
  eyeTilt:     { mean: 0.100, sd: 0.060 }, // 눈꼬리 올라감 정도
  eyeGap:      { mean: 1.180, sd: 0.090 }, // 미간(눈 사이) / 눈 가로
  browLen:     { mean: 1.500, sd: 0.100 }, // 눈썹 길이 / 눈 가로
  browThick:   { mean: 0.230, sd: 0.040 }, // 눈썹 두께 / 눈 가로
  browTilt:    { mean: 0.000, sd: 0.080 }, // 눈썹 꼬리 올라감
  browEye:     { mean: 0.600, sd: 0.120 }, // 눈썹~눈 간격(전택궁) / 눈 가로
  glabella:    { mean: 1.050, sd: 0.120 }, // 인당(눈썹 사이) / 눈 가로
  noseWidth:   { mean: 0.290, sd: 0.020 }, // 콧볼 폭 / 얼굴 폭
  noseLen:     { mean: 0.315, sd: 0.020 }, // 코 길이 / 얼굴 길이
  mouthWidth:  { mean: 0.390, sd: 0.030 }, // 입 폭 / 얼굴 폭
  mouthCorner: { mean: 0.060, sd: 0.060 }, // 입꼬리 올라감
  lipThick:    { mean: 0.280, sd: 0.060 }, // 입술 두께 / 입 폭
  philtrum:    { mean: 0.200, sd: 0.030 }, // 인중 / 하정
  chinLen:     { mean: 0.480, sd: 0.050 }, // 턱 길이 / 하정
  jawWidth:    { mean: 0.780, sd: 0.040 }, // 턱선 폭 / 광대 폭
  faceRatio:   { mean: 1.250, sd: 0.070 }, // 얼굴 세로 / 가로
  upper:       { mean: 0.235, sd: 0.025 }, // 상정 비율 (메시 기준)
  middle:      { mean: 0.420, sd: 0.020 }, // 중정 비율
  lower:       { mean: 0.345, sd: 0.030 }, // 하정 비율
  symmetry:    { mean: 0.880, sd: 0.050 }, // 좌우 대칭
};

const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export async function analyzeImage(imgEl) {
  const lmk = await initAnalyzer();
  const res = lmk.detect(imgEl);
  if (!res.faceLandmarks || res.faceLandmarks.length === 0) return null;
  const W = imgEl.naturalWidth || imgEl.videoWidth || imgEl.width;
  const H = imgEl.naturalHeight || imgEl.videoHeight || imgEl.height;
  const raw = res.faceLandmarks[0].map((p) => ({ x: p.x * W, y: p.y * H, z: p.z * W }));

  // 1) 기울기 보정: 두 눈의 중심을 수평으로 맞춥니다.
  const eL = mid(raw[33], raw[133]);
  const eR = mid(raw[362], raw[263]);
  const ang = Math.atan2(eR.y - eL.y, eR.x - eL.x);
  const c = mid(eL, eR);
  const cos = Math.cos(-ang), sin = Math.sin(-ang);
  const P = raw.map((p) => ({
    x: c.x + (p.x - c.x) * cos - (p.y - c.y) * sin,
    y: c.y + (p.x - c.x) * sin + (p.y - c.y) * cos,
  }));

  const blend = {};
  if (res.faceBlendshapes && res.faceBlendshapes[0]) {
    for (const cat of res.faceBlendshapes[0].categories) blend[cat.categoryName] = cat.score;
  }

  const metrics = measure(P);
  const smile = ((blend.mouthSmileLeft || 0) + (blend.mouthSmileRight || 0)) / 2;
  metrics.smile = smile;

  // 고개 돌림(yaw) 추정 — 코끝이 얼굴 중앙에서 얼마나 벗어났는지
  const faceMidX = (P[234].x + P[454].x) / 2;
  const yaw = (P[1].x - faceMidX) / d(P[234], P[454]);

  const z = {};
  for (const k of Object.keys(BASELINE)) {
    z[k] = clamp((metrics[k] - BASELINE[k].mean) / BASELINE[k].sd, -3, 3);
  }
  // 고개가 돌아간 사진은 좌우 대칭 측정이 왜곡되므로 중립 처리
  if (Math.abs(yaw) > 0.08) z.symmetry = clamp(z.symmetry * 0.3, -1, 1);
  // 눈을 감았거나 크게 웃어 눈이 감기면 눈 크기 판정을 완화
  if (metrics.eyeOpen < 0.15) z.eyeOpen = 0;

  return {
    metrics, z, blend, yaw,
    landmarks: raw,
    box: bbox(raw),
    quality: { yaw: Math.abs(yaw), roll: (ang * 180) / Math.PI },
  };
}

function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function measure(P) {
  const faceW = d(P[234], P[454]);
  const faceH = d(P[10], P[152]);
  const eyeWL = d(P[33], P[133]), eyeWR = d(P[362], P[263]);
  const eyeW = (eyeWL + eyeWR) / 2;
  const eyeH = (d(P[159], P[145]) + d(P[386], P[374])) / 2;

  // 눈꼬리: 바깥 꼬리가 안쪽보다 높으면 +
  const tiltL = (P[133].y - P[33].y) / eyeWL;
  const tiltR = (P[362].y - P[263].y) / eyeWR;

  // 눈썹: 70(꼬리)…107(머리) / 300(꼬리)…336(머리)
  const browLen = (d(P[70], P[107]) + d(P[300], P[336])) / 2;
  const browThick = (d(P[105], P[52]) + d(P[334], P[282])) / 2;
  const browTilt = ((P[107].y - P[70].y) / d(P[70], P[107]) + (P[336].y - P[300].y) / d(P[300], P[336])) / 2;
  const browEye = (d(P[52], P[159]) + d(P[282], P[386])) / 2;

  // 코
  const noseW = d(P[129], P[358]);
  const noseLen = d(P[168], P[2]);

  // 입
  const mouthW = d(P[61], P[291]);
  const lipCenterY = (P[13].y + P[14].y) / 2;
  const cornerY = (P[61].y + P[291].y) / 2;
  const lipThick = (d(P[0], P[13]) + d(P[14], P[17])) / mouthW;

  // 삼정: 10(이마 상단) – 9(인당) – 2(코 밑) – 152(턱끝)
  const brow9 = P[9];
  const up = Math.abs(brow9.y - P[10].y);
  const mi = Math.abs(P[2].y - brow9.y);
  const lo = Math.abs(P[152].y - P[2].y);
  const tot = up + mi + lo;

  // 대칭: 중심선(168-152) 기준 좌우 거리 비교
  const cx = (P[168].x + P[152].x) / 2;
  const pairs = [[33, 263], [133, 362], [61, 291], [234, 454], [70, 300], [129, 358], [172, 397]];
  let asym = 0;
  for (const [a, b] of pairs) {
    const da = Math.abs(P[a].x - cx), db = Math.abs(P[b].x - cx);
    asym += Math.abs(da - db) / Math.max(da, db);
    asym += Math.abs(P[a].y - P[b].y) / faceW;
  }
  const symmetry = 1 - asym / pairs.length;

  return {
    eyeSize: eyeW / faceW,
    eyeOpen: eyeH / eyeW,
    eyeTilt: (tiltL + tiltR) / 2,
    eyeGap: d(P[133], P[362]) / eyeW,
    browLen: browLen / eyeW,
    browThick: browThick / eyeW,
    browTilt,
    browEye: browEye / eyeW,
    glabella: d(P[107], P[336]) / eyeW,
    noseWidth: noseW / faceW,
    noseLen: noseLen / faceH,
    mouthWidth: mouthW / faceW,
    mouthCorner: (lipCenterY - cornerY) / mouthW,
    lipThick,
    philtrum: d(P[2], P[0]) / lo,
    chinLen: d(P[17], P[152]) / lo,
    jawWidth: d(P[172], P[397]) / faceW,
    faceRatio: faceH / faceW,
    upper: up / tot,
    middle: mi / tot,
    lower: lo / tot,
    symmetry,
  };
}
