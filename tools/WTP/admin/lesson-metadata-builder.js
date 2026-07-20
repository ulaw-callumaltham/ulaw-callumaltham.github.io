// ===========================
// State Management
// ===========================

let lessons = [];
let lessonCounter = 1;

// ===========================
// Render Lessons List
// ===========================

function renderLessons() {
    const lessonsList = document.getElementById('lessonsList');
    
    if (lessons.length === 0) {
        lessonsList.innerHTML = '<div class="empty-state">No lessons added yet. Click "Add Lesson" to get started.</div>';
        return;
    }
    
    lessonsList.innerHTML = lessons.map((lesson, index) => `
        <div class="lesson-card">
            <div class="lesson-card-header">
                <span class="lesson-number">Lesson ${lesson.id}</span>
                <button class="btn btn-danger btn-small" onclick="removeLesson(${index})">Remove</button>
            </div>
            
            <div class="grid-2">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" value="${lesson.title}" onchange="updateLesson(${index}, 'title', this.value)" placeholder="e.g., HTML Basics">
                </div>
                <div class="form-group">
                    <label>Language *</label>
                    <select onchange="updateLesson(${index}, 'language', this.value)">
                        <option value="web" ${lesson.language === 'web' ? 'selected' : ''}>Web (HTML/CSS/JS)</option>
                        <option value="python" ${lesson.language === 'python' ? 'selected' : ''}>Python</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label>Description *</label>
                <textarea rows="2" onchange="updateLesson(${index}, 'description', this.value)" placeholder="Brief description of what students will learn">${lesson.description}</textarea>
            </div>
            
            ${lesson.language === 'web' ? `
            <div class="form-group">
                <label>Active Panels</label>
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="checkbox" ${lesson.activePanels.includes('html') ? 'checked' : ''} onchange="togglePanel(${index}, 'html', this.checked)">
                        <span>HTML</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" ${lesson.activePanels.includes('css') ? 'checked' : ''} onchange="togglePanel(${index}, 'css', this.checked)">
                        <span>CSS</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" ${lesson.activePanels.includes('js') ? 'checked' : ''} onchange="togglePanel(${index}, 'js', this.checked)">
                        <span>JavaScript</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>Starter Files</label>
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="checkbox" ${lesson.starterCode.html ? 'checked' : ''} onchange="toggleStarter(${index}, 'html', this.checked)">
                        <span>HTML</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" ${lesson.starterCode.css ? 'checked' : ''} onchange="toggleStarter(${index}, 'css', this.checked)">
                        <span>CSS</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" ${lesson.starterCode.js ? 'checked' : ''} onchange="toggleStarter(${index}, 'js', this.checked)">
                        <span>JavaScript</span>
                    </label>
                </div>
            </div>
            ` : `
            <div class="form-group">
                <label>Starter Files</label>
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="checkbox" ${lesson.starterCode.python ? 'checked' : ''} onchange="toggleStarter(${index}, 'python', this.checked)">
                        <span>Python</span>
                    </label>
                </div>
            </div>
            `}
            
            <div class="form-group">
                <label>Hints</label>
                <div class="hints-container">
                    ${renderHints(lesson.hints, index)}
                </div>
                <button class="btn btn-secondary btn-small" onclick="addHint(${index})">+ Add Hint</button>
            </div>
        </div>
    `).join('');
}

function renderHints(hints, lessonIndex) {
    if (hints.length === 0) {
        return '<p style="color: #999; font-size: 14px;">No hints added yet.</p>';
    }
    
    return hints.map((hint, hintIndex) => `
        <div class="hint-item">
            <input type="text" value="${hint}" onchange="updateHint(${lessonIndex}, ${hintIndex}, this.value)" placeholder="Enter hint text">
            <button class="btn btn-danger btn-small" onclick="removeHint(${lessonIndex}, ${hintIndex})">Remove</button>
        </div>
    `).join('');
}

// ===========================
// Lesson CRUD Operations
// ===========================

function addLesson() {
    const newLesson = {
        id: lessonCounter++,
        title: '',
        description: '',
        language: 'web',
        activePanels: ['html', 'css', 'js'],
        starterCode: {},
        hints: []
    };
    
    lessons.push(newLesson);
    renderLessons();
}

function updateLesson(index, field, value) {
    lessons[index][field] = value;
    
    // If language changed, reset panels and starter code
    if (field === 'language') {
        if (value === 'web') {
            lessons[index].activePanels = ['html', 'css', 'js'];
            lessons[index].starterCode = {};
        } else {
            lessons[index].activePanels = [];
            lessons[index].starterCode = {};
        }
        renderLessons();
    }
}

function togglePanel(lessonIndex, panel, checked) {
    if (checked) {
        if (!lessons[lessonIndex].activePanels.includes(panel)) {
            lessons[lessonIndex].activePanels.push(panel);
        }
    } else {
        lessons[lessonIndex].activePanels = lessons[lessonIndex].activePanels.filter(p => p !== panel);
    }
}

function toggleStarter(lessonIndex, type, checked) {
    const moduleId = document.getElementById('moduleId').value.trim();
    const unitNumber = document.getElementById('unitNumber').value.trim();
    const lessonId = lessons[lessonIndex].id;
    
    if (checked) {
        lessons[lessonIndex].starterCode[type] = `data/lessons/${moduleId}/unit-${unitNumber}/lesson-${lessonId}/starter.${type === 'js' ? 'js' : type === 'python' ? 'py' : type}`;
    } else {
        delete lessons[lessonIndex].starterCode[type];
    }
}

function removeLesson(index) {
    if (confirm('Are you sure you want to remove this lesson?')) {
        lessons.splice(index, 1);
        renderLessons();
    }
}

// ===========================
// Hints CRUD Operations
// ===========================

function addHint(lessonIndex) {
    lessons[lessonIndex].hints.push('');
    renderLessons();
}

function updateHint(lessonIndex, hintIndex, value) {
    lessons[lessonIndex].hints[hintIndex] = value;
}

function removeHint(lessonIndex, hintIndex) {
    lessons[lessonIndex].hints.splice(hintIndex, 1);
    renderLessons();
}

// ===========================
// Download Functions
// ===========================

function downloadLessonsJson() {
    const moduleId = document.getElementById('moduleId').value.trim();
    const unitNumber = document.getElementById('unitNumber').value.trim();
    const unitTitle = document.getElementById('unitTitle').value.trim();
    
    // Validation
    if (!moduleId || !unitNumber || !unitTitle) {
        alert('Please fill in Module ID, Unit Number, and Unit Title');
        return;
    }
    
    if (lessons.length === 0) {
        alert('Please add at least one lesson');
        return;
    }
    
    // Validate all lessons have required fields
    for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        if (!lesson.title || !lesson.description) {
            alert(`Lesson ${lesson.id} is missing required fields (Title and Description)`);
            return;
        }
    }
    
    // Build lessons JSON with correct structure
    const lessonsData = {
        unitId: parseInt(unitNumber),
        unitTitle: unitTitle,
        lessons: lessons.map(lesson => {
            const lessonEntry = {
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                language: lesson.language
            };
            
            // Add activePanels only for web lessons
            if (lesson.language === 'web') {
                lessonEntry.activePanels = lesson.activePanels;
            }
            
            // Add instructionFile
            lessonEntry.instructionFile = `data/lessons/${moduleId}/unit-${unitNumber}/lesson-${lesson.id}/instruction.html`;
            
            // Add starterCode (always include for web, even if empty)
            if (lesson.language === 'web') {
                lessonEntry.starterCode = lesson.starterCode;
            } else if (lesson.language === 'python' && Object.keys(lesson.starterCode).length > 0) {
                lessonEntry.starterCode = lesson.starterCode;
            }
            
            // Add hints (filter out empty ones)
            lessonEntry.hints = lesson.hints.filter(h => h.trim() !== '');
            
            return lessonEntry;
        })
    };
    
    const json = JSON.stringify(lessonsData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lessons.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearAll() {
    if (confirm('Are you sure you want to clear all lessons? This cannot be undone.')) {
        document.getElementById('moduleId').value = '';
        document.getElementById('unitNumber').value = '';
        document.getElementById('unitTitle').value = '';
        lessons = [];
        lessonCounter = 1;
        renderLessons();
    }
}

// ===========================
// Event Listeners
// ===========================

document.getElementById('addLessonBtn').addEventListener('click', addLesson);
document.getElementById('downloadBtn').addEventListener('click', downloadLessonsJson);
document.getElementById('clearBtn').addEventListener('click', clearAll);

// ===========================
// Initialize
// ===========================

renderLessons();