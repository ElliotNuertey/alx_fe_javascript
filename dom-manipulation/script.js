let quotes = [];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 60000; // 60 seconds

// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const categoryFilter = document.getElementById('categoryFilter');
const notificationBanner = document.createElement('div');

// Add notification banner to DOM
notificationBanner.id = 'notificationBanner';
notificationBanner.style = 'position: fixed; top: 0; width: 100%; background: yellow; padding: 10px; display: none; z-index: 1000;';
document.body.prepend(notificationBanner);

function defaultQuotes() {
  const now = Date.now();
  return [
    { id: 1, text: "The future depends on what you do today.", category: "Motivation", lastUpdated: now },
    { id: 2, text: "Simplicity is the ultimate sophistication.", category: "Philosophy", lastUpdated: now },
    { id: 3, text: "Do not wait for leaders; do it alone.", category: "Action", lastUpdated: now }
  ];
}

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : defaultQuotes();
  saveQuotes();
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const current = categoryFilter.value;
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem('lastSelectedCategory');
  if (savedCategory && [...categoryFilter.options].some(opt => opt.value === savedCategory)) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  } else {
    categoryFilter.value = current || 'all';
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('lastSelectedCategory', selectedCategory);

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
  } else {
    quoteDisplay.textContent = `"${filtered[0].text}" — ${filtered[0].category}`;
    sessionStorage.setItem("lastQuote", JSON.stringify(filtered[0]));
  }
}

function displayRandomQuote() {
  const selectedCategory = categoryFilter.value;

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function createAddQuoteForm() {
  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.onclick = addQuote;

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addBtn);
}

async function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text,
    category,
    lastUpdated: Date.now()
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  try {
    const res = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuote)
    });
    const responseJson = await res.json();
    console.log('Posted to server:', responseJson);
  } catch (error) {
    console.error("Error posting to server:", error);
  }

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added successfully!");
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array.");
      }
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
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

// NEW FUNCTION REQUIRED BY PROMPT
async function syncQuotes() {
  await fetchQuotesFromServer();
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();
    let updated = false;

    const serverQuotes = serverData.slice(0, 10).map(item => ({
      id: item.id,
      text: item.title,
      category: "Server",
      lastUpdated: Date.now()
    }));

    serverQuotes.forEach(serverQuote => {
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
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

function initializeApp() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  } else {
    filterQuotes();
  }

  newQuoteBtn.addEventListener('click', displayRandomQuote);
  syncQuotes();
  setInterval(syncQuotes, SYNC_INTERVAL);
}

initializeApp();
