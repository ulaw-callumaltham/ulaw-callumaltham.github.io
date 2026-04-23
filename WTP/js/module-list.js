// ===========================
// Module List - Load and Display Modules
// ===========================

const moduleGrid = document.getElementById('moduleGrid');

// Load modules from JSON
async function loadModules() {
    try {
        const response = await fetch('data/modules.json');
        const data = await response.json();
        
        // Clear existing content
        moduleGrid.innerHTML = '';
        
        // Generate module cards
        data.modules.forEach(module => {
            const card = createModuleCard(module);
            moduleGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading modules:', error);
        moduleGrid.innerHTML = '<p>Error loading modules. Please try again later.</p>';
    }
}

// Create a module card element
function createModuleCard(module) {
    const card = document.createElement('a');
    card.href = `units.html?module=${module.id}`;
    card.className = 'module-card';
    
    card.innerHTML = `
        <div class="module-content">
            <div class="module-header">
                <span class="module-code">${module.code}</span>
                <span class="meta-separator">•</span>
                <span class="module-level">Level ${module.level}</span>
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