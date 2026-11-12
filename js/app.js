// =====================================================================
//  app.js — UI · camera · upload · result rendering · share image
// =====================================================================
import { initAnalyzer, analyzeImage, quickCheck } from "./analyzer.js";
import { FaceLandmarker } from "../vendor/mediapipe/vision_bundle.mjs";
import { buildReading } from "./reading.js";
import {
  BOOKS, PALACES, FIVE_ORGANS, PART_READINGS, FORTUNES, FORTUNE_LINES, MAKEUP_TIPS,
  EAR_TYPES, FACE_SHAPES, METRIC_LABELS, AGE_GROUPS, GENDERS, GROOMING_TIPS,
} from "./content.js";
import { FIGURES } from "./figures.js";
import { fillAds } from "./ads.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SITE = "MyFaceFate";
const HOST = "myfacefate.com";

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
    if (state.analysis) { state.reading = buildReading(state.analysis, state.ear, state.profile); renderResult(false); toast("👤 Updated your reading for your gender & age"); }
  };
  $$("#ageChips .chip").forEach((c) => c.addEventListener("click", () => { state.profile.age = c.dataset.age; changed(); }));
  $$("#genderChips .chip").forEach((c) => c.addEventListener("click", () => { state.profile.gender = c.dataset.gender; changed(); }));
}

function renderEarChips() {
  $("#earChips").innerHTML = Object.entries(EAR_TYPES)
    .map(([k, v]) => `<button class="chip ${k === state.ear ? "active" : ""}" data-ear="${k}">${v.label}</button>`).join("");
  $$("#earChips .chip").forEach((c) => c.addEventListener("click", () => {
    state.ear = c.dataset.ear; renderEarChips();
    if (state.analysis) { state.reading = buildReading(state.analysis, state.ear, state.profile); renderResult(false); toast("👂 Updated your reading with your ear shape"); }
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
  if (!file.type.startsWith("image/")) return toast("Please choose an image file");
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); runAnalysis(toCanvas(img, img.naturalWidth, img.naturalHeight)); };
  img.onerror = () => showNotice("We couldn't open that photo", "This file won't open. Please choose a JPG or PNG photo instead.");
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
  if (state.devices.length < 2) return camStatus("Only one camera was found on this device.", "");
  state.userPicked = true;
  state.devIdx = (state.devIdx + 1) % state.devices.length;
  state.deviceId = state.devices[state.devIdx].deviceId;
  startStream();
});
$("#camShot").addEventListener("click", countdownShot);
$("#camRetake").addEventListener("click", retake);
$("#camUse").addEventListener("click", () => { const c = state.shot; closeCamera(); if (c) runAnalysis(c); });

const CAM_MSG = {
  wait: ["📷 Starting your camera…", ""],
  black: ["📷 The camera is still dark. Hang tight — if it stays black, close other apps using the camera (Zoom, FaceTime, etc.).", "bad"],
  none: ["😶 We can't see your face yet. Fit it inside the yellow oval.", "bad"],
  dark: ["💡 It's a bit dark. Move somewhere brighter or turn on a light.", "bad"],
  small: ["🔍 Your face looks small. Come a little closer.", "bad"],
  big: ["↩️ A little too close! Move back just a bit.", "bad"],
  off: ["↔️ Center your face inside the yellow oval.", "bad"],
  good: ["✅ Perfect — hold still! Taking your photo automatically…", "ok"],
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
  if (/facing front|front camera|^front/.test(l)) return "Front camera";
  if (/facing back|back camera|rear|^back/.test(l)) return "Back camera";
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
    camStatus("📷 Fit your face inside the yellow oval.", "");
    startStream();
    return true;
  }
  state.deviceId = next.deviceId;
  camStatus(reason || "🔄 Looking for the camera that can see you… one sec.", "");
  startStream();
  return true;
}

async function openCamera() {
  state.userPicked = false;
  state.searchDone = false;
  state.triedCams = new Set();
  if (!navigator.mediaDevices?.getUserMedia) {
    return showNotice("No camera? No problem! 📸", "This browser can't open a live camera, but you can still get your reading. " + (IS_PHONE ? "Snap a selfie with your phone's camera app, or upload a photo below." : "Upload a front-facing photo below."), null, "camera");
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
  $("#camUse").textContent = "✅ Read This Photo";
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
    $("#camFlip").textContent = state.devices.length > 1 ? `🔄 Switch (${state.devIdx + 1}/${state.devices.length})` : "🔄 Switch";
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
    return showNotice("No camera? No problem! 📸",
      "We couldn't open the live camera (camera access may be turned off, or another app is using it). You can still get your reading — " +
      (IS_PHONE ? "snap a selfie with your phone's camera app or upload a photo below." : "just upload a front-facing photo below.") +
      " Want the live camera next time? Allow camera access from the icon in your address bar.", null, "camera");
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
          && switchToNextCam("🔄 This camera can't see your face — trying another one…")) return;
      if (r.ok) { state.camHadFace = true; if (camScore(curLabel) >= 0 || state.userPicked) saveCam(state.curCamId); }
      if (searching && !r.ok && r.reason === "none") { camStatus("🔄 Looking for the camera that can see you… one sec.", ""); state.liveTimer = setTimeout(liveCheck, 500); return; }
      if (state.darkCount >= 4) {
        camStatus(state.devices.length > 1
          ? `⬛ The camera image is black. Try tapping 'Switch' below (this device has ${state.devices.length} cameras).`
          : "⬛ The camera image is black. The lens cover may be closed, or another app (Zoom, FaceTime…) is using the camera. Close it, tap 'Cancel' and try again.", "bad");
      } else camStatus(r.ok ? (r.reason === "dark" ? "dark" : "good") : r.reason);
      state.goodCount = r.ok && r.reason === "good" ? (state.goodCount || 0) + 1 : 0;
      $("#camAutoBar").style.width = Math.min(100, state.goodCount / 3 * 100) + "%";
      if (state.goodCount >= 3) { state.goodCount = 0; $("#camAutoBar").style.width = "0"; countdownShot(); return; }
    } catch (e) { camStatus("📷 Camera ready! Fit your face inside the yellow oval.", ""); }
  }
  state.liveTimer = setTimeout(liveCheck, 600);
}

let counting = false;
async function countdownShot() {
  if (counting || !state.stream) return; counting = true;
  const el = $("#camCount");
  camStatus("😊 Hold still! Here we go…", "");
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
  camStatus("🔎 Checking your photo…", "");
  try {
    const r = await quickCheck(toCanvas(c, c.width, c.height, false, 480));
    if (r.ok) {
      camStatus(r.reason === "dark"
        ? "📸 Got it! A little dark, but it works. Reading your face in a moment…"
        : "📸 Perfect shot! Reading your face in a moment…", "ok");
      autoGo();
    } else {
      const why = { dark: " (too dark)", small: " (face too small)", big: " (too close)", off: " (face not centered)" }[r.reason] || "";
      camStatus("😢 We can't see your face clearly in this one" + why + ". Tap 'Retake.'", "bad");
      $("#camUse").classList.add("hidden");
    }
  } catch (e) { camStatus("📸 Got it! If it looks good, tap 'Read This Photo.'", ""); }
}
// After a good shot, start the reading automatically in 3 seconds (or tap to go now)
function autoGo() {
  clearTimeout(state.goTimer);
  let n = 3;
  const btn = $("#camUse");
  const tick = () => {
    if (!state.shot || $("#camModal").classList.contains("hidden")) return;
    if (n === 0) { btn.click(); return; }
    btn.textContent = `✅ Reading in ${n}s (tap to go now)`;
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
  cam.textContent = mode === "reload" ? "🔄 Reload Page" : "📸 Retake Selfie";
  cam.dataset.mode = mode;
  nat.classList.toggle("hidden", !(mode === "camera" && IS_PHONE));
  up.textContent = mode === "camera" ? "🖼️ Upload a Photo" : "🖼️ Choose Another Photo";
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
    return showNotice("The photo didn't come through", "It looks like the photo was taken before the camera was ready. Please tap 'Retake Selfie.'");
  }
  state.photo = canvas;
  $("#result").classList.add("hidden");
  $("#how").classList.add("hidden");
  const box = $("#analyzing"); box.classList.remove("hidden");
  const sc = $("#scanCanvas"); sc.width = canvas.width; sc.height = canvas.height; sc.getContext("2d").drawImage(canvas, 0, 0);
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  const steps = $$("#scanSteps li"); steps.forEach((s) => s.classList.remove("done"));
  const msgs = ["Reading your face…", "Measuring your Three Zones…", "Knocking on your Wealth Palace…", "Opening the Ma Yi classic…", "Cross-checking the encyclopedia…"];
  let i = 0;
  const tick = setInterval(() => { if (i < steps.length) { steps[i].classList.add("done"); $("#scanMsg").textContent = msgs[Math.min(i + 1, msgs.length - 1)]; i++; } }, 650);
  try {
    await initAnalyzer((m) => ($("#scanMsg").textContent = m));
    const result = await analyzeImage(canvas);
    await sleep(Math.max(0, 3300 - i * 650)); // build a little suspense
    clearInterval(tick); steps.forEach((s) => s.classList.add("done"));
    if (!result) {
      box.classList.add("hidden");
      return showNotice("We couldn't find a face 😢",
        "We can't spot a face in this photo — take a look at it here. If it's dark, try brighter light; if your face is small, get closer. Face the camera straight on, take off glasses or a mask, and sweep your hair back for best results.", canvas);
    }
    drawOverlay(sc, canvas, result.landmarks, "mesh", false);
    await sleep(600);
    state.analysis = result;
    state.reading = buildReading(result, state.ear, state.profile);
    box.classList.add("hidden");
    renderResult(true);
    if (result.quality.yaw > 0.12) toast("📐 Your head is turned a little. A straight-on photo gives a more accurate reading!", 6000);
  } catch (err) {
    console.error(err);
    clearInterval(tick); box.classList.add("hidden");
    showNotice("The reading engine didn't load",
      "Your connection may be slow or offline. Tap 'Reload Page' below. If it still fails, open the site in the latest Chrome or Safari. (Error: " + (err?.message || err) + ")", canvas, "reload");
  }
}

// ───────────────────────── Overlay ─────────────────────────
const PALACE_POINTS = {
  "Career": 151, "Destiny": 9, "Health": 168, "Wealth": 4, "Friends": 105, "Home": 223,
  "Family": 230, "Romance": 446, "Team": 172, "Travel": 54, "Blessings": 333, "Parents": 67,
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
const UI_FONT = '"Plus Jakarta Sans", system-ui, sans-serif';
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
    ["Upper", "Middle", "Lower"].forEach((label, k) => tag(ctx, label, rx + 6 * unit, (ys[k] + ys[k + 1]) / 2, "rgba(22,18,58,.6)", "#ffe9bd", unit, "left"));
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
  return `<svg class="radar" viewBox="-10 0 320 300" role="img" aria-label="Luck radar chart">
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
        <div><b>📜 The classics say</b>${esc(f.text.classic)}</div>
        <div><b>🍀 Luck booster</b>${esc(f.text.tip)}</div>
        <div><b>${R.tipLabel}</b>${esc(f.text.makeup || (R.gender === "m" ? GROOMING_TIPS : MAKEUP_TIPS).smile.hi)}</div>
      </div>
    </article>${i === 3 ? `<div class="ad-slot ad-infeed" data-ad="infeed"></div>` : ""}`).join("");

  el.innerHTML = `
    <div class="res-top">
      <div class="card photo-card reveal">
        <canvas id="resCanvas"></canvas>
        <div class="layer-toggle">
          <button class="chip ${state.layer === "mesh" ? "active" : ""}" data-layer="mesh">📐 Measurements</button>
          <button class="chip ${state.layer === "palace" ? "active" : ""}" data-layer="palace">🗺️ 12 Palaces</button>
          <button class="chip ${state.layer === "none" ? "active" : ""}" data-layer="none">🙂 Original</button>
        </div>
      </div>
      <div class="card hook-card reveal">
        <p class="eyebrow gold">Your face reader says…</p>
        <p class="hook-line">“${esc(R.hook)}”</p>
        <span class="shape-badge">${R.shape.emoji} ${R.shape.name} · ${R.shape.alias}</span>${R.profileLabel ? `<span class="profile-tag">👤 ${esc(R.profileLabel)}</span>` : ""}
        <div class="total">${ring(R.total)}<div><b class="total-title">Fate Score: ${R.total}</b><p>The average of your ${R.fortunes.length} lucks. Your strongest: <b>${R.ranked[0].emoji} ${R.ranked[0].name}</b>!</p></div></div>
        <div class="mini-bars">${R.fortunes.map((f) => `<div class="mini-bar"><span>${f.emoji} ${f.short}<b>${f.score}</b></span><i><b style="width:${f.score}%;background:${f.color}"></b></i></div>`).join("")}</div>
        <p class="fun-pill">✨ For entertainment only</p>
      </div>
    </div>

    <div class="card summary-card reveal">
      <h3>🔮 Your Face Story</h3>
      <p>${esc(R.summary)}</p>
    </div>

    <div class="ad-slot ad-infeed" data-ad="infeed"></div>

    <div class="card radar-card reveal">
      <div>${radar(R.fortunes)}</div>
      <div><h3 class="block-title">🏆 Your Luck Ranking</h3>
        <ol class="rank-list">${R.ranked.map((f, i) => `<li><span class="n">${i + 1}</span>${f.emoji} ${f.name}<span class="s" style="color:${f.color}">${f.score}</span></li>`).join("")}</ol></div>
    </div>

    <section>
      <h3 class="block-title">👁️ Feature-by-Feature Reading</h3>
      <div class="part-grid">${R.parts.map((p, i) => `
        <article class="card part-card reveal" style="--c:${["#f2b443", "#7c5cff", "#4a8fe7", "#f2b705", "#ff6f91", "#2fc4b2", "#a77bd9"][i % 7]}">
          <h4>${p.emoji} ${p.name} <span class="organ">${p.organ}</span></h4>
          <div class="tagrow">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <p>${esc(p.text)}</p>
        </article>`).join("")}</div>
    </section>

    <section>
      <h3 class="block-title">🍀 Your ${R.fortunes.length} Lucks, Explained</h3>
      <div class="fortune-list">${fortunesHTML}</div>
    </section>

    <div class="card reveal">
      <h3 class="block-title">🌟 Your Famous Face Twins</h3>
      <div class="match-grid">${R.figures.map(({ fig, pct }) => `
        <div class="match"><div class="av" style="background:${fig.color}">${fig.emoji}</div><b>${fig.name}</b><div class="pct">${pct}%</div><p>${FACE_SHAPES[fig.shape].name} · ${fig.parts[0]}</p></div>`).join("")}</div>
      <p class="note">A just-for-fun match comparing face-reading tendencies in your proportions — not a look-alike or identity check. <a href="#figures" data-goto="figures">See all Famous Faces →</a></p>
    </div>

    <div class="card reveal">
      <h3 class="block-title">📏 Your Measurements</h3>
      <div class="metric-grid">${R.metricsView.map((v) => `
        <div class="metric"><div class="top"><span>${v.label}</span><em>${v.word}</em></div>
        <div class="mtrack"><i style="left:${50 + Math.max(-2.5, Math.min(2.5, v.z)) * 19}%"></i></div></div>`).join("")}</div>
      <p class="note">We found 478 points on your face, leveled the tilt, then measured each feature as a ratio of your face's width and length. Center = average · left = more refined · right = bolder. Neither side is better — every face is a different strength. Head turn ${(A.quality.yaw * 100).toFixed(0)}% · tilt corrected ${A.quality.roll.toFixed(1)}°</p>
    </div>

    <div class="ad-slot ad-infeed" data-ad="infeed"></div>

    <div class="actions">
      <button class="btn btn-primary btn-xl" id="btnSave">💾 Save My Result</button>
      <button class="btn btn-gold btn-xl" id="btnShare">📤 Share with Friends</button>
      <button class="btn btn-ghost btn-xl" id="btnCopy">📋 Copy Full Reading</button>
      <button class="btn btn-ghost btn-xl" id="btnRetry">🔁 Try Another Photo</button>
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
const DISPLAY = '"Fraunces", Georgia, serif';
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
  ctx.fillText("AI face reading · ancient classics", W - 70, 114); ctx.textAlign = "left";

  // Right: face type + total
  const rx = 560;
  ctx.fillStyle = "#fff"; ctx.font = `800 34px ${UI_FONT}`;
  ctx.fillText(`${R.shape.emoji} ${R.shape.name}`, rx, 220);
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `600 26px ${UI_FONT}`; ctx.fillText(`"${R.shape.alias}"` + (R.profileLabel ? ` · ${R.profileLabel}` : ""), rx, 260);
  ctx.fillStyle = "#ffc94d"; ctx.font = `800 150px ${DISPLAY}`; ctx.fillText(String(R.total), rx, 420);
  ctx.fillStyle = "#fff"; ctx.font = `700 28px ${UI_FONT}`; ctx.fillText("FATE SCORE", rx + 6, 466);

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
  ctx.fillStyle = "#ffc94d"; ctx.font = `italic 600 42px ${DISPLAY}`;
  const hookLines = wrap(ctx, `“${R.hook}”`, W - 200).slice(0, 2);
  hookLines.forEach((l, i) => ctx.fillText(l, 100, by + 64 + i * 52));
  ctx.fillStyle = "#fff"; ctx.font = `500 26px ${UI_FONT}`;
  const sum = `${R.ranked[0].emoji} Strongest luck: ${R.ranked[0].name}. ` + R.ranked[0].text.body;
  const sl = wrap(ctx, sum, W - 200);
  const maxLines = Math.max(2, Math.floor((H - by - 110 - 70 - hookLines.length * 52) / 40));
  sl.slice(0, maxLines).forEach((l, i, arr) => ctx.fillText(i === arr.length - 1 && sl.length > maxLines ? l.replace(/\s+\S*$/, "") + "…" : l, 100, by + 64 + hookLines.length * 52 + 20 + i * 40));
  ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = `700 26px ${UI_FONT}`; ctx.textAlign = "center";
  ctx.fillText(`What does YOUR face say? 👉 ${HOST}`, W / 2, H - 58);
  ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = `500 18px ${UI_FONT}`;
  ctx.fillText("For entertainment only", W / 2, H - 28);
  return c;
}
// Word-based wrapping for English text
function wrap(ctx, text, maxW) {
  const out = []; let line = "";
  for (const word of text.split(/\s+/)) {
    const t = line ? line + " " + word : word;
    if (ctx.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t;
  }
  if (line) out.push(line); return out;
}
async function saveImage() {
  const c = await buildShareCanvas();
  c.toBlob((blob) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `myfacefate-reading-${Date.now()}.png`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("💾 Saved your result image!");
  }, "image/png");
}
async function shareResult() {
  const R = state.reading;
  const text = `My face reading: ${R.shape.name} ("${R.shape.alias}") — Fate Score ${R.total}, ${R.ranked[0].name} ${R.ranked[0].score} 🔮 What does YOUR face say?`;
  const url = `https://${HOST}/`;
  try {
    const c = await buildShareCanvas();
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const file = new File([blob], "myfacefate.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text: `${text} ${url}`, title: SITE });
    if (navigator.share) return await navigator.share({ text, url, title: SITE });
  } catch (e) { if (e.name === "AbortError") return; }
  await navigator.clipboard?.writeText(`${text} ${url}`);
  toast("🔗 Share text copied — paste it anywhere!");
}
async function copyText() {
  const R = state.reading;
  const txt = [`🔮 My MyFaceFate reading — ${R.shape.name} ("${R.shape.alias}") · Fate Score ${R.total}`, "", `“${R.hook}”`, "", R.summary, "",
    ...R.parts.map((p) => `■ ${p.name}\n${p.text}`), "",
    ...R.fortunes.map((f) => `■ ${f.name}: ${f.score}\n${f.text.open} ${f.text.body}\n💄 ${f.text.makeup}`), "",
    `Get yours free at https://${HOST} · For entertainment only`].join("\n");
  try { await navigator.clipboard.writeText(txt); toast("📋 Copied your full reading!"); }
  catch { toast("Copy isn't allowed in this browser"); }
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
    $("#palaceInfo").innerHTML = `<p class="eyebrow">The Twelve Palaces</p><h3>${p.name} Palace <span class="hanzi">${p.hanja}</span></h3><p class="place">📍 ${p.place}</p><p>${p.meaning}</p>
      <div class="palace-list">${PALACES.map((x) => `<button class="chip ${x.id === id ? "active" : ""}" data-pp="${x.id}">${x.name}</button>`).join("")}</div>`;
    $$("[data-pp]").forEach((b) => b.addEventListener("click", () => show(b.dataset.pp)));
  };
  $$("#palaceMap .dot").forEach((d) => d.addEventListener("click", () => show(d.dataset.p)));
  show("destiny");

  const organEmoji = { ear: "👂", brow: "〰️", eye: "👁️", nose: "👃", mouth: "👄" };
  $("#organGrid").innerHTML = Object.entries(FIVE_ORGANS).map(([k, o]) => `<div class="card organ"><div class="big">${organEmoji[k]}</div><b>${o.name}</b><span class="t">${o.title}</span><p>${o.role}</p></div>`).join("");

  const lvName = { hi: "Bold · long · high", mid: "Balanced", lo: "Refined · short · soft" };
  $("#partDict").innerHTML = Object.values(PART_READINGS).map((part) => `
    <div class="card dict-part"><h3>${part.emoji} ${part.name} <small>${part.organ}</small></h3>
      ${Object.entries(part).filter(([, v]) => typeof v === "object").map(([mk, t]) => `
        <div class="dict-sub">${METRIC_LABELS[mk]}</div>
        <div class="dict-row">${["hi", "mid", "lo"].map((lv) => `<div><b>${lvName[lv]}</b>${t[lv]}</div>`).join("")}</div>`).join("")}
    </div>`).join("") + `<div class="card dict-part"><h3>👂 Ears <small>The Listener · Inborn Blessings</small></h3>
      <div class="dict-row" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${Object.values(EAR_TYPES).filter((e) => e.text).map((e) => `<div><b>${e.label}</b>${e.text}</div>`).join("")}</div></div>`;
}

// ───────────────────────── Static tab: Luck Guide ─────────────────────────
function renderFortuneTab() {
  $("#fortuneGuide").innerHTML = FORTUNES.map((f) => `
    <article class="card guide" style="--c:${f.color}">
      <h3>${f.emoji} ${f.name}</h3>
      <div class="look">${Object.keys(f.weights).map((k) => `<span>${METRIC_LABELS[k] || (k === "ear" ? "Ears" : k === "balance" ? "Three-Zone balance" : k)}</span>`).join("")}</div>
      <p>${f.classic}</p>
      <p>${Object.values(FORTUNE_LINES[f.id])[0].hi}</p>
      <p class="tipline">🍀 ${f.tip}</p>
    </article>`).join("");
  const tipKeys = ["mouthCorner", "browLen", "glabella", "noseWidth", "eyeOpen", "upper", "lipThick", "smile", "jawWidth"];
  $("#tipGrid").innerHTML = tipKeys.map((k) => `<div class="card"><h4>${METRIC_LABELS[k]}</h4><p><b>To enhance it</b> ${MAKEUP_TIPS[k].lo}</p><p><b>If it's already your strength</b> ${MAKEUP_TIPS[k].hi}</p></div>`).join("");
}

// ───────────────────────── Static tab: Famous Faces ─────────────────────────
function renderFigures(filter = "all") {
  const list = FIGURES.filter((f) => filter === "all" || f.region === filter || f.gender === filter);
  $("#figGrid").innerHTML = list.map((f, i) => `
    <article class="card fig">
      <div class="fig-head"><div class="av" style="background:${f.color}22">${f.emoji}</div>
        <div><h3>${f.name}</h3><div class="meta">${f.era} · ${f.role}</div></div><span class="region">${f.region === "legend" ? "🏛️ Legend" : "⭐ Icon"}</span></div>
      <div class="shape">${FACE_SHAPES[f.shape].emoji} ${FACE_SHAPES[f.shape].name} · ${FACE_SHAPES[f.shape].alias}</div>
      <div class="tagrow">${f.parts.map((p) => `<span>${p}</span>`).join("")}</div>
      <p class="clip">${f.text}</p>
      <button class="more">Read full reading ▾</button>
      <div class="fbars">${Object.entries(f.fortunes).map(([k, v]) => `<div><span>${k}</span><i><b style="width:${v}%;background:${f.color}"></b></i><b>${v}</b></div>`).join("")}</div>
    </article>${(i + 1) % 8 === 0 && i < list.length - 1 ? `<div class="ad-slot ad-infeed fig-ad" data-ad="infeed"></div>` : ""}`).join("");
  $$("#figGrid .more").forEach((b) => b.addEventListener("click", () => {
    const p = b.previousElementSibling; const open = p.classList.toggle("clip");
    b.textContent = open ? "Read full reading ▾" : "Show less ▴";
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
  "Fortune loves a smiling face. Today, lift the corners of your mouth just 2 mm — and watch what happens.",
  "Relax the space between your brows and your luck relaxes too. A frown is the #1 thing that blocks your Destiny Palace.",
  "A clear nose tip means clear money luck. A little skincare today keeps your Wealth Palace glowing!",
  "After 40, you're responsible for your own face — it's a record of your habits. Make today's a happy one.",
  "The eyes are the window to the soul. Hold eye contact with someone for three extra seconds today.",
  "Show your forehead and your Career Palace opens. Big day? Sweep those bangs aside.",
  "Great faces come from great sleep. The secret to bright, lucky under-eyes is a good night's rest!",
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

// Debug hook (window.__mff in dev tools)
window.__mff = { state };
