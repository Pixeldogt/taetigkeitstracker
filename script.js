let allEntries = {};

document.addEventListener('DOMContentLoaded', () => {
  const datePicker = document.getElementById('datePicker');
  const selectedDateLabel = document.getElementById('selectedDate');
  const entriesList = document.getElementById('entriesList');
  const newEntryInput = document.getElementById('newEntry');
  const exportButton = document.getElementById('exportButton');
  const importButton = document.getElementById('importButton');
  const importFileInput = document.getElementById('importFile');
  const prevDayBtn = document.getElementById('prevDay');
  const nextDayBtn = document.getElementById('nextDay');

  prevDayBtn.addEventListener('click', () => {
    shiftDate(-1);
  });

  nextDayBtn.addEventListener('click', () => {
    shiftDate(1);
  });

  function shiftDate(days) {
    const current = new Date(datePicker.value);
    current.setDate(current.getDate() + days);
    datePicker.value = current.toISOString().split('T')[0];
    updateSelectedDate(datePicker.value); // Aktualisiert die Anzeige des Datums
    loadEntries(datePicker.value);
  }

  // Init date
  const today = new Date().toISOString().split('T')[0];
  datePicker.value = today;

  // Load from localStorage
  const saved = localStorage.getItem('entries');
  if (saved) allEntries = JSON.parse(saved);

  updateSelectedDate(today);
  loadEntries(today);

  datePicker.addEventListener('change', () => {
    const date = datePicker.value;
    updateSelectedDate(date);
    loadEntries(date);
  });

  newEntryInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && newEntryInput.value.trim()) {
      const val = newEntryInput.value.trim();
      const date = datePicker.value;
      if (!allEntries[date]) allEntries[date] = [];
      allEntries[date].push(val);
      saveEntries();
      newEntryInput.value = '';
      loadEntries(date);
    }
  });

  exportButton.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(allEntries, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'eintraege.json';
    a.click();
  });

  importButton.addEventListener('click', () => importFileInput.click());

  importFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const imported = JSON.parse(evt.target.result);
        allEntries = imported;
        saveEntries();
        loadEntries(datePicker.value);
        alert('Import erfolgreich!');
      } catch (err) {
        alert('Fehler beim Importieren.');
      }
    };
    reader.readAsText(file);
  });

  function updateSelectedDate(dateStr) {
    const date = new Date(dateStr);
    selectedDateLabel.textContent = date.toLocaleDateString('de-DE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function loadEntries(date) {
    entriesList.innerHTML = '';
    const entries = allEntries[date] || [];

    entries.forEach((entryText, index) => {
      const li = document.createElement('li');
      li.textContent = entryText;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.style.marginLeft = '0.5rem';
      deleteBtn.style.border = 'none';
      deleteBtn.style.background = 'transparent';
      deleteBtn.style.cursor = 'pointer';

      deleteBtn.addEventListener('click', () => {
        if (confirm('Diesen Eintrag wirklich löschen?')) {
          allEntries[date].splice(index, 1);
          if (allEntries[date].length === 0) {
            delete allEntries[date];
          }
          saveEntries();
          loadEntries(date);
        }
      });

      li.appendChild(deleteBtn);
      entriesList.appendChild(li);
    });
  }


  function saveEntries() {
    localStorage.setItem('entries', JSON.stringify(allEntries));
  }

  const generateButton = document.getElementById('generateButton');
  const output = document.getElementById('generatedOutput');

  generateButton.addEventListener('click', () => {
    const lines = [];

    const selected = new Date(datePicker.value);
    const monday = getMonday(selected);

    for (let i = 0; i < 5; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);

      const isoDate = current.toISOString().split('T')[0];
      const weekday = current.toLocaleDateString('de-DE', { weekday: 'short' });
      const dateStr = current.toLocaleDateString('de-DE');

      const texts = allEntries[isoDate];
      if (texts && texts.length) {
        lines.push(`${dateStr}`);
        lines.push(`[${weekday}]${texts.join(', ')}`);
      }
    }

    output.value = lines.join('\n');
  });

  // Hilfsfunktion, um Wochenstart (Montag) zu finden
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1); // Sonntag = 0
    return new Date(d.setDate(diff));
  }

  const copyButton = document.getElementById('copyButton');

  copyButton.addEventListener('click', () => {
    const text = output.value;
    if (!text.trim()) {
      alert('Kein Text zum Kopieren!');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => alert('Text kopiert!'))
      .catch(() => alert('Fehler beim Kopieren.'));
  });

});
