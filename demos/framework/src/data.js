// Deterministic page data: ~244KB inline CSS, ~100KB JSON-LD, and product rows.
export function generateProducts(n) {
  const cats = ['Hardware', 'Software', 'Services', 'Books', 'Toys'];
  return Array.from({ length: n }, (_, i) => ({
    id: i, name: `Product ${i}`, category: cats[i % 5], sku: `SKU-${String(i).padStart(6, '0')}`,
    price: ((i * 7.31) % 500).toFixed(2), stock: (i * 13) % 200, status: i % 7 ? 'in stock' : 'backorder', rating: ((i % 50) / 10).toFixed(1), reviewCount: (i * 3) % 400,
  }));
}
export function makeCss(target = 244000) {
  let css = '';
  for (let i = 0; css.length < target; i++) {
    css += `.c${i}{color:#${((i * 2654435761) >>> 8).toString(16).padStart(6, '0').slice(0, 6)};margin:${i % 17}px ${i % 5}px;padding:${i % 11}px;display:flex;flex-direction:column;border:1px solid rgba(0,0,0,.${i % 9})}.c${i}:hover>.d${i}{opacity:.${i % 10}}\n`;
  }
  return css;
}
export function makeJsonLd(n = 300) {
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: generateProducts(n).map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: p.name, sku: p.sku, category: p.category, offers: { '@type': 'Offer', price: p.price, priceCurrency: 'USD', availability: p.status === 'in stock' ? 'InStock' : 'BackOrder' } } })) });
}
