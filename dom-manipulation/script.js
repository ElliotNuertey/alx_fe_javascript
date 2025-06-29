let quotes = [];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Replace with real endpoint
const SYNC_INTERVAL = 60000; // 60 seconds

// DOM references
const quoteDisplay       = document.getElementById('quoteDisplay');
const newQuoteBtn        = document.getElementById('newQuote');
const formContainer      = document.getElementById('formContainer');
const categoryFilter     = document.getElementById('categoryFilter');
const notificationBanner = document.createElement('div');

// Add notification banner to DOM
notificationBanner.id = 'notificationBanner';
notificationBanner.style = 'position: fixed; top: 0; width: 100%; background: yellow; padding: 10px; display: none;';
document.body.prepend(notificationBanner);

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) quotes = JSON.parse(stored);
  else {
    quotes = defaultQuotes();
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function defaultQuotes() {
  const now = Date.now();
  return [
    { id: 1, text: "Future depends on what you do today.", category: "Motivation", lastUpdated: now },
    { id: 2, text: "Simplicity is sophistication.", category: "Philosophy", lastUpdated: now },
    { id: 3, text: "Do it alone, don't wait.", category: "Action", lastUpdated: now }
  ];
}

function fetchServerQuotes() {
  fetch(SERVER_URL)
    .then(res => res.json())
    .then(serverData => {
      let updated = false;
      serverData.slice(0,10).forEach(item => {
        const serverQuote = {
          id: item.id,
          text: item.title,
          category: 'Server',
          lastUpdated: Date.now()
        };
        const local = quotes.find(q => q.id === serverQuote.id);
        if (!local) {
          quotes.push(serverQuote);
          updated = true;
        } else if (serverQuote.lastUpdated > local.lastUpdated) {
          Object.assign(local, serverQuote);
          updated = true;
        }
      });

      if (updated) {
        const previous = JSON.parse(JSON.stringify(quotes));
        saveQuotes();
        populateCategories();
        filterQuotes();
        showNotification("Server data synchronized. <button onclick='undoSync()'>Undo</button>");
        window._undoState = previous;
      }
    })
    .catch(console.error);
}

function showNotification(html) {
  notificationBanner.innerHTML = html;
  notificationBanner.style.display = 'block';
  setTimeout(() => notificationBanner.style.display = 'none', 8000);
}

function undoSync() {
  if (!window._undoState) return;
  quotes = window._undoState;
  saveQuotes();
  populateCategories();
  filterQuotes();
  showNotification('Sync undone.');
  window._undoState = null;
}

// ... existing UI and filter code (populateCategories, filterQuotes, displayRandomQuote, etc.) ...
// unchanged from previous version, using selectedCategory variable and session/localStorage integration

function initializeApp() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  }
  newQuoteBtn.addEventListener('click', displayRandomQuote);

  // Start periodic sync
  fetchServerQuotes();
  setInterval(fetchServerQuotes, SYNC_INTERVAL);
}

initializeApp();
