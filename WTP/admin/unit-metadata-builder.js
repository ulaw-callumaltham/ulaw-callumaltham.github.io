// ===========================
// State Management
// ===========================

let units = [];
let unitCounter = 1;

// ===========================
// Render Units List
// ===========================

function renderUnits() {
    const unitsList = document.getElementById('unitsList');
    
    if (units.length === 0) {
        unitsList.innerHTML = '<div class="empty-state">No units added yet. Click "Add Unit" to get started.</div>';
        return;
    }
    
    unitsList.innerHTML = units.map((unit, index) => `
        <div class="unit-card">
            <div class="unit-card-header">
                <span class="unit-number">Unit ${unit.unitNumber}</span>
                <button class="btn btn-danger btn-small" onclick="removeUnit(${index})">Remove</button>
            </div>
            
            <div class="grid-2">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" value="${unit.title}" onchange="updateUnit(${index}, 'title', this.value)" placeholder="e.g., Introduction to HTML">
                </div>
                <div class="form-group">
                    <label>Week Number *</label>
                    <input type="number" value="${unit.week}" onchange="updateUnit(${index}, 'week', this.value)" min="1" placeholder="1">
                </div>
            </div>
            
            <div class="form-group">
                <label>Description *</label>
                <textarea rows="2" onchange="updateUnit(${index}, 'description', this.value)" placeholder="Brief description of this unit">${unit.description}</textarea>
            </div>
            
            <div class="grid-3">
                <div class="form-group">
                    <label>Unlock Date *</label>
                    <input type="date" value="${unit.unlockDate}" onchange="updateUnit(${index}, 'unlockDate', this.value)">
                </div>
                <div class="form-group">
                    <label>Lesson Count *</label>
                    <input type="number" value="${unit.lessonCount}" onchange="updateUnit(${index}, 'lessonCount', this.value)" min="1" placeholder="5">
                </div>
            </div>
            
            <div class="form-group">
                <label>Technologies</label>
                <div class="tech-tags">
                    <label class="tech-tag">
                        <input type="checkbox" ${unit.technologies.includes('HTML') ? 'checked' : ''} onchange="toggleTechnology(${index}, 'HTML', this.checked)">
                        <span>HTML</span>
                    </label>
                    <label class="tech-tag">
                        <input type="checkbox" ${unit.technologies.includes('CSS') ? 'checked' : ''} onchange="toggleTechnology(${index}, 'CSS', this.checked)">
                        <span>CSS</span>
                    </label>
                    <label class="tech-tag">
                        <input type="checkbox" ${unit.technologies.includes('JavaScript') ? 'checked' : ''} onchange="toggleTechnology(${index}, 'JavaScript', this.checked)">
                        <span>JavaScript</span>
                    </label>
                    <label class="tech-tag">
                        <input type="checkbox" ${unit.technologies.includes('Python') ? 'checked' : ''} onchange="toggleTechnology(${index}, 'Python', this.checked)">
                        <span>Python</span>
                    </label>
                </div>
            </div>
        </div>
    `).join('');
}

// ===========================
// Unit CRUD Operations
// ===========================

function addUnit() {
    const newUnit = {
        unitNumber: unitCounter++,
        title: '',
        description: '',
        week: unitCounter - 1,
        unlockDate: '',
        lessonCount: 0,
        technologies: []
    };
    
    units.push(newUnit);
    renderUnits();
}

function updateUnit(index, field, value) {
    units[index][field] = value;
}

function toggleTechnology(index, tech, checked) {
    if (checked) {
        if (!units[index].technologies.includes(tech)) {
            units[index].technologies.push(tech);
        }
    } else {
        units[index].technologies = units[index].technologies.filter(t => t !== tech);
    }
}

function removeUnit(index) {
    if (confirm('Are you sure you want to remove this unit?')) {
        units.splice(index, 1);
        renderUnits();
    }
}

// ===========================
// Download Functions
// ===========================

function downloadUnitsJson() {
    const moduleId = document.getElementById('moduleId').value.trim();
    const moduleTitle = document.getElementById('moduleTitle').value.trim();
    
    // Validation
    if (!moduleId || !moduleTitle) {
        alert('Please enter both Module ID and Module Title');
        return;
    }
    
    if (units.length === 0) {
        alert('Please add at least one unit');
        return;
    }
    
    // Validate all units have required fields
    for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        if (!unit.title || !unit.description || !unit.week || !unit.unlockDate || !unit.lessonCount) {
            alert(`Unit ${unit.unitNumber} is missing required fields. Please fill in all fields marked with *`);
            return;
        }
    }
    
    // Build units JSON with module metadata at top
    const unitsData = {
        moduleId: moduleId,
        moduleCode: moduleId,  // Same as moduleId
        moduleTitle: moduleTitle,  // User will need to fill this manually in the JSON
        units: units.map(unit => ({
            id: unit.unitNumber,
            title: unit.title,
            description: unit.description,
            week: parseInt(unit.week),
            unlockDate: unit.unlockDate,
            lessonCount: parseInt(unit.lessonCount),
            technologies: unit.technologies,
            lessonsFile: `data/lessons/${moduleId}/unit-${unit.unitNumber}/lessons.json`
        }))
    };
    
    const json = JSON.stringify(unitsData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleId}-units.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearAll() {
    if (confirm('Are you sure you want to clear all units? This cannot be undone.')) {
        document.getElementById('moduleId').value = '';
        document.getElementById('moduleTitle').value = '';
        units = [];
        unitCounter = 1;
        renderUnits();
    }
}

// ===========================
// Event Listeners
// ===========================

document.getElementById('addUnitBtn').addEventListener('click', addUnit);
document.getElementById('downloadBtn').addEventListener('click', downloadUnitsJson);
document.getElementById('clearBtn').addEventListener('click', clearAll);

// ===========================
// Initialize
// ===========================

renderUnits();