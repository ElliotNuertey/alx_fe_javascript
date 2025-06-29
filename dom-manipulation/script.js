let quotes = [];

// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const categoryFilter = document.getElementById('categoryFilter');

// Load quotes from localStorage or initialize default
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The future depends on what you do today.", category: "Motivation" },
      { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" },
      { text: "Do not wait for leaders; do it alone.", category: "Action" }
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate category dropdown from unique categories
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

  // Restore previously selected category from localStorage
  const savedCategory = localStorage.getItem('lastSelectedCategory');
  if (savedCategory && [...categoryFilter.options].some(opt => opt.value === savedCategory)) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  } else {
    categoryFilter.value = current || 'all';
  }
}

// Filter quotes based on selected category
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

// Display random quote based on selected category
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

// Create form elements for adding quotes
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

// Add quote to array and update UI
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added successfully!");
}

// Export quotes as JSON file
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

// Import quotes from uploaded JSON file
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

// Initialize app
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
}

initializeApp();
