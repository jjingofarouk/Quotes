// DOM Elements
const quoteText = document.querySelector('.quote-text');
const quoteAuthor = document.querySelector('.quote-author');
const quoteCategory = document.querySelector('.quote-category');
const newQuoteButton = document.getElementById('newQuote');
const copyQuoteButton = document.getElementById('copyQuote');
const favoriteButton = document.getElementById('favorite');
const searchInput = document.querySelector('.search-input');
const categoryTags = document.querySelectorAll('.category-tag');
const loadingSpinner = document.querySelector('.loading-spinner');

// API Endpoint
const API_URL = 'https://api.quotable.io';

// Fetch a random quote
async function fetchRandomQuote(tag = '') {
    try {
        // Show loading spinner
        loadingSpinner.style.display = 'block';

        // Fetch quote from API
        const response = await fetch(`${API_URL}/random${tag ? `?tags=${tag}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch quote');

        const data = await response.json();
        displayQuote(data);
    } catch (error) {
        console.error('Error fetching quote:', error);
        quoteText.textContent = 'Failed to load quote. Please try again.';
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
    }
}

// Display the quote
function displayQuote(quote) {
    quoteText.textContent = `"${quote.content}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
    quoteCategory.textContent = `#${quote.tags.join(', #')}`;
}

// Copy quote to clipboard
function copyQuote() {
    const textToCopy = `${quoteText.textContent} ${quoteAuthor.textContent}`;
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert('Quote copied to clipboard!'))
        .catch(() => alert('Failed to copy quote.'));
}

// Save quote to favorites (local storage)
function saveFavorite() {
    const favoriteQuotes = JSON.parse(localStorage.getItem('favoriteQuotes')) || [];
    const currentQuote = {
        text: quoteText.textContent,
        author: quoteAuthor.textContent,
        category: quoteCategory.textContent,
    };

    // Check if quote is already saved
    if (!favoriteQuotes.some(quote => quote.text === currentQuote.text)) {
        favoriteQuotes.push(currentQuote);
        localStorage.setItem('favoriteQuotes', JSON.stringify(favoriteQuotes));
        alert('Quote saved to favorites!');
    } else {
        alert('Quote already saved!');
    }
}

// Search quotes by keyword
async function searchQuotes(query) {
    try {
        loadingSpinner.style.display = 'block';
        const response = await fetch(`${API_URL}/search/quotes?query=${query}`);
        if (!response.ok) throw new Error('Failed to search quotes');

        const data = await response.json();
        if (data.results.length > 0) {
            displayQuote(data.results[0]);
        } else {
            quoteText.textContent = 'No quotes found. Try another search!';
            quoteAuthor.textContent = '';
            quoteCategory.textContent = '';
        }
    } catch (error) {
        console.error('Error searching quotes:', error);
        quoteText.textContent = 'Failed to search quotes. Please try again.';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Event Listeners
newQuoteButton.addEventListener('click', () => fetchRandomQuote());
copyQuoteButton.addEventListener('click', copyQuote);
favoriteButton.addEventListener('click', saveFavorite);

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
        searchQuotes(query);
    } else {
        fetchRandomQuote();
    }
});

categoryTags.forEach(tag => {
    tag.addEventListener('click', () => {
        // Remove active class from all tags
        categoryTags.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tag
        tag.classList.add('active');
        // Fetch quotes by category
        const category = tag.textContent.toLowerCase();
        fetchRandomQuote(category === 'all' ? '' : category);
    });
});

// Initial Load: Fetch a random quote
fetchRandomQuote();
