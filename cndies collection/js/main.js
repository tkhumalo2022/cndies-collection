(function () {
  function ensureStylesheet(selector, href, attributeName) {
    if (document.querySelector(selector)) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(attributeName, "true");
    document.head.appendChild(link);
  }

  function ensurePolishStyles() {
    ensureStylesheet('link[data-cndies-polish]', "css/polish.css?v=20260910", "data-cndies-polish");
  }

  function ensureAppleEnhanceStyles() {
    ensureStylesheet('link[data-cndies-apple-enhance]', "css/apple-enhance.css?v=20260910b", "data-cndies-apple-enhance");
  }

  function ensureDeviceHotfixStyles() {
    ensureStylesheet('link[data-cndies-device-hotfix]', "css/device-hotfix.css?v=20260911b", "data-cndies-device-hotfix");
  }

  function ensureChatbotScript() {
    if (document.querySelector('script[data-cndies-chatbot]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "js/chatbot.js?v=20260910b";
    script.defer = true;
    script.setAttribute("data-cndies-chatbot", "true");
    document.body.appendChild(script);
  }

  function scheduleChatbotScript() {
    const load = function () {
      ensureChatbotScript();
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(load, { timeout: 2200 });
      return;
    }

    window.setTimeout(load, 1200);
  }

  ensurePolishStyles();
  ensureAppleEnhanceStyles();
  ensureDeviceHotfixStyles();

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
      "assets/images/phones/" + slug + "/" + side + ".png",
      "assets/images/phones/" + slug + "/" + side + ".webp",
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
      "<stop stop-color='#ffc1a3' offset='0'/>",
      "<stop stop-color='#8fb59a' offset='1'/>",
      "</linearGradient>",
      "</defs>",
      "<rect width='520' height='760' rx='68' fill='#101714'/>",
      "<rect x='22' y='22' width='476' height='716' rx='52' fill='url(#g)' opacity='0.10'/>",
      "<rect x='78' y='78' width='364' height='604' rx='44' fill='#1b2820' stroke='rgba(167,190,172,0.34)' stroke-width='2'/>",
      "<text x='260' y='340' text-anchor='middle' fill='#f7f4ed' font-size='34' font-family='Arial, sans-serif' font-weight='700'>" + safeLabel + "</text>",
      "<text x='260' y='386' text-anchor='middle' fill='#9eaaa0' font-size='24' font-family='Arial, sans-serif'>Local " + safeSide + " image unavailable</text>",
      "</svg>"
    ].join("");

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  };

  site.loadImage = function loadImage(img, candidates, label, side, options) {
    if (!img) {
      return;
    }

    const settings = options || {};
    const isEager = Boolean(settings.eager);
    img.loading = isEager ? "eager" : "lazy";
    img.decoding = "async";
    img.width = 520;
    img.height = 760;

    try {
      img.fetchPriority = isEager ? "high" : "low";
    } catch (error) {
      // Older browsers can ignore fetchPriority without affecting image loading.
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

    let ticking = false;
    function syncHeaderState() {
      header.classList.toggle("scrolled", window.scrollY > 50);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(syncHeaderState);
    }, { passive: true });

    syncHeaderState();
  }

  function setupScrollReveal() {
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = document.querySelectorAll(".page-hero-card, .contact-page-grid, .story-grid, .payment-grid, .eft-payment-card");
    if (!targets.length) {
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    targets.forEach(function (target) {
      target.classList.add("reveal-ready");
      observer.observe(target);
    });
  }

  function ensurePaymentSectionStyles() {
    if (document.getElementById("cndies-eft-payment-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "cndies-eft-payment-styles";
    style.textContent = [
      ".eft-payment-section{padding-top:0;}",
      ".eft-payment-card{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:clamp(1.5rem,4vw,4rem);padding:clamp(1.5rem,4vw,3rem);background:linear-gradient(145deg,rgba(25,24,22,.96),rgba(12,12,13,.98));border:1px solid var(--border-strong);border-radius:var(--radius);box-shadow:var(--shadow);}",
      ".eft-payment-card:before{content:'';position:absolute;inset:0 auto 0 0;width:4px;background:linear-gradient(180deg,var(--accent),var(--accent-deep));}",
      ".eft-payment-copy{align-self:center;max-width:42rem;}",
      ".eft-payment-copy h2{margin:.45rem 0 .75rem;font-size:clamp(2rem,4vw,3.5rem);line-height:1;}",
      ".eft-payment-copy p{margin:0;color:var(--soft);font-size:1rem;line-height:1.75;}",
      ".eft-payment-copy .eyebrow{display:inline-flex;margin-bottom:.2rem;}",
      ".eft-details{display:grid;gap:.8rem;margin:0;}",
      ".eft-detail-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.05rem;border:1px solid var(--border);border-radius:var(--radius-md);background:rgba(255,255,255,.025);}",
      ".eft-detail-row dt{color:var(--muted);font-size:.76rem;text-transform:uppercase;letter-spacing:.09em;}",
      ".eft-detail-row dd{margin:0;color:var(--text);font-weight:700;text-align:right;}",
      ".eft-account-number{font-size:clamp(1.25rem,3vw,1.7rem);letter-spacing:.055em;}",
      ".eft-payment-note{margin-top:1rem;padding:1rem 1.05rem;border-radius:var(--radius-md);background:rgba(217,183,110,.08);border:1px solid rgba(217,183,110,.2);color:var(--soft);font-size:.9rem;line-height:1.6;}",
      ".eft-payment-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem;}",
      ".eft-copy-button{appearance:none;background:transparent;color:var(--text);border:1px solid var(--border-strong);border-radius:var(--radius-md);padding:.9rem 1rem;font:inherit;font-weight:600;cursor:pointer;transition:border-color .2s ease,background .2s ease;}",
      ".eft-copy-button:hover{background:rgba(255,255,255,.04);border-color:var(--accent);}",
      ".eft-copy-button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;}",
      "@media (max-width:820px){.eft-payment-card{grid-template-columns:1fr;}.eft-detail-row{align-items:flex-start;flex-direction:column;}.eft-detail-row dd{text-align:left;}.eft-payment-actions{flex-direction:column;}.eft-payment-actions .btn,.eft-copy-button{width:100%;}.eft-account-number{font-size:1.35rem;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function bindCopyAccountButton(section) {
    if (!section) {
      return;
    }

    const copyButton = section.querySelector(".eft-copy-button");
    if (!copyButton || copyButton.dataset.copyBound === "true") {
      return;
    }

    copyButton.dataset.copyBound = "true";
    copyButton.addEventListener("click", function () {
      const accountNumber = copyButton.getAttribute("data-account-number") || "2115946185";
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        window.prompt("Copy the Capitec account number:", accountNumber);
        return;
      }

      navigator.clipboard.writeText(accountNumber).then(function () {
        const originalLabel = copyButton.textContent;
        copyButton.textContent = "Account number copied";
        window.setTimeout(function () {
          copyButton.textContent = originalLabel;
        }, 1800);
      }).catch(function () {
        window.prompt("Copy the Capitec account number:", accountNumber);
      });
    });
  }

  function setupPaymentSection() {
    const infoBar = document.querySelector(".info-bar");
    if (!infoBar) {
      return;
    }

    ensurePaymentSectionStyles();

    const infoItems = infoBar.querySelectorAll(".info-item");
    infoItems.forEach(function (item) {
      const heading = item.querySelector("strong");
      if (!heading || (heading.textContent.trim() !== "Capitec Bank" && heading.textContent.trim() !== "Pay via EFT")) {
        return;
      }
      heading.textContent = "Pay via EFT";
      const detail = item.querySelector("span");
      if (detail) {
        detail.textContent = "Capitec • 2115946185";
      }
    });

    let section = document.querySelector(".eft-payment-section");
    if (!section) {
      const confirmMessage = "Hi Cndie's Collection, I want to confirm the iPhone and final total before making an EFT payment.";
      const proofMessage = "Hi Cndie's Collection, I have made my EFT payment and would like to send my proof of payment.";

      section = document.createElement("section");
      section.className = "section eft-payment-section";
      section.id = "payment";
      section.setAttribute("aria-labelledby", "eftPaymentTitle");
      section.innerHTML = [
        '<div class="container">',
        '<div class="eft-payment-card">',
        '<div class="eft-payment-copy">',
        '<span class="eyebrow">Pay via EFT</span>',
        '<h2 id="eftPaymentTitle">Capitec payment details</h2>',
        '<p>The account is published here so it is easy to find. Please confirm your iPhone, final price and availability with us on WhatsApp before sending payment.</p>',
        '</div>',
        '<div class="eft-payment-details">',
        '<dl class="eft-details">',
        '<div class="eft-detail-row"><dt>Bank</dt><dd>Capitec Bank</dd></div>',
        '<div class="eft-detail-row"><dt>Account number</dt><dd class="eft-account-number">2115946185</dd></div>',
        '<div class="eft-detail-row"><dt>Payment reference</dt><dd>Full name + iPhone model</dd></div>',
        '</dl>',
        '<div class="eft-payment-note"><strong>After paying:</strong> send your proof of payment on WhatsApp so the order and delivery can be confirmed.</div>',
        '<div class="eft-payment-actions">',
        '<a class="btn btn-primary" href="https://wa.me/' + site.whatsAppNumber + '?text=' + encodeURIComponent(confirmMessage) + '" target="_blank" rel="noopener noreferrer">Confirm on WhatsApp</a>',
        '<a class="btn btn-secondary" href="https://wa.me/' + site.whatsAppNumber + '?text=' + encodeURIComponent(proofMessage) + '" target="_blank" rel="noopener noreferrer">Send proof</a>',
        '<button class="eft-copy-button" type="button" data-account-number="2115946185">Copy account number</button>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");

      infoBar.insertAdjacentElement("afterend", section);
    }

    bindCopyAccountButton(section);
  }

  function setupStorefrontPolish() {
    document.body.classList.add("site-polished", "apple-inspired");

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
    setupPaymentSection();
    setupScrollReveal();
  });

  window.addEventListener("load", scheduleChatbotScript, { once: true });
}());
