/**
 * Search form behavior.
 *
 * Owns reading form values and triggering render updates. It does not know how
 * fetch works and does not build vendor cards directly.
 * 
 * ================
 * 
 * Modified to work in React
 * 
 * Example usage:

    import VendorSearch from "./components/VendorSearch.jsx";

    export default function App() {
    return (
        <main>
        <h1>Vendor Search</h1>

        <VendorSearch />
        </main>
    );
    }

 */


import { useState } from "react";
import { searchVendors } from "../api/vendorApi.js";
import VendorList from "./VendorList.jsx";

export default function VendorSearch() {
  const [ingredientName, setIngredientName] = useState("");
  const [locationText, setLocationText] = useState("");

  const [vendors, setVendors] = useState([]);
  const [searchSummary, setSearchSummary] = useState("");

  async function handleSearchSubmit(event) {
    event.preventDefault();

    const trimmedIngredient = ingredientName.trim();
    const trimmedLocation = locationText.trim();

    setSearchSummary("Searching vendors...");

    try {
      const searchResult = await searchVendors({
        ingredientName: trimmedIngredient,
        locationText: trimmedLocation,
      });

      setSearchSummary(
        `Showing ${searchResult.vendors.length} demo vendors for ${searchResult.ingredient.name}.`
      );

      setVendors(searchResult.vendors);
    } catch (error) {
      setSearchSummary(error.message);
      setVendors([]);
    }
  }

  return (
    <section>
      <form
        id="vendor-search-form"
        onSubmit={handleSearchSubmit}
      >
        <input
          id="ingredient-input"
          type="text"
          placeholder="Ingredient"
          value={ingredientName}
          onChange={(event) =>
            setIngredientName(event.target.value)
          }
        />

        <input
          id="location-input"
          type="text"
          placeholder="Location"
          value={locationText}
          onChange={(event) =>
            setLocationText(event.target.value)
          }
        />

        <button type="submit">
          Search
        </button>
      </form>

      <p id="search-summary">
        {searchSummary}
      </p>

      <VendorList vendors={vendors} />
    </section>
  );
}