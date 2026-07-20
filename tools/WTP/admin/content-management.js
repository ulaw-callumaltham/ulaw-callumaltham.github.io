// ===========================
// State
// ===========================

let allData = {
    modules: [],
    stats: {
        totalModules: 0,
        totalUnits: 0,
        totalLessons: 0,
        warnings: 0,
        errors: 0
    }
};

// ===========================
// Load All Content
// ===========================

async function loadAllContent() {
    try {
        // Load modules.json
        const modulesResponse = await fetch('../data/modules.json');
        const modulesData = await modulesResponse.json();
        
        // Load each module's units and lessons
        for (const module of modulesData.modules) {
            const moduleInfo = {
                ...module,
                units: []
            };
            
            // Load units
            try {
                const unitsResponse = await fetch(`../${module.unitsFile}`);
                if (!unitsResponse.ok) {
                    console.warn(`Units file not found: ${module.unitsFile}`);
                    continue; // Skip this module
                }
                const unitsData = await unitsResponse.json();
                
                for (const unit of unitsData.units) {
                    const unitInfo = {
                        ...unit,
                        lessons: []
                    };
                    
                    // Load lessons
                    try {
                        const lessonsResponse = await fetch(`../${unit.lessonsFile}`);
                        if (!lessonsResponse.ok) {
                            console.warn(`Lessons file not found: ${unit.lessonsFile}`);
                            // Add unit but mark as having no lessons
                            unitInfo.lessons = [];
                            unitInfo.error = 'Lessons file not found';
                        } else {
                            const lessonsData = await lessonsResponse.json();
                            unitInfo.lessons = lessonsData.lessons;
                        }
                    } catch (error) {
                        console.warn(`Error loading lessons for ${unit.id}:`, error);
                        unitInfo.lessons = [];
                        unitInfo.error = 'Error loading lessons';
                    }
                    
                    moduleInfo.units.push(unitInfo);
                }
            } catch (error) {
                console.warn(`Error loading units for ${module.id}:`, error);
            }
            
            allData.modules.push(moduleInfo);
        }
        
        // Calculate stats
        calculateStats();
        
        // Render
        renderStats();
        renderContent();
        
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('contentInventory').innerHTML = `
            <div class="loading" style="color: #dc2626;">
                Error loading content. Please check the console for details.
            </div>
        `;
    }
}

// ===========================
// Calculate Statistics
// ===========================

function calculateStats() {
    let totalUnits = 0;
    let totalLessons = 0;
    let warnings = 0;
    let errors = 0;
    
    allData.modules.forEach(module => {
        totalUnits += module.units.length;
        
        module.units.forEach(unit => {
            totalLessons += unit.lessons.length;
            
            unit.lessons.forEach(lesson => {
                const validation = validateLesson(lesson);
                if (validation.errors.length > 0) {
                    errors++;
                } else if (validation.warnings.length > 0) {
                    warnings++;
                }
            });
        });
    });
    
    allData.stats = {
        totalModules: allData.modules.length,
        totalUnits,
        totalLessons,
        warnings,
        errors
    };
}

// ===========================
// Validate Lesson
// ===========================

function validateLesson(lesson) {
    const errors = [];
    const warnings = [];
    
    // Check for instruction file (we can't check if it exists without fetching)
    if (!lesson.instructionFile) {
        errors.push('Missing instruction file path');
    }
    
    // Check for hints
    if (!lesson.hints || lesson.hints.length === 0) {
        warnings.push('No hints provided');
    }
    
    // Check for starter code
    if (lesson.language === 'web') {
        if (!lesson.starterCode || Object.keys(lesson.starterCode).length === 0) {
            warnings.push('No starter files specified');
        }
    }
    
    // Check for empty description
    if (!lesson.description || lesson.description.trim() === '') {
        warnings.push('Empty description');
    }
    
    // Check for active panels (web only)
    if (lesson.language === 'web') {
        if (!lesson.activePanels || lesson.activePanels.length === 0) {
            errors.push('No active panels specified');
        }
    }
    
    return { errors, warnings };
}

// ===========================
// Get Lesson Status
// ===========================

function getLessonStatus(lesson) {
    const validation = validateLesson(lesson);
    
    if (validation.errors.length > 0) {
        return {
            class: 'error',
            icon: '❌',
            issues: validation.errors
        };
    } else if (validation.warnings.length > 0) {
        return {
            class: 'warning',
            icon: '⚠️',
            issues: validation.warnings
        };
    } else {
        return {
            class: 'complete',
            icon: '✅',
            issues: []
        };
    }
}

// ===========================
// Render Statistics
// ===========================

function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${allData.stats.totalModules}</div>
            <div class="stat-label">Modules</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${allData.stats.totalUnits}</div>
            <div class="stat-label">Units</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${allData.stats.totalLessons}</div>
            <div class="stat-label">Lessons</div>
        </div>
        ${allData.stats.warnings > 0 ? `
        <div class="stat-card warning">
            <div class="stat-value">${allData.stats.warnings}</div>
            <div class="stat-label">Warnings</div>
        </div>
        ` : ''}
        ${allData.stats.errors > 0 ? `
        <div class="stat-card error">
            <div class="stat-value">${allData.stats.errors}</div>
            <div class="stat-label">Errors</div>
        </div>
        ` : ''}
    `;
}

// ===========================
// Render Content Inventory
// ===========================

function renderContent() {
    const contentInventory = document.getElementById('contentInventory');
    
    if (allData.modules.length === 0) {
        contentInventory.innerHTML = '<div class="loading">No modules found.</div>';
        return;
    }
    
    contentInventory.innerHTML = allData.modules.map((module, moduleIndex) => `
        <div class="module-card">
            <div class="module-header" onclick="toggleModule(${moduleIndex})">
                <div>
                    <div class="module-title">${module.code} - ${module.title}</div>
                    <div class="module-meta">${module.units.length} units • ${module.units.reduce((sum, u) => sum + u.lessons.length, 0)} lessons</div>
                </div>
                <span class="toggle-icon" id="toggle-${moduleIndex}">▼</span>
            </div>
            <div class="module-content" id="module-${moduleIndex}">
                ${renderUnits(module.units)}
            </div>
        </div>
    `).join('');
}

function renderUnits(units) {
    return units.map(unit => `
        <div class="unit-card">
            <div class="unit-header">Unit ${unit.id}: ${unit.title} (${unit.lessons.length} lessons)</div>
            <div class="lesson-list">
                ${renderLessons(unit.lessons)}
            </div>
        </div>
    `).join('');
}

function renderLessons(lessons) {
    return lessons.map(lesson => {
        const status = getLessonStatus(lesson);
        const starterCount = lesson.starterCode ? Object.keys(lesson.starterCode).length : 0;
        
        return `
            <div class="lesson-item ${status.class}">
                <span class="lesson-status">${status.icon}</span>
                <div class="lesson-info">
                    <div class="lesson-title">Lesson ${lesson.id}: ${lesson.title}</div>
                    <div class="lesson-details">
                        <span class="lesson-badge badge-${lesson.language}">${lesson.language.toUpperCase()}</span>
                        ${lesson.language === 'web' ? `<span>• Panels: ${lesson.activePanels ? lesson.activePanels.join(', ') : 'none'}</span>` : ''}
                        <span>• Starters: ${starterCount}</span>
                        <span>• Hints: ${lesson.hints ? lesson.hints.length : 0}</span>
                    </div>
                    ${status.issues.length > 0 ? `
                        <div class="lesson-issues">⚠ ${status.issues.join(', ')}</div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ===========================
// Toggle Module Visibility
// ===========================

function toggleModule(index) {
    const content = document.getElementById(`module-${index}`);
    const icon = document.getElementById(`toggle-${index}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        icon.classList.add('collapsed');
    }
}

// ===========================
// Initialize
// ===========================

loadAllContent();