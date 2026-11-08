'use client';
// A stateless "client" row: it does nothing in the browser, but is a client component so it normally
// ships in the Flight payload and hydrates.
export default function Row({ name, category, sku, price, stock, status, rating, reviewCount }) {
  return (
    <tr className="table-row">
      <td><div className="product-name-cell"><span className="product-name">{name}</span><span className="product-category">{category}</span></div></td>
      <td>{sku}</td><td>{category}</td><td><span className="price">${price}</span></td><td>{stock}</td><td>{status}</td>
      <td><span className="rating">&#9733; {rating}<span className="review-count">({reviewCount})</span></span></td>
    </tr>
  );
}
