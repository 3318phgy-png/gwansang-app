// =====================================================================
//  lang-suggest.js — shared by every language edition of MyFaceFate.
//  If the visitor's browser language (or the language they picked before)
//  differs from this page, show a small dismissible bar that links to the
//  same page in their language. It never redirects on its own, so search
//  engines always see each page as it is.
// =====================================================================
(function () {
  var LANGS = {
    en: { dir: "", name: "English", msg: "This page is also available in English.", go: "Switch to English", close: "Close" },
    zh: { dir: "zh/", name: "简体中文", msg: "本页面有简体中文版。", go: "切换到中文", close: "关闭" },
    ja: { dir: "ja/", name: "日本語", msg: "日本語版もあります。", go: "日本語で見る", close: "閉じる" },
    es: { dir: "es/", name: "Español", msg: "Esta página también está disponible en español.", go: "Ver en español", close: "Cerrar" },
    fr: { dir: "fr/", name: "Français", msg: "Cette page existe aussi en français.", go: "Voir en français", close: "Fermer" },
    de: { dir: "de/", name: "Deutsch", msg: "Diese Seite gibt es auch auf Deutsch.", go: "Auf Deutsch ansehen", close: "Schließen" },
  };
  function norm(tag) {
    var t = String(tag || "").toLowerCase();
    if (t.indexOf("zh") === 0) return "zh";
    var b = t.split("-")[0];
    return LANGS[b] ? b : null;
  }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }

  var current = norm(document.documentElement.lang) || "en";

  // Remember the language whenever the visitor picks one from a language link.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[hreflang]");
    if (!a) return;
    var l = norm(a.getAttribute("hreflang"));
    if (l) set("mff_lang", l);
  });

  if (get("mff_lang_bar_closed") === current) return;
  var target = norm(get("mff_lang"));
  if (!target) {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < prefs.length && !target; i++) target = norm(prefs[i]);
  }
  if (!target || target === current) return;

  // Same page in the other language: /ja/about.html -> /about.html -> /de/about.html
  var page = location.pathname.replace(/^\/(zh|ja|es|fr|de)\//, "/").replace(/^\//, "");
  var L = LANGS[target];
  var bar = document.createElement("div");
  bar.className = "lang-bar";
  bar.setAttribute("lang", target === "zh" ? "zh-Hans" : target);
  bar.innerHTML = '<span class="lang-bar-msg">🌐 ' + L.msg + '</span> <a class="lang-bar-go" hreflang="' + (target === "zh" ? "zh-Hans" : target) +
    '" href="/' + L.dir + page + location.hash + '">' + L.go + ' →</a><button type="button" class="lang-bar-x" aria-label="' + L.close + '">×</button>';
  bar.querySelector(".lang-bar-x").addEventListener("click", function () {
    set("mff_lang_bar_closed", current);
    set("mff_lang", current); // they chose to stay on this language
    bar.remove();
  });
  document.body.insertBefore(bar, document.body.firstChild);
})();
