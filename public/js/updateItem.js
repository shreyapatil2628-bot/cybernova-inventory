// updateItem.js — Search, update, and delete inventory items

let selectedItemId = null; // MongoDB _id of the currently selected item

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  document.getElementById('searchBtn').addEventListener('click', searchItem);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchItem();
  });

  // Live calculation: update remaining qty as user types
  document.getElementById('usedQty').addEventListener('input', calculateRemaining);

  document.getElementById('updateBtn').addEventListener('click', handleUpdate);
  document.getElementById('cancelBtn').addEventListener('click', resetUpdateForm);
  document.getElementById('deleteBtn').addEventListener('click', handleDelete);
});

async function searchItem() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    showToast('Please enter an Item ID or name to search', 'warning');
    return;
  }

  try {
    const res = await apiCall(`/items?search=${encodeURIComponent(query)}&limit=5`);
    const items = res.data;
    const container = document.getElementById('searchResults');
    container.classList.remove('hidden');

    if (items.length === 0) {
      container.innerHTML = `<p class="text-muted">No items found matching "${query}"</p>`;
      return;
    }

    // Show search result cards
    container.innerHTML = items.map(item => `
      <div style="
        border:1px solid var(--border);
        border-radius:var(--radius-sm);
        padding:12px 16px;
        margin-bottom:8px;
        cursor:pointer;
        transition:var(--transition);
        display:flex;
        justify-content:space-between;
        align-items:center;
      " onclick="selectItem('${item._id}')"
         onmouseover="this.style.borderColor='var(--primary)'"
         onmouseout="this.style.borderColor='var(--border)'">
        <div>
          <strong style="font-size:14px">${item.itemName}</strong>
          <span style="font-size:12px;color:var(--text-muted);margin-left:10px">${item.itemId}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:13px;color:var(--text-secondary)">Remaining: ${item.remainingQuantity}</span>
          ${stockBadge(item.stockStatus)}
        </div>
      </div>
    `).join('');
  } catch (err) {
    // Error handled in apiCall
  }
}

async function selectItem(mongoId) {
  try {
    const res = await apiCall(`/items/${mongoId}`);
    const item = res.data;

    selectedItemId = mongoId;

    // Fill read-only fields
    document.getElementById('displayItemId').value   = item.itemId;
    document.getElementById('displayItemName').value = item.itemName;
    document.getElementById('displayItemType').value = item.itemType;
    document.getElementById('origQty').value         = item.quantityReceived;
    document.getElementById('usedQty').value         = item.usedQuantity;
    document.getElementById('remainingQty').value    = item.remainingQuantity;

    // Show the update card
    document.getElementById('updateCard').classList.remove('hidden');
    document.getElementById('searchResults').classList.add('hidden');

    // Scroll to form
    document.getElementById('updateCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

    calculateRemaining(); // Show stock status preview

  } catch (err) { /* handled */ }
}

function calculateRemaining() {
  const orig = parseInt(document.getElementById('origQty').value) || 0;
  const used = parseInt(document.getElementById('usedQty').value) || 0;
  const remaining = orig - used;

  document.getElementById('remainingQty').value = remaining >= 0 ? remaining : 0;

  // Color coding
  const remInput = document.getElementById('remainingQty');
  const preview = document.getElementById('stockStatusPreview');
  const alert = document.getElementById('lowStockAlert');

  if (remaining <= 0) {
    remInput.style.color = 'var(--danger)';
    preview.classList.remove('hidden');
    alert.className = 'alert-banner danger';
    alert.innerHTML = '❌ <strong>Out of Stock!</strong> Item will be marked as Out of Stock.';
  } else if (remaining <= 10) {
    remInput.style.color = 'var(--warning)';
    preview.classList.remove('hidden');
    alert.className = 'alert-banner warning';
    alert.innerHTML = `⚠️ <strong>Low Stock Warning!</strong> Only ${remaining} unit(s) remaining.`;
  } else {
    remInput.style.color = 'var(--success)';
    preview.classList.add('hidden');
  }
}

async function handleUpdate() {
  const usedQty = parseInt(document.getElementById('usedQty').value);
  const origQty = parseInt(document.getElementById('origQty').value);
  const itemName = document.getElementById('displayItemName').value;

  document.getElementById('usedQtyErr').classList.add('hidden');

  if (isNaN(usedQty) || usedQty < 0) {
    document.getElementById('usedQtyErr').textContent = 'Please enter a valid used quantity';
    document.getElementById('usedQtyErr').classList.remove('hidden');
    return;
  }

  if (usedQty > origQty) {
    document.getElementById('usedQtyErr').textContent = `Used quantity cannot exceed original quantity (${origQty})`;
    document.getElementById('usedQtyErr').classList.remove('hidden');
    return;
  }

  showConfirm(
    '✏️ Confirm Update',
    `Update used quantity of "${itemName}" to ${usedQty}?`,
    async () => {
      try {
        const res = await apiCall(`/items/${selectedItemId}`, 'PUT', { usedQuantity: usedQty });
        showToast(res.message, 'success');
        resetUpdateForm();
      } catch (err) { /* handled */ }
    }
  );
}

async function handleDelete() {
  const itemName = document.getElementById('displayItemName').value;

  showConfirm(
    '🗑️ Delete Item',
    `Are you sure you want to permanently delete "${itemName}"? This cannot be undone.`,
    async () => {
      try {
        const res = await apiCall(`/items/${selectedItemId}`, 'DELETE');
        showToast(res.message, 'success');
        resetUpdateForm();
      } catch (err) { /* handled */ }
    }
  );
}

function resetUpdateForm() {
  document.getElementById('updateCard').classList.add('hidden');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').classList.add('hidden');
  selectedItemId = null;
}