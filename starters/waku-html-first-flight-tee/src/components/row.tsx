'use client';

// Stateless client row: renders the same markup in the browser as on the server.
export const Row = ({ id, name, category, price, description }: { id: number; name: string; category: string; price: string; description: string }) => (
  <tr>
    <td>{id}</td>
    <td>{name}</td>
    <td>{category}</td>
    <td>${price}</td>
    <td>{description}</td>
    <td></td>
  </tr>
);
