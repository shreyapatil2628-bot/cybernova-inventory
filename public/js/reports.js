// reports.js — Inventory reports with search, filter, sort, pagination

let currentPage = 1;
const LIMIT = 10;

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  // Check URL parameters (e.g. from dashboard low-stock link)
  const params = new URLSearchParams(window.location.search);
  if (params.get('status')) {
    document.getElementById('filterStatus').value = params.get('status');
  }

  loadReport();

  // Apply filters on button click
  document.getElementById('applyFilters').addEventListener('click', () => {
    currentPage = 1;
    loadReport();
  });

  // Reset filters
  document.getElementById('resetFilters').addEventListener('click', () => {
    document.getElementById('searchInput').value  = '';
    document.getElementById('filterType').value   = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('sortBy').value        = '';
    currentPage = 1;
    loadReport();
  });

  // Live search (with debounce)
  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { currentPage = 1; loadReport(); }, 400);
  });
});

async function loadReport() {
  const search = document.getElementById('searchInput').value.trim();
  const type   = document.getElementById('filterType').value;
  const status = document.getElementById('filterStatus').value;
  const sort   = document.getElementById('sortBy').value;

  // Build query string
  const qs = new URLSearchParams({
    ...(search && { search }),
    ...(type   && { type }),
    ...(status && { status }),
    ...(sort   && { sort }),
    page:  currentPage,
    limit: LIMIT,
  }).toString();

  try {
    const res = await apiCall(`/items?${qs}`);
    renderTable(res.data, res.total);
    renderPagination(res.totalPages);
    document.getElementById('resultCount').textContent =
      `Showing ${res.data.length} of ${res.total} item(s)`;
  } catch (err) {
    document.getElementById('reportTableBody').innerHTML =
      `<tr><td colspan="10" class="text-center text-muted" style="padding:32px">
        Backend not connected. Start the server and refresh.
       </td></tr>`;
  }
}

function renderTable(items, total) {
  const tbody = document.getElementById('reportTableBody');

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr>
      <td colspan="10" class="text-center text-muted" style="padding:32px">
        No items found matching the selected filters.
      </td>
    </tr>`;
    return;
  }

  const startRow = (currentPage - 1) * LIMIT + 1;

  tbody.innerHTML = items.map((item, i) => `
    <tr class="${item.stockStatus === 'Low Stock' ? 'low-stock' : item.stockStatus === 'Out of Stock' ? 'out-of-stock' : ''}">
      <td class="text-muted">${startRow + i}</td>
      <td><code style="font-size:12px;color:var(--primary)">${item.itemId}</code></td>
      <td><strong>${item.itemName}</strong>${item.description ? `<br><small style="color:var(--text-muted)">${item.description.substring(0, 40)}${item.description.length > 40 ? '…' : ''}</small>` : ''}</td>
      <td>${item.itemType}</td>
      <td>${item.quantityReceived}</td>
      <td>${item.usedQuantity}</td>
      <td style="font-weight:700;color:${item.remainingQuantity <= 0 ? 'var(--danger)' : item.remainingQuantity <= 10 ? 'var(--warning)' : 'var(--success)'}">
        ${item.remainingQuantity}
      </td>
      <td>${formatDate(item.dateAdded)}</td>
      <td>${stockBadge(item.stockStatus)}</td>
      <td>
        <a href="updateItem.html" onclick="localStorage.setItem('editId','${item._id}')"
           class="btn btn-secondary btn-sm">✏️ Edit</a>
      </td>
    </tr>
  `).join('');
}

function renderPagination(totalPages) {
  const container = document.getElementById('pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';

  // Previous button
  html += `<button class="page-btn" onclick="goToPage(${currentPage-1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;
    }
  }

  // Next button
  html += `<button class="page-btn" onclick="goToPage(${currentPage+1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadReport();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}