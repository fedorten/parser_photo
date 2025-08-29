// Theme management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.currentTheme = localStorage.getItem('theme');
        this.init();
    }

    init() {
        if (this.currentTheme === 'light') {
            document.documentElement.classList.remove('dark');
            this.themeToggle.checked = false;
        } else {
            document.documentElement.classList.add('dark');
            this.themeToggle.checked = true;
            localStorage.setItem('theme', 'dark');
        }

        this.themeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// Loading spinner management
class LoadingManager {
    constructor() {
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.searchForm = document.querySelector('form');
        this.init();
    }

    init() {
        this.searchForm.addEventListener('submit', () => {
            this.showSpinner();
            this.hideResults();
        });

        window.addEventListener('load', () => {
            this.hideSpinner();
        });

        window.addEventListener('error', () => {
            this.hideSpinner();
        });
    }

    showSpinner() {
        this.loadingSpinner.classList.remove('hidden');
    }

    hideSpinner() {
        this.loadingSpinner.classList.add('hidden');
    }

    hideResults() {
        const results = document.querySelector('.grid');
        if (results) {
            results.classList.add('hidden');
        }
    }
}

// Modal management
class ModalManager {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalImg = document.getElementById('modal-image');
        this.scale = 1;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.initialDistance = null;
        this.currentImageIndex = 0;
        this.allImages = [];
        this.init();
    }

    init() {
        this.setupKeyboardEvents();
        this.setupMouseEvents();
        this.setupTouchEvents();
        this.setupClickEvents();
    }

    openModal(imgUrl, index = 0) {
        this.currentImageIndex = index;
        this.modalImg.src = imgUrl;
        this.modal.classList.remove('hidden');
        this.scale = 1;
        this.modalImg.style.transform = `scale(${this.scale})`;
        this.modalImg.classList.remove('zoomed');
        this.modalImg.style.left = '0';
        this.modalImg.style.top = '0';
        document.body.style.overflow = 'hidden';
        
        // Show counter
        const counter = document.getElementById('counter');
        if (counter) {
            counter.classList.remove('hidden');
        }
        
        this.updateNavigation();
    }

    closeModal() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Hide counter
        const counter = document.getElementById('counter');
        if (counter) {
            counter.classList.add('hidden');
        }
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.closeModal();
                } else if (e.key === 'ArrowLeft') {
                    this.navigate(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigate(1);
                }
            }
        });
    }

    setupMouseEvents() {
        // Zoom with mouse wheel
        this.modal.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale = Math.max(0.5, Math.min(this.scale * delta, 3));

            this.modalImg.style.transform = `scale(${this.scale})`;
            if (this.scale > 1) {
                this.modalImg.classList.add('zoomed');
            } else {
                this.modalImg.classList.remove('zoomed');
                this.modalImg.style.left = '0';
                this.modalImg.style.top = '0';
            }
        });

        // Drag when zoomed
        this.modalImg.addEventListener('mousedown', (e) => {
            if (this.scale <= 1) return;
            this.isDragging = true;
            this.startX = e.clientX - this.modalImg.offsetLeft;
            this.startY = e.clientY - this.modalImg.offsetTop;
            this.modalImg.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();

            const x = e.clientX - this.startX;
            const y = e.clientY - this.startY;

            this.modalImg.style.left = `${x}px`;
            this.modalImg.style.top = `${y}px`;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            if (this.scale > 1) {
                this.modalImg.style.cursor = 'grab';
            }
        });
    }

    setupTouchEvents() {
        this.modal.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        });

        this.modal.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );

                if (this.initialDistance) {
                    const delta = currentDistance / this.initialDistance;
                    this.scale = Math.max(0.5, Math.min(this.scale * delta, 3));
                    this.modalImg.style.transform = `scale(${this.scale})`;

                    if (this.scale > 1) {
                        this.modalImg.classList.add('zoomed');
                    } else {
                        this.modalImg.classList.remove('zoomed');
                    }

                    this.initialDistance = currentDistance;
                }
            }
        });

        this.modal.addEventListener('touchend', () => {
            this.initialDistance = null;
        });
    }

    setupClickEvents() {
        // Close modal when clicking on background
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigate(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigate(1);
            });
        }
    }

    navigate(direction) {
        this.currentImageIndex += direction;

        // Зацикливаем навигацию
        if (this.currentImageIndex < 0) {
            this.currentImageIndex = this.allImages.length - 1;
        } else if (this.currentImageIndex >= this.allImages.length) {
            this.currentImageIndex = 0;
        }

        this.modalImg.src = this.allImages[this.currentImageIndex];
        this.scale = 1;
        this.modalImg.style.transform = `scale(${this.scale})`;
        this.modalImg.classList.remove('zoomed');
        this.modalImg.style.left = '0';
        this.modalImg.style.top = '0';

        this.updateNavigation();
    }

    updateNavigation() {
        const counter = document.getElementById('counter');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (counter) {
            counter.textContent = `${this.currentImageIndex + 1}/${this.allImages.length}`;
        }

        if (prevBtn && nextBtn) {
            prevBtn.disabled = this.allImages.length <= 1;
            nextBtn.disabled = this.allImages.length <= 1;
        }
    }

    setImages(images) {
        this.allImages = images;
    }
}

// Image grid management
class ImageGridManager {
    constructor() {
        this.init();
    }

    init() {
        // Add click handlers to all image cards
        document.addEventListener('click', (e) => {
            const imageCard = e.target.closest('.image-card');
            if (imageCard) {
                const imgUrl = imageCard.dataset.imageUrl;
                const index = parseInt(imageCard.dataset.imageIndex);
                if (imgUrl) {
                    window.modalManager.openModal(imgUrl, index);
                }
            }
        });
    }
}

// Initialize all managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.loadingManager = new LoadingManager();
    window.modalManager = new ModalManager();
    window.imageGridManager = new ImageGridManager();

    // Initialize images array from template
    const imageCards = document.querySelectorAll('.image-card');
    if (imageCards.length > 0) {
        const images = Array.from(imageCards).map(card => card.dataset.imageUrl);
        window.modalManager.setImages(images);
    }
});

// Global functions for backward compatibility
function openModal(imgUrl) {
    if (window.modalManager) {
        window.modalManager.openModal(imgUrl);
    }
}

function closeModal() {
    if (window.modalManager) {
        window.modalManager.closeModal();
    }
}
