// =====================================================================
//  app.js — 화면 구성 · 카메라 · 업로드 · 결과 렌더링 · 이미지 저장
// =====================================================================
import { initAnalyzer, analyzeImage } from "./analyzer.js";
import { FaceLandmarker } from "../vendor/mediapipe/vision_bundle.mjs";
import { buildReading, level } from "./reading.js";
import {
  BOOKS, PALACES, FIVE_ORGANS, PART_READINGS, FORTUNES, FORTUNE_LINES, MAKEUP_TIPS,
  EAR_TYPES, FACE_SHAPES, METRIC_LABELS,
} from "./content.js";
import { FIGURES } from "./figures.js";
import { fillAds } from "./ads.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const state = { ear: "auto", analysis: null, reading: null, photo: null, layer: "mesh", stream: null, facing: "user" };

// ───────────────────────── 탭 ─────────────────────────
function showTab(id) {
  const changed = !$(`#panel-${id}`).classList.contains("active");
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
  $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${id}`));
  history.replaceState(null, "", `#${id}`);
  if (changed) window.scrollTo({ top: 0, behavior: "smooth" });
  fillAds();
}
$$("[data-tab]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); showTab(b.dataset.tab); }));

// ───────────────────────── 토스트 ─────────────────────────
let toastTimer;
function toast(msg, ms = 3000) {
  const t = $("#toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add("hidden"), ms);
}

// ───────────────────────── 귀 선택 ─────────────────────────
function renderEarChips() {
  $("#earChips").innerHTML = Object.entries(EAR_TYPES)
    .map(([k, v]) => `<button class="chip ${k === state.ear ? "active" : ""}" data-ear="${k}">${v.label}</button>`).join("");
  $$("#earChips .chip").forEach((c) => c.addEventListener("click", () => {
    state.ear = c.dataset.ear; renderEarChips();
    if (state.analysis) { state.reading = buildReading(state.analysis, state.ear); renderResult(false); toast("👂 귀 정보를 반영해 다시 풀이했어요"); }
  }));
}

// ───────────────────────── 이미지 입력 ─────────────────────────
$("#fileInput").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = ""; });
const dz = $("#dropZone");
["dragenter", "dragover"].forEach((ev) => document.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => document.addEventListener(ev, (e) => { e.preventDefault(); if (ev === "drop" || e.target === dz) dz.classList.remove("over"); }));
document.addEventListener("drop", (e) => { const f = e.dataTransfer?.files?.[0]; if (f && f.type.startsWith("image/")) { showTab("read"); loadFile(f); } });
document.addEventListener("paste", (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/")); if (f) loadFile(f); });

function loadFile(file) {
  if (!file.type.startsWith("image/")) return toast("이미지 파일만 올릴 수 있어요");
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); runAnalysis(toCanvas(img, img.naturalWidth, img.naturalHeight)); };
  img.onerror = () => toast("사진을 열 수 없어요. 다른 사진으로 시도해 주세요");
  img.src = url;
}

function toCanvas(src, w, h, mirror = false) {
  const max = 1400, s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * s); c.height = Math.round(h * s);
  const ctx = c.getContext("2d");
  if (mirror) { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

// ───────────────────────── 카메라 ─────────────────────────
$("#btnCamera").addEventListener("click", openCamera);
$("#camCancel").addEventListener("click", closeCamera);
$("#camFlip").addEventListener("click", () => { state.facing = state.facing === "user" ? "environment" : "user"; startStream(); });
$("#camShot").addEventListener("click", countdownShot);

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) return toast("이 브라우저는 카메라를 지원하지 않아요. 사진 불러오기를 이용해 주세요");
  $("#camModal").classList.remove("hidden");
  initAnalyzer().catch(() => {}); // 촬영하는 동안 엔진 미리 준비
  await startStream();
}
async function startStream() {
  stopStream();
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: state.facing, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
    const v = $("#camVideo"); v.srcObject = state.stream; v.classList.toggle("rear", state.facing !== "user");
  } catch (e) {
    closeCamera();
    toast("카메라 권한이 필요해요. 브라우저 설정에서 허용하거나 사진을 불러와 주세요", 4500);
  }
}
function stopStream() { state.stream?.getTracks().forEach((t) => t.stop()); state.stream = null; }
function closeCamera() { stopStream(); $("#camModal").classList.add("hidden"); $("#camCount").textContent = ""; }
let counting = false;
async function countdownShot() {
  if (counting) return; counting = true;
  const el = $("#camCount");
  for (const n of [3, 2, 1]) { el.textContent = n; await sleep(700); }
  el.textContent = "";
  const v = $("#camVideo");
  const flash = document.createElement("div"); flash.className = "flash"; document.body.appendChild(flash); setTimeout(() => flash.remove(), 500);
  // 전면 카메라는 사용자가 거울처럼 보던 모습 그대로 저장
  const c = toCanvas(v, v.videoWidth, v.videoHeight, state.facing === "user");
  counting = false;
  closeCamera();
  runAnalysis(c);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────── 분석 ─────────────────────────
async function runAnalysis(canvas) {
  showTab("read");
  state.photo = canvas;
  $("#result").classList.add("hidden");
  const box = $("#analyzing"); box.classList.remove("hidden");
  const sc = $("#scanCanvas"); sc.width = canvas.width; sc.height = canvas.height; sc.getContext("2d").drawImage(canvas, 0, 0);
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  const steps = $$("#scanSteps li"); steps.forEach((s) => s.classList.remove("done"));
  const msgs = ["관상도사가 얼굴을 살피는 중…", "삼정의 균형을 재는 중…", "코의 재백궁을 두드려 보는 중…", "마의상법을 펼쳐 보는 중…", "신상전편과 대조하는 중…"];
  let i = 0;
  const tick = setInterval(() => { if (i < steps.length) { steps[i].classList.add("done"); $("#scanMsg").textContent = msgs[Math.min(i + 1, msgs.length - 1)]; i++; } }, 650);
  try {
    await initAnalyzer((m) => ($("#scanMsg").textContent = m));
    const result = await analyzeImage(canvas);
    await sleep(Math.max(0, 3300 - i * 650)); // 두근두근 연출
    clearInterval(tick); steps.forEach((s) => s.classList.add("done"));
    if (!result) {
      box.classList.add("hidden");
      return toast("얼굴을 찾지 못했어요 😢 정면 얼굴이 크게 나온 밝은 사진으로 다시 시도해 주세요", 5000);
    }
    drawOverlay(sc, canvas, result.landmarks, "mesh", false);
    await sleep(600);
    state.analysis = result;
    state.reading = buildReading(result, state.ear);
    box.classList.add("hidden");
    renderResult(true);
    if (result.quality.yaw > 0.12) toast("📐 고개가 조금 돌아가 있어요. 정면 사진이면 더 정확해요!", 4500);
  } catch (err) {
    console.error(err);
    clearInterval(tick); box.classList.add("hidden");
    toast("관상 엔진을 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요", 5000);
  }
}

// ───────────────────────── 오버레이 그리기 ─────────────────────────
const PALACE_POINTS = {
  "관록궁": 151, "명궁": 9, "질액궁": 168, "재백궁": 4, "형제궁": 105, "전택궁": 223,
  "자녀궁": 230, "처첩궁": 446, "노복궁": 172, "천이궁": 54, "복덕궁": 333, "부모궁": 67,
};
function cropBox(lm, W, H) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of lm) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 - (y1 - y0) * 0.05;
  let h = (y1 - y0) * 1.55, w = h * 0.8;
  if (w < (x1 - x0) * 1.4) { w = (x1 - x0) * 1.4; h = w / 0.8; }
  let x = cx - w / 2, y = cy - h / 2;
  x = Math.max(0, Math.min(W - w, x)); y = Math.max(0, Math.min(H - h, y));
  return { x, y, w: Math.min(w, W), h: Math.min(h, H) };
}
function drawOverlay(target, photo, lm, layer, crop = true) {
  const b = crop ? cropBox(lm, photo.width, photo.height) : { x: 0, y: 0, w: photo.width, h: photo.height };
  const scale = crop ? 900 / b.w : 1;
  target.width = Math.round(b.w * scale); target.height = Math.round(b.h * scale);
  const ctx = target.getContext("2d");
  ctx.drawImage(photo, b.x, b.y, b.w, b.h, 0, 0, target.width, target.height);
  const P = (i) => ({ x: (lm[i].x - b.x) * scale, y: (lm[i].y - b.y) * scale });
  const unit = target.width / 300;
  if (layer === "none") return;

  if (layer === "mesh") {
    ctx.lineWidth = 1.6 * unit; ctx.lineCap = "round";
    const groups = [
      [FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, "rgba(255,255,255,.75)"],
      [FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, "#ffc94d"], [FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, "#ffc94d"],
      [FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, "#4ad6ff"], [FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, "#4ad6ff"],
      [FaceLandmarker.FACE_LANDMARKS_LIPS, "#ff6b8b"],
    ];
    for (const [conns, color] of groups) {
      ctx.strokeStyle = color; ctx.beginPath();
      for (const c of conns) { const a = P(c.start), e = P(c.end); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); }
      ctx.stroke();
    }
    ctx.strokeStyle = "#7cf2b0"; ctx.beginPath();
    [168, 6, 197, 195, 5, 4, 1].forEach((i, k) => { const p = P(i); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
    [129, 98, 2, 327, 358].forEach((i, k) => { const p = P(i); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
    ctx.stroke();
    // 삼정 가이드 라인
    const L = P(234).x - 14 * unit, R = P(454).x + 14 * unit;
    ctx.setLineDash([5 * unit, 4 * unit]); ctx.lineWidth = 1.2 * unit; ctx.strokeStyle = "rgba(255,201,77,.9)";
    const lines = [[10, "상정"], [9, "중정"], [2, "하정"], [152, ""]];
    ctx.font = `700 ${10 * unit}px "Noto Sans KR", sans-serif`;
    lines.forEach(([i, label], k) => {
      const y = P(i).y; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      if (label) { const ny = P(lines[k + 1][0]).y; tag(ctx, label, R + 2 * unit, (y + ny) / 2, "#ffc94d", "#2b1d5c", unit, "left"); }
    });
    ctx.setLineDash([]);
  }
  if (layer === "palace") {
    ctx.font = `700 ${9 * unit}px "Noto Sans KR", sans-serif`;
    for (const [name, i] of Object.entries(PALACE_POINTS)) {
      const p = P(i);
      ctx.fillStyle = "#ff6b8b"; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2 * unit, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2 * unit; ctx.stroke();
      tag(ctx, name, p.x, p.y - 6 * unit, "rgba(43,29,92,.85)", "#fff", unit, "center", true);
    }
  }
}
function tag(ctx, text, x, y, bg, fg, unit, align = "center", above = false) {
  const w = ctx.measureText(text).width + 8 * unit, h = 14 * unit;
  let x0 = align === "center" ? x - w / 2 : x, y0 = above ? y - h : y - h / 2;
  x0 = Math.max(2, Math.min(ctx.canvas.width - w - 2, x0));
  ctx.fillStyle = bg; roundRect(ctx, x0, y0, w, h, 6 * unit); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(text, x0 + 4 * unit, y0 + h / 2 + 0.5);
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ───────────────────────── 결과 렌더링 ─────────────────────────
function ring(score, color = "#ffc94d") {
  const r = 40, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return `<svg class="total-ring" viewBox="0 0 96 96"><circle cx="48" cy="48" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="8"/>
    <circle cx="48" cy="48" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 48 48)"/>
    <text x="48" y="56" text-anchor="middle" font-size="26" fill="#fff">${score}</text></svg>`;
}
function radar(fortunes) {
  const n = fortunes.length, cx = 150, cy = 150, R = 105;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; const r = (R * v) / 100; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  let g = "";
  for (const lv of [25, 50, 75, 100]) g += `<polygon class="grid" points="${fortunes.map((_, i) => pt(i, lv).join(",")).join(" ")}"/>`;
  fortunes.forEach((_, i) => { const [x, y] = pt(i, 100); g += `<line class="grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; });
  const poly = fortunes.map((f, i) => pt(i, f.score).join(",")).join(" ");
  const labels = fortunes.map((f, i) => { const [x, y] = pt(i, 124); return `<text class="axis-label" x="${x}" y="${y + 4}" text-anchor="middle">${f.emoji}${f.name.replace("·합격", "").replace("·인복", "")}</text>`; }).join("");
  const dots = fortunes.map((f, i) => { const [x, y] = pt(i, f.score); return `<circle cx="${x}" cy="${y}" r="4" fill="${f.color}" stroke="#fff" stroke-width="1.5"/>`; }).join("");
  return `<svg class="radar" viewBox="0 0 300 300" role="img" aria-label="운세 레이더 차트">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b8b"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
    ${g}<polygon points="${poly}" fill="url(#rg)" fill-opacity=".35" stroke="url(#rg)" stroke-width="2.5"/>${dots}${labels}</svg>`;
}

function renderResult(scroll) {
  const R = state.reading, A = state.analysis;
  const el = $("#result");
  const fortunesHTML = R.fortunes.map((f, i) => `
    <article class="card fcard reveal" style="--c:${f.color}">
      <div class="fhead"><div class="em">${f.emoji}</div><h4>${f.name}</h4><div class="score">${f.score}<small>점</small></div></div>
      <div class="fbar"><b data-w="${f.score}"></b></div>
      <p class="fopen">${esc(f.text.open)}</p>
      <p class="fbody">${esc(f.text.body)}</p>
      <div class="fbox">
        <div><b>📜 고전은 이렇게 말해요</b>${esc(f.text.classic)}</div>
        <div><b>🍀 개운 포인트</b>${esc(f.text.tip)}</div>
        <div><b>💄 메이크업 · 인상 팁</b>${esc(f.text.makeup || MAKEUP_TIPS.smile.hi)}</div>
      </div>
    </article>${i === 3 ? `<div class="ad-slot ad-infeed" data-ad="infeed"></div>` : ""}`).join("");

  el.innerHTML = `
    <div class="res-top">
      <div class="card photo-card reveal">
        <canvas id="resCanvas"></canvas>
        <div class="layer-toggle">
          <button class="chip ${state.layer === "mesh" ? "active" : ""}" data-layer="mesh">📐 실측 라인</button>
          <button class="chip ${state.layer === "palace" ? "active" : ""}" data-layer="palace">🗺️ 십이궁</button>
          <button class="chip ${state.layer === "none" ? "active" : ""}" data-layer="none">🙂 원본</button>
        </div>
      </div>
      <div class="card hook-card reveal">
        <p class="eyebrow" style="color:#ffc94d">관상도사의 첫마디</p>
        <p class="hook-line">“${esc(R.hook)}”</p>
        <span class="shape-badge">${R.shape.emoji} ${R.shape.alias} · ${R.shape.name}</span>
        <div class="total">${ring(R.total)}<div><b style="font-size:18px">관상 종합 ${R.total}점</b><p>8가지 운의 평균이에요. 가장 강한 운은 <b>${R.ranked[0].name}</b>!</p></div></div>
        <div class="mini-bars">${R.fortunes.map((f) => `<div class="mini-bar"><span>${f.emoji} ${f.name}<b>${f.score}</b></span><i><b style="width:${f.score}%;background:${f.color}"></b></i></div>`).join("")}</div>
      </div>
    </div>

    <div class="card summary-card reveal">
      <h3>🔮 총평 — 당신의 얼굴 이야기</h3>
      <p>${esc(R.summary)}</p>
    </div>

    <div class="ad-slot ad-infeed" data-ad="infeed"></div>

    <div class="card radar-card reveal">
      <div>${radar(R.fortunes)}</div>
      <div><h3 class="block-title">🏆 나의 운세 랭킹</h3>
        <ol class="rank-list">${R.ranked.map((f, i) => `<li><span class="n">${i + 1}</span>${f.emoji} ${f.name}<span class="s" style="color:${f.color}">${f.score}</span></li>`).join("")}</ol></div>
    </div>

    <section>
      <h3 class="block-title">👁️ 부위별 관상 풀이</h3>
      <div class="part-grid">${R.parts.map((p, i) => `
        <article class="card part-card reveal" style="--c:${["#ffc94d", "#8b5cf6", "#4a8fe7", "#f2b705", "#ff6b8b", "#20b2aa", "#a77bd9"][i % 7]}">
          <h4>${p.emoji} ${p.name} <span class="organ">${p.organ}</span></h4>
          <div class="tagrow">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <p>${esc(p.text)}</p>
        </article>`).join("")}</div>
    </section>

    <section>
      <h3 class="block-title">🍀 생활 · 상황별 관상</h3>
      <div class="fortune-list">${fortunesHTML}</div>
    </section>

    <div class="card reveal">
      <h3 class="block-title">🌏 나와 닮은 관상의 인물</h3>
      <div class="match-grid">${R.figures.map(({ fig, pct }) => `
        <div class="match"><div class="av" style="background:${fig.color}">${fig.emoji}</div><b>${fig.name}</b><div class="pct">${pct}%</div><p>${FACE_SHAPES[fig.shape].alias} · ${fig.parts[0]}</p></div>`).join("")}</div>
      <p class="note">얼굴 비율의 '관상학적 경향'이 얼마나 비슷한지 비교한 재미용 매칭이에요. <a href="#figures" data-goto="figures">인물 관상 전체 보기 →</a></p>
    </div>

    <div class="card reveal">
      <h3 class="block-title">📏 실측 데이터 — 이렇게 쟀어요</h3>
      <div class="metric-grid">${R.metricsView.map((v) => `
        <div class="metric"><div class="top"><span>${v.label}</span><em>${v.word}</em></div>
        <div class="mtrack"><i style="left:${50 + Math.max(-2.5, Math.min(2.5, v.z)) * 19}%"></i></div></div>`).join("")}</div>
      <p class="note">얼굴 478개 지점을 찾아 기울기를 보정한 뒤, 각 부위의 길이를 얼굴 폭·길이 대비 비율로 계산했어요. 가운데가 평균, 왼쪽은 작은 편, 오른쪽은 큰 편이에요. 고개 각도 ${(A.quality.yaw * 100).toFixed(0)}% · 기울기 보정 ${A.quality.roll.toFixed(1)}°</p>
    </div>

    <div class="ad-slot ad-infeed" data-ad="infeed"></div>

    <div class="actions">
      <button class="btn btn-primary btn-xl" id="btnSave">💾 결과 이미지 저장</button>
      <button class="btn btn-gold btn-xl" id="btnShare">📤 친구에게 공유</button>
      <button class="btn btn-ghost btn-xl" id="btnCopy">📋 풀이 텍스트 복사</button>
      <button class="btn btn-ghost btn-xl" id="btnRetry">🔁 다른 사진으로</button>
    </div>`;

  el.classList.remove("hidden");
  drawOverlay($("#resCanvas"), state.photo, A.landmarks, state.layer);
  $$("[data-layer]", el).forEach((b) => b.addEventListener("click", () => {
    state.layer = b.dataset.layer; $$("[data-layer]", el).forEach((x) => x.classList.toggle("active", x === b));
    drawOverlay($("#resCanvas"), state.photo, A.landmarks, state.layer);
  }));
  $("[data-goto]", el).addEventListener("click", (e) => { e.preventDefault(); showTab("figures"); });
  $("#btnSave").addEventListener("click", saveImage);
  $("#btnShare").addEventListener("click", shareResult);
  $("#btnCopy").addEventListener("click", copyText);
  $("#btnRetry").addEventListener("click", () => { $("#hero").scrollIntoView({ behavior: "smooth" }); });
  fillAds(el);
  observeReveal(el);
  if (scroll) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const io = "IntersectionObserver" in window ? new IntersectionObserver((ents) => {
  for (const e of ents) if (e.isIntersecting) {
    e.target.classList.add("in");
    const bar = e.target.querySelector(".fbar b"); if (bar) bar.style.width = bar.dataset.w + "%";
    io.unobserve(e.target);
  }
}, { threshold: 0.12 }) : null;
function observeReveal(root) {
  $$(".reveal", root).forEach((r) => {
    if (io) io.observe(r);
    else { r.classList.add("in"); const bar = r.querySelector(".fbar b"); if (bar) bar.style.width = bar.dataset.w + "%"; }
  });
}

// ───────────────────────── 결과 이미지 저장 · 공유 ─────────────────────────
async function buildShareCanvas() {
  await document.fonts.ready;
  const R = state.reading, A = state.analysis;
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#2b1d5c"); g.addColorStop(0.6, "#5a3db5"); g.addColorStop(1, "#b14d8d");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.07; ctx.fillStyle = "#fff"; ctx.font = '700 520px "Gowun Batang", serif'; ctx.fillText("相", 560, 1250); ctx.globalAlpha = 1;

  // 사진
  const pc = document.createElement("canvas"); drawOverlay(pc, state.photo, A.landmarks, "mesh");
  const pw = 440, ph = pw * (pc.height / pc.width), px = 70, py = 170;
  ctx.save(); roundRect(ctx, px, py, pw, ph, 36); ctx.clip(); ctx.drawImage(pc, px, py, pw, ph); ctx.restore();
  ctx.strokeStyle = "#ffc94d"; ctx.lineWidth = 6; roundRect(ctx, px, py, pw, ph, 36); ctx.stroke();

  ctx.fillStyle = "#ffc94d"; ctx.font = '400 64px "Black Han Sans", sans-serif'; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillText("관상도사", 70, 120);
  ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = '500 26px "Noto Sans KR", sans-serif';
  ctx.fillText("마의상법 · 유장상법 · 신상전편 실측 관상", 330, 116);

  // 오른쪽: 얼굴형 + 종합점수
  const rx = 560;
  ctx.fillStyle = "#fff"; ctx.font = '700 34px "Noto Sans KR", sans-serif';
  ctx.fillText(`${R.shape.emoji} ${R.shape.alias}`, rx, 220);
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = '500 26px "Noto Sans KR", sans-serif'; ctx.fillText(R.shape.name, rx, 260);
  ctx.fillStyle = "#ffc94d"; ctx.font = '400 150px "Black Han Sans", sans-serif'; ctx.fillText(String(R.total), rx, 420);
  ctx.fillStyle = "#fff"; ctx.font = '700 30px "Noto Sans KR", sans-serif'; ctx.fillText("관상 종합 점수", rx + 4, 470);

  // 운세 바
  let y = 520;
  for (const f of R.fortunes) {
    ctx.fillStyle = "#fff"; ctx.font = '700 26px "Noto Sans KR", sans-serif'; ctx.fillText(`${f.emoji} ${f.name}`, rx, y);
    ctx.textAlign = "right"; ctx.fillText(String(f.score), W - 70, y); ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.18)"; roundRect(ctx, rx, y + 12, W - 70 - rx, 12, 6); ctx.fill();
    ctx.fillStyle = f.color; roundRect(ctx, rx, y + 12, (W - 70 - rx) * f.score / 100, 12, 6); ctx.fill();
    y += 56;
  }

  // 훅 문구 + 총평 요약
  const by = Math.max(py + ph, y - 30) + 30;
  ctx.fillStyle = "rgba(255,255,255,.12)"; roundRect(ctx, 70, by, W - 140, H - by - 110, 32); ctx.fill();
  ctx.fillStyle = "#ffc94d"; ctx.font = '400 44px "Black Han Sans", sans-serif';
  const hookLines = wrap(ctx, `“${R.hook}”`, W - 200);
  hookLines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 100, by + 64 + i * 54));
  ctx.fillStyle = "#fff"; ctx.font = '400 27px "Gowun Batang", serif';
  const sum = `${R.ranked[0].emoji} ${R.ranked[0].name}이 가장 강한 ${R.shape.alias}! ` + R.ranked[0].text.body;
  const sl = wrap(ctx, sum, W - 200); const maxLines = Math.max(2, Math.floor((H - by - 110 - 70 - hookLines.slice(0, 2).length * 54) / 42));
  sl.slice(0, maxLines).forEach((l, i, arr) => ctx.fillText(i === arr.length - 1 && sl.length > maxLines ? l.slice(0, -2) + "…" : l, 100, by + 64 + hookLines.slice(0, 2).length * 54 + 20 + i * 42));
  ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = '500 24px "Noto Sans KR", sans-serif'; ctx.textAlign = "center";
  ctx.fillText(`나도 관상 보기 👉 ${location.host || "관상도사"}`, W / 2, H - 50);
  return c;
}
function wrap(ctx, text, maxW) {
  const out = []; let line = "";
  for (const ch of text) { const t = line + ch; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = ch; } else line = t; }
  if (line) out.push(line); return out;
}
async function saveImage() {
  const c = await buildShareCanvas();
  c.toBlob((blob) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `관상도사_결과_${Date.now()}.png`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("💾 결과 이미지를 저장했어요!");
  }, "image/png");
}
async function shareResult() {
  const R = state.reading;
  const text = `[관상도사] 내 관상은 ${R.shape.alias}(${R.shape.name})! 종합 ${R.total}점, ${R.ranked[0].name} ${R.ranked[0].score}점 🔮 너도 해봐!`;
  try {
    const c = await buildShareCanvas();
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const file = new File([blob], "gwansang.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text, title: "관상도사" });
    if (navigator.share) return await navigator.share({ text, url: location.href, title: "관상도사" });
  } catch (e) { if (e.name === "AbortError") return; }
  await navigator.clipboard?.writeText(`${text} ${location.href}`);
  toast("🔗 공유 문구를 복사했어요. 카톡에 붙여넣기 하세요!");
}
async function copyText() {
  const R = state.reading;
  const txt = [`🔮 관상도사 결과 — ${R.shape.alias}(${R.shape.name}) · 종합 ${R.total}점`, "", `“${R.hook}”`, "", R.summary, "",
    ...R.parts.map((p) => `■ ${p.name}\n${p.text}`), "",
    ...R.fortunes.map((f) => `■ ${f.name} ${f.score}점\n${f.text.open} ${f.text.body}\n💄 ${f.text.makeup}`)].join("\n");
  try { await navigator.clipboard.writeText(txt); toast("📋 전체 풀이를 복사했어요!"); }
  catch { toast("복사 권한이 없어요"); }
}

// ───────────────────────── 정적 탭: 부위별 관상 ─────────────────────────
function renderPartsTab() {
  const dots = PALACES.map((p) => `<g class="dot" data-p="${p.id}"><circle cx="${p.x}" cy="${p.y}" r="3.4" fill="#8b5cf6" stroke="#fff" stroke-width=".8"/><text x="${p.x}" y="${p.below ? p.y + 7.2 : p.y - 4.6}" text-anchor="middle">${p.name.split("(")[0]}</text></g>`).join("");
  $("#palaceMap").innerHTML = `<svg viewBox="0 0 100 110">
    <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7d6"/><stop offset="1" stop-color="#ffd0bd"/></linearGradient></defs>
    <ellipse cx="50" cy="52" rx="38" ry="48" fill="url(#fg)" stroke="#e8b9a5" stroke-width=".8"/>
    <ellipse cx="11" cy="52" rx="4" ry="9" fill="#ffd0bd" stroke="#e8b9a5" stroke-width=".6"/><ellipse cx="89" cy="52" rx="4" ry="9" fill="#ffd0bd" stroke="#e8b9a5" stroke-width=".6"/>
    <path d="M24 32 q10 -5 20 -1 M56 31 q10 -4 20 1" stroke="#5a4033" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="41" rx="7" ry="3" fill="#fff" stroke="#5a4033" stroke-width=".7"/><circle cx="34" cy="41" r="2" fill="#3b2a24"/>
    <ellipse cx="66" cy="41" rx="7" ry="3" fill="#fff" stroke="#5a4033" stroke-width=".7"/><circle cx="66" cy="41" r="2" fill="#3b2a24"/>
    <path d="M50 42 v16 q-5 3 -7 1 M50 58 q5 3 7 1" stroke="#c48c76" stroke-width=".9" fill="none"/>
    <path d="M40 72 q10 6 20 0" stroke="#d9667f" stroke-width="2" fill="none" stroke-linecap="round"/>
    <line x1="8" y1="28" x2="92" y2="28" stroke="#ffc94d" stroke-dasharray="1.5 1.5" stroke-width=".5"/><line x1="8" y1="61" x2="92" y2="61" stroke="#ffc94d" stroke-dasharray="1.5 1.5" stroke-width=".5"/>
    ${dots}</svg>`;
  const show = (id) => {
    const p = PALACES.find((x) => x.id === id);
    $$("#palaceMap .dot").forEach((d) => d.classList.toggle("on", d.dataset.p === id));
    $("#palaceInfo").innerHTML = `<p class="eyebrow">십이궁</p><h3>${p.name}</h3><p class="place">📍 ${p.place}</p><p>${p.meaning}</p>
      <div class="palace-list">${PALACES.map((x) => `<button class="chip ${x.id === id ? "active" : ""}" data-pp="${x.id}">${x.name.split("(")[0]}</button>`).join("")}</div>`;
    $$("[data-pp]").forEach((b) => b.addEventListener("click", () => show(b.dataset.pp)));
  };
  $$("#palaceMap .dot").forEach((d) => d.addEventListener("click", () => show(d.dataset.p)));
  show("myeong");

  const organEmoji = { ear: "👂", brow: "〰️", eye: "👁️", nose: "👃", mouth: "👄" };
  $("#organGrid").innerHTML = Object.entries(FIVE_ORGANS).map(([k, o]) => `<div class="card organ"><div class="big">${organEmoji[k]}</div><b>${o.name}</b><span class="t">${o.title}</span><p>${o.role}</p></div>`).join("");

  const lvName = { hi: "크다 · 길다 · 높다", mid: "균형형", lo: "작다 · 짧다 · 낮다" };
  $("#partDict").innerHTML = Object.values(PART_READINGS).map((part) => `
    <div class="card dict-part"><h3>${part.emoji} ${part.name} <small style="color:var(--ink2);font-size:13px">${part.organ}</small></h3>
      ${Object.entries(part).filter(([, v]) => typeof v === "object").map(([mk, t]) => `
        <div class="dict-sub">${METRIC_LABELS[mk]}</div>
        <div class="dict-row">${["hi", "mid", "lo"].map((lv) => `<div><b>${lvName[lv]}</b>${t[lv]}</div>`).join("")}</div>`).join("")}
    </div>`).join("") + `<div class="card dict-part"><h3>👂 귀 <small style="color:var(--ink2);font-size:13px">채청관 · 타고난 복</small></h3>
      <div class="dict-row" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${Object.values(EAR_TYPES).filter((e) => e.text).map((e) => `<div><b>${e.label}</b>${e.text}</div>`).join("")}</div></div>`;
}

// ───────────────────────── 정적 탭: 운세별 관상 ─────────────────────────
function renderFortuneTab() {
  $("#fortuneGuide").innerHTML = FORTUNES.map((f) => `
    <article class="card guide" style="--c:${f.color}">
      <h3>${f.emoji} ${f.name}</h3>
      <div class="look">${Object.keys(f.weights).map((k) => `<span>${METRIC_LABELS[k] || (k === "ear" ? "귀" : k === "balance" ? "삼정 균형" : k)}</span>`).join("")}</div>
      <p>${f.classic}</p>
      <p>${Object.values(FORTUNE_LINES[f.id])[0].hi}</p>
      <p class="tipline">🍀 ${f.tip}</p>
    </article>`).join("");
  const tipKeys = ["mouthCorner", "browLen", "glabella", "noseWidth", "eyeOpen", "upper", "lipThick", "smile", "jawWidth"];
  $("#tipGrid").innerHTML = tipKeys.map((k) => `<div class="card"><h4>${METRIC_LABELS[k]}</h4><p><b>보완하고 싶다면</b> ${MAKEUP_TIPS[k].lo}</p><p><b>이미 좋다면</b> ${MAKEUP_TIPS[k].hi}</p></div>`).join("");
}

// ───────────────────────── 정적 탭: 인물 관상 ─────────────────────────
function renderFigures(filter = "all") {
  const list = FIGURES.filter((f) => filter === "all" || f.region === filter);
  $("#figGrid").innerHTML = list.map((f) => `
    <article class="card fig">
      <div class="fig-head"><div class="av" style="background:${f.color}22">${f.emoji}</div>
        <div><h3>${f.name}</h3><div class="meta">${f.era} · ${f.role}</div></div><span class="region">${f.region === "국내" ? "🇰🇷 국내" : "🌍 해외"}</span></div>
      <div class="shape">${FACE_SHAPES[f.shape].emoji} ${FACE_SHAPES[f.shape].alias} · ${FACE_SHAPES[f.shape].name}</div>
      <div class="tagrow">${f.parts.map((p) => `<span>${p}</span>`).join("")}</div>
      <p class="clip">${f.text}</p>
      <button class="more">전체 풀이 보기 ▾</button>
      <div class="fbars" style="margin-top:10px">${Object.entries(f.fortunes).map(([k, v]) => `<div><span>${k}</span><i><b style="width:${v}%;background:${f.color}"></b></i><b>${v}</b></div>`).join("")}</div>
    </article>`).join("");
  $$("#figGrid .more").forEach((b) => b.addEventListener("click", () => {
    const p = b.previousElementSibling; const open = p.classList.toggle("clip");
    b.textContent = open ? "전체 풀이 보기 ▾" : "접기 ▴";
  }));
}
$$("#figFilter .chip").forEach((c) => c.addEventListener("click", () => {
  $$("#figFilter .chip").forEach((x) => x.classList.toggle("active", x === c)); renderFigures(c.dataset.f);
}));

// ───────────────────────── 정적 탭: 3대 고전 ─────────────────────────
function renderBooks() {
  $("#bookGrid").innerHTML = BOOKS.map((b) => `
    <article class="card book" style="--c:${b.color}"><div class="spine">${b.hanja}</div>
      <h3>${b.name}</h3><div class="era">${b.era}</div><p>${b.desc}</p>
      <div class="tagrow">${b.key.map((k) => `<span>${k}</span>`).join("")}</div></article>`).join("");
}

// ───────────────────────── 오늘의 한마디 ─────────────────────────
const WORDS = [
  "웃는 얼굴에 침 못 뱉고, 웃는 얼굴엔 복이 붙는다. 오늘은 입꼬리를 2mm만 올려 보세요.",
  "인당(미간)을 펴면 운이 펴진다. 찡그림은 명궁을 막는 가장 큰 적이에요.",
  "코끝이 맑으면 재물이 맑다. 오늘은 코끝 유분 관리로 재백궁을 반짝이게!",
  "마흔이 넘으면 자기 얼굴에 책임을 져야 한다 — 관상은 습관이 만든 기록이에요.",
  "눈은 마음의 창. 오늘 만나는 사람의 눈을 3초만 더 바라봐 주세요.",
  "이마를 드러내면 관록궁이 열린다. 중요한 날엔 앞머리를 넘겨 보세요.",
  "좋은 관상은 좋은 잠에서 나온다. 와잠(눈 밑)이 빛나는 비결은 숙면!",
];
$("#todayWord").textContent = WORDS[new Date().getDate() % WORDS.length];

// ───────────────────────── 모바일 하단 광고 닫기 ─────────────────────────
$("#adClose").addEventListener("click", () => $("#adAnchor").remove());

// ───────────────────────── 시작 ─────────────────────────
renderEarChips();
renderPartsTab();
renderFortuneTab();
renderFigures();
renderBooks();
const initial = location.hash.slice(1);
if (["read", "parts", "fortune", "figures", "books"].includes(initial)) showTab(initial); else fillAds();
// 첫 화면이 뜬 뒤 백그라운드로 엔진 미리 로드
setTimeout(() => initAnalyzer().catch(() => {}), 1500);

// 테스트용 훅 (개발자 도구에서 window.__gwansang 사용 가능)
window.__gwansang = { state, runAnalysis, toCanvas };
