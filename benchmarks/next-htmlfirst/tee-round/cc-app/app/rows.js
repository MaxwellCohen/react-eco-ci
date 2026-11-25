export default function Rows() {
  return (
    <table><tbody>
      {Array.from({ length: 500 }, (_, i) => (
        <tr key={i}><td>{i}</td><td>{`Product ${i}`}</td><td>A reasonably long static description for row {i}.</td></tr>
      ))}
    </tbody></table>
  );
}
