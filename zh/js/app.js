// =====================================================================
//  app.js — 界面 · 相机 · 上传 · 结果显示 · 分享图片（简体中文版）
// =====================================================================
import { initAnalyzer, analyzeImage, quickCheck } from "./analyzer.js";
import { FaceLandmarker } from "../../vendor/mediapipe/vision_bundle.mjs";
import { buildReading } from "./reading.js";
import {
  BOOKS, PALACES, FIVE_ORGANS, PART_READINGS, FORTUNES, FORTUNE_LINES, MAKEUP_TIPS,
  EAR_TYPES, FACE_SHAPES, METRIC_LABELS, AGE_GROUPS, GENDERS, GROOMING_TIPS,
} from "./content.js";
import { FIGURES } from "./figures.js";
import { fillAds } from "../../js/ads.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SITE = "MyFaceFate";
const HOST = "myfacefate.com";
const PAGE_URL = `https://${HOST}/zh/`;

const state = { shot: null, liveTimer: 0, ear: "auto", analysis: null, reading: null, photo: null, layer: "mesh", stream: null, mirror: true, devices: [], devIdx: 0, deviceId: null, darkCount: 0, profile: { age: "", gender: "" } };
try { Object.assign(state.profile, JSON.parse(localStorage.getItem("mff_profile") || "{}")); } catch (e) { /* storage unavailable */ }

// ───────────────────────── Tabs ─────────────────────────
function showTab(id) {
  const changed = !$(`#panel-${id}`).classList.contains("active");
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
  $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${id}`));
  history.replaceState(null, "", `#${id}`);
  if (changed) window.scrollTo({ top: 0, behavior: "smooth" });
  fillAds();
}
$$("[data-tab]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); showTab(b.dataset.tab); }));

// ───────────────────────── Toast ─────────────────────────
let toastTimer;
function toast(msg, ms = 3000) {
  const t = $("#toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add("hidden"), ms);
}

// ───────────────────────── Ear picker ─────────────────────────
// ───────────────────────── Gender & age picker ─────────────────────────
function renderProfileChips() {
  $("#ageChips").innerHTML = ["20", "30", "40", "50", "60", ""].map((k) => `<button class="chip ${state.profile.age === k ? "active" : ""}" data-age="${k}">${AGE_GROUPS[k].label}</button>`).join("");
  $("#genderChips").innerHTML = ["f", "m", ""].map((k) => `<button class="chip ${state.profile.gender === k ? "active" : ""}" data-gender="${k}">${{ f: "👩 ", m: "👨 ", "": "" }[k]}${GENDERS[k]}</button>`).join("");
  const changed = () => {
    try { localStorage.setItem("mff_profile", JSON.stringify(state.profile)); } catch (e) { /* ignore */ }
    renderProfileChips();
    if (state.analysis) { state.reading = buildReading(state.analysis, state.ear, state.profile); renderResult(false); toast("👤 已根据你的性别和年龄更新解读"); }
  };
  $$("#ageChips .chip").forEach((c) => c.addEventListener("click", () => { state.profile.age = c.dataset.age; changed(); }));
  $$("#genderChips .chip").forEach((c) => c.addEventListener("click", () => { state.profile.gender = c.dataset.gender; changed(); }));
}

function renderEarChips() {
  $("#earChips").innerHTML = Object.entries(EAR_TYPES)
    .map(([k, v]) => `<button class="chip ${k === state.ear ? "active" : ""}" data-ear="${k}">${v.label}</button>`).join("");
  $$("#earChips .chip").forEach((c) => c.addEventListener("click", () => {
    state.ear = c.dataset.ear; renderEarChips();
    if (state.analysis) { state.reading = buildReading(state.analysis, state.ear, state.profile); renderResult(false); toast("👂 已根据你的耳形更新解读"); }
  }));
}

// ───────────────────────── Image input ─────────────────────────
$("#fileInput").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = ""; });
const dz = $("#dropZone");
["dragenter", "dragover"].forEach((ev) => document.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => document.addEventListener(ev, (e) => { e.preventDefault(); if (ev === "drop" || e.target === dz) dz.classList.remove("over"); }));
document.addEventListener("drop", (e) => { const f = e.dataTransfer?.files?.[0]; if (f && f.type.startsWith("image/")) { showTab("read"); loadFile(f); } });
document.addEventListener("paste", (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/")); if (f) loadFile(f); });

function loadFile(file) {
  if (!file.type.startsWith("image/")) return toast("请选择图片文件");
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); runAnalysis(toCanvas(img, img.naturalWidth, img.naturalHeight)); };
  img.onerror = () => showNotice("无法打开这张照片", "这个文件打不开。请改选 JPG 或 PNG 格式的照片。");
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

// ───────────────────────── Camera ─────────────────────────
// Flow: open camera → live face check → AUTO-SHOOT when the face is steady → confirm → AUTO-READ
$("#btnCamera").addEventListener("click", () => ensureGender(openCamera));

// If gender hasn't been picked yet, ask once before shooting / uploading.
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
        try { localStorage.setItem("mff_profile", JSON.stringify(state.profile)); } catch (e) { /* ignore */ }
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
  if (state.devices.length < 2) return camStatus("这台设备上只找到一个摄像头。", "");
  state.userPicked = true;
  state.devIdx = (state.devIdx + 1) % state.devices.length;
  state.deviceId = state.devices[state.devIdx].deviceId;
  startStream();
});
$("#camShot").addEventListener("click", countdownShot);
$("#camRetake").addEventListener("click", retake);
$("#camUse").addEventListener("click", () => { const c = state.shot; closeCamera(); if (c) runAnalysis(c); });

const CAM_MSG = {
  wait: ["📷 正在启动摄像头…", ""],
  black: ["📷 画面还是黑的，请稍等——如果一直黑屏，请关闭其他正在使用摄像头的应用（Zoom、微信视频等）。", "bad"],
  none: ["😶 还没看到你的脸。请把脸放进黄色椭圆框内。", "bad"],
  dark: ["💡 有点暗。请换到亮一点的地方或打开灯。", "bad"],
  small: ["🔍 脸有点小，请再靠近一点。", "bad"],
  big: ["↩️ 有点太近了！请稍微往后退一点。", "bad"],
  off: ["↔️ 请把脸对准黄色椭圆框的中央。", "bad"],
  good: ["✅ 完美——别动！正在自动拍照…", "ok"],
};
function camStatus(key, cls) {
  const preset = CAM_MSG[key];
  const text = preset ? preset[0] : key;
  const c = cls !== undefined ? cls : preset ? preset[1] : "";
  const el = $("#camStatus"); el.textContent = text; el.className = "cam-status " + c;
  $("#camOval").setAttribute("stroke", c === "ok" ? "#34e08a" : c === "bad" ? "#ff6b8b" : "#ffd36e");
}

// Macs often list an iPhone (Continuity Camera), Desk View or virtual cameras first.
// Prefer the built-in face camera by name, and remember the camera where a face was seen.
function camScore(label = "") {
  const l = label.toLowerCase();
  if (/iphone|continuity|desk view|virtual|obs|snap|camo|ndi|manycam|screen/.test(l)) return -3;
  if (/facetime|macbook|imac|studio display|built-in|builtin|integrated|front|user/.test(l)) return 3;
  if (/back|rear|environment/.test(l)) return -1; // phone rear cameras (wide / tele)
  return 0;
}
function friendlyCamName(label) {
  const l = label.toLowerCase();
  if (/facing front|front camera|^front/.test(l)) return "前置摄像头";
  if (/facing back|back camera|rear|^back/.test(l)) return "后置摄像头";
  return label;
}
function loadSavedCam() { try { return localStorage.getItem("mff_cam") || null; } catch (e) { return null; } }
function saveCam(id) { try { if (id) localStorage.setItem("mff_cam", id); } catch (e) { /* ignore */ } }
function switchToNextCam(reason) {
  if (state.devices.length < 2) return false;
  state.triedCams = state.triedCams || new Set();
  state.triedCams.add(state.curCamId);
  const next = state.devices
    .filter((d) => !state.triedCams.has(d.deviceId))
    .sort((a, b) => camScore(b.label) - camScore(a.label))[0];
  if (!next) {
    // Tried them all: go back to the best-looking camera and stop switching
    state.searchDone = true;
    const best = [...state.devices].sort((a, b) => camScore(b.label) - camScore(a.label))[0];
    if (!best || best.deviceId === state.curCamId) return false;
    state.deviceId = best.deviceId;
    camStatus("📷 请把脸放进黄色椭圆框内。", "");
    startStream();
    return true;
  }
  state.deviceId = next.deviceId;
  camStatus(reason || "🔄 正在寻找能看到你的摄像头…请稍等。", "");
  startStream();
  return true;
}

async function openCamera() {
  state.userPicked = false;
  state.searchDone = false;
  state.triedCams = new Set();
  if (!navigator.mediaDevices?.getUserMedia) {
    return showNotice("没有摄像头？没关系！📸", "这个浏览器无法打开实时摄像头，但你仍然可以看面相。" + (IS_PHONE ? "用手机相机拍一张自拍，或在下方上传照片。" : "请在下方上传一张正面照片。"), null, "camera");
  }
  hideNotice();
  $("#camModal").classList.remove("hidden");
  showShootMode();
  initAnalyzer().catch(() => {}); // warm up the engine while the camera starts
  state.deviceId = await pickInitialCam();
  await startStream();
}
// Pick before opening: ① built-in laptop camera → ② last camera that saw a face → ③ anything that isn't an iPhone/virtual cam
async function pickInitialCam() {
  let devs = [];
  try { devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput" && d.deviceId); } catch (e) { /* ignore */ }
  const saved = loadSavedCam();
  if (devs.some((d) => d.label)) {
    const best = [...devs].sort((a, b) => camScore(b.label) - camScore(a.label))[0];
    if (best && camScore(best.label) > 0) return best.deviceId;
    const sv = devs.find((d) => d.deviceId === saved && camScore(d.label) >= 0);
    if (sv) return sv.deviceId;
    const ok = devs.find((d) => camScore(d.label) >= 0);
    if (ok) return ok.deviceId;
  } else if (saved && devs.some((d) => d.deviceId === saved)) return saved;
  // Names unknown: phones ask for the front camera; computers start with the first (usually built-in)
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
  $("#camUse").textContent = "✅ 用这张照片看相";
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
      state.deviceId = null;
      state.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    const track = state.stream.getVideoTracks()[0];
    const set = track.getSettings ? track.getSettings() : {};
    state.mirror = set.facingMode !== "environment";
    try {
      state.devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
      state.devIdx = Math.max(0, state.devices.findIndex((d) => d.deviceId === set.deviceId));
    } catch (e2) { state.devices = []; }
    $("#camFlip").textContent = state.devices.length > 1 ? `🔄 切换 (${state.devIdx + 1}/${state.devices.length})` : "🔄 切换";
    state.curCamId = set.deviceId || "";
    { const d = state.devices.find((x) => x.deviceId === state.curCamId); $("#camName").textContent = d && d.label ? "📷 " + friendlyCamName(d.label) : ""; }
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
    return showNotice("没有摄像头？没关系！📸",
      "无法打开实时摄像头（可能关闭了摄像头权限，或其他应用正在使用）。你仍然可以看面相——" +
      (IS_PHONE ? "用手机相机拍一张自拍，或在下方上传照片。" : "在下方上传一张正面照片即可。") +
      "下次想用实时摄像头？请在地址栏的图标里允许摄像头权限。", null, "camera");
  }
  const v = $("#camVideo");
  v.setAttribute("playsinline", ""); v.muted = true;
  v.srcObject = state.stream;
  v.classList.toggle("rear", !state.mirror);
  try { await v.play(); } catch (e) { /* some browsers autoplay */ }
  // Wait for real frames (Safari shows black for the first second or two)
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

// Every 0.6 s, check whether the face is clearly visible. ~2 s of "good" in a row → auto-shoot.
async function liveCheck() {
  clearTimeout(state.liveTimer);
  const v = $("#camVideo");
  if (!state.stream || state.shot) return;
  if (!counting) {
    try {
      const small = toCanvas(v, v.videoWidth, v.videoHeight, state.mirror, 360);
      const r = await quickCheck(small);
      if (!state.stream || state.shot || counting) return;
      state.darkCount = r.bright < 14 ? (state.darkCount || 0) + 1 : 0;
      if (state.darkCount >= 4 && !state.userPicked && switchToNextCam()) return;
      // On a camera unlikely to see a face (iPhone/virtual), move on after a few seconds without a face
      state.noFaceCount = !r.ok && r.reason === "none" ? (state.noFaceCount || 0) + 1 : 0;
      const curLabel = (state.devices.find((d) => d.deviceId === state.curCamId) || {}).label;
      const savedHere = state.curCamId && state.curCamId === loadSavedCam() && camScore(curLabel) >= 0;
      const searching = !state.userPicked && !state.camHadFace && !state.searchDone && state.devices.length > 1 && !savedHere && camScore(curLabel) <= 0;
      if (searching && state.noFaceCount >= (camScore(curLabel) < 0 ? 2 : 3)
          && switchToNextCam("🔄 这个摄像头看不到你的脸——正在换另一个…")) return;
      if (r.ok) { state.camHadFace = true; if (camScore(curLabel) >= 0 || state.userPicked) saveCam(state.curCamId); }
      if (searching && !r.ok && r.reason === "none") { camStatus("🔄 正在寻找能看到你的摄像头…请稍等。", ""); state.liveTimer = setTimeout(liveCheck, 500); return; }
      if (state.darkCount >= 4) {
        camStatus(state.devices.length > 1
          ? `⬛ 摄像头画面是黑的。试试点下方的“切换”（这台设备有 ${state.devices.length} 个摄像头）。`
          : "⬛ 摄像头画面是黑的。可能镜头盖关着，或其他应用（Zoom、微信视频…）正在使用摄像头。请关闭后点“取消”再试一次。", "bad");
      } else camStatus(r.ok ? (r.reason === "dark" ? "dark" : "good") : r.reason);
      state.goodCount = r.ok && r.reason === "good" ? (state.goodCount || 0) + 1 : 0;
      $("#camAutoBar").style.width = Math.min(100, state.goodCount / 3 * 100) + "%";
      if (state.goodCount >= 3) { state.goodCount = 0; $("#camAutoBar").style.width = "0"; countdownShot(); return; }
    } catch (e) { camStatus("📷 摄像头准备好了！请把脸放进黄色椭圆框内。", ""); }
  }
  state.liveTimer = setTimeout(liveCheck, 600);
}

let counting = false;
async function countdownShot() {
  if (counting || !state.stream) return; counting = true;
  const el = $("#camCount");
  camStatus("😊 别动！马上开始…", "");
  for (const n of [3, 2, 1]) { el.textContent = n; await sleep(650); if (!state.stream) { counting = false; el.textContent = ""; return; } }
  el.textContent = "";
  const v = $("#camVideo");
  const flash = document.createElement("div"); flash.className = "flash"; document.body.appendChild(flash); setTimeout(() => flash.remove(), 500);
  // Front camera: save exactly the mirror image the user saw
  const c = toCanvas(v, v.videoWidth, v.videoHeight, state.mirror);
  counting = false;
  state.shot = c;
  clearTimeout(state.liveTimer);
  const pv = $("#camPreview"); pv.width = c.width; pv.height = c.height; pv.getContext("2d").drawImage(c, 0, 0);
  pv.classList.remove("hidden");
  $("#camCtrlShoot").classList.add("hidden");
  $("#camCtrlConfirm").classList.remove("hidden");
  camStatus("🔎 正在检查照片…", "");
  try {
    const r = await quickCheck(toCanvas(c, c.width, c.height, false, 480));
    if (r.ok) {
      camStatus(r.reason === "dark"
        ? "📸 拍好了！有点暗，但可以用。马上为你看相…"
        : "📸 拍得完美！马上为你看相…", "ok");
      autoGo();
    } else {
      const why = { dark: "（太暗）", small: "（脸太小）", big: "（太近）", off: "（脸没有居中）" }[r.reason] || "";
      camStatus("😢 这张照片看不清你的脸" + why + "。请点“重拍”。", "bad");
      $("#camUse").classList.add("hidden");
    }
  } catch (e) { camStatus("📸 拍好了！满意的话，点“用这张照片看相”。", ""); }
}
// After a good shot, start the reading automatically in 3 seconds (or tap to go now)
function autoGo() {
  clearTimeout(state.goTimer);
  let n = 3;
  const btn = $("#camUse");
  const tick = () => {
    if (!state.shot || $("#camModal").classList.contains("hidden")) return;
    if (n === 0) { btn.click(); return; }
    btn.textContent = `✅ ${n}秒后开始看相（点击立即开始）`;
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

// ───────────────────────── Notice card ─────────────────────────
// mode: "photo" (retake / choose another) · "camera" (camera blocked → phone camera app / upload) · "reload"
const IS_PHONE = /iphone|ipad|android|mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(navigator.userAgent));
function showNotice(title, text, photo, mode = "photo") {
  $("#noticeTitle").textContent = title;
  $("#noticeText").textContent = text;
  const nc = $("#noticePhoto");
  if (photo) { nc.width = photo.width; nc.height = photo.height; nc.getContext("2d").drawImage(photo, 0, 0); nc.classList.remove("hidden"); }
  else nc.classList.add("hidden");
  $("#notice").classList.toggle("nophoto", !photo);
  const cam = $("#noticeCamera"), nat = $("#noticeNative"), up = $("#noticeUpload");
  cam.classList.toggle("hidden", mode === "camera");
  cam.textContent = mode === "reload" ? "🔄 重新加载页面" : "📸 重新自拍";
  cam.dataset.mode = mode;
  nat.classList.toggle("hidden", !(mode === "camera" && IS_PHONE));
  up.textContent = mode === "camera" ? "🖼️ 上传照片" : "🖼️ 换一张照片";
  up.classList.toggle("btn-primary", mode === "camera" && !IS_PHONE);
  up.classList.toggle("btn-ghost", !(mode === "camera" && !IS_PHONE));
  $("#notice").classList.remove("hidden");
  $("#notice").scrollIntoView({ behavior: "smooth", block: "center" });
}
function hideNotice() { $("#notice").classList.add("hidden"); }
$("#noticeCamera").addEventListener("click", (e) => { if (e.currentTarget.dataset.mode === "reload") location.reload(); else openCamera(); });
// Phone's own camera app (works even when live camera access is blocked)
$("#captureInput").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = ""; });

// ───────────────────────── Analysis ─────────────────────────
async function runAnalysis(canvas) {
  showTab("read");
  hideNotice();
  if (!canvas || !canvas.width || !canvas.height) {
    return showNotice("照片没有拍成功", "看起来照片是在摄像头准备好之前拍的。请点“重新自拍”。");
  }
  state.photo = canvas;
  $("#result").classList.add("hidden");
  $("#how").classList.add("hidden");
  const box = $("#analyzing"); box.classList.remove("hidden");
  const sc = $("#scanCanvas"); sc.width = canvas.width; sc.height = canvas.height; sc.getContext("2d").drawImage(canvas, 0, 0);
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  const steps = $$("#scanSteps li"); steps.forEach((s) => s.classList.remove("done"));
  const msgs = ["正在读取你的面相…", "正在测量三停…", "正在敲开你的财帛宫…", "正在翻开《麻衣神相》…", "正在对照《神相全编》…"];
  let i = 0;
  const tick = setInterval(() => { if (i < steps.length) { steps[i].classList.add("done"); $("#scanMsg").textContent = msgs[Math.min(i + 1, msgs.length - 1)]; i++; } }, 650);
  try {
    await initAnalyzer((m) => ($("#scanMsg").textContent = m));
    const result = await analyzeImage(canvas);
    await sleep(Math.max(0, 3300 - i * 650)); // build a little suspense
    clearInterval(tick); steps.forEach((s) => s.classList.add("done"));
    if (!result) {
      box.classList.add("hidden");
      return showNotice("没有找到人脸 😢",
        "这张照片里没有找到人脸——你可以在这里看看照片。如果太暗，请换到更亮的地方；如果脸太小，请靠近一点。正对镜头、摘掉眼镜或口罩、把头发拨到后面，效果最好。", canvas);
    }
    drawOverlay(sc, canvas, result.landmarks, "mesh", false);
    await sleep(600);
    state.analysis = result;
    state.reading = buildReading(result, state.ear, state.profile);
    box.classList.add("hidden");
    renderResult(true);
    if (result.quality.yaw > 0.12) toast("📐 你的头稍微侧了一点。正面照片的解读会更准确！", 6000);
  } catch (err) {
    console.error(err);
    clearInterval(tick); box.classList.add("hidden");
    showNotice("面相引擎没有加载成功",
      "可能是网络较慢或已断开。请点下方的“重新加载页面”。如果还是不行，请用最新版的 Chrome 或 Safari 打开本站。（错误：" + (err?.message || err) + "）", canvas, "reload");
  }
}

// ───────────────────────── Overlay ─────────────────────────
const PALACE_POINTS = {
  "官禄宫": 151, "命宫": 9, "疾厄宫": 168, "财帛宫": 4, "兄弟宫": 105, "田宅宫": 223,
  "子女宫": 230, "夫妻宫": 446, "奴仆宫": 172, "迁移宫": 54, "福德宫": 333, "父母宫": 67,
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
const UI_FONT = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';
// Face-outline landmarks, clockwise from the top of the forehead
const FACE_OVAL_ORDER = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
// Join points with a smooth curve (Catmull-Rom)
function smoothPath(ctx, pts, closed = false) {
  const n = pts.length, at = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
  }
  if (closed) ctx.closePath();
}
// A small four-point sparkle
function sparkle(ctx, x, y, r, color) {
  const k = r * 0.28;
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x + k, y - k, x + r, y); ctx.quadraticCurveTo(x + k, y + k, x, y + r);
  ctx.quadraticCurveTo(x - k, y + k, x - r, y); ctx.quadraticCurveTo(x - k, y - k, x, y - r); ctx.fill();
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
    // No lines across the face: a soft glowing halo just outside it, plus small sparkles
    const cx = (P(234).x + P(454).x) / 2, cy = (P(10).y + P(152).y) / 2;
    const halo = FACE_OVAL_ORDER.map((i) => { const p = P(i); return { x: cx + (p.x - cx) * 1.07, y: cy + (p.y - cy) * 1.06 }; });
    const grad = ctx.createLinearGradient(0, P(10).y, 0, P(152).y);
    grad.addColorStop(0, "rgba(255,236,190,.95)"); grad.addColorStop(0.5, "rgba(255,190,215,.9)"); grad.addColorStop(1, "rgba(255,236,190,.95)");
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(255,214,170,.9)"; ctx.shadowBlur = 10 * unit;
    ctx.strokeStyle = "rgba(255,225,200,.18)"; ctx.lineWidth = 5 * unit;
    smoothPath(ctx, halo, true); ctx.stroke();
    ctx.shadowBlur = 5 * unit; ctx.strokeStyle = grad; ctx.lineWidth = 1.1 * unit; ctx.globalAlpha = 0.85;
    smoothPath(ctx, halo, true); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = "rgba(255,220,160,.95)"; ctx.shadowBlur = 6 * unit;
    for (const i of [70, 300, 33, 263, 129, 358, 61, 291, 152, 10]) {
      const p = P(i); sparkle(ctx, p.x, p.y, 2.6 * unit, "rgba(255,248,228,.95)");
    }
    [3, 9, 15, 22, 28, 33].forEach((k, n) => { const p = halo[k]; sparkle(ctx, p.x, p.y, (n % 2 ? 2.2 : 3.2) * unit, "rgba(255,240,210,.9)"); });
    ctx.restore();
    // Three Zones: a slim ruler beside the face (never across it)
    const rx = Math.min(target.width - 40 * unit, halo[8].x + 10 * unit);
    const ys = [10, 9, 2, 152].map((i) => P(i).y);
    ctx.save();
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255,214,170,.8)"; ctx.shadowBlur = 4 * unit;
    ctx.strokeStyle = "rgba(255,230,190,.7)"; ctx.lineWidth = 1 * unit;
    ctx.beginPath(); ctx.moveTo(rx, ys[0]); ctx.lineTo(rx, ys[3]); ctx.stroke();
    ys.forEach((y) => sparkle(ctx, rx, y, 2.4 * unit, "rgba(255,246,222,.95)"));
    ctx.shadowBlur = 0;
    ctx.font = `700 ${9 * unit}px ${UI_FONT}`;
    ["上停", "中停", "下停"].forEach((label, k) => tag(ctx, label, rx + 6 * unit, (ys[k] + ys[k + 1]) / 2, "rgba(22,18,58,.6)", "#ffe9bd", unit, "left"));
    ctx.restore();
  }
  if (layer === "palace") {
    ctx.font = `700 ${8.5 * unit}px ${UI_FONT}`;
    for (const [name, i] of Object.entries(PALACE_POINTS)) {
      const p = P(i);
      ctx.fillStyle = "#ff6b8b"; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2 * unit, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2 * unit; ctx.stroke();
      tag(ctx, name, p.x, p.y - 6 * unit, "rgba(22,18,58,.85)", "#fff", unit, "center", true);
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

// ───────────────────────── Result rendering ─────────────────────────
function ring(score, color = "#ffc94d") {
  const r = 40, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return `<svg class="total-ring" viewBox="0 0 96 96"><circle cx="48" cy="48" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="8"/>
    <circle cx="48" cy="48" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 48 48)"/>
    <text x="48" y="57" text-anchor="middle" font-size="27" fill="#fff">${score}</text></svg>`;
}
function radar(fortunes) {
  const n = fortunes.length, cx = 150, cy = 150, R = 100;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; const r = (R * v) / 100; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  let g = "";
  for (const lv of [25, 50, 75, 100]) g += `<polygon class="grid" points="${fortunes.map((_, i) => pt(i, lv).join(",")).join(" ")}"/>`;
  fortunes.forEach((_, i) => { const [x, y] = pt(i, 100); g += `<line class="grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; });
  const poly = fortunes.map((f, i) => pt(i, f.score).join(",")).join(" ");
  const labels = fortunes.map((f, i) => { const [x, y] = pt(i, 126); return `<text class="axis-label" x="${x}" y="${y + 4}" text-anchor="middle">${f.emoji} ${f.short}</text>`; }).join("");
  const dots = fortunes.map((f, i) => { const [x, y] = pt(i, f.score); return `<circle cx="${x}" cy="${y}" r="4" fill="${f.color}" stroke="#fff" stroke-width="1.5"/>`; }).join("");
  return `<svg class="radar" viewBox="-10 0 320 300" role="img" aria-label="运势雷达图">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6f91"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>
    ${g}<polygon points="${poly}" fill="url(#rg)" fill-opacity=".35" stroke="url(#rg)" stroke-width="2.5"/>${dots}${labels}</svg>`;
}

function renderResult(scroll) {
  const R = state.reading, A = state.analysis;
  const el = $("#result");
  const fortunesHTML = R.fortunes.map((f, i) => `
    <article class="card fcard reveal" style="--c:${f.color}">
      <div class="fhead"><div class="em">${f.emoji}</div><h4>${f.name}</h4><div class="score">${f.score}<small>/100</small></div></div>
      <div class="fbar"><b data-w="${f.score}"></b></div>
      <p class="fopen">${esc(f.text.open)}</p>
      <p class="fbody">${esc(f.text.body)}</p>
      <div class="fbox">
        <div><b>📜 经典这样说</b>${esc(f.text.classic)}</div>
        <div><b>🍀 开运小贴士</b>${esc(f.text.tip)}</div>
        <div><b>${R.tipLabel}</b>${esc(f.text.makeup || (R.gender === "m" ? GROOMING_TIPS : MAKEUP_TIPS).smile.hi)}</div>
      </div>
    </article>${i === 3 ? `<div class="ad-slot ad-infeed" data-ad="infeed"></div>` : ""}`).join("");

  el.innerHTML = `
    <div class="res-top">
      <div class="card photo-card reveal">
        <canvas id="resCanvas"></canvas>
        <div class="layer-toggle">
          <button class="chip ${state.layer === "mesh" ? "active" : ""}" data-layer="mesh">📐 测量线</button>
          <button class="chip ${state.layer === "palace" ? "active" : ""}" data-layer="palace">🗺️ 十二宫</button>
          <button class="chip ${state.layer === "none" ? "active" : ""}" data-layer="none">🙂 原图</button>
        </div>
      </div>
      <div class="card hook-card reveal">
        <p class="eyebrow gold">相士对你说…</p>
        <p class="hook-line">“${esc(R.hook)}”</p>
        <span class="shape-badge">${R.shape.emoji} ${R.shape.name} · ${R.shape.alias}</span>${R.profileLabel ? `<span class="profile-tag">👤 ${esc(R.profileLabel)}</span>` : ""}
        <div class="total">${ring(R.total)}<div><b class="total-title">命运总分：${R.total}</b><p>${R.fortunes.length}种运势的平均分。你最强的是：<b>${R.ranked[0].emoji} ${R.ranked[0].name}</b>！</p></div></div>
        <div class="mini-bars">${R.fortunes.map((f) => `<div class="mini-bar"><span>${f.emoji} ${f.short}<b>${f.score}</b></span><i><b style="width:${f.score}%;background:${f.color}"></b></i></div>`).join("")}</div>
        <p class="fun-pill">✨ 仅供娱乐</p>
      </div>
    </div>

    <div class="card summary-card reveal">
      <h3>🔮 你的面相故事</h3>
      <p>${esc(R.summary)}</p>
    </div>

    <div class="ad-slot ad-infeed" data-ad="infeed"></div>

    <div class="card radar-card reveal">
      <div>${radar(R.fortunes)}</div>
      <div><h3 class="block-title">🏆 你的运势排行</h3>
        <ol class="rank-list">${R.ranked.map((f, i) => `<li><span class="n">${i + 1}</span>${f.emoji} ${f.name}<span class="s" style="color:${f.color}">${f.score}</span></li>`).join("")}</ol></div>
    </div>

    <section>
      <h3 class="block-title">👁️ 五官逐一解读</h3>
      <div class="part-grid">${R.parts.map((p, i) => `
        <article class="card part-card reveal" style="--c:${["#f2b443", "#7c5cff", "#4a8fe7", "#f2b705", "#ff6f91", "#2fc4b2", "#a77bd9"][i % 7]}">
          <h4>${p.emoji} ${p.name} <span class="organ">${p.organ}</span></h4>
          <div class="tagrow">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <p>${esc(p.text)}</p>
        </article>`).join("")}</div>
    </section>

    <section>
      <h3 class="block-title">🍀 详解你的${R.fortunes.length}种运势</h3>
      <div class="fortune-list">${fortunesHTML}</div>
    </section>

    <div class="card reveal">
      <h3 class="block-title">🌟 和你面相相似的名人</h3>
      <div class="match-grid">${R.figures.map(({ fig, pct }) => `
        <div class="match"><div class="av" style="background:${fig.color}">${fig.emoji}</div><b>${fig.name}</b><div class="pct">${pct}%</div><p>${FACE_SHAPES[fig.shape].name} · ${fig.parts[0]}</p></div>`).join("")}</div>
      <p class="note">这是比较五官比例中面相倾向的趣味匹配——不是长相相似度或身份识别。<a href="#figures" data-goto="figures">查看全部名人面相 →</a></p>
    </div>

    <div class="card reveal">
      <h3 class="block-title">📏 你的测量数据</h3>
      <div class="metric-grid">${R.metricsView.map((v) => `
        <div class="metric"><div class="top"><span>${v.label}</span><em>${v.word}</em></div>
        <div class="mtrack"><i style="left:${50 + Math.max(-2.5, Math.min(2.5, v.z)) * 19}%"></i></div></div>`).join("")}</div>
      <p class="note">我们在你的脸上找到478个点，校正倾斜后，以脸的宽度和长度为基准测量每个部位的比例。中间 = 平均 · 左 = 更秀气 · 右 = 更鲜明。没有哪一边更好——每张脸都有不同的优势。头部转动 ${(A.quality.yaw * 100).toFixed(0)}% · 已校正倾斜 ${A.quality.roll.toFixed(1)}°</p>
    </div>

    <div class="ad-slot ad-infeed" data-ad="infeed"></div>

    <div class="actions">
      <button class="btn btn-primary btn-xl" id="btnSave">💾 保存结果图片</button>
      <button class="btn btn-gold btn-xl" id="btnShare">📤 分享给朋友</button>
      <button class="btn btn-ghost btn-xl" id="btnCopy">📋 复制完整解读</button>
      <button class="btn btn-ghost btn-xl" id="btnRetry">🔁 换一张照片试试</button>
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

// ───────────────────────── Share image (1080×1350) ─────────────────────────
const DISPLAY = '"Fraunces", "Noto Serif SC", Georgia, serif';
const ZH_SERIF = '"Noto Serif SC", "Songti SC", serif';
async function buildShareCanvas() {
  await document.fonts.ready;
  const R = state.reading, A = state.analysis;
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#16123a"); g.addColorStop(0.55, "#3b2a8f"); g.addColorStop(1, "#c2457a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.07; ctx.fillStyle = "#fff"; ctx.font = '700 520px "Noto Serif SC", serif'; ctx.textBaseline = "alphabetic"; ctx.fillText("相", 560, 1250); ctx.globalAlpha = 1;

  // Photo
  const pc = document.createElement("canvas"); drawOverlay(pc, state.photo, A.landmarks, "mesh");
  const pw = 440, ph = pw * (pc.height / pc.width), px = 70, py = 170;
  ctx.save(); roundRect(ctx, px, py, pw, ph, 36); ctx.clip(); ctx.drawImage(pc, px, py, pw, ph); ctx.restore();
  ctx.strokeStyle = "#ffc94d"; ctx.lineWidth = 6; roundRect(ctx, px, py, pw, ph, 36); ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#fff"; ctx.font = `800 64px ${DISPLAY}`; ctx.fillText("MyFace", 70, 120);
  const mw = ctx.measureText("MyFace").width;
  ctx.fillStyle = "#ffc94d"; ctx.font = `italic 600 64px ${DISPLAY}`; ctx.fillText("Fate", 70 + mw + 4, 120);
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `600 24px ${UI_FONT}`; ctx.textAlign = "right";
  ctx.fillText("AI 面相 · 三大古典相书", W - 70, 114); ctx.textAlign = "left";

  // Right: face type + total
  const rx = 560;
  ctx.fillStyle = "#fff"; ctx.font = `800 34px ${UI_FONT}`;
  ctx.fillText(`${R.shape.emoji} ${R.shape.name}`, rx, 220);
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `600 26px ${UI_FONT}`; ctx.fillText(`“${R.shape.alias}”` + (R.profileLabel ? ` · ${R.profileLabel}` : ""), rx, 260);
  ctx.fillStyle = "#ffc94d"; ctx.font = `800 150px ${DISPLAY}`; ctx.fillText(String(R.total), rx, 420);
  ctx.fillStyle = "#fff"; ctx.font = `700 28px ${UI_FONT}`; ctx.fillText("命运总分", rx + 6, 466);

  // Luck bars
  let y = 520;
  for (const f of R.fortunes) {
    ctx.fillStyle = "#fff"; ctx.font = `700 25px ${UI_FONT}`; ctx.fillText(`${f.emoji} ${f.short}`, rx, y);
    ctx.textAlign = "right"; ctx.fillText(String(f.score), W - 70, y); ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.18)"; roundRect(ctx, rx, y + 12, W - 70 - rx, 12, 6); ctx.fill();
    ctx.fillStyle = f.color; roundRect(ctx, rx, y + 12, (W - 70 - rx) * f.score / 100, 12, 6); ctx.fill();
    y += 48;
  }

  // Hook + summary
  const by = Math.max(py + ph, y - 30) + 30;
  ctx.fillStyle = "rgba(255,255,255,.12)"; roundRect(ctx, 70, by, W - 140, H - by - 110, 32); ctx.fill();
  ctx.fillStyle = "#ffc94d"; ctx.font = `700 40px ${ZH_SERIF}`;
  const hookLines = wrap(ctx, `“${R.hook}”`, W - 200).slice(0, 2);
  hookLines.forEach((l, i) => ctx.fillText(l, 100, by + 64 + i * 52));
  ctx.fillStyle = "#fff"; ctx.font = `500 26px ${UI_FONT}`;
  const sum = `${R.ranked[0].emoji} 最强运势：${R.ranked[0].name}。` + R.ranked[0].text.body;
  const sl = wrap(ctx, sum, W - 200);
  const maxLines = Math.max(2, Math.floor((H - by - 110 - 70 - hookLines.length * 52) / 40));
  sl.slice(0, maxLines).forEach((l, i, arr) => ctx.fillText(i === arr.length - 1 && sl.length > maxLines ? l.slice(0, -1) + "…" : l, 100, by + 64 + hookLines.length * 52 + 20 + i * 40));
  ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = `700 26px ${UI_FONT}`; ctx.textAlign = "center";
  ctx.fillText(`你的脸在说什么？👉 ${HOST}/zh`, W / 2, H - 58);
  ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = `500 18px ${UI_FONT}`;
  ctx.fillText("仅供娱乐", W / 2, H - 28);
  return c;
}
// 中文按字换行（中文没有空格）；行首不放标点
const NO_LINE_START = "，。、；：！？）」』”’》…—,.;:!?)";
function wrap(ctx, text, maxW) {
  const out = []; let line = "";
  for (const ch of Array.from(text)) {
    const t = line + ch;
    if (ctx.measureText(t).width > maxW && line && !NO_LINE_START.includes(ch)) { out.push(line); line = ch; } else line = t;
  }
  if (line) out.push(line); return out;
}
async function saveImage() {
  const c = await buildShareCanvas();
  c.toBlob((blob) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `myfacefate-reading-${Date.now()}.png`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("💾 结果图片已保存！");
  }, "image/png");
}
async function shareResult() {
  const R = state.reading;
  const text = `我的面相：${R.shape.name}（“${R.shape.alias}”）— 命运总分 ${R.total}，${R.ranked[0].name} ${R.ranked[0].score}分 🔮 你的脸在说什么？`;
  const url = PAGE_URL;
  try {
    const c = await buildShareCanvas();
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const file = new File([blob], "myfacefate.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text: `${text} ${url}`, title: SITE });
    if (navigator.share) return await navigator.share({ text, url, title: SITE });
  } catch (e) { if (e.name === "AbortError") return; }
  await navigator.clipboard?.writeText(`${text} ${url}`);
  toast("🔗 分享文字已复制——随处粘贴吧！");
}
async function copyText() {
  const R = state.reading;
  const txt = [`🔮 我的 MyFaceFate 面相 — ${R.shape.name}（“${R.shape.alias}”）· 命运总分 ${R.total}`, "", `“${R.hook}”`, "", R.summary, "",
    ...R.parts.map((p) => `■ ${p.name}\n${p.text}`), "",
    ...R.fortunes.map((f) => `■ ${f.name}：${f.score}分\n${f.text.open}${f.text.body}\n💄 ${f.text.makeup}`), "",
    `免费看你的面相：${PAGE_URL} · 仅供娱乐`].join("\n");
  try { await navigator.clipboard.writeText(txt); toast("📋 已复制完整解读！"); }
  catch { toast("这个浏览器不允许复制"); }
}

// ───────────────────────── Static tab: Face Map ─────────────────────────
function renderPartsTab() {
  const dots = PALACES.map((p) => `<g class="dot" data-p="${p.id}"><circle cx="${p.x}" cy="${p.y}" r="3.4" fill="#7c5cff" stroke="#fff" stroke-width=".8"/><text x="${p.x}" y="${p.below ? p.y + 7.2 : p.y - 4.6}" text-anchor="middle">${p.name}</text></g>`).join("");
  $("#palaceMap").innerHTML = `<svg viewBox="0 0 100 110">
    <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9dc"/><stop offset="1" stop-color="#ffd6c4"/></linearGradient></defs>
    <ellipse cx="50" cy="52" rx="38" ry="48" fill="url(#fg)" stroke="#e8b9a5" stroke-width=".8"/>
    <ellipse cx="11" cy="52" rx="4" ry="9" fill="#ffd6c4" stroke="#e8b9a5" stroke-width=".6"/><ellipse cx="89" cy="52" rx="4" ry="9" fill="#ffd6c4" stroke="#e8b9a5" stroke-width=".6"/>
    <path d="M24 32 q10 -5 20 -1 M56 31 q10 -4 20 1" stroke="#5a4033" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="41" rx="7" ry="3" fill="#fff" stroke="#5a4033" stroke-width=".7"/><circle cx="34" cy="41" r="2" fill="#3b2a24"/>
    <ellipse cx="66" cy="41" rx="7" ry="3" fill="#fff" stroke="#5a4033" stroke-width=".7"/><circle cx="66" cy="41" r="2" fill="#3b2a24"/>
    <path d="M50 42 v16 q-5 3 -7 1 M50 58 q5 3 7 1" stroke="#c48c76" stroke-width=".9" fill="none"/>
    <path d="M40 72 q10 6 20 0" stroke="#d9667f" stroke-width="2" fill="none" stroke-linecap="round"/>
    <line x1="8" y1="28" x2="92" y2="28" stroke="#f2b443" stroke-dasharray="1.5 1.5" stroke-width=".5"/><line x1="8" y1="61" x2="92" y2="61" stroke="#f2b443" stroke-dasharray="1.5 1.5" stroke-width=".5"/>
    ${dots}</svg>`;
  const show = (id) => {
    const p = PALACES.find((x) => x.id === id);
    $$("#palaceMap .dot").forEach((d) => d.classList.toggle("on", d.dataset.p === id));
    $("#palaceInfo").innerHTML = `<p class="eyebrow">面相十二宫</p><h3>${p.name}</h3><p class="place">📍 ${p.place}</p><p>${p.meaning}</p>
      <div class="palace-list">${PALACES.map((x) => `<button class="chip ${x.id === id ? "active" : ""}" data-pp="${x.id}">${x.name}</button>`).join("")}</div>`;
    $$("[data-pp]").forEach((b) => b.addEventListener("click", () => show(b.dataset.pp)));
  };
  $$("#palaceMap .dot").forEach((d) => d.addEventListener("click", () => show(d.dataset.p)));
  show("destiny");

  const organEmoji = { ear: "👂", brow: "〰️", eye: "👁️", nose: "👃", mouth: "👄" };
  $("#organGrid").innerHTML = Object.entries(FIVE_ORGANS).map(([k, o]) => `<div class="card organ"><div class="big">${organEmoji[k]}</div><b>${o.name}</b><span class="t">${o.title}</span><p>${o.role}</p></div>`).join("");

  const lvName = { hi: "鲜明 · 长 · 高", mid: "均衡", lo: "秀气 · 短 · 柔" };
  $("#partDict").innerHTML = Object.values(PART_READINGS).map((part) => `
    <div class="card dict-part"><h3>${part.emoji} ${part.name} <small>${part.organ}</small></h3>
      ${Object.entries(part).filter(([, v]) => typeof v === "object").map(([mk, t]) => `
        <div class="dict-sub">${METRIC_LABELS[mk]}</div>
        <div class="dict-row">${["hi", "mid", "lo"].map((lv) => `<div><b>${lvName[lv]}</b>${t[lv]}</div>`).join("")}</div>`).join("")}
    </div>`).join("") + `<div class="card dict-part"><h3>👂 耳朵 <small>采听官 · 先天福气</small></h3>
      <div class="dict-row" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${Object.values(EAR_TYPES).filter((e) => e.text).map((e) => `<div><b>${e.label}</b>${e.text}</div>`).join("")}</div></div>`;
}

// ───────────────────────── Static tab: Luck Guide ─────────────────────────
function renderFortuneTab() {
  $("#fortuneGuide").innerHTML = FORTUNES.map((f) => `
    <article class="card guide" style="--c:${f.color}">
      <h3>${f.emoji} ${f.name}</h3>
      <div class="look">${Object.keys(f.weights).map((k) => `<span>${METRIC_LABELS[k] || (k === "ear" ? "耳朵" : k === "balance" ? "三停均衡" : k)}</span>`).join("")}</div>
      <p>${f.classic}</p>
      <p>${Object.values(FORTUNE_LINES[f.id])[0].hi}</p>
      <p class="tipline">🍀 ${f.tip}</p>
    </article>`).join("");
  const tipKeys = ["mouthCorner", "browLen", "glabella", "noseWidth", "eyeOpen", "upper", "lipThick", "smile", "jawWidth"];
  $("#tipGrid").innerHTML = tipKeys.map((k) => `<div class="card"><h4>${METRIC_LABELS[k]}</h4><p><b>想要加强时</b> ${MAKEUP_TIPS[k].lo}</p><p><b>已经是优势时</b> ${MAKEUP_TIPS[k].hi}</p></div>`).join("");
}

// ───────────────────────── Static tab: Famous Faces ─────────────────────────
function renderFigures(filter = "all") {
  const list = FIGURES.filter((f) => filter === "all" || f.region === filter || f.gender === filter);
  $("#figGrid").innerHTML = list.map((f, i) => `
    <article class="card fig">
      <div class="fig-head"><div class="av" style="background:${f.color}22">${f.emoji}</div>
        <div><h3>${f.name}</h3><div class="meta">${f.era} · ${f.role}</div></div><span class="region">${f.region === "legend" ? "🏛️ 历史传奇" : "⭐ 现代偶像"}</span></div>
      <div class="shape">${FACE_SHAPES[f.shape].emoji} ${FACE_SHAPES[f.shape].name} · ${FACE_SHAPES[f.shape].alias}</div>
      <div class="tagrow">${f.parts.map((p) => `<span>${p}</span>`).join("")}</div>
      <p class="clip">${f.text}</p>
      <button class="more">阅读完整解读 ▾</button>
      <div class="fbars">${Object.entries(f.fortunes).map(([k, v]) => `<div><span>${k}</span><i><b style="width:${v}%;background:${f.color}"></b></i><b>${v}</b></div>`).join("")}</div>
    </article>${(i + 1) % 8 === 0 && i < list.length - 1 ? `<div class="ad-slot ad-infeed fig-ad" data-ad="infeed"></div>` : ""}`).join("");
  $$("#figGrid .more").forEach((b) => b.addEventListener("click", () => {
    const p = b.previousElementSibling; const open = p.classList.toggle("clip");
    b.textContent = open ? "阅读完整解读 ▾" : "收起 ▴";
  }));
  fillAds($("#figGrid"));
}
$$("#figFilter .chip").forEach((c) => c.addEventListener("click", () => {
  $$("#figFilter .chip").forEach((x) => x.classList.toggle("active", x === c)); renderFigures(c.dataset.f);
}));

// ───────────────────────── Static tab: Ancient Secrets ─────────────────────────
function renderBooks() {
  $("#bookGrid").innerHTML = BOOKS.map((b) => `
    <article class="card book" style="--c:${b.color}"><div class="spine">${b.hanja}</div>
      <h3>${b.name}</h3><div class="era">${b.era}</div><p>${b.desc}</p>
      <div class="tagrow">${b.key.map((k) => `<span>${k}</span>`).join("")}</div></article>`).join("");
}

// ───────────────────────── Today's tip ─────────────────────────
const WORDS = [
  "笑口常开，好运自来。今天把嘴角上扬2毫米——看看会发生什么。",
  "眉间放松，运势也会放松。皱眉是挡住命宫的头号元凶。",
  "鼻头清爽，财运就清爽。今天做点护肤，让你的财帛宫闪闪发光！",
  "人过四十，要为自己的脸负责——它记录着你的习惯。让今天的表情开心一点吧。",
  "眼睛是心灵之窗。今天和别人对视时，多停留三秒。",
  "露出额头，官禄宫就会打开。今天有大事？把刘海拨到一边吧。",
  "好面相来自好睡眠。眼下明亮有福气的秘诀，就是睡个好觉！",
];
$("#todayWord").textContent = WORDS[new Date().getDate() % WORDS.length];

// ───────────────────────── Mobile bottom ad close ─────────────────────────
$("#adClose").addEventListener("click", () => $("#adAnchor").remove());

// ───────────────────────── Start ─────────────────────────
renderProfileChips();
renderEarChips();
renderPartsTab();
renderFortuneTab();
renderFigures();
renderBooks();
const initial = location.hash.slice(1);
if (["read", "parts", "fortune", "figures", "books"].includes(initial)) showTab(initial); else fillAds();
setTimeout(() => initAnalyzer().catch(() => {}), 1500);

// 调试用（开发者工具中的 window.__mff）
window.__mff = { state };
