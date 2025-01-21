  
        // Expanded quotes database
        const quotes = [
            {
                text: "The unexamined life is not worth living.",
                author: "Socrates",
                category: "Philosophy"
            },
            {
                text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
                author: "Albert Einstein",
                category: "Science"
            },
            {
                text: "To love and be loved is to feel the sun from both sides.",
                author: "David Viscott",
                category: "Love"
            },
            {
                text: "It is better to remain silent and be thought a fool than to speak and remove all doubt.",
                author: "Mark Twain",
                category: "Humor"
            },
            {
                text: "Art enables us to find ourselves and lose ourselves at the same time.",
                author: "Thomas Merton",
                category: "Art"
            },
            {
                text: "The cure for anything is salt water: sweat, tears, or the sea.",
                author: "Isak Dinesen",
                category: "Nature"
            },
            {
                text: "Those who cannot remember the past are condemned to repeat it.",
                author: "George Santayana",
                category: "History"
            },
            {
                text: "Books are a uniquely portable magic.",
                author: "Stephen King",
                category: "Literature"
            },
            {
                text: "The only true wisdom is in knowing you know nothing.",
                author: "Socrates",
                category: "Wisdom"
            },
            {
                text: "Life is really simple, but we insist on making it complicated.",
                author: "Confucius",
                category: "Life"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                category: "Success"
            }
        ];

        // DOM Elements
        const quoteContainer = document.querySelector('.quote-container');
        const quoteText = document.querySelector('.quote-text');
        const quoteAuthor = document.querySelector('.quote-author');
        const quoteCategory = document.querySelector('.quote-category');
        const newQuoteBtn = document.getElementById('newQuote');
        const copyQuoteBtn = document.getElementById('copyQuote');
        const favoriteBtn = document.getElementById('favorite');
        const categoryTags = document.querySelectorAll('.category-tag');
        const themeToggle = document.querySelector('.theme-toggle');
        const loadingSpinner = document.querySelector('.loading-spinner');
        const searchInput = document.querySelector('.search-input');

        // Functions
        function filterQuotes(searchTerm = '', category = 'All') {
            return quotes.filter(quote => {
                const matchesSearch = searchTerm === '' || 
                    quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    quote.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    quote.category.toLowerCase().includes(searchTerm.toLowerCase());
                
                const matchesCategory = category === 'All' || quote.category === category;
                
                return matchesSearch && matchesCategory;
            });
        }

        function getRandomQuote(searchTerm = '', category = 'All') {
            const filteredQuotes = filterQuotes(searchTerm, category);
            if (filteredQuotes.length === 0) return null;
            return filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
        }

        async function displayNewQuote(searchTerm = '', category = 'All') {
            loadingSpinner.style.display = 'block';
            quoteContainer.style.opacity = '0';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const quote = getRandomQuote(searchTerm, category);
            
            if (!quote) {
                quoteText.textContent = "No quotes found matching your criteria.";
                quoteAuthor.textContent = "";
                quoteCategory.textContent = "";
            } else {
                quoteText.textContent = quote.text;
                quoteAuthor.textContent = `- ${quote.author}`;
                quoteCategory.textContent = quote.category;
            }

            gsap.to(quoteContainer, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });
            
            loadingSpinner.style.display = 'none';
        }

        // Event Listeners
        newQuoteBtn.addEventListener('click', () => {
            const activeCategory = document.querySelector('.category-tag.active').textContent;
            const searchTerm = searchInput.value;
            displayNewQuote(searchTerm, activeCategory);
        });

        copyQuoteBtn.addEventListener('click', () => {
            const textToCopy = `"${quoteText.textContent}" ${quoteAuthor.textContent}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyQuoteBtn.textContent = '✓ Copied!';
                setTimeout(() => {
                    copyQuoteBtn.textContent = '📋 Copy Quote';
                }, 2000);
            });
        });

        favoriteBtn.addEventListener('click', () => {
            favoriteBtn.textContent = '❤️ Saved!';
            setTimeout(() => {
                favoriteBtn.textContent = '❤️ Save';
            }, 2000);
        });

        [Previous code remains exactly the same until the categoryTags event listener...]

        categoryTags.forEach(tag => {
            tag.addEventListener('click', () => {
                categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                const searchTerm = searchInput.value;
                displayNewQuote(searchTerm, tag.textContent);
            });
        });

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const activeCategory = document.querySelector('.category-tag.active').textContent;
                displayNewQuote(e.target.value, activeCategory);
            }, 300);
        });

        let isDarkMode = false;
        themeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.documentElement.style.setProperty('--background', '#1a1a1a');
                document.documentElement.style.setProperty('--primary', '#2C3639');
                document.documentElement.style.setProperty('--secondary', '#3F4E4F');
                document.documentElement.style.setProperty('--accent', '#A27B5C');
                document.documentElement.style.setProperty('--text', '#ffffff');
                document.documentElement.style.setProperty('--card-bg', '#2d2d2d');
            } else {
                document.documentElement.style.setProperty('--background', '#DCD7C9');
                document.documentElement.style.setProperty('--primary', '#2C3639');
                document.documentElement.style.setProperty('--secondary', '#3F4E4F');
                document.documentElement.style.setProperty('--accent', '#A27B5C');
                document.documentElement.style.setProperty('--text', '#2C3639');
                document.documentElement.style.setProperty('--card-bg', 'white');
            }
        });

        // Local Storage Management
        const FAVORITES_KEY = 'quotesphere_favorites';

        function loadFavorites() {
            const favorites = localStorage.getItem(FAVORITES_KEY);
            return favorites ? JSON.parse(favorites) : [];
        }

        function saveFavorite(quote) {
            const favorites = loadFavorites();
            const exists = favorites.some(fav => 
                fav.text === quote.text && 
                fav.author === quote.author
            );
            
            if (!exists) {
                favorites.push(quote);
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
                return true;
            }
            return false;
        }

        favoriteBtn.addEventListener('click', () => {
            const currentQuote = {
                text: quoteText.textContent,
                author: quoteAuthor.textContent,
                category: quoteCategory.textContent
            };

            if (saveFavorite(currentQuote)) {
                favoriteBtn.innerHTML = '✓ Saved!';
                gsap.from(favoriteBtn, {
                    scale: 1.2,
                    duration: 0.3,
                    ease: "back.out"
                });
            } else {
                favoriteBtn.innerHTML = 'Already Saved';
            }

            setTimeout(() => {
                favoriteBtn.innerHTML = '❤️ Save';
            }, 2000);
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
                newQuoteBtn.click();
            } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
                copyQuoteBtn.click();
            } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
                favoriteBtn.click();
            } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                searchInput.focus();
            }
        });

        // Share functionality
        async function shareQuote() {
            const quote = `"${quoteText.textContent}" ${quoteAuthor.textContent}`;
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'QuoteSphere',
                        text: quote,
                        url: window.location.href
                    });
                } catch (err) {
                    console.error('Share failed:', err);
                }
            } else {
                navigator.clipboard.writeText(quote).then(() => {
                    alert('Quote copied to clipboard!');
                });
            }
        }

        // Add share button to controls
        const shareBtn = document.createElement('button');
        shareBtn.innerHTML = '📤 Share';
        shareBtn.addEventListener('click', shareQuote);
        document.querySelector('.controls').appendChild(shareBtn);

        // Handle mobile gestures
        let touchstartX = 0;
        let touchendX = 0;

        quoteContainer.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        });

        quoteContainer.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            handleGesture();
        });

        function handleGesture() {
            if (touchendX < touchstartX - 50) {
                // Swipe left - next quote
                newQuoteBtn.click();
            } else if (touchendX > touchstartX + 50) {
                // Swipe right - save quote
                favoriteBtn.click();
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            displayNewQuote();
            
            // Show keyboard shortcuts hint
            const hint = document.createElement('div');
            hint.style.position = 'fixed';
            hint.style.bottom = '1rem';
            hint.style.left = '1rem';
            hint.style.fontSize = '0.8rem';
            hint.style.color = 'var(--secondary)';
            hint.innerHTML = 'Keyboard shortcuts: (N)ew quote, (C)opy, (S)ave, (/) Search';
            document.body.appendChild(hint);
            
            setTimeout(() => {
                hint.style.opacity = '0';
                hint.style.transition = 'opacity 0.5s ease';
                setTimeout(() => hint.remove(), 500);
            }, 5000);
        });
    
