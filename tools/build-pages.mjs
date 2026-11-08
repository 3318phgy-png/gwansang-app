// =====================================================================
//  tools/build-pages.mjs — 검색에 걸리는 정적 페이지 만들기
//  앱이 쓰는 데이터(js/content.js, js/figures.js)로 아래 페이지를 생성합니다.
//    /figures, /figures/<id>      인물 관상 (모아 보기 + 38명)
//    /parts,   /parts/<slug>      부위별 관상 (모아 보기 + 7개)
//    /fortune, /fortune/<id>      운세별 관상 (모아 보기 + 10개)
//    /shapes  /palaces  /books    얼굴형(오행) · 십이궁 · 3대 고전
//  그리고 sitemap.xml을 다시 만듭니다.
//  실행:  node tools/build-pages.mjs     (저장소 최상위 폴더에서)
//  Cloudflare Pages는 /a/b.html 을 /a/b 주소로 보여 주므로, 링크는 .html 없이 씁니다.
// =====================================================================
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = await import(join(ROOT, "js/content.js"));
const { FIGURES } = await import(join(ROOT, "js/figures.js"));
const { BOOKS, FACE_SHAPES, PALACES, FIVE_ORGANS, PART_READINGS, EAR_TYPES, FORTUNES, FORTUNE_LINES,
  AGE_LINES, MAKEUP_TIPS, GROOMING_TIPS, METRIC_LABELS } = C;

const SITE = "https://gwansangdosa.com";
const TODAY = new Date().toISOString().slice(0, 10);
const APP_V = (readFileSync(join(ROOT, "version.json"), "utf8").match(/"v":\s*"(\w+)"/) || [])[1] || "1";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

// ── 부위 ↔ 지표 ↔ 운세 연결 ──────────────────────────────
const PART_SLUG = { forehead: "forehead", brow: "eyebrows", eye: "eyes", nose: "nose", mouth: "mouth", lower: "chin", ear: "ears" };
const PART_TITLE = { forehead: "이마", brow: "눈썹", eye: "눈", nose: "코", mouth: "입", lower: "인중·턱", ear: "귀" };
const METRIC_PART = {
  upper: "forehead", browLen: "brow", browThick: "brow", browTilt: "brow", browEye: "brow", glabella: "brow",
  eyeOpen: "eye", eyeTilt: "eye", eyeGap: "eye", noseWidth: "nose", noseLen: "nose",
  mouthWidth: "mouth", mouthCorner: "mouth", lipThick: "mouth", smile: "mouth",
  philtrum: "lower", chinLen: "lower", jawWidth: "lower", lower: "lower", ear: "ear",
};
const LABEL = (k) => METRIC_LABELS[k] || { ear: "귀", balance: "삼정 균형", smile: "미소" }[k] || k;
const FIG_FORTUNE_ID = { 재물운: "wealth", 연애운: "love", 취업운: "career", 건강운: "health", 사업운: "business", 명예운: "honor", 자식운: "children", 대인운: "people" };
const fortunesForPart = (pk) => FORTUNES.filter((f) => Object.keys(f.weights).some((m) => METRIC_PART[m] === pk));
const partsForFortune = (f) => [...new Set(Object.keys(f.weights).map((m) => METRIC_PART[m]).filter(Boolean))];

// ── 공통 틀 ──────────────────────────────────────────────
function page({ path, title, desc, lead, h1, eyebrow, crumbs = [], body, jsonld = [] }) {
  const url = SITE + path;
  const bc = [{ name: "관상도사", path: "/" }, ...crumbs];
  const ld = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: bc.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: SITE + c.path })) },
    ...jsonld,
  ];
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="관상도사" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:image" content="${SITE}/img/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#2b1d5c" />
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css?v=${APP_V}" />
  <link rel="stylesheet" href="/css/pages.css?v=${APP_V}" />
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n  ")}
</head>
<body>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="logo" href="/"><span class="logo-mark">相</span><span class="logo-text">관상도사<small>3대 고전으로 읽는 실관상</small></span></a>
      <nav class="tabs">
        <a class="tab" href="/">📸 내 관상 보기</a>
        <a class="tab" href="/parts">👁️ 부위별</a>
        <a class="tab" href="/fortune">🍀 운세별</a>
        <a class="tab" href="/figures">🌏 인물</a>
        <a class="tab" href="/shapes">🧭 얼굴형</a>
      </nav>
    </div>
  </header>
  <div class="wrap"><div class="ad-slot ad-top" data-ad="top"></div></div>
  <main class="wrap article">
    <nav class="crumbs">${bc.map((c, i) => (i < bc.length - 1 ? `<a href="${c.path}">${esc(c.name)}</a>` : `<span>${esc(c.name)}</span>`)).join(" › ")}</nav>
    <header class="art-head">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}
      <h1>${h1}</h1>
      <p class="lead">${esc(lead ?? desc)}</p>
    </header>
    ${body}
    ${cta()}
    <section class="more card">
      <h2>📚 관상 백과 더 보기</h2>
      <div class="link-grid">
        <a href="/parts">👁️ 부위별 관상 보는 법</a><a href="/fortune">🍀 운세별 관상</a><a href="/figures">🌏 인물 관상 38인</a>
        <a href="/shapes">🧭 오행 얼굴형</a><a href="/palaces">🗺️ 얼굴 지도 십이궁</a><a href="/books">📜 관상학 3대 고전</a>
      </div>
    </section>
    <p class="disclaimer">관상도사의 풀이는 전통 관상학(마의상법·유장상법·신상전편)의 체계를 바탕으로 한 재미용 콘텐츠이며 과학적·의학적 판단이 아닙니다.</p>
  </main>
  <footer class="site-footer"><div class="wrap">
    <p><b>관상도사</b> · 마의상법 · 유장상법 · 신상전편 기반 무료 AI 관상</p>
    <p class="small"><a href="/about" style="color:inherit">서비스 소개·광고 문의</a> · <a href="/privacy" style="color:inherit">개인정보처리방침</a> · <a href="/terms" style="color:inherit">이용약관</a> · © 2026 관상도사</p>
  </div></footer>
  <script type="module">import { fillAds } from "/js/ads.js?v=${APP_V}"; fillAds();</script>
</body>
</html>
`;
}
const cta = (text = "내 얼굴은 어떤 관상일까?") => `
    <section class="cta">
      <div><b>${esc(text)}</b><span>사진 한 장이면 눈썹·눈·코·입을 실제로 재서 10가지 운세까지 무료로 풀어 드려요. 사진은 기기 밖으로 나가지 않아요.</span></div>
      <a class="btn btn-primary btn-xl" href="/">📸 내 관상 보러 가기</a>
    </section>`;
const adMid = `<div class="ad-slot ad-infeed" data-ad="infeed"></div>`;
const bars = (obj, color) => `<div class="fbars">${Object.entries(obj).map(([k, v]) => {
  const id = FIG_FORTUNE_ID[k];
  const name = id ? `<a href="/fortune/${id}">${esc(k)}</a>` : esc(k);
  return `<div><span>${name}</span><i><b style="width:${v}%;background:${color}"></b></i><em>${v}</em></div>`;
}).join("")}</div>`;

const OUT = [];
function emit(path, html) {
  const file = path === "/" ? "index.html" : path.replace(/^\//, "") + ".html";
  const full = join(ROOT, file);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
  OUT.push(path);
}

// ── 인물 관상 ────────────────────────────────────────────
const genderWord = { m: "남성", f: "여성" };
for (const f of FIGURES) {
  const shape = FACE_SHAPES[f.shape];
  const related = FIGURES.filter((x) => x.id !== f.id && (x.shape === f.shape || x.region === f.region))
    .sort((a, b) => (b.shape === f.shape) - (a.shape === f.shape)).slice(0, 6);
  const topFortune = Object.entries(f.fortunes).sort((a, b) => b[1] - a[1])[0];
  const body = `
    <section class="card fig-hero" style="--c:${f.color}">
      <div class="av">${f.emoji}</div>
      <div>
        <p class="meta">${esc(f.era)} · ${esc(f.role)} · ${f.region === "국내" ? "🇰🇷 국내" : "🌍 해외"} · ${genderWord[f.gender]}</p>
        <p class="shape">${shape.emoji} ${esc(shape.alias)} · ${esc(shape.name)}</p>
        <div class="tagrow">${f.parts.map((p) => `<span>${esc(p)}</span>`).join("")}</div>
      </div>
    </section>
    <section class="card prose">
      <h2>${esc(f.name)}의 관상 풀이</h2>
      <p>${esc(f.text)}</p>
    </section>
    ${adMid}
    <section class="card">
      <h2>관상으로 본 운세</h2>
      ${bars(f.fortunes, f.color)}
      <p class="note">가장 두드러진 운은 <b>${esc(topFortune[0])}</b>입니다. 운세 이름을 누르면 그 운을 얼굴 어디에서 보는지 알 수 있어요.</p>
    </section>
    <section class="card prose">
      <h2>${shape.emoji} ${esc(shape.name)}이란?</h2>
      <p>${esc(shape.text)}</p>
      <p><a href="/shapes#${f.shape}">오행 얼굴형 전체 보기 →</a></p>
    </section>
    <section class="card">
      <h2>비슷한 관상의 인물</h2>
      <div class="link-grid">${related.map((x) => `<a href="/figures/${x.id}">${x.emoji} ${esc(x.name)} <small>${esc(FACE_SHAPES[x.shape].alias)}</small></a>`).join("")}</div>
    </section>`;
  emit(`/figures/${f.id}`, page({
    path: `/figures/${f.id}`,
    title: `${f.name} 관상 풀이 · ${shape.alias} ${shape.name} | 관상도사`,
    desc: clip(`${f.name}(${f.role})의 관상을 마의상법·신상전편으로 풀어 봤어요. ${f.parts.join(", ")}. ${f.text}`, 150),
    lead: `${f.name}(${f.role})의 얼굴을 마의상법·신상전편으로 풀어 봤어요. ${f.parts.join(" · ")}에 담긴 이야기를 만나 보세요.`,
    h1: `${f.emoji} ${esc(f.name)} 관상`,
    eyebrow: "인물 관상 리서치",
    crumbs: [{ name: "인물 관상", path: "/figures" }, { name: f.name, path: `/figures/${f.id}` }],
    body,
    jsonld: [{ "@context": "https://schema.org", "@type": "Article", headline: `${f.name} 관상 풀이`, inLanguage: "ko", about: { "@type": "Person", name: f.name }, author: { "@type": "Organization", name: "관상도사" }, publisher: { "@type": "Organization", name: "관상도사", logo: { "@type": "ImageObject", url: `${SITE}/icons/icon-512.png` } }, image: `${SITE}/img/og-image.png`, mainEntityOfPage: `${SITE}/figures/${f.id}`, dateModified: TODAY }],
  }));
}
{
  const group = (title, list) => `<section class="card"><h2>${title} <small>${list.length}명</small></h2><div class="fig-list">${list.map((f) => `
      <a class="fig-item" href="/figures/${f.id}" style="--c:${f.color}"><span class="av">${f.emoji}</span><span><b>${esc(f.name)}</b><small>${esc(f.role)} · ${esc(FACE_SHAPES[f.shape].alias)}</small></span></a>`).join("")}</div></section>`;
  const body = [
    group("🇰🇷 국내 · 남성", FIGURES.filter((f) => f.region === "국내" && f.gender === "m")),
    group("🇰🇷 국내 · 여성", FIGURES.filter((f) => f.region === "국내" && f.gender === "f")),
    adMid,
    group("🌍 해외 · 남성", FIGURES.filter((f) => f.region === "해외" && f.gender === "m")),
    group("🌍 해외 · 여성", FIGURES.filter((f) => f.region === "해외" && f.gender === "f")),
  ].join("\n");
  emit("/figures", page({
    path: "/figures", title: "인물 관상 38인 · 위인과 스타의 얼굴로 본 성공 비결 | 관상도사",
    desc: "세종대왕, 이순신, 손흥민, 유재석, 아이유부터 링컨, 아인슈타인, 오드리 헵번까지 국내외 38인의 관상을 3대 관상 고전으로 풀어 봤어요.",
    h1: "🌏 인물 관상 38인", eyebrow: "인물 관상 리서치", crumbs: [{ name: "인물 관상", path: "/figures" }], body,
  }));
}

// ── 부위별 관상 ──────────────────────────────────────────
const LV = { hi: "크다 · 길다 · 높다", mid: "균형형", lo: "작다 · 짧다 · 낮다" };
const organOf = { forehead: null, brow: "brow", eye: "eye", nose: "nose", mouth: "mouth", lower: null, ear: "ear" };
const palacesOf = { forehead: ["gwallok", "bumo", "bokdeok", "cheoni"], brow: ["hyeongje", "myeong", "jeontaek"], eye: ["janyeo", "cheocheop", "jeontaek"], nose: ["jaebaek", "jilaek"], mouth: [], lower: ["nobok"], ear: [] };
for (const [pk, slug] of Object.entries(PART_SLUG)) {
  const nameKo = PART_TITLE[pk];
  const P = PART_READINGS[pk];
  const organ = organOf[pk] ? FIVE_ORGANS[organOf[pk]] : null;
  const pals = (palacesOf[pk] || []).map((id) => PALACES.find((x) => x.id === id)).filter(Boolean);
  const fs = fortunesForPart(pk);
  let main = "";
  if (pk === "ear") {
    main = `<section class="card prose"><h2>귀는 '채청관(採聽官)'</h2><p>마의상법은 귀를 오관 중 '채청관', 곧 듣고 받아들이는 기관이라 하여 타고난 복과 수명을 보는 자리로 여겼습니다. 귀는 오관 중 가장 먼저 생기고 가장 늦게까지 변하지 않는 부위라, 어린 시절(1~14세)의 운과 평생의 기본 복을 함께 본다고 해요.</p></section>
    <section class="card"><h2>귀 모양별 관상</h2><div class="type-list">${Object.values(EAR_TYPES).filter((e) => e.text).map((e) => `<div><b>${esc(e.label)}</b><p>${esc(e.text)}</p></div>`).join("")}</div></section>`;
  } else {
    const metrics = Object.entries(P).filter(([, v]) => typeof v === "object");
    main = `<section class="card prose"><h2>${esc(P.name)} 관상의 기본</h2><p>${esc(P.intro)}</p></section>
    ${metrics.map(([mk, t]) => `<section class="card"><h2>${esc(LABEL(mk))}으로 보는 관상</h2><div class="type-list">${["hi", "mid", "lo"].map((lv) => `<div><b>${LV[lv]}</b><p>${esc(t[lv])}</p></div>`).join("")}</div>
      ${MAKEUP_TIPS[mk] ? `<p class="tipline">💄 <b>메이크업:</b> ${esc(MAKEUP_TIPS[mk].lo)}<br />💈 <b>그루밍:</b> ${esc((GROOMING_TIPS[mk] || MAKEUP_TIPS[mk]).lo)}</p>` : ""}</section>`).join("\n")}
    <section class="card prose"><h2>개운(開運) 한마디</h2><p>${esc(P.outro)}</p></section>`;
  }
  const body = `
    ${organ ? `<section class="card organ-box"><b>${esc(organ.name)} = ${esc(organ.title)}</b><span>${esc(organ.role)}</span></section>` : ""}
    ${main}
    ${adMid}
    ${pals.length ? `<section class="card"><h2>${nameKo}에 있는 십이궁</h2><div class="type-list">${pals.map((x) => `<div><b>${esc(x.name)} · ${esc(x.place)}</b><p>${esc(x.meaning)}</p></div>`).join("")}</div><p><a href="/palaces">얼굴 지도 십이궁 전체 보기 →</a></p></section>` : ""}
    ${fs.length ? `<section class="card"><h2>${nameKo}로 보는 운세</h2><div class="link-grid">${fs.map((f) => `<a href="/fortune/${f.id}">${f.emoji} ${esc(f.name)}</a>`).join("")}</div></section>` : ""}
    <section class="card"><h2>다른 부위 관상</h2><div class="link-grid">${Object.entries(PART_SLUG).filter(([k]) => k !== pk).map(([k, s]) => `<a href="/parts/${s}">${PART_TITLE[k]} 관상</a>`).join("")}</div></section>`;
  const firstText = pk === "ear" ? EAR_TYPES.lobe.text : P.intro;
  emit(`/parts/${slug}`, page({
    path: `/parts/${slug}`,
    title: `${nameKo} 관상 보는 법 · 모양별 성격과 운세 | 관상도사`,
    desc: clip(`${nameKo} 관상, 어떻게 볼까요? ${organ ? organ.title + " · " + organ.role + ". " : ""}${firstText}`, 150),
    lead: `${nameKo} 모양으로 성격과 운을 읽는 법을 3대 관상 고전으로 쉽게 정리했어요.`,
    h1: `${pk === "ear" ? "👂" : P.emoji} ${nameKo} 관상 보는 법`,
    eyebrow: "부위별 관상",
    crumbs: [{ name: "부위별 관상", path: "/parts" }, { name: `${nameKo} 관상`, path: `/parts/${slug}` }],
    body,
  }));
}
emit("/parts", page({
  path: "/parts", title: "부위별 관상 보는 법 · 이마 눈썹 눈 코 입 턱 귀 | 관상도사",
  desc: "이마, 눈썹, 눈, 코, 입, 인중과 턱, 귀까지. 마의상법의 오관(五官)과 십이궁 체계로 얼굴 부위별 관상 보는 법을 쉽게 정리했어요.",
  h1: "👁️ 부위별 관상 보는 법", eyebrow: "기본 관상학", crumbs: [{ name: "부위별 관상", path: "/parts" }],
  body: `<section class="card prose"><h2>오관(五官) · 다섯 개의 관문</h2><p>마의상법은 얼굴의 다섯 기관을 '오관'이라 불렀습니다. 귀는 채청관, 눈썹은 보수관, 눈은 감찰관, 코는 심변관, 입은 출납관이에요. 여기에 이마(상정)와 인중·턱(하정)을 더해 얼굴 전체의 운을 봅니다.</p></section>
  <section class="card"><div class="part-cards">${Object.entries(PART_SLUG).map(([k, s]) => {
    const P = PART_READINGS[k]; const o = organOf[k] ? FIVE_ORGANS[organOf[k]] : null;
    return `<a href="/parts/${s}"><span class="em">${k === "ear" ? "👂" : P.emoji}</span><b>${PART_TITLE[k]} 관상</b><small>${esc(o ? o.title : P ? P.organ : "")}</small></a>`;
  }).join("")}</div></section>`,
}));

// ── 운세별 관상 ──────────────────────────────────────────
for (const f of FORTUNES) {
  const lines = FORTUNE_LINES[f.id] || {};
  const parts = partsForFortune(f);
  const tipKeys = Object.keys(f.weights).filter((k) => MAKEUP_TIPS[k]).slice(0, 3);
  const body = `
    <section class="card prose"><h2>고전은 ${esc(f.name)}을 이렇게 봅니다</h2><p>${esc(f.classic)}</p></section>
    <section class="card"><h2>${esc(f.name)}을 보는 얼굴 특징</h2>
      <div class="type-list">${Object.keys(f.weights).map((k) => {
        const L = lines[k]; if (!L || (!L.hi && !L.lo)) return "";
        const part = METRIC_PART[k];
        return `<div><b>${esc(LABEL(k))}${part ? ` · <a href="/parts/${PART_SLUG[part]}">${PART_TITLE[part]} 관상 →</a>` : ""}</b>${L.hi ? `<p>▲ ${esc(L.hi)}</p>` : ""}${L.lo ? `<p>▼ ${esc(L.lo)}</p>` : ""}</div>`;
      }).join("")}</div></section>
    ${adMid}
    ${AGE_LINES[f.id] ? `<section class="card"><h2>나이대별 ${esc(f.name)}</h2><div class="type-list"><div><b>20대 이하</b><p>${esc(AGE_LINES[f.id].early)}</p></div><div><b>30~40대</b><p>${esc(AGE_LINES[f.id].mid)}</p></div><div><b>50대 이상</b><p>${esc(AGE_LINES[f.id].late)}</p></div></div></section>` : ""}
    <section class="card prose"><h2>🍀 ${esc(f.name)}을 여는 개운 포인트</h2><p>${esc(f.tip)}</p>
      ${tipKeys.map((k) => `<p class="tipline">💄 <b>${esc(LABEL(k))} 메이크업:</b> ${esc(MAKEUP_TIPS[k].lo)}<br />💈 <b>그루밍:</b> ${esc((GROOMING_TIPS[k] || MAKEUP_TIPS[k]).lo)}</p>`).join("")}</section>
    <section class="card"><h2>${esc(f.name)}과 관련된 부위</h2><div class="link-grid">${parts.map((p) => `<a href="/parts/${PART_SLUG[p]}">${PART_TITLE[p]} 관상</a>`).join("")}</div></section>
    <section class="card"><h2>다른 운세 관상</h2><div class="link-grid">${FORTUNES.filter((x) => x.id !== f.id).map((x) => `<a href="/fortune/${x.id}">${x.emoji} ${esc(x.name)}</a>`).join("")}</div></section>`;
  emit(`/fortune/${f.id}`, page({
    path: `/fortune/${f.id}`,
    title: `${f.name} 관상 · ${f.name} 좋은 얼굴 특징과 개운법 | 관상도사`,
    desc: clip(`${f.name}이 좋은 관상은? ${f.classic}`, 150),
    lead: `${f.name}이 좋은 얼굴은 어떤 모습일까요? 얼굴 특징, 나이대별 풀이, 운을 여는 방법까지 정리했어요.`,
    h1: `${f.emoji} ${esc(f.name)} 관상`,
    eyebrow: "운세별 관상",
    crumbs: [{ name: "운세별 관상", path: "/fortune" }, { name: `${f.name} 관상`, path: `/fortune/${f.id}` }],
    body,
  }));
}
emit("/fortune", page({
  path: "/fortune", title: "운세별 관상 · 재물운 연애운 결혼운 학업운 얼굴 특징 | 관상도사",
  desc: "재물운, 연애운, 결혼·부부운, 취업운, 학업운, 건강운, 사업운, 명예운, 자식운, 인복까지. 운마다 얼굴 어디를 보는지, 운을 여는 방법까지 정리했어요.",
  h1: "🍀 운세별 관상", eyebrow: "생활 · 상황별 관상", crumbs: [{ name: "운세별 관상", path: "/fortune" }],
  body: `<section class="card"><div class="part-cards">${FORTUNES.map((f) => `<a href="/fortune/${f.id}" style="--c:${f.color}"><span class="em">${f.emoji}</span><b>${esc(f.name)}</b><small>${esc(Object.keys(f.weights).slice(0, 3).map(LABEL).join(" · "))}</small></a>`).join("")}</div></section>`,
}));

// ── 얼굴형 · 십이궁 · 3대 고전 ───────────────────────────
emit("/shapes", page({
  path: "/shapes", title: "오행 얼굴형 관상 · 목형 화형 토형 금형 수형 | 관상도사",
  desc: "신상전편의 오행형상(五行形)으로 보는 얼굴형 관상. 긴 얼굴(목형), 역삼각형(화형), 두툼한 얼굴(토형), 각진 얼굴(금형), 둥근 얼굴(수형), 계란형까지.",
  h1: "🧭 오행 얼굴형 관상", eyebrow: "신상전편 오행형상", crumbs: [{ name: "오행 얼굴형", path: "/shapes" }],
  body: Object.entries(FACE_SHAPES).map(([k, s], i) => {
    const figs = FIGURES.filter((f) => f.shape === k);
    return `<section class="card prose" id="${k}" style="border-top:5px solid ${s.color}"><h2>${s.emoji} ${esc(s.name)} · ${esc(s.alias)}</h2><p>${esc(s.text)}</p>
      ${figs.length ? `<p class="note">이 얼굴형의 인물:</p><div class="link-grid">${figs.map((f) => `<a href="/figures/${f.id}">${f.emoji} ${esc(f.name)}</a>`).join("")}</div>` : ""}</section>${i === 2 ? adMid : ""}`;
  }).join("\n"),
}));
emit("/palaces", page({
  path: "/palaces", title: "얼굴 지도 십이궁(十二宮) · 명궁 재백궁 관록궁 위치와 의미 | 관상도사",
  desc: "마의상법의 십이궁(十二宮). 명궁, 재백궁, 형제궁, 전택궁, 자녀궁, 노복궁, 처첩궁, 질액궁, 천이궁, 관록궁, 복덕궁, 부모궁이 얼굴 어디에 있고 무엇을 뜻하는지 정리했어요.",
  h1: "🗺️ 얼굴 지도 · 십이궁", eyebrow: "마의상법", crumbs: [{ name: "십이궁", path: "/palaces" }],
  body: `<section class="card prose"><p>마의상법은 얼굴을 열두 개의 궁(宮)으로 나눠 각 자리에 삶의 영역을 배정했습니다. 재물은 코, 직업은 이마 한가운데, 배우자는 눈꼬리 옆처럼 '얼굴 지도'를 그려 운을 읽는 방식이에요.</p></section>
  <section class="card"><div class="type-list">${PALACES.map((x) => `<div><b>${esc(x.name)} · ${esc(x.place)}</b><p>${esc(x.meaning)}</p></div>`).join("")}</div></section>${adMid}
  <section class="card prose"><h2>📐 삼정(三停) — 얼굴을 셋으로 나누기</h2><p><b>상정</b>(머리털~눈썹)은 초년운과 지혜, <b>중정</b>(눈썹~코끝)은 중년운과 의지·재물, <b>하정</b>(코밑~턱끝)은 말년운과 건강·자손을 봅니다. 세 부분의 길이가 비슷할수록 일생의 운이 고르게 흐른다고 해요.</p></section>`,
}));
emit("/books", page({
  path: "/books", title: "관상학 3대 고전 · 마의상법 유장상법 신상전편 | 관상도사",
  desc: "국내 관상가들이 '3대 상서'로 꼽는 마의상법(麻衣相法), 유장상법(柳莊相法), 신상전편(神相全編)을 쉽게 소개합니다.",
  h1: "📜 관상학 3대 고전", eyebrow: "이 서비스가 참고한 책", crumbs: [{ name: "3대 고전", path: "/books" }],
  body: BOOKS.map((b) => `<section class="card prose" style="border-top:5px solid ${b.color}"><h2>${esc(b.name)} <small>${esc(b.hanja)} · ${esc(b.era)}</small></h2><p>${esc(b.desc)}</p><div class="tagrow">${b.key.map((k) => `<span>${esc(k)}</span>`).join("")}</div></section>`).join("\n"),
}));

// ── 사이트 지도 ──────────────────────────────────────────
const urls = [["/", "1.0"], ["/figures", "0.8"], ["/parts", "0.8"], ["/fortune", "0.8"], ["/shapes", "0.7"], ["/palaces", "0.7"], ["/books", "0.6"],
  ...OUT.filter((p) => /^\/(figures|parts|fortune)\//.test(p)).map((p) => [p, "0.7"]),
  ["/about", "0.5"], ["/privacy", "0.3"], ["/terms", "0.3"]];
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr]) => `  <url><loc>${SITE}${p === "/" ? "/" : p}</loc><lastmod>${TODAY}</lastmod><priority>${pr}</priority></url>`).join("\n")}
</urlset>
`);
console.log(`pages: ${OUT.length}, sitemap urls: ${urls.length}`);
