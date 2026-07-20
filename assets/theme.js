// Wires up the dark/light toggle button. Pair with the no-flash
// inline snippet in <head> that sets data-theme before first paint.
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;

  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cs-tools-theme', theme);
    btn.setAttribute('aria-pressed', theme === 'dark');
  };

  btn.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'dark');

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark');
  });
});