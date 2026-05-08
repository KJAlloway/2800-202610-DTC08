/**
 * Search form behavior.
 *
 * Owns reading form values and triggering render updates. It does not know how
 * fetch works and does not build vendor cards directly.
 */

import { searchVendors } from '../api/vendorApi.js';
import { renderVendorList } from './vendorCards.js';

const searchForm = document.querySelector('#vendor-search-form');
const ingredientInput = document.querySelector('#ingredient-input');
const locationInput = document.querySelector('#location-input');
const searchSummary = document.querySelector('#search-summary');

export function initSearchForm() {
  searchForm.addEventListener('submit', handleSearchSubmit);
}

async function handleSearchSubmit(event) {
  event.preventDefault();

  const ingredientName = ingredientInput.value.trim();
  const locationText = locationInput.value.trim();

  searchSummary.textContent = 'Searching vendors...';

  try {
    const searchResult = await searchVendors({ ingredientName, locationText });
    searchSummary.textContent = `Showing ${searchResult.vendors.length} demo vendors for ${searchResult.ingredient.name}.`;
    renderVendorList(searchResult.vendors);
  } catch (error) {
    searchSummary.textContent = error.message;
    renderVendorList([]);
  }
}
