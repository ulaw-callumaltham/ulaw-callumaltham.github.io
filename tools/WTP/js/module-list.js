// ===========================
// Module List - Load and Display Modules
// ===========================

const moduleGrid = document.getElementById('moduleGrid');

// ?view=archived shows archived modules instead of current ones
const showArchived = new URLSearchParams(window.location.search).get('view') === 'archived';

// Load modules from JSON
async function loadModules() {
    try {
        const response = await fetch('data/modules.json');
        const data = await response.json();

        const isArchived = m => m.archived === true;
        const modules = data.modules.filter(m => showArchived ? isArchived(m) : !isArchived(m));
        const archivedCount = data.modules.filter(isArchived).length;

        if (showArchived) {
            updateArchivedHeading();
        }

        // Clear existing content
        moduleGrid.innerHTML = '';

        if (modules.length === 0) {
            moduleGrid.innerHTML = showArchived
                ? '<p>There are no archived modules.</p>'
                : '<p>There are no current modules.</p>';
        }

        // Generate module cards
        modules.forEach(module => {
            const card = createModuleCard(module);
            moduleGrid.appendChild(card);
        });

        addArchiveToggle(archivedCount);

    } catch (error) {
        console.error('Error loading modules:', error);
        moduleGrid.innerHTML = '<p>Error loading modules. Please try again later.</p>';
    }
}

// Change the page heading when viewing the archive
function updateArchivedHeading() {
    const title = document.querySelector('.page-title');
    const description = document.querySelector('.page-description');

    if (title) title.textContent = 'Archived Modules';
    if (description) description.textContent = 'Modules from previous cohorts, kept available for reference.';
    document.title = 'Archived Modules | CS WTP';
}

// Link below the grid to switch between current and archived views
function addArchiveToggle(archivedCount) {
    // Only offer the archive link if there is something in it
    if (!showArchived && archivedCount === 0) return;

    const toggle = document.createElement('p');
    toggle.className = 'archive-toggle';
    toggle.innerHTML = showArchived
        ? '<a href="index.html">← Back to current modules</a>'
        : `<a href="index.html?view=archived">View archived modules (${archivedCount})</a>`;

    moduleGrid.insertAdjacentElement('afterend', toggle);
}

// Create a module card element
function createModuleCard(module) {
    const card = document.createElement('a');
    card.href = `units.html?module=${module.id}`;
    card.className = 'module-card';

    const archivedBadge = module.archived === true
        ? '<span class="meta-separator">•</span><span class="archived-badge">Archived</span>'
        : '';

    card.innerHTML = `
        <div class="module-content">
            <div class="module-header">
                <span class="module-code">${module.code}</span>
                <span class="meta-separator">•</span>
                <span class="module-level">Level ${module.level}</span>
                ${archivedBadge}
            </div>
            <h3 class="module-title">${module.title}</h3>
            <p class="module-description">${module.description}</p>
            <div class="module-meta">
                <span class="module-units">${module.unitCount} units</span>
            </div>
            <div class="module-entry">
                <span class="entry-label">Entry:</span> ${module.entryDate}
            </div>
        </div>
        <div class="module-arrow">→</div>
    `;

    return card;
}

// Load modules on page load
loadModules();