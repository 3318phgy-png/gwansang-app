// =====================================================================
//  ads.js — Ad slot settings
//  After Google AdSense approval, fill in `client` and each slot `id` below
//  and real ads appear automatically. While empty, striped placeholders show
//  so you can check the layout.
// =====================================================================
export const ADS_CONFIG = {
  client: "", // e.g. "ca-pub-1234567890123456"
  slots: {
    top: { id: "", size: "728×90 / 320×100", format: "horizontal" },  // top leaderboard
    infeed: { id: "", size: "300×250 · in-feed", format: "fluid" },    // between content (several)
    side: { id: "", size: "300×600", format: "vertical" },            // desktop sidebar (sticky)
    bottom: { id: "", size: "320×50", format: "horizontal" },         // mobile sticky footer
  },
};

let scriptLoaded = false;

export function fillAds(root = document) {
  const { client, slots } = ADS_CONFIG;
  root.querySelectorAll(".ad-slot:not([data-filled])").forEach((el) => {
    const conf = slots[el.dataset.ad] || slots.infeed;
    el.dataset.filled = "1";
    if (!client || !conf.id) {
      el.classList.add("placeholder");
      el.dataset.size = conf.size;
      return;
    }
    if (!scriptLoaded) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
      scriptLoaded = true;
    }
    el.classList.add("live");
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
