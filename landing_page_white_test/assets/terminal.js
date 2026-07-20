// Types out a directory-listing style output inside .terminal .out
// Skips straight to the final state if reduced motion is preferred.
document.addEventListener('DOMContentLoaded', () => {
  const out = document.querySelector('[data-type-target]');
  if (!out) return;

  const lines = JSON.parse(out.getAttribute('data-type-target'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const render = (text) => {
    return text.replace(/\[dir\](.*?)\[\/dir\]/g, '<span class="dir">$1</span>');
  };

  if (prefersReduced) {
    out.innerHTML = lines.map(render).join('\n');
    return;
  }

  out.innerHTML = '';
  let lineIndex = 0, charIndex = 0;
  let current = '';

  function tick() {
    if (lineIndex >= lines.length) {
      out.innerHTML = lines.map(render).join('\n') + '<span class="type-cursor"></span>';
      return;
    }
    const line = lines[lineIndex];
    const plain = line.replace(/\[dir\](.*?)\[\/dir\]/g, '$1');
    if (charIndex <= plain.length) {
      current = plain.slice(0, charIndex);
      const finishedLines = lines.slice(0, lineIndex).map(render).join('\n');
      out.innerHTML = (finishedLines ? finishedLines + '\n' : '') + current + '<span class="type-cursor"></span>';
      charIndex++;
      setTimeout(tick, 14 + Math.random() * 22);
    } else {
      lineIndex++;
      charIndex = 0;
      setTimeout(tick, 90);
    }
  }
  setTimeout(tick, 300);
});
