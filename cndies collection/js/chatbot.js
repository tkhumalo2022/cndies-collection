(function () {
  "use strict";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function formatPrice(value) {
    if (window.CndiesSite && typeof window.CndiesSite.formatPrice === "function") {
      return window.CndiesSite.formatPrice(value);
    }
    return "R" + String(Number(value) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function whatsappUrl(label) {
    if (window.CndiesSite && typeof window.CndiesSite.whatsAppUrl === "function") {
      return window.CndiesSite.whatsAppUrl(label || "an iPhone");
    }
    return "https://wa.me/27781347169?text=" + encodeURIComponent("Hi I want to enquire about " + (label || "an iPhone"));
  }

  function modelGeneration(name) {
    var match = String(name || "").match(/iPhone\s+(\d+)/i);
    return match ? Number(match[1]) : 0;
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  onReady(function initAssistant() {
    if (document.querySelector(".cndies-chat-shell")) {
      return;
    }

    var state = {
      greeted: false,
      range: null,
      condition: "All"
    };

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "cndies-chat-launcher";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "cndiesAssistant");
    launcher.setAttribute("aria-label", "Open Cndie's phone assistant");
    launcher.innerHTML = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
      '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
      '<path d="M8 9h8M8 13h5"/>',
      "</svg>",
      "<span>Need help choosing?</span>"
    ].join("");

    var shell = document.createElement("section");
    shell.className = "cndies-chat-shell";
    shell.id = "cndiesAssistant";
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-label", "Cndie's iPhone assistant");
    shell.innerHTML = [
      '<header class="chat-header">',
      '  <div class="chat-avatar" aria-hidden="true">C</div>',
      '  <div class="chat-title"><strong>Cndie\'s Assistant</strong><span>Phone finder · instant help</span></div>',
      '  <button class="chat-close" type="button" aria-label="Close assistant">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
      "  </button>",
      "</header>",
      '<div class="chat-body" id="cndiesChatBody" aria-live="polite"></div>',
      '<div class="chat-composer">',
      '  <form class="chat-input-row" id="cndiesChatForm">',
      '    <input class="chat-input" id="cndiesChatInput" type="text" autocomplete="off" maxlength="120" aria-label="Message Cndie\'s assistant" placeholder="Try: iPhone 13 or budget R8 000">',
      '    <button class="chat-send" type="submit" aria-label="Send message">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/></svg>',
      "    </button>",
      "  </form>",
      '  <p class="chat-footnote">Uses the current store catalogue. Confirm stock and payment details on WhatsApp.</p>',
      "</div>"
    ].join("");

    document.body.appendChild(launcher);
    document.body.appendChild(shell);

    var body = shell.querySelector(".chat-body");
    var closeButton = shell.querySelector(".chat-close");
    var form = shell.querySelector("#cndiesChatForm");
    var input = shell.querySelector("#cndiesChatInput");

    function scrollToBottom() {
      window.requestAnimationFrame(function () {
        body.scrollTop = body.scrollHeight;
      });
    }

    function addMessage(text, sender) {
      var wrapper = document.createElement("div");
      wrapper.className = "chat-message " + (sender === "user" ? "is-user" : "is-bot");

      var bubble = document.createElement("div");
      bubble.className = "chat-bubble";
      bubble.textContent = text;

      wrapper.appendChild(bubble);
      body.appendChild(wrapper);
      scrollToBottom();
      return wrapper;
    }

    function addActions(items) {
      var actions = document.createElement("div");
      actions.className = "chat-actions";

      items.forEach(function (item) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "chat-chip";
        button.textContent = item.label;
        button.addEventListener("click", function () {
          actions.remove();
          item.action();
        });
        actions.appendChild(button);
      });

      body.appendChild(actions);
      scrollToBottom();
    }

    function products() {
      return Array.isArray(window.CndiesProducts) ? window.CndiesProducts.slice() : [];
    }

    function goToShop(product) {
      var search = document.getElementById("searchInput");
      var shop = document.getElementById("shop");

      if (search && shop) {
        search.value = product.name;
        search.dispatchEvent(new Event("input", { bubbles: true }));
        shop.scrollIntoView({ behavior: "smooth", block: "start" });
        closeAssistant();
        return;
      }

      window.location.href = "index.html#shop";
    }

    function addRecommendations(matches) {
      var wrap = document.createElement("div");
      wrap.className = "chat-recommendations";

      matches.forEach(function (product) {
        var card = document.createElement("article");
        card.className = "chat-product";

        var title = document.createElement("strong");
        title.textContent = product.name;

        var meta = document.createElement("small");
        meta.textContent = product.storage + " · " + product.condition;

        var price = document.createElement("span");
        price.className = "chat-product-price";
        price.textContent = formatPrice(product.price);

        var actions = document.createElement("div");
        actions.className = "chat-product-actions";

        var whatsapp = document.createElement("a");
        whatsapp.href = whatsappUrl(product.name);
        whatsapp.target = "_blank";
        whatsapp.rel = "noopener noreferrer";
        whatsapp.textContent = "WhatsApp";

        var view = document.createElement("button");
        view.type = "button";
        view.textContent = document.getElementById("shop") ? "View in shop" : "Open shop";
        view.addEventListener("click", function () {
          goToShop(product);
        });

        actions.appendChild(whatsapp);
        actions.appendChild(view);
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(price);
        card.appendChild(actions);
        wrap.appendChild(card);
      });

      body.appendChild(wrap);
      scrollToBottom();
    }

    function showHomeActions() {
      addActions([
        { label: "Find me an iPhone", action: beginFinder },
        { label: "Delivery", action: showDelivery },
        { label: "Payment", action: showPayment },
        { label: "Warranty & quality", action: showWarranty },
        { label: "Talk on WhatsApp", action: openWhatsApp }
      ]);
    }

    function welcome() {
      if (state.greeted) {
        return;
      }
      state.greeted = true;
      addMessage("Hi 👋 I can help you find an iPhone from the current collection, explain delivery, or take you straight to WhatsApp.", "bot");
      showHomeActions();
    }

    function beginFinder() {
      addMessage("Find me an iPhone", "user");

      if (!products().length) {
        addMessage("The full catalogue loads on the Shop page. I can take you there, or you can tell me the model you want.", "bot");
        addActions([
          { label: "Open the shop", action: function () { window.location.href = "index.html#shop"; } },
          { label: "WhatsApp us", action: openWhatsApp }
        ]);
        return;
      }

      addMessage("What budget should I work with?", "bot");
      addActions([
        { label: "Under R5 000", action: function () { chooseBudget(0, 5000, "Under R5 000"); } },
        { label: "R5k–R10k", action: function () { chooseBudget(5000, 10000, "R5 000–R10 000"); } },
        { label: "R10k–R15k", action: function () { chooseBudget(10000, 15000, "R10 000–R15 000"); } },
        { label: "R15k+", action: function () { chooseBudget(15000, Infinity, "R15 000+"); } }
      ]);
    }

    function chooseBudget(min, max, label) {
      state.range = { min: min, max: max };
      addMessage(label, "user");
      addMessage("Do you prefer brand new, pre-owned, or should I show the best options from both?", "bot");
      addActions([
        { label: "Best from both", action: function () { recommend("All", "Best from both"); } },
        { label: "Brand New", action: function () { recommend("Brand New", "Brand New"); } },
        { label: "Pre-Owned", action: function () { recommend("Pre-Owned", "Pre-Owned"); } }
      ]);
    }

    function recommend(condition, label) {
      state.condition = condition;
      addMessage(label, "user");

      var range = state.range || { min: 0, max: Infinity };
      var matches = products().filter(function (product) {
        var price = Number(product.price) || 0;
        var conditionMatch = condition === "All" || product.condition === condition;
        return conditionMatch && price >= range.min && price <= range.max;
      });

      matches.sort(function (a, b) {
        var generationDifference = modelGeneration(b.name) - modelGeneration(a.name);
        if (generationDifference !== 0) {
          return generationDifference;
        }
        return a.price - b.price;
      });

      matches = matches.slice(0, 3);

      if (!matches.length) {
        addMessage("I couldn’t find a current listing in that exact range. Try another budget or ask on WhatsApp for fresh stock.", "bot");
        addActions([
          { label: "Try another budget", action: beginFinder },
          { label: "Ask on WhatsApp", action: openWhatsApp }
        ]);
        return;
      }

      addMessage("These are the strongest current matches I found. Stock can change, so confirm availability before paying.", "bot");
      addRecommendations(matches);
      addActions([
        { label: "Try another budget", action: beginFinder },
        { label: "Delivery info", action: showDelivery },
        { label: "Main menu", action: showHomeActions }
      ]);
    }

    function showDelivery() {
      addMessage("Delivery", "user");
      addMessage("Delivery is free within Richards Bay and Meer En See. The site lists R70 delivery to other areas, and you can ask about same-day delivery when you enquire.", "bot");
      addActions([
        { label: "Find a phone", action: beginFinder },
        { label: "Confirm delivery on WhatsApp", action: openWhatsApp },
        { label: "Main menu", action: showHomeActions }
      ]);
    }

    function showPayment() {
      addMessage("Payment", "user");
      addMessage("The store accepts bank payment. For safety, confirm the latest banking details and your order reference directly on WhatsApp before sending money.", "bot");
      addActions([
        { label: "Confirm payment details", action: openWhatsApp },
        { label: "Find a phone", action: beginFinder },
        { label: "Main menu", action: showHomeActions }
      ]);
    }

    function showWarranty() {
      addMessage("Warranty & quality", "user");
      addMessage("The store describes its phones as fully tested and covered by warranty. Ask for the exact warranty terms and condition details for the specific phone before you pay.", "bot");
      addActions([
        { label: "Find a phone", action: beginFinder },
        { label: "Ask about a phone", action: openWhatsApp },
        { label: "Main menu", action: showHomeActions }
      ]);
    }

    function openWhatsApp() {
      addMessage("Talk on WhatsApp", "user");
      addMessage("I’ll open WhatsApp so you can confirm stock, delivery and payment details with the store.", "bot");
      window.open(whatsappUrl("an iPhone"), "_blank", "noopener,noreferrer");
    }

    function searchModel(query) {
      var catalogue = products();
      if (!catalogue.length) {
        return false;
      }

      var normalized = normalizeText(query);
      var meaningful = normalized.replace(/\b(want|need|looking|for|a|an|show|me|please|price|of)\b/g, " ").replace(/\s+/g, " ").trim();
      if (!meaningful || meaningful.indexOf("iphone") === -1) {
        return false;
      }

      var matches = catalogue.filter(function (product) {
        var haystack = normalizeText(product.name + " " + product.storage + " " + product.condition);
        var tokens = meaningful.split(" ").filter(Boolean);
        return tokens.every(function (token) { return haystack.indexOf(token) !== -1; });
      }).sort(function (a, b) {
        return a.price - b.price;
      }).slice(0, 4);

      if (!matches.length) {
        addMessage("I don’t see that exact model in the current catalogue. Try a simpler model name, another budget, or ask about fresh stock on WhatsApp.", "bot");
        addActions([
          { label: "Browse by budget", action: beginFinder },
          { label: "Ask on WhatsApp", action: openWhatsApp }
        ]);
        return true;
      }

      addMessage("Here’s what I found in the current catalogue:", "bot");
      addRecommendations(matches);
      addActions([
        { label: "Browse by budget", action: beginFinder },
        { label: "Main menu", action: showHomeActions }
      ]);
      return true;
    }

    function parseBudget(text) {
      var compact = String(text || "").toLowerCase().replace(/,/g, "").replace(/\s/g, "");
      var kMatch = compact.match(/(?:r)?(\d+(?:\.\d+)?)k\b/);
      if (kMatch) {
        return Math.round(Number(kMatch[1]) * 1000);
      }

      var numberMatch = compact.match(/(?:r)?(\d{4,5})\b/);
      if (numberMatch) {
        return Number(numberMatch[1]);
      }

      return null;
    }

    function handleFreeText(rawText) {
      var text = String(rawText || "").trim();
      if (!text) {
        return;
      }

      addMessage(text, "user");
      var normalized = normalizeText(text);

      if (/deliver|shipping|courier|richards bay|meer en see/.test(normalized)) {
        showDelivery();
        return;
      }
      if (/pay|payment|bank|capitec|account/.test(normalized)) {
        showPayment();
        return;
      }
      if (/warrant|quality|tested|genuine|condition/.test(normalized)) {
        showWarranty();
        return;
      }
      if (/whatsapp|human|person|call|contact/.test(normalized)) {
        openWhatsApp();
        return;
      }
      if (searchModel(text)) {
        return;
      }

      var budget = parseBudget(text);
      if (budget && products().length) {
        state.range = { min: 0, max: budget };
        addMessage("I’ll treat " + formatPrice(budget) + " as your maximum budget. Do you prefer brand new or pre-owned?", "bot");
        addActions([
          { label: "Best from both", action: function () { recommend("All", "Best from both"); } },
          { label: "Brand New", action: function () { recommend("Brand New", "Brand New"); } },
          { label: "Pre-Owned", action: function () { recommend("Pre-Owned", "Pre-Owned"); } }
        ]);
        return;
      }

      if (/brand new|new phone|new iphone/.test(normalized)) {
        state.condition = "Brand New";
        addMessage("Got it — brand new. Tell me your budget, for example “R10 000”, and I’ll narrow the catalogue.", "bot");
        return;
      }
      if (/pre owned|preowned|used|second hand/.test(normalized)) {
        state.condition = "Pre-Owned";
        addMessage("Got it — pre-owned. Tell me your budget, for example “R7 000”, and I’ll narrow the catalogue.", "bot");
        return;
      }

      addMessage("I can help with a model, a budget, delivery, payment, warranty, or WhatsApp. Try “iPhone 13”, “budget R8 000”, or choose an option below.", "bot");
      showHomeActions();
    }

    function openAssistant() {
      shell.classList.add("is-open");
      document.body.classList.add("chat-open");
      launcher.setAttribute("aria-expanded", "true");
      welcome();
      window.setTimeout(function () { input.focus(); }, 220);
    }

    function closeAssistant() {
      shell.classList.remove("is-open");
      document.body.classList.remove("chat-open");
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus({ preventScroll: true });
    }

    launcher.addEventListener("click", openAssistant);
    closeButton.addEventListener("click", closeAssistant);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value;
      input.value = "";
      handleFreeText(value);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && shell.classList.contains("is-open")) {
        closeAssistant();
      }
    });
  });
}());
