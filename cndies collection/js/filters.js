(function () {
  function renderProducts() {
    const grid = document.getElementById("productGrid");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const filterContainer = document.getElementById("conditionFilters");

    if (!grid || !emptyState || !searchInput || !sortSelect || !filterContainer || !window.CndiesProducts || !window.CndiesSite) {
      return;
    }

    const site = window.CndiesSite;
    const allProducts = window.CndiesProducts.slice();
    let activeCondition = "All";
    let activeSort = sortSelect.value || "low-high";
    let activeSearch = "";

    function cardMarkup(product) {
      const badgeClass = product.condition === "Brand New" ? "is-brand-new" : "is-pre-owned";
      return [
        '<article class="product-card glass-card">',
        '  <div class="product-media">',
        '    <div class="product-badges">',
        '      <span class="product-badge ' + badgeClass + '">' + product.condition + '</span>',
        '      <span class="product-badge">' + product.storage + '</span>',
        "    </div>",
        '    <div class="product-image-shell">',
        '      <div class="product-image-frame product-image-frame--front">',
        '        <img class="product-image product-image--front" data-slug="' + product.slug + '" data-name="' + product.name + '" data-side="front" alt="' + product.name + ' front view">',
        "      </div>",
        '      <div class="product-image-frame product-image-frame--back">',
        '        <img class="product-image product-image--back" data-slug="' + product.slug + '" data-name="' + product.name + '" data-side="back" alt="' + product.name + ' back view">',
        "      </div>",
        "    </div>",
        "  </div>",
        '  <div class="product-body">',
        "    <div>",
        "      <h3>" + product.name + "</h3>",
        '      <div class="product-meta">',
        "        <span>" + product.storage + "</span>",
        "        <span>" + product.condition + "</span>",
        "      </div>",
        "    </div>",
        '    <div class="product-price-row">',
        '      <div class="product-price">',
        "        <strong>" + site.formatPrice(product.price) + "</strong>",
        "        <span>Fully Tested Devices</span>",
        "      </div>",
        '      <a class="btn btn-primary" href="' + site.whatsAppUrl(product.name) + '" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a>',
        "    </div>",
        "  </div>",
        "</article>"
      ].join("");
    }

    function hydrateImages() {
      grid.querySelectorAll(".product-image").forEach(function (img) {
        const slug = img.getAttribute("data-slug");
        const side = img.getAttribute("data-side");
        const name = img.getAttribute("data-name");
        site.loadImage(img, site.phoneAssetCandidates(slug, side), name, side);
      });
    }

    function getFilteredProducts() {
      const query = activeSearch.trim().toLowerCase();
      return allProducts.filter(function (product) {
        const matchesCondition = activeCondition === "All" || product.condition === activeCondition;
        const matchesSearch = !query || [product.name, product.storage, product.condition].join(" ").toLowerCase().indexOf(query) !== -1;
        return matchesCondition && matchesSearch;
      }).sort(function (left, right) {
        return activeSort === "high-low" ? right.price - left.price : left.price - right.price;
      });
    }

    function paint() {
      const filtered = getFilteredProducts();

      if (!filtered.length) {
        grid.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
      }

      emptyState.classList.add("hidden");
      grid.innerHTML = filtered.map(cardMarkup).join("");
      hydrateImages();
    }

    filterContainer.querySelectorAll("[data-condition]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeCondition = button.getAttribute("data-condition") || "All";
        filterContainer.querySelectorAll("[data-condition]").forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        paint();
      });
    });

    searchInput.addEventListener("input", function () {
      activeSearch = searchInput.value || "";
      paint();
    });

    sortSelect.addEventListener("change", function () {
      activeSort = sortSelect.value || "low-high";
      paint();
    });

    paint();
  }

  document.addEventListener("DOMContentLoaded", renderProducts);
}());
