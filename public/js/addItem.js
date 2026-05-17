// addItem.js — Handles the Add Item form

document.addEventListener('DOMContentLoaded', () => {
  requireAuth(); // Redirect to login if not authenticated

  // Set today's date as default
  document.getElementById('dateAdded').valueAsDate = new Date();

  // Save button
  document.getElementById('saveBtn').addEventListener('click', handleSave);

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', () => {
    ['itemId','itemName','itemType','quantityReceived','description'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('dateAdded').valueAsDate = new Date();
    clearFormErrors();
    showToast('Form cleared', 'info');
  });
});

async function handleSave() {
  clearFormErrors();

  // Collect values
  const itemId           = document.getElementById('itemId').value.trim();
  const itemName         = document.getElementById('itemName').value.trim();
  const itemType         = document.getElementById('itemType').value;
  const quantityReceived = parseInt(document.getElementById('quantityReceived').value);
  const dateAdded        = document.getElementById('dateAdded').value;
  const description      = document.getElementById('description').value.trim();

  // Validate
  let valid = true;

  if (!itemId) { showErr('itemIdErr', 'Item ID is required'); valid = false; }
  if (!itemName) { showErr('itemNameErr', 'Item Name is required'); valid = false; }
  if (!itemType) { showErr('itemTypeErr', 'Please select an item type'); valid = false; }
  if (!quantityReceived || quantityReceived < 1) {
    showErr('qtyErr', 'Quantity must be at least 1'); valid = false;
  }
  if (!dateAdded) { showErr('dateErr', 'Please select a date'); valid = false; }

  if (!valid) return;

  // Show confirmation popup before saving
  showConfirm(
    '➕ Confirm Add Item',
    `Add "${itemName}" (ID: ${itemId}) with quantity ${quantityReceived} to inventory?`,
    async () => {
      try {
        const result = await apiCall('/items', 'POST', {
          itemId, itemName, description,
          itemType, quantityReceived, dateAdded
        });

        showToast(result.message, 'success');

        // Clear form after successful save
        setTimeout(() => {
          ['itemId','itemName','itemType','quantityReceived','description'].forEach(id => {
            document.getElementById(id).value = '';
          });
          document.getElementById('dateAdded').valueAsDate = new Date();
        }, 500);

      } catch (err) {
        // Error is already shown via showToast in apiCall
      }
    }
  );
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearFormErrors() {
  ['itemIdErr','itemNameErr','itemTypeErr','qtyErr','dateErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });
}