// ===========================
// Dark Mode Toggle (Shared)
// ===========================

const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeIcon = document.getElementById('darkModeIcon');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateDarkModeIcon(savedTheme);

// Toggle dark mode
darkModeToggle?.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme);
});

// Update icon based on theme
function updateDarkModeIcon(theme) {
    if (darkModeIcon) {
        if (theme === 'dark') {
            darkModeIcon.textContent = '◑';
        } else {
            darkModeIcon.textContent = '◐';
        }
    }
}