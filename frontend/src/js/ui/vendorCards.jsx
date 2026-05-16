/**
 * Vendor card rendering.
 *
 * Receives normalized vendor data from the backend contract and renders it. This
 * module should not call fetch or know which provider produced the data.
 * 
 * =============
 * 
 * Has been modified to return React elements, can be directly integrated into Donovan's final product
 * 
 * Example usage in search result page:
 
    import VendorList from "./VendorList";

    function App() {
    return <VendorList vendors={vendors} />;
    }
 */

export default function VendorList({ vendors }) {
  return (
    <section id="vendor-results">
      {vendors.map((vendor, index) => (
        <VendorCard
          key={vendor.id || index}
          vendor={vendor}
        />
      ))}
    </section>
  );
}

function VendorCard({ vendor }) {
  return (
    <article className="vendor-card">
      <h3>{vendor.name}</h3>

      <p className="vendor-meta">
        {vendor.address}
      </p>

      <p className="vendor-meta">
        Categories:{" "}
        {vendor.categories.length > 0
          ? vendor.categories.join(", ")
          : "none listed"}
      </p>

      <p className="vendor-meta">
        Ingredient status: {vendor.ingredientStatus.status}
      </p>
    </article>
  );
}