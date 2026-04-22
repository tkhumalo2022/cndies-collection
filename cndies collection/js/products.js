(function () {
  const products = [
    { id: "bn-iphone-7-32", name: "iPhone 7", slug: "iphone-7", storage: "32GB", condition: "Brand New", price: 2850 },
    { id: "bn-iphone-7-plus-32", name: "iPhone 7 Plus", slug: "iphone-7-plus", storage: "32GB", condition: "Brand New", price: 3850 },
    { id: "bn-iphone-8-64", name: "iPhone 8", slug: "iphone-8", storage: "64GB", condition: "Brand New", price: 8550 },
    { id: "bn-iphone-8-plus-64", name: "iPhone 8 Plus", slug: "iphone-8-plus", storage: "64GB", condition: "Brand New", price: 4550 },
    { id: "bn-iphone-x-64", name: "iPhone X", slug: "iphone-x", storage: "64GB", condition: "Brand New", price: 4750 },
    { id: "bn-iphone-xr-64", name: "iPhone XR", slug: "iphone-xr", storage: "64GB", condition: "Brand New", price: 5050 },
    { id: "bn-iphone-xs-64", name: "iPhone XS", slug: "iphone-xs", storage: "64GB", condition: "Brand New", price: 6050 },
    { id: "bn-iphone-xs-max-64", name: "iPhone XS Max", slug: "iphone-xs-max", storage: "64GB", condition: "Brand New", price: 7550 },
    { id: "bn-iphone-11-64", name: "iPhone 11", slug: "iphone-11", storage: "64GB", condition: "Brand New", price: 6050 },
    { id: "bn-iphone-11-pro-64", name: "iPhone 11 Pro", slug: "iphone-11-pro", storage: "64GB", condition: "Brand New", price: 8050 },
    { id: "bn-iphone-11-pro-max-64", name: "iPhone 11 Pro Max", slug: "iphone-11-pro-max", storage: "64GB", condition: "Brand New", price: 8550 },
    { id: "bn-iphone-12-64", name: "iPhone 12", slug: "iphone-12", storage: "64GB", condition: "Brand New", price: 8050 },
    { id: "bn-iphone-12-pro-128", name: "iPhone 12 Pro", slug: "iphone-12-pro", storage: "128GB", condition: "Brand New", price: 10550 },
    { id: "bn-iphone-12-pro-max-128", name: "iPhone 12 Pro Max", slug: "iphone-12-pro-max", storage: "128GB", condition: "Brand New", price: 12850 },
    { id: "bn-iphone-13-128", name: "iPhone 13", slug: "iphone-13", storage: "128GB", condition: "Brand New", price: 11550 },
    { id: "bn-iphone-13-pro-256", name: "iPhone 13 Pro", slug: "iphone-13-pro", storage: "256GB", condition: "Brand New", price: 14800 },
    { id: "bn-iphone-13-pro-max-128", name: "iPhone 13 Pro Max", slug: "iphone-13-pro-max", storage: "128GB", condition: "Brand New", price: 15800 },
    { id: "bn-iphone-14-128", name: "iPhone 14", slug: "iphone-14", storage: "128GB", condition: "Brand New", price: 14000 },
    { id: "bn-iphone-14-plus-128", name: "iPhone 14 Plus", slug: "iphone-14-plus", storage: "128GB", condition: "Brand New", price: 15000 },
    { id: "bn-iphone-14-pro-128", name: "iPhone 14 Pro", slug: "iphone-14-pro", storage: "128GB", condition: "Brand New", price: 18000 },
    { id: "bn-iphone-14-pro-max-128", name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max", storage: "128GB", condition: "Brand New", price: 20500 },
    { id: "bn-iphone-15-128", name: "iPhone 15", slug: "iphone-15", storage: "128GB", condition: "Brand New", price: 15000 },
    { id: "bn-iphone-15-plus-128", name: "iPhone 15 Plus", slug: "iphone-15-plus", storage: "128GB", condition: "Brand New", price: 17000 },
    { id: "bn-iphone-15-pro-128", name: "iPhone 15 Pro", slug: "iphone-15-pro", storage: "128GB", condition: "Brand New", price: 19000 },
    { id: "bn-iphone-15-pro-256", name: "iPhone 15 Pro", slug: "iphone-15-pro", storage: "256GB", condition: "Brand New", price: 21000 },
    { id: "bn-iphone-15-pro-max-256", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", storage: "256GB", condition: "Brand New", price: 23500 },

    { id: "po-iphone-7-32", name: "iPhone 7", slug: "iphone-7", storage: "32GB", condition: "Pre-Owned", price: 2150 },
    { id: "po-iphone-7-plus-32", name: "iPhone 7 Plus", slug: "iphone-7-plus", storage: "32GB", condition: "Pre-Owned", price: 3150 },
    { id: "po-iphone-8-64", name: "iPhone 8", slug: "iphone-8", storage: "64GB", condition: "Pre-Owned", price: 2850 },
    { id: "po-iphone-8-plus-64", name: "iPhone 8 Plus", slug: "iphone-8-plus", storage: "64GB", condition: "Pre-Owned", price: 3800 },
    { id: "po-iphone-x-64", name: "iPhone X", slug: "iphone-x", storage: "64GB", condition: "Pre-Owned", price: 4250 },
    { id: "po-iphone-xr-64", name: "iPhone XR", slug: "iphone-xr", storage: "64GB", condition: "Pre-Owned", price: 4550 },
    { id: "po-iphone-xs-64", name: "iPhone XS", slug: "iphone-xs", storage: "64GB", condition: "Pre-Owned", price: 5050 },
    { id: "po-iphone-xs-max-64", name: "iPhone XS Max", slug: "iphone-xs-max", storage: "64GB", condition: "Pre-Owned", price: 7050 },
    { id: "po-iphone-11-64", name: "iPhone 11", slug: "iphone-11", storage: "64GB", condition: "Pre-Owned", price: 5850 },
    { id: "po-iphone-11-pro-64", name: "iPhone 11 Pro", slug: "iphone-11-pro", storage: "64GB", condition: "Pre-Owned", price: 7550 },
    { id: "po-iphone-11-pro-max-64", name: "iPhone 11 Pro Max", slug: "iphone-11-pro-max", storage: "64GB", condition: "Pre-Owned", price: 8050 },
    { id: "po-iphone-12-64", name: "iPhone 12", slug: "iphone-12", storage: "64GB", condition: "Pre-Owned", price: 7350 },
    { id: "po-iphone-12-pro-128", name: "iPhone 12 Pro", slug: "iphone-12-pro", storage: "128GB", condition: "Pre-Owned", price: 9050 },
    { id: "po-iphone-12-pro-max-128", name: "iPhone 12 Pro Max", slug: "iphone-12-pro-max", storage: "128GB", condition: "Pre-Owned", price: 11050 },
    { id: "po-iphone-13-128", name: "iPhone 13", slug: "iphone-13", storage: "128GB", condition: "Pre-Owned", price: 9050 },
    { id: "po-iphone-13-pro-128", name: "iPhone 13 Pro", slug: "iphone-13-pro", storage: "128GB", condition: "Pre-Owned", price: 12050 },
    { id: "po-iphone-13-pro-max-128", name: "iPhone 13 Pro Max", slug: "iphone-13-pro-max", storage: "128GB", condition: "Pre-Owned", price: 14050 },
    { id: "po-iphone-14-128", name: "iPhone 14", slug: "iphone-14", storage: "128GB", condition: "Pre-Owned", price: 10050 },
    { id: "po-iphone-14-plus-128", name: "iPhone 14 Plus", slug: "iphone-14-plus", storage: "128GB", condition: "Pre-Owned", price: 12050 },
    { id: "po-iphone-14-pro-128", name: "iPhone 14 Pro", slug: "iphone-14-pro", storage: "128GB", condition: "Pre-Owned", price: 13550 },
    { id: "po-iphone-14-pro-max-128", name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max", storage: "128GB", condition: "Pre-Owned", price: 16550 },
    { id: "po-iphone-15-128", name: "iPhone 15", slug: "iphone-15", storage: "128GB", condition: "Pre-Owned", price: 13550 },
    { id: "po-iphone-15-plus-128", name: "iPhone 15 Plus", slug: "iphone-15-plus", storage: "128GB", condition: "Pre-Owned", price: 14550 },
    { id: "po-iphone-15-pro-128", name: "iPhone 15 Pro", slug: "iphone-15-pro", storage: "128GB", condition: "Pre-Owned", price: 18550 },
    { id: "po-iphone-15-pro-256", name: "iPhone 15 Pro", slug: "iphone-15-pro", storage: "256GB", condition: "Pre-Owned", price: 21050 }
  ];

  const featuredModels = [
    {
      match: { name: "iPhone 15 Pro Max", condition: "Brand New", storage: "256GB" },
      note: "Titanium feel, premium finish, and a standout large-display flagship for buyers who want a top-shelf experience."
    },
    {
      match: { name: "iPhone 14 Pro Max", condition: "Brand New", storage: "128GB" },
      note: "A high-end balance of camera power, premium design, and flagship presence."
    },
    {
      match: { name: "iPhone 13 Pro", condition: "Brand New", storage: "256GB" },
      note: "A polished performance pick for customers who want premium value without compromise."
    },
    {
      match: { name: "iPhone 12 Pro Max", condition: "Pre-Owned", storage: "128GB" },
      note: "Large-screen premium value with a trusted pre-owned price point."
    }
  ].map(function (entry) {
    const product = products.find(function (item) {
      return item.name === entry.match.name && item.condition === entry.match.condition && item.storage === entry.match.storage;
    });

    return {
      product: product,
      note: entry.note
    };
  }).filter(function (entry) {
    return Boolean(entry.product);
  });

  window.CndiesProducts = products;
  window.CndiesFeaturedModels = featuredModels;
}());
