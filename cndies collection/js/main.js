(function () {
  function ensurePolishStyles() {
    if (document.querySelector('link[data-cndies-polish]')) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/polish.css?v=20260910";
    link.setAttribute("data-cndies-polish", "true");
    document.head.appendChild(link);
  }

  ensurePolishStyles();

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
      "<stop stop-color='#f2dfad' offset='0'/>",
      "<stop stop-color='#a98340' offset='1'/>",
      "</linearGradient>",
      "</defs>",
      "<rect width='520' height='760' rx='68' fill='#111111'/>",
      "<rect x='22' y='22' width='476' height='716' rx='52' fill='url(#g)' opacity='0.10'/>",
      "<rect x='78' y='78' width='364' height='604' rx='44' fill='#1b1916' stroke='rgba(226,198,139,0.30)' stroke-width='2'/>",
      "<text x='260' y='340' text-anchor='middle' fill='#f8f5ee' font-size='34' font-family='Arial, sans-serif' font-weight='700'>" + safeLabel + "</text>",
      "<text x='260' y='386' text-anchor='middle' fill='#9c9487' font-size='24' font-family='Arial, sans-serif'>Local " + safeSide + " image unavailable</text>",
      "</svg>"
    ].join("");

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  };

  site.loadImage = function loadImage(img, candidates, label, side) {
    if (!img) {
      return;
    }

    if (!img.hasAttribute("loading")) {
      img.loading = "lazy";
    }
    img.decoding = "async";

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

    if (toggle.querySelectorAll("span").length === 2) {
      toggle.appendChild(document.createElement("span"));
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

    function syncHeaderState() {
      header.classList.toggle("scrolled", window.scrollY > 50);
    }

    window.addEventListener("scroll", syncHeaderState, { passive: true });
    syncHeaderState();
  }

  function setupStorefrontPolish() {
    document.body.classList.add("site-polished");

    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");

    if (searchInput && !searchInput.getAttribute("aria-label")) {
      searchInput.setAttribute("aria-label", "Search iPhones");
    }
    if (sortSelect && !sortSelect.getAttribute("aria-label")) {
      sortSelect.setAttribute("aria-label", "Sort iPhones by price");
    }

    if (!document.querySelector(".floating-whatsapp")) {
      const whatsapp = document.createElement("a");
      whatsapp.className = "floating-whatsapp";
      whatsapp.href = site.whatsAppUrl("an iPhone");
      whatsapp.target = "_blank";
      whatsapp.rel = "noopener noreferrer";
      whatsapp.setAttribute("aria-label", "Chat with CNDIE'S COLLECTION on WhatsApp");
      whatsapp.innerHTML = [
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">',
        '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.198.297-.768.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.611-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.009-.372-.01-.571-.01s-.52.075-.792.372c-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.71.306 1.26.489 1.69.625.71.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>',
        '<path d="M12 2.001C6.486 2.001 2 6.487 2 12.001c0 2.113.69 4.061 1.84 5.678L2 22l4.502-1.153A9.942 9.942 0 0 0 12 22.001c5.514 0 10-4.486 10-10 0-5.514-4.486-10-10-10zm0 18c-1.777 0-3.432-.575-4.814-1.553l-.344-.208-2.846.73.76-2.775-.224-.356A7.958 7.958 0 0 1 4 12.001c0-4.411 3.589-7.999 8-7.999s8 3.588 8 7.999c0 4.411-3.589 7.999-8 7.999z"/>',
        "</svg>",
        "<span>WhatsApp</span>"
      ].join("");
      document.body.appendChild(whatsapp);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupSmoothAnchors();
    setupNavbarScroll();
    setupStorefrontPolish();
  });
}());
