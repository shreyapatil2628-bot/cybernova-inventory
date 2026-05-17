// dashboard.js — Loads and displays dashboard statistics

document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard — redirect to login if not logged in
  const user = requireAuth();

  // Set welcome message
  document.getElementById('welcomeText').textContent =
    `Welcome, ${user.name} (${user.role})`;

  // Set current date
  document.getElementById('dateText').textContent =
    new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

  // Load dashboard data
  await loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await apiCall('/items/stats');
    const { totalItems, lowStock, outOfStock, totalQuantity, recentItems } = res.data;

    // Update stat cards
    document.getElementById('statTotal').textContent     = totalItems;
    document.getElementById('statLowStock').textContent  = lowStock;
    document.getElementById('statQuantity').textContent  = totalQuantity;
    document.getElementById('statOutOfStock').textContent = outOfStock;

    // Update low stock badge in sidebar
    document.getElementById('lowStockBadge').textContent = lowStock;

    // Show low stock alert banner if needed
    if (lowStock > 0 || outOfStock > 0) {
      const banner = document.getElementById('lowStockBanner');
      banner.classList.remove('hidden');
      document.getElementById('alertText').textContent =
        `⚠️ ${lowStock} item(s) are low on stock and ${outOfStock} are out of stock!`;

      if (outOfStock > 0) banner.classList.replace('warning', 'danger');
    }

    // Populate recent items table
    const tbody = document.getElementById('recentTableBody');

    if (!recentItems || recentItems.length === 0) {
      tbody.innerHTML = `<tr>
        <td colspan="7" class="text-center text-muted" style="padding:32px">
          No items added yet. <a href="addItem.html" style="color:var(--primary)">Add your first item →</a>
        </td>
      </tr>`;
      return;
    }

    tbody.innerHTML = recentItems.map(item => `
      <tr class="${item.stockStatus === 'Low Stock' ? 'low-stock' : item.stockStatus === 'Out of Stock' ? 'out-of-stock' : ''}">
        <td><code style="font-size:12px;color:var(--primary)">${item.itemId}</code></td>
        <td><strong>${item.itemName}</strong></td>
        <td>${item.itemType}</td>
        <td>${item.quantityReceived}</td>
        <td>${item.remainingQuantity}</td>
        <td>${formatDate(item.dateAdded)}</td>
        <td>${stockBadge(item.stockStatus)}</td>
      </tr>
    `).join('');

  } catch (err) {
    // Show empty state if backend is not connected
    document.getElementById('statTotal').textContent     = '—';
    document.getElementById('statLowStock').textContent  = '—';
    document.getElementById('statQuantity').textContent  = '—';
    document.getElementById('statOutOfStock').textContent = '—';

    document.getElementById('recentTableBody').innerHTML = `<tr>
      <td colspan="7" class="text-center text-muted" style="padding:32px">
        Could not load data. Make sure the backend server is running on port 5000.
      </td>
    </tr>`;
  }
}