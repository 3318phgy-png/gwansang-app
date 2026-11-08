// =====================================================================
//  app.js — 화면 구성 · 카메라 · 업로드 · 결과 렌더링 · 이미지 저장
// =====================================================================
import { initAnalyzer, analyzeImage, quickCheck } from "./analyzer.js?v=17";
import { FaceLandmarker } from "../vendor/mediapipe/vision_bundle.mjs";
import { buildReading, level } from "./reading.js?v=17";
import {
  BOOKS, PALACES, FIVE_ORGANS, PART_READINGS, FORTUNES, FORTUNE_LINES, MAKEUP_TIPS,
  EAR_TYPES, FACE_SHAPES, METRIC_LABELS, AGE_GROUPS, GENDERS,
} from "./content.js?v=17";
import { FIGURES } from "./figures.js?v=17";
import { fillAds } from "./ads.js?v=17";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const state = { shot: null, liveTimer: 0, ear: "auto", analysis: null, reading: null, photo: null, layer: "portrait", stream: null, mirror: true, devices: [], devIdx: 0, deviceId: null, darkCount: 0 };

// ───────────────────────── 자동 업데이트 ─────────────────────────
// 사파리 탭을 오래 열어 두면 예전 앱이 계속 돌아갑니다.
// 새 버전이 올라와 있으면 스스로 화면을 새로 불러와 최신 버전으로 바꿉니다.
export const APP_VERSION = "17";
async function latestVersion() {
  try {
    const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()).v || null;
  } catch (e) { return null; }
}
async function updateIfNeeded() {
  const v = await latestVersion();
  if (!v || v === APP_VERSION) return false;
  let done = "";
  try { done = sessionStorage.getItem("gw_reloaded_for") || ""; } catch (e) { /* 무시 */ }
  if (done === v) return false; // 같은 버전으로 한 번만 시도 (무한 새로고침 방지)
  try { sessionStorage.setItem("gw_reloaded_for", v); } catch (e) { /* 무시 */ }
  toast("✨ 새 버전이 있어서 화면을 새로 불러올게요…", 2000);
  setTimeout(() => location.reload(), 600);
  return true;
}
updateIfNeeded();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") updateIfNeeded(); });

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

// ───────────────────────── 나이 · 성별 선택 ─────────────────────────
state.profile = { age: "", gender: "" };
try { Object.assign(state.profile, JSON.parse(localStorage.getItem("gw_profile") || "{}")); } catch (e) { /* 저장소 사용 불가 */ }
function renderProfileChips() {
  const order = ["20", "30", "40", "50", "60", ""];
  $("#ageChips").innerHTML = order.map((k) => `<button class="chip ${state.profile.age === k ? "active" : ""}" data-age="${k}">${AGE_GROUPS[k].label}</button>`).join("");
  $("#genderChips").innerHTML = ["f", "m", ""].map((k) => `<button class="chip ${state.profile.gender === k ? "active" : ""}" data-gender="${k}">${GENDERS[k]}</button>`).join("");
  const changed = () => {
    try { localStorage.setItem("gw_profile", JSON.stringify(state.profile)); } catch (e) { /* 무시 */ }
    renderProfileChips();
    if (state.analysis) { state.reading = buildReading(state.analysis, state.ear, state.profile); renderResult(false); toast("👤 나이·성별에 맞춰 다시 풀이했어요"); }
  };
  $$("#ageChips .chip").forEach((c) => c.addEventListener("click", () => { state.profile.age = c.dataset.age; changed(); }));
  $$("#genderChips .chip").forEach((c) => c.addEventListener("click", () => { state.profile.gender = c.dataset.gender; changed(); }));
}

// ───────────────────────── 귀 선택 ─────────────────────────
function renderEarChips() {
  $("#earChips").innerHTML = Object.entries(EAR_TYPES)
    .map(([k, v]) => `<button class="chip ${k === state.ear ? "active" : ""}" data-ear="${k}">${v.label}</button>`).join("");
  $$("#earChips .chip").forEach((c) => c.addEventListener("click", () => {
    state.ear = c.dataset.ear; renderEarChips();
    if (state.analysis) { state.reading = buildReading(state.analysis, state.ear, state.profile); renderResult(false); toast("👂 귀 정보를 반영해 다시 풀이했어요"); }
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
  img.onerror = () => showNotice("사진을 열 수 없어요", "이 사진 파일은 열리지 않아요. JPG나 PNG 사진으로 다시 골라 주세요.");
  img.src = url;
}

function toCanvas(src, w, h, mirror = false, max = 1400) {
  const s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * s); c.height = Math.round(h * s);
  const ctx = c.getContext("2d");
  if (mirror) { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

// ───────────────────────── 카메라 ─────────────────────────
// 흐름: 카메라 켜기 → (실시간으로 얼굴이 잘 보이는지 알려 줌) → 촬영 → 찍힌 사진 확인 → 관상 보기
$("#btnCamera").addEventListener("click", async () => { if (await updateIfNeeded()) return; ensureGender(openCamera); });

// 성별을 아직 안 고르셨으면 촬영·사진 불러오기 전에 한 번 여쭤봅니다.
let genderAsked = false;
function ensureGender(next) {
  if (state.profile.gender || genderAsked) return next();
  const m = $("#genderModal");
  m.classList.remove("hidden");
  $$("[data-pick]", m).forEach((b) => {
    b.onclick = () => {
      genderAsked = true;
      if (b.dataset.pick) {
        state.profile.gender = b.dataset.pick;
        try { localStorage.setItem("gw_profile", JSON.stringify(state.profile)); } catch (e) { /* 무시 */ }
        renderProfileChips();
      }
      m.classList.add("hidden");
      next();
    };
  });
}
$$(".pick-photo").forEach((l) => l.addEventListener("click", (e) => {
  if (state.profile.gender || genderAsked) return;
  e.preventDefault();
  ensureGender(() => $("#fileInput").click());
}));
$("#camCancel").addEventListener("click", closeCamera);
$("#camFlip").addEventListener("click", () => {
  if (state.devices.length < 2) return camStatus("이 기기에서 찾은 카메라가 하나뿐이에요.", "");
  state.userPicked = true;
  state.devIdx = (state.devIdx + 1) % state.devices.length;
  state.deviceId = state.devices[state.devIdx].deviceId;
  startStream();
});
$("#camShot").addEventListener("click", countdownShot);
$("#camRetake").addEventListener("click", retake);
$("#camUse").addEventListener("click", () => { const c = state.shot; closeCamera(); if (c) runAnalysis(c); });

const CAM_MSG = {
  wait: ["📷 카메라를 켜는 중이에요…", ""],
  black: ["📷 카메라 화면이 아직 까맣게 보여요. 잠시만 기다려 주세요. 계속 까맣다면 카메라를 쓰는 다른 프로그램(줌·페이스타임 등)을 닫아 주세요.", "bad"],
  none: ["😶 얼굴이 안 보여요. 노란 타원 안에 얼굴을 넣어 주세요.", "bad"],
  dark: ["💡 화면이 너무 어두워요. 밝은 곳으로 가거나 불을 켜 주세요.", "bad"],
  small: ["🔍 얼굴이 너무 작아요. 화면에 조금 더 가까이 와 주세요.", "bad"],
  off: ["↔️ 얼굴을 노란 타원 가운데로 맞춰 주세요.", "bad"],
  good: ["✅ 좋아요! 그대로 가만히 계세요. 곧 자동으로 찍어요.", "ok"],
  big: ["↩️ 얼굴이 너무 가까워요. 조금만 뒤로 가 주세요.", "bad"],
};
// key가 CAM_MSG에 있으면 그 문구, 없으면 key 자체를 문구로 사용. cls로 색을 지정할 수 있음.
function camStatus(key, cls) {
  const preset = CAM_MSG[key];
  const text = preset ? preset[0] : key;
  const c = cls !== undefined ? cls : preset ? preset[1] : "";
  const el = $("#camStatus"); el.textContent = text; el.className = "cam-status " + c;
  $("#camOval").setAttribute("stroke", c === "ok" ? "#34e08a" : c === "bad" ? "#ff6b8b" : "#ffd36e");
}

// 맥에서는 아이폰(연속성 카메라)·데스크 뷰·가상 카메라가 먼저 잡히기도 해요.
// 이름을 보고 '내장 얼굴 카메라'를 먼저 고르고, 얼굴이 잘 찍힌 카메라는 기억해 둡니다.
function camScore(label = "") {
  const l = label.toLowerCase();
  if (/iphone|continuity|desk view|데스크 뷰|virtual|obs|snap|camo|ndi|manycam|screen/.test(l)) return -3;
  if (/facetime|macbook|imac|studio display|built-in|builtin|integrated|내장|front|전면|user/.test(l)) return 3;
  if (/back|rear|후면|environment/.test(l)) return -1; // 휴대폰 뒷면 카메라(초광각·망원 포함)
  return 0;
}
// 휴대폰의 기술적인 카메라 이름(예: camera2 1, facing front)을 알기 쉬운 이름으로
function friendlyCamName(label) {
  const l = label.toLowerCase();
  if (/facing front|front camera|^front/.test(l)) return "앞면 카메라";
  if (/facing back|back camera|rear|^back/.test(l)) return "뒷면 카메라";
  return label;
}
function loadSavedCam() { try { return localStorage.getItem("gw_cam") || null; } catch (e) { return null; } }
function saveCam(id) { try { if (id) localStorage.setItem("gw_cam", id); } catch (e) { /* 무시 */ } }
function switchToNextCam(reason) {
  if (state.devices.length < 2) return false;
  state.triedCams = state.triedCams || new Set();
  state.triedCams.add(state.curCamId);
  const next = state.devices
    .filter((d) => !state.triedCams.has(d.deviceId))
    .sort((a, b) => camScore(b.label) - camScore(a.label))[0];
  if (!next) {
    // 모든 카메라를 다 봤으면, 가장 알맞은 카메라로 돌아가서 더는 바꾸지 않기
    state.searchDone = true;
    const best = [...state.devices].sort((a, b) => camScore(b.label) - camScore(a.label))[0];
    if (!best || best.deviceId === state.curCamId) return false;
    state.deviceId = best.deviceId;
    camStatus("📷 얼굴을 노란 타원 안에 맞춰 주세요.", "");
    startStream();
    return true;
  }
  state.deviceId = next.deviceId;
  camStatus(reason || "🔄 얼굴이 보이는 카메라를 찾는 중이에요… 잠시만요.", "");
  startStream();
  return true;
}

async function openCamera() {
  state.userPicked = false;
  state.searchDone = false;
  state.triedCams = new Set();
  if (!navigator.mediaDevices?.getUserMedia) {
    return showNotice("카메라를 쓸 수 없어요", "이 브라우저에서는 카메라를 쓸 수 없어요. 대신 '다른 사진 불러오기'를 눌러 휴대폰이나 컴퓨터에 있는 얼굴 사진을 골라 주세요.");
  }
  hideNotice();
  $("#camModal").classList.remove("hidden");
  showShootMode();
  initAnalyzer().catch(() => {}); // 카메라가 켜지는 동안 관상 엔진도 미리 준비
  state.deviceId = await pickInitialCam();
  await startStream();
}
// 켜기 전에 카메라 목록을 보고 고릅니다: ① 맥·노트북 내장 카메라 → ② 지난번에 얼굴이 잘 찍힌 카메라 → ③ 아이폰·가상 카메라가 아닌 것
async function pickInitialCam() {
  let devs = [];
  try { devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput" && d.deviceId); } catch (e) { /* 무시 */ }
  const saved = loadSavedCam();
  if (devs.some((d) => d.label)) {
    const best = [...devs].sort((a, b) => camScore(b.label) - camScore(a.label))[0];
    if (best && camScore(best.label) > 0) return best.deviceId;
    const sv = devs.find((d) => d.deviceId === saved && camScore(d.label) >= 0);
    if (sv) return sv.deviceId;
    const ok = devs.find((d) => camScore(d.label) >= 0);
    if (ok) return ok.deviceId;
  } else if (saved && devs.some((d) => d.deviceId === saved)) return saved;
  // 이름을 알 수 없을 때: 휴대폰은 '앞면 카메라'를 달라고 하고(목록 첫 번째가 뒷면인 경우가 많음),
  // 컴퓨터는 목록의 첫 번째(대개 내장 카메라)부터
  const isPhone = /iphone|ipad|android|mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(navigator.userAgent));
  if (isPhone) return null;
  return devs.length > 1 ? devs[0].deviceId : null;
}
function showShootMode() {
  state.shot = null;
  $("#camPreview").classList.add("hidden");
  $("#camCtrlShoot").classList.remove("hidden");
  $("#camCtrlConfirm").classList.add("hidden");
  $("#camUse").classList.remove("hidden");
  $("#camUse").textContent = "✅ 이 사진으로 보기";
  clearTimeout(state.goTimer);
  state.goodCount = 0;
  const bar = $("#camAutoBar"); if (bar) bar.style.width = "0";
}
async function startStream() {
  stopStream();
  $("#camShot").disabled = true;
  camStatus("wait");
  state.darkCount = 0; state.goodCount = 0; state.noFaceCount = 0; state.camHadFace = false;
  const size = { width: { ideal: 1280 }, height: { ideal: 960 } };
  const video = state.deviceId ? { deviceId: { exact: state.deviceId }, ...size } : { facingMode: "user", ...size };
  try {
    try { state.stream = await navigator.mediaDevices.getUserMedia({ video, audio: false }); }
    catch (e1) {
      if (e1.name === "NotAllowedError") throw e1;
      // 원하는 카메라를 못 열면 아무 카메라나 열어 봅니다
      state.deviceId = null;
      state.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    // 이 컴퓨터/휴대폰의 카메라 목록 (맥은 아이폰 연속성 카메라·가상 카메라가 잡히기도 해요)
    const track = state.stream.getVideoTracks()[0];
    const set = track.getSettings ? track.getSettings() : {};
    state.mirror = set.facingMode !== "environment";
    try {
      state.devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
      state.devIdx = Math.max(0, state.devices.findIndex((d) => d.deviceId === set.deviceId));
    } catch (e2) { state.devices = []; }
    const flipWord = window.innerWidth < 480 ? "🔄 바꾸기" : "🔄 카메라 바꾸기";
    $("#camFlip").textContent = state.devices.length > 1 ? `${flipWord} (${state.devIdx + 1}/${state.devices.length})` : flipWord;
    state.curCamId = set.deviceId || "";
    { const d = state.devices.find((x) => x.deviceId === state.curCamId); $("#camName").textContent = (d && d.label ? "📷 " + friendlyCamName(d.label) + " · " : "") + "v" + APP_VERSION; }
    const cur = state.devices[state.devIdx];
    const best = [...state.devices].sort((a, b) => camScore(b.label) - camScore(a.label))[0];
    if (!state.userPicked && cur && best && best.deviceId !== cur.deviceId && camScore(best.label) > camScore(cur.label)
        && !(state.triedCams && state.triedCams.has(best.deviceId)) && state.deviceId !== cur.deviceId) {
      state.triedCams = state.triedCams || new Set(); state.triedCams.add(cur.deviceId);
      state.deviceId = best.deviceId;
      return startStream();
    }
  } catch (e) {
    closeCamera();
    return showNotice("카메라 사용을 허락해 주세요",
      "카메라가 꺼져 있거나 사용 허락이 안 되어 있어요. 주소창의 카메라 표시를 누르거나(사파리: 메뉴 '사파리 → 이 웹 사이트에 대한 설정 → 카메라') '허용'으로 바꾼 뒤 다시 찍어 주세요. 아니면 '다른 사진 불러오기'로 얼굴 사진을 골라도 돼요.");
  }
  const v = $("#camVideo");
  v.setAttribute("playsinline", ""); v.muted = true;
  v.srcObject = state.stream;
  v.classList.toggle("rear", !state.mirror);
  try { await v.play(); } catch (e) { /* 일부 브라우저는 자동 재생 */ }
  // 실제 화면이 들어올 때까지 기다리기 (사파리는 처음 1~2초 까만 화면)
  const t0 = Date.now();
  const myStream = state.stream;
  while (state.stream === myStream && (v.videoWidth === 0 || v.readyState < 2)) {
    if (Date.now() - t0 > 4000) {
      if (!state.userPicked && switchToNextCam()) return;
      camStatus("black");
    }
    await sleep(150);
  }
  if (state.stream !== myStream) return;
  $("#camShot").disabled = false;
  liveCheck();
}
function stopStream() {
  state.stream?.getTracks().forEach((t) => t.stop()); state.stream = null;
  clearTimeout(state.liveTimer);
}
function closeCamera() { clearTimeout(state.goTimer); stopStream(); $("#camModal").classList.add("hidden"); $("#camCount").textContent = ""; counting = false; }

// 0.6초마다 카메라 화면을 살펴서 얼굴이 잘 보이는지 알려 줍니다.
async function liveCheck() {
  clearTimeout(state.liveTimer);
  const v = $("#camVideo");
  if (!state.stream || state.shot) return;
  if (!counting) {
    try {
      const small = toCanvas(v, v.videoWidth, v.videoHeight, state.mirror, 360);
      const r = await quickCheck(small);
      if (!state.stream || state.shot || counting) return;
      // 화면이 계속 새까마면: 카메라 가리개, 다른 카메라(연속성 카메라·가상 카메라) 선택 문제
      state.darkCount = r.bright < 14 ? (state.darkCount || 0) + 1 : 0;
      if (state.darkCount >= 4 && !state.userPicked && switchToNextCam()) return;
      // 아이폰·가상 카메라처럼 얼굴이 안 보일 법한 카메라에서 4초 넘게 얼굴이 없으면 다음 카메라로
      state.noFaceCount = !r.ok && r.reason === "none" ? (state.noFaceCount || 0) + 1 : 0;
      const curLabel = (state.devices.find((d) => d.deviceId === state.curCamId) || {}).label;
      const savedHere = state.curCamId && state.curCamId === loadSavedCam() && camScore(curLabel) >= 0;
      const searching = !state.userPicked && !state.camHadFace && !state.searchDone && state.devices.length > 1 && !savedHere && camScore(curLabel) <= 0;
      if (searching && state.noFaceCount >= (camScore(curLabel) < 0 ? 2 : 3)
          && switchToNextCam("🔄 이 카메라에는 얼굴이 안 보여서 다른 카메라로 바꿔 볼게요…")) return;
      if (r.ok) { state.camHadFace = true; if (camScore(curLabel) >= 0 || state.userPicked) saveCam(state.curCamId); }
      // 맞는 카메라를 찾는 중에는 '얼굴이 안 보여요' 대신 '찾는 중'이라고 안내
      if (searching && !r.ok && r.reason === "none") { camStatus("🔄 얼굴이 보이는 카메라를 찾는 중이에요… 잠시만요.", ""); state.liveTimer = setTimeout(liveCheck, 500); return; }
      if (state.darkCount >= 4) {
        camStatus(state.devices.length > 1
          ? `⬛ 카메라 화면이 까매요. 아래 '카메라 바꾸기'를 눌러 보세요. (이 컴퓨터에 카메라가 ${state.devices.length}개 있어요)`
          : "⬛ 카메라 화면이 까매요. 카메라 가리개가 닫혀 있거나, 줌·페이스타임 같은 다른 프로그램이 카메라를 쓰고 있을 수 있어요. 그 프로그램을 닫고 '취소' 후 다시 눌러 주세요.", "bad");
      } else camStatus(r.ok ? (r.reason === "dark" ? "dark" : "good") : r.reason);
      // 얼굴이 잘 보이는 상태가 약 2초 이어지면 자동으로 촬영
      state.goodCount = r.ok && r.reason === "good" ? (state.goodCount || 0) + 1 : 0;
      $("#camAutoBar").style.width = Math.min(100, state.goodCount / 3 * 100) + "%";
      if (state.goodCount >= 3) { state.goodCount = 0; $("#camAutoBar").style.width = "0"; countdownShot(); return; }
    } catch (e) { camStatus("📷 카메라 준비 완료! 얼굴을 노란 타원 안에 맞춰 주세요.", ""); }
  }
  state.liveTimer = setTimeout(liveCheck, 600);
}

let counting = false;
async function countdownShot() {
  if (counting || !state.stream) return; counting = true;
  const el = $("#camCount");
  camStatus("😊 움직이지 마세요! 곧 찍습니다", "");
  for (const n of [3, 2, 1]) { el.textContent = n; await sleep(650); if (!state.stream) { counting = false; el.textContent = ""; return; } }
  el.textContent = "";
  const v = $("#camVideo");
  const flash = document.createElement("div"); flash.className = "flash"; document.body.appendChild(flash); setTimeout(() => flash.remove(), 500);
  // 전면 카메라는 사용자가 거울처럼 보던 모습 그대로 저장
  const c = toCanvas(v, v.videoWidth, v.videoHeight, state.mirror);
  counting = false;
  state.shot = c;
  clearTimeout(state.liveTimer);
  // 찍힌 사진을 화면에 그대로 보여 주고 확인받기
  const pv = $("#camPreview"); pv.width = c.width; pv.height = c.height; pv.getContext("2d").drawImage(c, 0, 0);
  pv.classList.remove("hidden");
  $("#camCtrlShoot").classList.add("hidden");
  $("#camCtrlConfirm").classList.remove("hidden");
  camStatus("🔎 찍힌 사진을 확인하는 중…", "");
  try {
    const r = await quickCheck(toCanvas(c, c.width, c.height, false, 480));
    if (r.ok) {
      camStatus(r.reason === "dark"
        ? "📸 찍혔어요! 조금 어둡지만 볼 수 있어요. 아래 초록 버튼 '이 사진으로 보기'를 눌러 주세요."
        : "📸 잘 찍혔어요! 잠시 뒤 자동으로 관상을 봅니다.", "ok");
      autoGo();
    } else {
      const why = { dark: " (너무 어두워요)", small: " (얼굴이 너무 작아요)", off: " (얼굴이 가운데가 아니에요)" }[r.reason] || "";
      camStatus("😢 이 사진에서는 얼굴이 잘 안 보여요" + why + ". '다시 찍기'를 눌러 주세요.", "bad");
      $("#camUse").classList.add("hidden");
    }
  } catch (e) { camStatus("📸 찍혔어요! 사진이 괜찮으면 '이 사진으로 보기'를 눌러 주세요.", ""); }
}
function autoGo() {
  clearTimeout(state.goTimer);
  let n = 3;
  const btn = $("#camUse");
  const tick = () => {
    if (!state.shot || $("#camModal").classList.contains("hidden")) return;
    if (n === 0) { btn.click(); return; }
    btn.textContent = `✅ ${n}초 뒤 관상 보기 (바로 보기)`;
    n--; state.goTimer = setTimeout(tick, 1000);
  };
  tick();
}
async function retake() {
  clearTimeout(state.goTimer);
  showShootMode();
  if (!state.stream) await startStream(); else { camStatus("wait"); liveCheck(); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────── 안내 카드 (사라지지 않는 안내) ─────────────────────────
function showNotice(title, text, photo) {
  $("#noticeTitle").textContent = title;
  $("#noticeText").textContent = text;
  const nc = $("#noticePhoto");
  if (photo) { nc.width = photo.width; nc.height = photo.height; nc.getContext("2d").drawImage(photo, 0, 0); nc.classList.remove("hidden"); }
  else nc.classList.add("hidden");
  $("#notice").classList.remove("hidden");
  $("#notice").scrollIntoView({ behavior: "smooth", block: "center" });
}
function hideNotice() { $("#notice").classList.add("hidden"); }
$("#noticeCamera").addEventListener("click", openCamera);

// ───────────────────────── 분석 ─────────────────────────
async function runAnalysis(canvas) {
  showTab("read");
  hideNotice();
  if (!canvas || !canvas.width || !canvas.height) {
    return showNotice("사진이 제대로 찍히지 않았어요", "카메라 화면이 아직 준비되지 않았을 때 찍힌 것 같아요. '다시 찍기'를 눌러 주세요.");
  }
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
      return showNotice("얼굴을 찾지 못했어요 😢",
        "사진에서 얼굴이 보이지 않아요. 옆의 사진을 확인해 보세요. 화면이 까맣거나 어둡다면 밝은 곳에서, 얼굴이 작다면 가까이에서, 정면을 보고 다시 찍어 주세요. 안경과 마스크는 벗고, 앞머리는 넘기면 더 좋아요.", canvas);
    }
    drawOverlay(sc, canvas, result.landmarks, "mesh", false);
    await sleep(600);
    state.analysis = result;
    state.reading = buildReading(result, state.ear, state.profile);
    box.classList.add("hidden");
    renderResult(true);
    if (result.quality.yaw > 0.12) toast("📐 고개가 조금 돌아가 있어요. 정면 사진이면 더 정확해요!", 6000);
  } catch (err) {
    console.error(err);
    clearInterval(tick); box.classList.add("hidden");
    showNotice("관상 엔진을 불러오지 못했어요",
      "인터넷 연결이 느리거나 끊겼을 수 있어요. 화면을 새로고침(맥: ⌘+R, 윈도우: F5)한 뒤 다시 해 주세요. 계속 안 되면 크롬이나 사파리 최신 버전으로 열어 주세요. (오류: " + (err?.message || err) + ")", canvas);
  }
}

// ───────────────────────── 오버레이 그리기 ─────────────────────────
const PALACE_POINTS = {
  "관록궁": 151, "명궁": 9, "질액궁": 168, "재백궁": 4, "형제궁": 105, "전택궁": 223,
  "자녀궁": 230, "처첩궁": 446, "노복궁": 172, "천이궁": 54, "복덕궁": 333, "부모궁": 67,
};
function cropBox(lm, W, H, loose = true) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of lm) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const fh = y1 - y0, fw = x1 - x0;
  // 초상화처럼: 머리카락부터 턱 아래까지 여유 있게 (4:5 비율)
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 - fh * (loose ? 0.1 : 0.05);
  let h = fh * (loose ? 2.0 : 1.55), w = h * 0.8;
  if (w < fw * 1.7) { w = fw * 1.7; h = w / 0.8; }
  w = Math.min(w, W); h = Math.min(h, H);
  let x = cx - w / 2, y = cy - h / 2;
  x = Math.max(0, Math.min(W - w, x)); y = Math.max(0, Math.min(H - h, y));
  return { x, y, w, h };
}

// 사진을 '사진관 초상화'처럼: 살짝 밝고 따뜻하게, 부드러운 소프트 포커스, 가장자리는 은은하게 어둡게
function paintPortrait(ctx, photo, b, W, H) {
  ctx.save();
  ctx.filter = "brightness(1.07) contrast(1.02) saturate(1.06)";
  ctx.drawImage(photo, b.x, b.y, b.w, b.h, 0, 0, W, H);
  // 소프트 포커스 (피부를 살짝 매끈하게)
  ctx.globalAlpha = 0.22;
  ctx.filter = `blur(${Math.round(W / 160)}px) brightness(1.08)`;
  ctx.drawImage(photo, b.x, b.y, b.w, b.h, 0, 0, W, H);
  ctx.restore();
  // 따뜻한 빛
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(255, 196, 140, 0.18)";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // 비네팅 (가장자리 은은하게)
  const g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  g.addColorStop(0, "rgba(30, 18, 60, 0)");
  g.addColorStop(1, "rgba(30, 18, 60, 0.45)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

const GOLD = "rgba(255, 222, 150, 0.9)";
function drawOverlay(target, photo, lm, layer, crop = true) {
  const b = crop ? cropBox(lm, photo.width, photo.height) : { x: 0, y: 0, w: photo.width, h: photo.height };
  const scale = crop ? 900 / b.w : 1;
  target.width = Math.round(b.w * scale); target.height = Math.round(b.h * scale);
  const ctx = target.getContext("2d");
  const W = target.width, H = target.height;
  if (crop) paintPortrait(ctx, photo, b, W, H);
  else ctx.drawImage(photo, 0, 0);
  const P = (i) => ({ x: (lm[i].x - b.x) * scale, y: (lm[i].y - b.y) * scale });
  const unit = W / 300;
  if (layer === "portrait" || layer === "none") return;

  if (layer === "mesh") {
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 2 * unit;
    // 얼굴 윤곽: 아주 옅은 점선
    ctx.setLineDash([1.5 * unit, 3 * unit]); ctx.lineWidth = 0.9 * unit; ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    for (const c of FaceLandmarker.FACE_LANDMARKS_FACE_OVAL) { const a = P(c.start), e = P(c.end); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); }
    ctx.stroke(); ctx.setLineDash([]);
    // 눈썹 · 눈 · 입: 가는 금빛 선
    ctx.lineWidth = 1.1 * unit; ctx.strokeStyle = GOLD;
    for (const conns of [FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, FaceLandmarker.FACE_LANDMARKS_LIPS]) {
      ctx.beginPath();
      for (const c of conns) { const a = P(c.start), e = P(c.end); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); }
      ctx.stroke();
    }
    // 코: 아주 옅게
    ctx.strokeStyle = "rgba(255,222,150,.55)"; ctx.lineWidth = 0.9 * unit; ctx.beginPath();
    [168, 6, 197, 195, 5, 4].forEach((i, k) => { const p = P(i); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
    ctx.stroke();
    // 측정한 자리: 작은 빛나는 점
    ctx.shadowBlur = 4 * unit; ctx.shadowColor = "rgba(255,210,120,.9)";
    for (const i of [70, 107, 336, 300, 33, 133, 362, 263, 129, 358, 61, 291, 0, 17, 152]) {
      const p = P(i);
      ctx.fillStyle = "#fff6dc"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * unit, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // 삼정: 얼굴 옆에 세로 눈금자 (얼굴을 가로지르지 않게)
    const rx = Math.min(W - 40 * unit, P(454).x + 12 * unit);
    const ys = [10, 9, 2, 152].map((i) => P(i).y);
    ctx.save();
    ctx.strokeStyle = "rgba(255,222,150,.85)"; ctx.lineWidth = 1.2 * unit;
    ctx.beginPath(); ctx.moveTo(rx, ys[0]); ctx.lineTo(rx, ys[3]); ctx.stroke();
    ys.forEach((y) => { ctx.beginPath(); ctx.moveTo(rx - 4 * unit, y); ctx.lineTo(rx + 4 * unit, y); ctx.stroke(); });
    ctx.font = `700 ${9 * unit}px "Gowun Batang", serif`;
    ["상정", "중정", "하정"].forEach((label, k) => tag(ctx, label, rx + 6 * unit, (ys[k] + ys[k + 1]) / 2, "rgba(43,29,92,.72)", "#ffe3a3", unit, "left"));
    ctx.restore();
  }
  if (layer === "palace") {
    ctx.save();
    ctx.font = `700 ${8.5 * unit}px "Gowun Batang", serif`;
    for (const [name, i] of Object.entries(PALACE_POINTS)) {
      const p = P(i);
      ctx.shadowColor = "rgba(255,210,120,.9)"; ctx.shadowBlur = 4 * unit;
      ctx.fillStyle = "#fff6dc"; ctx.beginPath(); ctx.arc(p.x, p.y, 2 * unit, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      tag(ctx, name, p.x, p.y - 4 * unit, "rgba(43,29,92,.62)", "#ffe3a3", unit, "center", true);
    }
    ctx.restore();
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
  const labels = fortunes.map((f, i) => { const [x, y] = pt(i, 124); return `<text class="axis-label" x="${x}" y="${y + 4}" text-anchor="middle">${f.emoji}${f.name.replace("·합격", "").replace("·인복", "").replace("·부부", "")}</text>`; }).join("");
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
        <div><b>${R.tipLabel}</b>${esc(f.text.makeup || MAKEUP_TIPS.smile.hi)}</div>
      </div>
    </article>${i === 3 ? `<div class="ad-slot ad-infeed" data-ad="infeed"></div>` : ""}`).join("");

  el.innerHTML = `
    <div class="res-top">
      <div class="card photo-card reveal">
        <div class="portrait-frame"><canvas id="resCanvas"></canvas><span class="corner tl">✦</span><span class="corner tr">✦</span></div>
        <p class="portrait-caption">✦ 관상도사가 읽은 얼굴 ✦</p>
        <div class="layer-toggle">
          <button class="chip ${state.layer === "portrait" ? "active" : ""}" data-layer="portrait">✨ 초상화</button>
          <button class="chip ${state.layer === "mesh" ? "active" : ""}" data-layer="mesh">📐 관상 실측</button>
          <button class="chip ${state.layer === "palace" ? "active" : ""}" data-layer="palace">🗺️ 십이궁</button>
        </div>
      </div>
      <div class="card hook-card reveal">
        <p class="eyebrow" style="color:#ffc94d">관상도사의 첫마디</p>
        <p class="hook-line">“${esc(R.hook)}”</p>
        <span class="shape-badge">${R.shape.emoji} ${R.shape.alias} · ${R.shape.name}</span>${R.profileLabel ? `<span class="profile-tag">👤 ${esc(R.profileLabel)}</span>` : ""}
        <div class="total">${ring(R.total)}<div><b style="font-size:18px">관상 종합 ${R.total}점</b><p>${R.fortunes.length}가지 운의 평균이에요. 가장 강한 운은 <b>${R.ranked[0].name}</b>!</p></div></div>
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
      <div class="match-toggle">
        <button class="chip ${R.gender === "m" ? "active" : ""}" data-mg="m">👨 남성 인물 중에서</button>
        <button class="chip ${R.gender === "f" ? "active" : ""}" data-mg="f">👩 여성 인물 중에서</button>
      </div>
      <div class="match-grid">${R.figures.map(({ fig, pct }) => `
        <div class="match"><div class="av" style="background:${fig.color}">${fig.emoji}</div><b>${fig.name}</b><div class="pct">${pct}%</div><p>${FACE_SHAPES[fig.shape].alias} · ${fig.parts[0]}</p></div>`).join("")}</div>
      <p class="note">${R.gender ? `같은 성별(${R.gender === "m" ? "남성" : "여성"})의 인물 중에서 골랐어요. ` : "위에서 성별을 고르면 같은 성별의 인물 중에서 골라 드려요. "}얼굴 비율의 '관상학적 경향'이 얼마나 비슷한지 비교한 재미용 매칭이에요. <a href="#figures" data-goto="figures">인물 관상 전체 보기 →</a></p>
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
  $$("[data-mg]", el).forEach((b) => b.addEventListener("click", () => {
    state.profile.gender = b.dataset.mg;
    try { localStorage.setItem("gw_profile", JSON.stringify(state.profile)); } catch (e) { /* 무시 */ }
    renderProfileChips();
    state.reading = buildReading(state.analysis, state.ear, state.profile);
    const y = window.scrollY; renderResult(false); window.scrollTo(0, y);
    toast(b.dataset.mg === "m" ? "👨 남성 인물 중에서 다시 찾았어요" : "👩 여성 인물 중에서 다시 찾았어요");
  }));
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
  const pc = document.createElement("canvas"); drawOverlay(pc, state.photo, A.landmarks, "portrait");
  const pw = 440, ph = pw * (pc.height / pc.width), px = 70, py = 170;
  const arch = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.closePath(); };
  ctx.save(); arch(px, py, pw, ph, 28); ctx.clip(); ctx.drawImage(pc, px, py, pw, ph); ctx.restore();
  const gg = ctx.createLinearGradient(px, py, px + pw, py + ph); gg.addColorStop(0, "#fff1c4"); gg.addColorStop(0.5, "#e7b85a"); gg.addColorStop(1, "#fff1c4");
  ctx.strokeStyle = gg; ctx.lineWidth = 8; arch(px, py, pw, ph, 28); ctx.stroke();
  ctx.strokeStyle = "rgba(255,241,196,.55)"; ctx.lineWidth = 2; arch(px - 12, py - 12, pw + 24, ph + 24, 36); ctx.stroke();

  ctx.fillStyle = "#ffc94d"; ctx.font = '400 64px "Black Han Sans", sans-serif'; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillText("관상도사", 70, 120);
  ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = '500 26px "Noto Sans KR", sans-serif';
  ctx.fillText("마의상법 · 유장상법 · 신상전편 실측 관상", 330, 116);

  // 오른쪽: 얼굴형 + 종합점수
  const rx = 560;
  ctx.fillStyle = "#fff"; ctx.font = '700 34px "Noto Sans KR", sans-serif';
  ctx.fillText(`${R.shape.emoji} ${R.shape.alias}`, rx, 220);
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = '500 26px "Noto Sans KR", sans-serif'; ctx.fillText(R.shape.name + (R.profileLabel ? " · " + R.profileLabel : ""), rx, 260);
  ctx.fillStyle = "#ffc94d"; ctx.font = '400 150px "Black Han Sans", sans-serif'; ctx.fillText(String(R.total), rx, 420);
  ctx.fillStyle = "#fff"; ctx.font = '700 30px "Noto Sans KR", sans-serif'; ctx.fillText("관상 종합 점수", rx + 4, 470);

  // 운세 바
  let y = 520;
  for (const f of R.fortunes) {
    ctx.fillStyle = "#fff"; ctx.font = '700 26px "Noto Sans KR", sans-serif'; ctx.fillText(`${f.emoji} ${f.name}`, rx, y);
    ctx.textAlign = "right"; ctx.fillText(String(f.score), W - 70, y); ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.18)"; roundRect(ctx, rx, y + 12, W - 70 - rx, 12, 6); ctx.fill();
    ctx.fillStyle = f.color; roundRect(ctx, rx, y + 12, (W - 70 - rx) * f.score / 100, 12, 6); ctx.fill();
    y += R.fortunes.length > 9 ? 46 : R.fortunes.length > 8 ? 50 : 56;
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
      <p style="margin:10px 0 0"><a href="/fortune/${f.id}" style="color:var(--violet);font-weight:700;text-decoration:none">${f.name} 관상 자세히 보기 →</a></p>
    </article>`).join("");
  const tipKeys = ["mouthCorner", "browLen", "glabella", "noseWidth", "eyeOpen", "upper", "lipThick", "smile", "jawWidth"];
  $("#tipGrid").innerHTML = tipKeys.map((k) => `<div class="card"><h4>${METRIC_LABELS[k]}</h4><p><b>보완하고 싶다면</b> ${MAKEUP_TIPS[k].lo}</p><p><b>이미 좋다면</b> ${MAKEUP_TIPS[k].hi}</p></div>`).join("");
}

// ───────────────────────── 정적 탭: 인물 관상 ─────────────────────────
const figSel = { region: "all", gender: "" };
function renderFigures() {
  const list = FIGURES.filter((f) => (figSel.region === "all" || f.region === figSel.region) && (!figSel.gender || f.gender === figSel.gender));
  $("#figCount").textContent = `${list.length}명`;
  $("#figGrid").innerHTML = list.map((f) => `
    <article class="card fig">
      <div class="fig-head"><div class="av" style="background:${f.color}22">${f.emoji}</div>
        <div><h3>${f.name}</h3><div class="meta">${f.era} · ${f.role}</div></div><span class="region">${f.region === "국내" ? "🇰🇷 국내" : "🌍 해외"}</span></div>
      <div class="shape">${FACE_SHAPES[f.shape].emoji} ${FACE_SHAPES[f.shape].alias} · ${FACE_SHAPES[f.shape].name}</div>
      <div class="tagrow">${f.parts.map((p) => `<span>${p}</span>`).join("")}</div>
      <p class="clip">${f.text}</p>
      <button class="more">전체 풀이 보기 ▾</button> <a href="/figures/${f.id}" style="margin-left:10px;color:var(--violet);font-weight:700;font-size:13.5px;text-decoration:none">인물 페이지 →</a>
      <div class="fbars" style="margin-top:10px">${Object.entries(f.fortunes).map(([k, v]) => `<div><span>${k}</span><i><b style="width:${v}%;background:${f.color}"></b></i><b>${v}</b></div>`).join("")}</div>
    </article>`).join("");
  $$("#figGrid .more").forEach((b) => b.addEventListener("click", () => {
    const p = b.previousElementSibling; const open = p.classList.toggle("clip");
    b.textContent = open ? "전체 풀이 보기 ▾" : "접기 ▴";
  }));
}
$$("#figFilter .chip").forEach((c) => c.addEventListener("click", () => {
  $$("#figFilter .chip").forEach((x) => x.classList.toggle("active", x === c)); figSel.region = c.dataset.f; renderFigures();
}));
$$("#figGender .chip").forEach((c) => c.addEventListener("click", () => {
  $$("#figGender .chip").forEach((x) => x.classList.toggle("active", x === c)); figSel.gender = c.dataset.g; renderFigures();
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
renderProfileChips();
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
