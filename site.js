// LangHUD site: small progressive enhancements. Every page works without this file.
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal sections as they scroll into view. Content is visible by default; the hidden starting
  // state only applies once this script has added the "js-reveal" class.
  if (!reduceMotion && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(function (element) {
      observer.observe(element);
    });
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
})();
