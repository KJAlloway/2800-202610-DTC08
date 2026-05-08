/**
 * API helper for vendor search.
 *
 * Frontend UI modules should call this helper instead of building fetch calls
 * directly. That keeps endpoint changes contained.
 */

export async function searchVendors({ ingredientName, locationText }) {
  const params = new URLSearchParams({
    ingredient: ingredientName,
  });

  if (locationText) {
    params.set('location', locationText);
  }

  const response = await fetch(`/api/search/vendors?${params.toString()}`);

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody?.error?.message || 'Vendor search failed.');
  }

  return response.json();
}
