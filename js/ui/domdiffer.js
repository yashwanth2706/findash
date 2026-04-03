
// ─────────────────────────────────────────────
// LIGHTWEIGHT DOM DIFFER
// Patches only text nodes and attributes that changed.
// Falls back to innerHTML for table bodies (keyed diffing).
// ─────────────────────────────────────────────
function patchText(id, newText) {
  const el = document.getElementById(id);
  if (el && el.innerHTML !== newText) el.innerHTML = newText;
}

function patchAttr(el, attr, value) {
  if (el.getAttribute(attr) !== String(value)) el.setAttribute(attr, value);
}

function patchClass(el, cls, condition) {
  if (condition && !el.classList.contains(cls)) el.classList.add(cls);
  if (!condition && el.classList.contains(cls)) el.classList.remove(cls);
}

function patchStyle(el, prop, value) {
  if (el.style[prop] !== value) el.style[prop] = value;
}

/**
 * Keyed tbody diffing.
 * Rows are matched by data-id. Rows missing from newRows are removed;
 * rows present in newRows but absent from DOM are inserted; unchanged rows
 * are left in place (innerHTML comparison as a cheap equality check).
 */
function patchTbody(tbody, newRows) {
  // Build a map of current rows by key
  const existingMap = {};
  for (const tr of tbody.querySelectorAll("tr[data-id]")) {
    existingMap[tr.dataset.id] = tr;
  }

  // If newRows is the empty-state sentinel (no data-id rows), just replace
  if (newRows.every(r => !r.key)) {
    const html = newRows.map(r => r.html).join("");
    if (tbody.innerHTML !== html) tbody.innerHTML = html;
    return;
  }

  const newKeys = newRows.map(r => r.key);
  const newMap  = {};
  newRows.forEach(r => { newMap[r.key] = r.html; });

  // Remove rows no longer in new state
  for (const key of Object.keys(existingMap)) {
    if (!newMap[key]) existingMap[key].remove();
  }

  // Insert / update rows in correct order
  let refNode = null; // we'll insert before this node (null = append)
  for (let i = newKeys.length - 1; i >= 0; i--) {
    const key  = newKeys[i];
    const html = newMap[key];
    let tr = tbody.querySelector(`tr[data-id="${key}"]`);

    if (!tr) {
      // New row — create and insert
      const tmp = document.createElement("tbody");
      tmp.innerHTML = html;
      tr = tmp.firstElementChild;
      tbody.insertBefore(tr, refNode);
    } else {
      // Existing row — patch if changed
      if (tr.outerHTML !== html) {
        const tmp = document.createElement("tbody");
        tmp.innerHTML = html;
        tbody.replaceChild(tmp.firstElementChild, tr);
        tr = tbody.querySelector(`tr[data-id="${key}"]`);
      }
      // Reorder if needed
      if (tr.nextSibling !== refNode) {
        tbody.insertBefore(tr, refNode);
      }
    }
    refNode = tr;
  }
}
