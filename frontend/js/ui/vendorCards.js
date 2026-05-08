/**
 * Vendor card rendering.
 *
 * Receives normalized vendor data from the backend contract and renders it. This
 * module should not call fetch or know which provider produced the data.
 */

const vendorResults = document.querySelector('#vendor-results');

export function renderVendorList(vendors) {
  vendorResults.replaceChildren(...vendors.map(createVendorCard));
}

function createVendorCard(vendor) {
  const card = document.createElement('article');
  card.className = 'vendor-card';

  const title = document.createElement('h3');
  title.textContent = vendor.name;

  const address = document.createElement('p');
  address.className = 'vendor-meta';
  address.textContent = vendor.address;

  const categories = document.createElement('p');
  categories.className = 'vendor-meta';
  categories.textContent = `Categories: ${vendor.categories.join(', ') || 'none listed'}`;

  const status = document.createElement('p');
  status.className = 'vendor-meta';
  status.textContent = `Ingredient status: ${vendor.ingredientStatus.status}`;

  card.append(title, address, categories, status);
  return card;
}
