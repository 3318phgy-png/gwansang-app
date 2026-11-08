// =====================================================================
//  ads.js — 광고 영역 설정
//  Google AdSense 승인 후 아래 client / slot 값만 채우면 자동으로 광고가 들어갑니다.
//  값이 비어 있으면 광고 자리를 숨깁니다. (주소에 ?adpreview 를 붙이면 자리표시가 보입니다)
// =====================================================================
export const ADS_CONFIG = {
  client: "ca-pub-2164050743743017", // 애드센스 게시자 ID
  slots: {
    top: { id: "", size: "728×90 / 320×100", format: "horizontal" },  // 상단 리더보드
    infeed: { id: "", size: "300×250 · 인피드", format: "fluid" },     // 결과 중간 (여러 개)
    side: { id: "", size: "300×600", format: "vertical" },            // PC 사이드바
    bottom: { id: "", size: "320×50", format: "horizontal" },         // 모바일 하단 고정
  },
};

let scriptLoaded = false;
const PREVIEW = typeof location !== "undefined" && /[?&]adpreview/.test(location.search);

export function fillAds(root = document) {
  const { client, slots } = ADS_CONFIG;
  root.querySelectorAll(".ad-slot:not([data-filled])").forEach((el) => {
    const conf = slots[el.dataset.ad] || slots.infeed;
    el.dataset.filled = "1";
    if (!client || !conf.id) {
      // 광고 번호가 없으면 숨깁니다. 주소 끝에 ?adpreview 를 붙이면 자리표시를 볼 수 있어요.
      if (PREVIEW) { el.classList.add("placeholder"); el.dataset.size = conf.size; }
      else { el.style.display = "none"; const anchor = el.closest(".ad-anchor"); if (anchor) anchor.style.display = "none"; }
      return;
    }
    if (!scriptLoaded && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
      scriptLoaded = true;
    }
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.style.width = "100%";
    ins.dataset.adClient = client;
    ins.dataset.adSlot = conf.id;
    ins.dataset.adFormat = conf.format === "fluid" ? "auto" : conf.format;
    ins.dataset.fullWidthResponsive = "true";
    el.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* noop */ }
  });
}
