// LangHUD site: first-visit language choice and small progressive enhancements.
// Every page works without this file. No wording lives here: the pages carry it, and the list of
// languages comes from the page's langhud-languages meta tag, written by Scripts/build-site.sh.
(function () {
  "use strict";

  var root = document.documentElement;
  var storageKey = "langhud-lang";

  function listedLanguages() {
    var meta = document.querySelector('meta[name="langhud-languages"]');
    var value = meta ? meta.getAttribute("content") || "" : "";
    var codes = value.split(",");
    var result = [];
    var i;
    for (i = 0; i < codes.length; i++) {
      var code = codes[i].trim().toLowerCase();
      if (code) result.push(code);
    }
    return result;
  }

  function savedLanguage(languages) {
    try {
      var value = localStorage.getItem(storageKey);
      if (value && languages.indexOf(value) >= 0) return value;
    } catch (error) {
      return null;
    }
    return null;
  }

  function remember(code) {
    try {
      localStorage.setItem(storageKey, code);
    } catch (error) {
      // Private browsing can refuse storage; the link still works for this visit.
    }
  }

  // The first non-master language in the browser's preference list that the site has.
  function browserLanguage(languages) {
    var list = navigator.languages || [navigator.language || ""];
    var i;
    for (i = 0; i < list.length; i++) {
      var code = String(list[i] || "").toLowerCase();
      var j;
      for (j = 1; j < languages.length; j++) {
        if (code === languages[j] || code.indexOf(languages[j] + "-") === 0) return languages[j];
      }
    }
    return null;
  }

  // Only a page in the master language (the site root) ever sends the visitor elsewhere, so a direct
  // visit to a language folder is never redirected away. A saved menu choice wins over the browser.
  function chooseLanguage() {
    var languages = listedLanguages();
    if (languages.length < 2 || root.lang !== languages[0]) return false;
    var saved = savedLanguage(languages);
    var target = saved || browserLanguage(languages);
    if (!target || target === languages[0]) return false;
    var page = location.pathname.split("/").pop();
    location.replace(target + "/" + page + location.search + location.hash);
    return true;
  }

  function bindLanguageMenu() {
    var links = document.querySelectorAll(".lang-menu a[hreflang]");
    var i;
    for (i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        remember(this.getAttribute("hreflang"));
      });
    }
  }

  function enhance() {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Fade sections in as they reach the viewport. Content stays visible without this script, and
    // when motion is reduced. An intersection observer does the work; a scroll check backs it up
    // (and replaces it where it is missing) so a section is never left blank, including a section
    // already above the viewport, for example after jumping to a link further down.
    if (!reduceMotion) {
      root.classList.add("js-reveal");
      var show = function (node) { node.classList.add("is-visible"); };
      var reveal = function () {
        var nodes = document.querySelectorAll(".reveal:not(.is-visible)");
        var i;
        for (i = 0; i < nodes.length; i++) {
          var rect = nodes[i].getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.92) show(nodes[i]);
        }
      };
      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              show(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, { rootMargin: "0px 0px -8% 0px" });
        document.querySelectorAll(".reveal").forEach(function (node) { observer.observe(node); });
      }
      reveal();
      window.addEventListener("scroll", reveal, { passive: true });
      window.addEventListener("resize", reveal);
    }

    // Demo video: until media/demo.mp4 exists the poster stays up with its caption. Once the file
    // loads, the caption is hidden. With reduced motion the video does not play by itself.
    document.querySelectorAll(".demo video").forEach(function (video) {
      var frame = video.closest(".demo");
      var showVideo = function () { frame.classList.add("has-video"); };
      if (video.readyState >= 2) {
        showVideo();
      } else {
        video.addEventListener("loadeddata", showVideo, { once: true });
      }
      if (reduceMotion) {
        video.removeAttribute("autoplay");
        video.pause();
        video.setAttribute("controls", "");
      }
    });
  }

  // Runs from the end of <head>, before the body is parsed, so a redirect happens before the first
  // paint. The rest waits for the body.
  if (chooseLanguage()) return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindLanguageMenu();
      enhance();
    });
  } else {
    bindLanguageMenu();
    enhance();
  }
})();
