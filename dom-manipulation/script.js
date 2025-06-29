let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');

// Load from local storage or initialize default quotes
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The future depends on what you do today.", category: "Motivation" },
      { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" },
      { text: "Do not wait for leaders; do it alone.", category: "Action" }
    ];
    saveQuotes();
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a random quote and save to session storage
function displayRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  // Store last viewed quote in session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Create add quote form dynamically
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

// Add new quote and update storage
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  alert("Quote added successfully!");
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// Export quotes to JSON file
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
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format. Expected an array of quotes.');
      }
    } catch (err) {
      alert('Failed to parse JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Display last viewed quote from sessionStorage
function displayLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  }
}

// Initialize application
loadQuotes();
createAddQuoteForm();
displayLastQuote();
newQuoteBtn.addEventListener('click', displayRandomQuote);
