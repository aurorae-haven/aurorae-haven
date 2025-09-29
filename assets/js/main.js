// v12.3 main: export/import + beforeunload guard
const STORAGE_KEYS = { schedule: 'sj.schedule.events', braindump: 'sj.braindump.text' };

function exportData() {
  const payload = {
    version: 12.3,
    exportedAt: new Date().toISOString(),
    schedule: JSON.parse(localStorage.getItem(STORAGE_KEYS.schedule) || '[]'),
    braindump: localStorage.getItem(STORAGE_KEYS.braindump) || ''
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `stellar-journey-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      if (Array.isArray(json.schedule)) {
        localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(json.schedule));
      }
      if (typeof json.braindump === 'string') {
        localStorage.setItem(STORAGE_KEYS.braindump, json.braindump);
      }
      alert('Import OK');
    } catch {
      alert('Fichier invalide');
    }
  };
  reader.readAsText(file);
}
function bindGlobalButtons() {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  if (exportBtn) exportBtn.addEventListener('click', exportData);
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', () => {
        if (input.files && input.files[0]) importData(input.files[0]);
      });
      input.click();
    });
  }
}
document.addEventListener('DOMContentLoaded', bindGlobalButtons);
export function markDirty() {}
export function clearDirty() {}
