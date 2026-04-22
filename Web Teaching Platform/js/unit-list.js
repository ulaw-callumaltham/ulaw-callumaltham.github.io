// ===========================
// Unit List - Load and Display Units
// ===========================

const unitGrid = document.getElementById('unitGrid');
const moduleHeader = document.querySelector('.module-header');

// Get module ID from URL or default
const urlParams = new URLSearchParams(window.location.search);
const moduleId = urlParams.get('module') || 'CSCI71585'; // Default to CSCI71585

// Load units from JSON
async function loadUnits() {
    try {
        // First, load the module data to get the units file path
        const modulesResponse = await fetch('../data/modules.json');
        const modulesData = await modulesResponse.json();
        
        // Find the current module
        const module = modulesData.modules.find(m => m.id === moduleId);
        
        if (!module) {
            throw new Error('Module not found');
        }
        
        // Update module header with module info
        updateModuleHeader(module);
        
        // Load units data
        const unitsResponse = await fetch(`../${module.unitsFile}`);
        const unitsData = await unitsResponse.json();
        
        // Clear existing content
        unitGrid.innerHTML = '';
        
        // Generate unit cards
        unitsData.units.forEach(unit => {
            const card = createUnitCard(unit, moduleId);
            unitGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading units:', error);
        unitGrid.innerHTML = '<p>Error loading units. Please try again later.</p>';
    }
}

// Update module header with module info
function updateModuleHeader(module) {
    moduleHeader.innerHTML = `
        <div class="module-meta-info">
            <span class="module-code">${module.code}</span>
            <span class="meta-separator">•</span>
            <span class="module-level">Level ${module.level}</span>
        </div>
        <h1 class="module-title">${module.title}</h1>
        <p class="module-description">${module.description}</p>
        <div class="module-stats">
            <span>${module.unitCount} units</span>
            <span class="meta-separator">•</span>
            <span>${module.weeks} weeks</span>
            <span class="meta-separator">•</span>
            <span>Entry: ${module.entryDate}</span>
        </div>
    `;
}

// Create a unit card element
function createUnitCard(unit, moduleId) {
    const card = document.createElement('a');
    card.href = `../lesson.html?module=${moduleId}&unit=${unit.id}`;
    card.className = 'unit-card';
    
    // Check if unit is locked (compare unlock date with today)
    const unlockDate = new Date(unit.unlockDate);
    const today = new Date();
    const isLocked = today < unlockDate;
    
    if (isLocked) {
        card.classList.add('locked');
        card.removeAttribute('href'); // Remove link if locked
        card.style.cursor = 'not-allowed';
    }
    
    // Build technology tags
    const techTags = unit.technologies.map(tech => 
        `<span class="tag tag-${tech.toLowerCase()}">${tech}</span>`
    ).join('');
    
    // Build card HTML
    let cardHTML = '';
    
    if (isLocked) {
        const unlockDateStr = unlockDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        cardHTML += `
            <div class="lock-badge">
                <span class="lock-icon">🔒</span>
                <span class="lock-text">Unlocks ${unlockDateStr}</span>
            </div>
        `;
    }
    
    cardHTML += `
        <div class="unit-header">
            <h3 class="unit-title">${unit.title}</h3>
            <span class="unit-week">Week ${unit.week}</span>
        </div>
        <p class="unit-description">${unit.description}</p>
        <div class="unit-meta">
            <span class="unit-lessons">${unit.lessonCount} lessons</span>
        </div>
        <div class="unit-tags">
            ${techTags}
        </div>
    `;
    
    // Add progress bar for unlocked units
    if (!isLocked) {
        const progress = getUnitProgress(moduleId, unit.id);
        const progressPercent = (progress.completed / unit.lessonCount) * 100;
        
        cardHTML += `
            <div class="unit-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                </div>
                <span class="progress-text">${progress.completed}/${unit.lessonCount} complete</span>
            </div>
        `;
        
        // Add completed class if all lessons done
        if (progress.completed === unit.lessonCount) {
            card.classList.add('completed');
        }
    }
    
    card.innerHTML = cardHTML;
    
    return card;
}

// Get unit progress from localStorage
function getUnitProgress(moduleId, unitId) {
    const progressKey = `progress_${moduleId}_${unitId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    
    return {
        completed: progress.length,
        total: progress.length
    };
}

// Load units on page load
loadUnits();