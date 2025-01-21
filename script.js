// Advanced Quote Management System with API Integration
class QuoteManager {
    constructor() {
        this.API_ENDPOINT = 'https://api.quotable.io';
        this.state = {
            currentQuote: null,
            categories: new Set(),
            favorites: new Map(),
            isLoading: false,
            currentCategory: 'All',
            searchTerm: '',
            darkMode: false
        };
        
        this.elements = this.initializeElements();
        this.initializeEventListeners();
        this.initializeIntersectionObserver();
    }

    // DOM Element Initialization with Error Handling
    initializeElements() {
        const selectors = {
            quoteContainer: '.quote-container',
            quoteText: '.quote-text',
            quoteAuthor: '.quote-author',
            quoteCategory: '.quote-category',
            categoriesContainer: '.categories',
            searchInput: '.search-input',
            controls: '.controls',
            loadingSpinner: '.loading-spinner',
            themeToggle: '.theme-toggle'
        };

        const elements = {};
        for (const [key, selector] of Object.entries(selectors)) {
            const element = document.querySelector(selector);
            if (!element) {
                console.error(`Element with selector "${selector}" not found`);
            }
            elements[key] = element;
        }

        // Initialize dynamic buttons
        elements.actionButtons = {
            newQuote: this.createButton('newQuote', '🔄 New Quote'),
            copyQuote: this.createButton('copyQuote', '📋 Copy Quote'),
            favorite: this.createButton('favorite', '❤️ Save'),
            share: this.createButton('share', '📤 Share')
        };

        return elements;
    }

    // Button Creation with Custom Attributes
    createButton(id, text) {
        const button = document.getElementById(id) || document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.setAttribute('data-action', id);
        return button;
    }

    // API Integration with Error Handling and Retry Logic
    async fetchQuotes(category = '', searchTerm = '', retries = 3) {
        const endpoint = category === 'All' ? 
            `${this.API_ENDPOINT}/quotes/random?limit=1` :
            `${this.API_ENDPOINT}/quotes/random?limit=1&tags=${category}`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data[0] : data;
        } catch (error) {
            console.error('Error fetching quote:', error);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.fetchQuotes(category, searchTerm, retries - 1);
            }
            throw error;
        }
    }

    // Advanced Category Management with Caching
    async fetchCategories() {
        try {
            const response = await fetch(`${this.API_ENDPOINT}/tags`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const categories = await response.json();
            return categories.map(cat => cat.name);
        } catch (error) {
            console.error('Error fetching categories:', error);
            return ['Wisdom', 'Philosophy', 'Love', 'Life', 'Success', 'Science', 
                    'Literature', 'Humor', 'Art', 'Nature', 'History'];
        }
    }

    // Intersection Observer for Lazy Loading
    initializeIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadNewQuote();
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        this.observer.observe(this.elements.quoteContainer);
    }

    // Advanced Event Management System
    initializeEventListeners() {
        // Event delegation for all control buttons
        this.elements.controls.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action && this[`handle${action.charAt(0).toUpperCase() + action.slice(1)}`]) {
                this[`handle${action.charAt(0).toUpperCase() + action.slice(1)}`]();
            }
        });

        // Debounced search handler
        this.elements.searchInput.addEventListener('input', 
            this.debounce(() => this.handleSearch(), 300)
        );

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Touch gestures
        this.initializeTouchGestures();

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', 
            () => this.toggleTheme()
        );
    }

    // Touch Gesture System
    initializeTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        this.handleFavorite();
                    } else {
                        this.handleNewQuote();
                    }
                }
            }
        };

        this.elements.quoteContainer.addEventListener('touchstart', handleTouchStart);
        this.elements.quoteContainer.addEventListener('touchend', handleTouchEnd);
    }

    // Event Handlers
    async handleNewQuote() {
        await this.loadNewQuote();
    }

    async handleCopyQuote() {
        const quote = this.state.currentQuote;
        if (!quote) return;

        const text = `"${quote.content}" - ${quote.author}`;
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Quote copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy quote', 'error');
        }
    }

    async handleShare() {
        const quote = this.state.currentQuote;
        if (!quote) return;

        const shareData = {
            title: 'QuoteSphere',
            text: `"${quote.content}" - ${quote.author}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                this.showNotification('Quote copied for sharing!');
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    }

    // Advanced Quote Loading System
    async loadNewQuote() {
        if (this.state.isLoading) return;

        this.state.isLoading = true;
        this.elements.loadingSpinner.style.display = 'block';
        this.elements.quoteContainer.style.opacity = '0.5';

        try {
            const quote = await this.fetchQuotes(
                this.state.currentCategory,
                this.state.searchTerm
            );

            this.state.currentQuote = quote;
            
            // Animate quote transition
            await this.animateQuoteTransition(() => {
                this.elements.quoteText.textContent = quote.content;
                this.elements.quoteAuthor.textContent = `- ${quote.author}`;
                this.elements.quoteCategory.textContent = quote.tags?.[0] || 'Uncategorized';
            });

        } catch (error) {
            this.showNotification('Failed to load quote. Please try again.', 'error');
        } finally {
            this.state.isLoading = false;
            this.elements.loadingSpinner.style.display = 'none';
            this.elements.quoteContainer.style.opacity = '1';
        }
    }

    // Animation System
    async animateQuoteTransition(updateCallback) {
        await gsap.to(this.elements.quoteContainer, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });

        updateCallback();

        return gsap.to(this.elements.quoteContainer, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.in"
        });
    }

    // Notification System
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        gsap.to(notification, {
            opacity: 1,
            y: -20,
            duration: 0.3,
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(notification, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        onComplete: () => notification.remove()
                    });
                }, 2000);
            }
        });
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Theme Management
    toggleTheme() {
        this.state.darkMode = !this.state.darkMode;
        document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.state.darkMode);
    }

    // Keyboard Shortcut System
    handleKeyboardShortcuts(e) {
        const shortcuts = {
            'n': () => this.handleNewQuote(),
            'c': () => this.handleCopyQuote(),
            's': () => this.handleFavorite(),
            '/': () => this.elements.searchInput.focus()
        };

        if (!e.ctrlKey && !e.metaKey && shortcuts[e.key.toLowerCase()]) {
            e.preventDefault();
            shortcuts[e.key.toLowerCase()]();
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const quoteManager = new QuoteManager();
    // Load initial quote
    quoteManager.loadNewQuote();
});
