(function () {
  function setupPhoneViewer() {
    const featuredImage = document.getElementById("featuredPhoneImage");
    const featuredName = document.getElementById("featuredPhoneName");
    const featuredStorage = document.getElementById("featuredPhoneStorage");
    const featuredPrice = document.getElementById("featuredPhonePrice");
    const featuredCondition = document.getElementById("featuredPhoneCondition");
    const featuredSide = document.getElementById("featuredPhoneSide");
    const featuredNote = document.getElementById("featuredPhoneNote");
    const enquireButton = document.getElementById("featuredEnquireButton");
    const flipButton = document.getElementById("viewerFlipButton");
    const nextButton = document.getElementById("viewerNextButton");
    const frontButton = document.getElementById("viewerFrontButton");
    const backButton = document.getElementById("viewerBackButton");
    const modelButtons = document.getElementById("featuredModelButtons");

    if (
      !featuredImage ||
      !featuredName ||
      !featuredStorage ||
      !featuredPrice ||
      !featuredCondition ||
      !featuredSide ||
      !featuredNote ||
      !enquireButton ||
      !flipButton ||
      !nextButton ||
      !frontButton ||
      !backButton ||
      !modelButtons ||
      !window.CndiesSite ||
      !window.CndiesFeaturedModels ||
      !window.CndiesFeaturedModels.length
    ) {
      return;
    }

    const site = window.CndiesSite;
    const featuredModels = window.CndiesFeaturedModels;
    let activeIndex = 0;
    let activeSide = "front";

    function renderButtons() {
      modelButtons.innerHTML = featuredModels.map(function (entry, index) {
        return '<button class="viewer-model-button' + (index === activeIndex ? " active" : "") + '" type="button" data-index="' + index + '">' + entry.product.name + "</button>";
      }).join("");

      modelButtons.querySelectorAll("[data-index]").forEach(function (button) {
        button.addEventListener("click", function () {
          activeIndex = Number(button.getAttribute("data-index")) || 0;
          activeSide = "front";
          render();
        });
      });
    }

    function render() {
      const active = featuredModels[activeIndex];
      const product = active.product;

      featuredName.textContent = product.name;
      featuredStorage.textContent = product.storage;
      featuredPrice.textContent = site.formatPrice(product.price);
      featuredCondition.textContent = product.condition;
      featuredSide.textContent = activeSide === "front" ? "Front" : "Back";
      featuredNote.textContent = active.note;
      enquireButton.href = site.whatsAppUrl(product.name);

      site.loadImage(featuredImage, site.phoneAssetCandidates(product.slug, activeSide), product.name, activeSide);
      frontButton.classList.toggle("active", activeSide === "front");
      backButton.classList.toggle("active", activeSide === "back");
      renderButtons();
    }

    flipButton.addEventListener("click", function () {
      activeSide = activeSide === "front" ? "back" : "front";
      render();
    });

    nextButton.addEventListener("click", function () {
      activeIndex = (activeIndex + 1) % featuredModels.length;
      activeSide = "front";
      render();
    });

    frontButton.addEventListener("click", function () {
      activeSide = "front";
      render();
    });

    backButton.addEventListener("click", function () {
      activeSide = "back";
      render();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", setupPhoneViewer);
}());
