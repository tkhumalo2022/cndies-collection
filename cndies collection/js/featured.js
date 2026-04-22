(function () {
  function renderFeaturedModels() {
    const grid = document.getElementById("featuredGrid");

    if (!grid || !window.CndiesFeaturedModels || !window.CndiesSite) {
      return;
    }

    const site = window.CndiesSite;
    const featured = window.CndiesFeaturedModels || [];

    if (!featured.length) {
      grid.innerHTML = "<p>No featured models available.</p>";
      return;
    }

    function cardMarkup(entry) {
      const product = entry.product || {};
      const badgeClass = product.condition === "Brand New" ? "is-brand-new" : "is-pre-owned";

      return [
        '<article class="featured-card glass-card">',
        '  <div>',
        '    <h3>' + (product.name || "iPhone") + '</h3>',
        '    <div class="product-meta">',
        '      <span>' + (product.storage || "") + '</span>',
        '      <span class="' + badgeClass + '">' + (product.condition || "") + '</span>',
        "    </div>",
        "  </div>",
        '  <div>',
        '    <p class="product-price">',
        "      <strong>" + site.formatPrice(product.price) + "</strong>",
        "    </p>",
        '    <p>' + (entry.note || "") + "</p>",
        "  </div>",
        '  <a class="btn btn-primary" href="' + site.whatsAppUrl(product.name) + '" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a>',
        "</article>"
      ].join("");
    }

    grid.innerHTML = featured.map(cardMarkup).join("");
  }

  document.addEventListener("DOMContentLoaded", renderFeaturedModels);
}());
