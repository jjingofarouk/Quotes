// DOM Elements
const jokeText = document.querySelector('.joke-text');
const jokeCategory = document.querySelector('.joke-category');
const jokeType = document.querySelector('.joke-type');
const newJokeButton = document.getElementById('newJoke');
const copyJokeButton = document.getElementById('copyJoke');
const favoriteButton = document.getElementById('favorite');
const searchInput = document.querySelector('.search-input');
const categoryTags = document.querySelectorAll('.category-tag');
const loadingSpinner = document.querySelector('.loading-spinner');

// API Endpoint
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke';

// Fetch a random joke
async function fetchRandomJoke(category = 'Any') {
    try {
        // Show loading spinner
        loadingSpinner.style.display = 'block';

        // Fetch joke from API
        const response = await fetch(`${JOKE_API_URL}/${category}`);
        if (!response.ok) throw new Error('Failed to fetch joke');

        const data = await response.json();
        displayJoke(data);
    } catch (error) {
        console.error('Error fetching joke:', error);
        jokeText.textContent = 'Failed to load joke. Please try again.';
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
    }
}

// Display the joke
function displayJoke(joke) {
    if (joke.type === 'single') {
        jokeText.textContent = joke.joke;
        jokeType.textContent = '';
    } else if (joke.type === 'twopart') {
        jokeText.textContent = `${joke.setup} ... ${joke.delivery}`;
        jokeType.textContent = '(Two-Part Joke)';
    }
    jokeCategory.textContent = `Category: ${joke.category}`;
}

// Copy joke to clipboard
function copyJoke() {
    const textToCopy = jokeText.textContent;
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert('Joke copied to clipboard!'))
        .catch(() => alert('Failed to copy joke.'));
}

// Save joke to favorites (local storage)
function saveFavorite() {
    const favoriteJokes = JSON.parse(localStorage.getItem('favoriteJokes')) || [];
    const currentJoke = {
        text: jokeText.textContent,
        category: jokeCategory.textContent,
        type: jokeType.textContent,
    };

    // Check if joke is already saved
    if (!favoriteJokes.some(joke => joke.text === currentJoke.text)) {
        favoriteJokes.push(currentJoke);
        localStorage.setItem('favoriteJokes', JSON.stringify(favoriteJokes));
        alert('Joke saved to favorites!');
    } else {
        alert('Joke already saved!');
    }
}

// Search jokes by keyword
async function searchJokes(query) {
    try {
        loadingSpinner.style.display = 'block';
        const response = await fetch(`${JOKE_API_URL}/Any?contains=${query}`);
        if (!response.ok) throw new Error('Failed to search jokes');

        const data = await response.json();
        if (data.error) {
            jokeText.textContent = 'No jokes found. Try another search!';
            jokeCategory.textContent = '';
            jokeType.textContent = '';
        } else {
            displayJoke(data);
        }
    } catch (error) {
        console.error('Error searching jokes:', error);
        jokeText.textContent = 'Failed to search jokes. Please try again.';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Event Listeners
newJokeButton.addEventListener('click', () => fetchRandomJoke());
copyJokeButton.addEventListener('click', copyJoke);
favoriteButton.addEventListener('click', saveFavorite);

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
        searchJokes(query);
    } else {
        fetchRandomJoke();
    }
});

categoryTags.forEach(tag => {
    tag.addEventListener('click', () => {
        // Remove active class from all tags
        categoryTags.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tag
        tag.classList.add('active');
        // Fetch jokes by category
        const category = tag.textContent;
        fetchRandomJoke(category);
    });
});

// Initial Load: Fetch a random joke
fetchRandomJoke();
