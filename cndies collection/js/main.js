(function () {
  const site = window.CndiesSite = window.CndiesSite || {};

  site.whatsAppNumber = "27781347169";

  site.formatPrice = function formatPrice(value) {
    const amount = Number(value) || 0;
    return "R" + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  site.whatsAppUrl = function whatsAppUrl(phoneName) {
    return "https://wa.me/" + site.whatsAppNumber + "?text=" + encodeURIComponent("Hi I want to enquire about " + phoneName);
  };

  site.phoneAssetCandidates = function phoneAssetCandidates(slug, side) {
    return [
      "assets/images/phones/" + slug + "/" + side + ".webp",
      "assets/images/phones/" + slug + "/" + side + ".png",
      "assets/images/phones/" + slug + "/" + side + ".jpg",
      "assets/images/phones/" + slug + "/" + side + ".jpeg"
    ];
  };

  site.placeholderPhoneSvg = function placeholderPhoneSvg(label, side) {
    const safeLabel = (label || "iPhone").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSide = (side || "front").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = [
      "<svg xmlns='http://www.w3.org/2000/svg' width='520' height='760' viewBox='0 0 520 760'>",
      "<defs>",
      "<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>",
      "<stop stop-color='#3b82f6' offset='0'/>",
      "<stop stop-color='#1d4ed8' offset='1'/>",
      "</linearGradient>",
      "</defs>",
      "<rect width='520' height='760' rx='68' fill='#0f172a'/>",
      "<rect x='22' y='22' width='476' height='716' rx='52' fill='url(#g)' opacity='0.12'/>",
      "<rect x='78' y='78' width='364' height='604' rx='44' fill='#1e293b' stroke='rgba(59,130,246,0.3)' stroke-width='2'/>",
      "<text x='260' y='340' text-anchor='middle' fill='#f1f5f9' font-size='34' font-family='Arial, sans-serif' font-weight='700'>" + safeLabel + "</text>",
      "<text x='260' y='386' text-anchor='middle' fill='#64748b' font-size='24' font-family='Arial, sans-serif'>Local " + safeSide + " image unavailable</text>",
      "</svg>"
    ].join("");

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  };

  site.loadImage = function loadImage(img, candidates, label, side) {
    if (!img) {
      return;
    }

    const sources = Array.isArray(candidates) ? candidates.slice() : [];
    const fallback = site.placeholderPhoneSvg(label, side);
    let index = 0;

    function tryNext() {
      if (index >= sources.length) {
        img.onerror = null;
        img.src = fallback;
        img.classList.add("is-placeholder");
        return;
      }

      img.classList.remove("is-placeholder");
      img.src = sources[index];
      index += 1;
    }

    img.onerror = tryNext;
    tryNext();
  };

  function setupMobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      const isOpen = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".site-header a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") {
          return;
        }

        const target = document.querySelector(targetId);
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupNavbarScroll() {
    const header = document.querySelector(".site-header");
    if (!header) {
      return;
    }

    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupSmoothAnchors();
    setupNavbarScroll();
  });
}());
