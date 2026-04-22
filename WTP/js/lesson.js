// ===========================
// Live Preview Auto-Refresh
// ===========================

function updatePreview() {
    const previewFrame = document.getElementById('preview');
    const htmlEditor = document.getElementById('htmlEditor');
    const cssEditor = document.getElementById('cssEditor');
    const jsEditor = document.getElementById('jsEditor');
    
    const htmlCode = htmlEditor.value;
    const cssCode = cssEditor.value;
    const jsCode = jsEditor.value;
    
    const previewContent = 
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<style>' + cssCode + '</style>' +
        '</head>' +
        '<body>' +
        htmlCode +
        '<script>' + jsCode + '<' + '/script>' +
        '</body>' +
        '</html>';
    
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    previewDoc.open();
    previewDoc.write(previewContent);
    previewDoc.close();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Set up preview listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // const htmlEditor = document.getElementById('htmlEditor');
    // const cssEditor = document.getElementById('cssEditor');
    // const jsEditor = document.getElementById('jsEditor');
    
    const debouncedUpdate = debounce(updatePreview, 500);
    
    htmlEditor.addEventListener('input', debouncedUpdate);
    cssEditor.addEventListener('input', debouncedUpdate);
    jsEditor.addEventListener('input', debouncedUpdate);
});

// Rest of lesson.js code below...



// // ===========================
// // Lesson Platform - Load and Display Lesson
// // ===========================

// // Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const moduleId = urlParams.get('module') || 'CSCI71585';
const unitId = parseInt(urlParams.get('unit')) || 1;
const lessonId = parseInt(urlParams.get('lesson')) || 1;

// // DOM elements
const lessonUnitTitle = document.querySelector('.lesson-unit-title');
const instructionTitle = document.querySelector('.instruction-title');
const instructionContent = document.getElementById('instructionContent');
// const htmlEditor = document.getElementById('htmlEditor');
// const cssEditor = document.getElementById('cssEditor');
// const jsEditor = document.getElementById('jsEditor');

// Store current lesson data
let currentLesson = null;
let currentUnit = null;
let allLessons = [];

// Load lesson data
async function loadLesson() {
    try {
        // Load module data to get module info
        const modulesResponse = await fetch('data/modules.json');
        const modulesData = await modulesResponse.json();
        const module = modulesData.modules.find(m => m.id === moduleId);
        
        if (!module) {
            throw new Error('Module not found');
        }
        
        // Load units data to get unit info
        const unitsResponse = await fetch(module.unitsFile);
        const unitsData = await unitsResponse.json();
        currentUnit = unitsData.units.find(u => u.id === unitId);
        
        if (!currentUnit) {
            throw new Error('Unit not found');
        }
        
        // Load lessons data
        const lessonsResponse = await fetch(currentUnit.lessonsFile);
        const lessonsData = await lessonsResponse.json();
        allLessons = lessonsData.lessons;
        currentLesson = allLessons.find(l => l.id === lessonId);
        
        if (!currentLesson) {
            throw new Error('Lesson not found');
        }
        
        // Update page with lesson data
        updateLessonTitle(module, currentUnit);
        await loadInstructionContent(currentLesson);
        await loadStarterCode(currentLesson);
        setupEditorPanels(currentLesson);
        populateHints(currentLesson);  // ← ADD THIS LINE
        populateMenuModal(currentUnit, allLessons, lessonId);
        updateNavigationButtons();  // ← ADD THIS LINE
    } catch (error) {
        console.error('Error loading lesson:', error);
        alert('Error loading lesson. Please try again.');
    }
}

// Update the lesson title in nav bar
function updateLessonTitle(module, unit) {
    lessonUnitTitle.innerHTML = `
        <span class="module-code">${module.code}</span>
        <span class="title-separator">•</span>
        <span class="module-name">${module.title}</span>
        <span class="title-separator">•</span>
        <span class="unit-name">${unit.title}</span>
    `;
}

// Load instruction content from HTML file
async function loadInstructionContent(lesson) {
    try {
        const response = await fetch(lesson.instructionFile);
        const html = await response.text();
        
        // Update instruction title and content
        instructionTitle.textContent = lesson.title;
        instructionContent.querySelector('.instruction-text').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading instruction content:', error);
        instructionContent.querySelector('.instruction-text').innerHTML = 
            '<p>Error loading instructions.</p>';
    }
}

// Load starter code into editors
async function loadStarterCode(lesson) {
    try {
        // Load HTML starter
        if (lesson.starterCode.html) {
            const htmlResponse = await fetch(lesson.starterCode.html);
            const htmlCode = await htmlResponse.text();
            htmlEditor.value = htmlCode;
        }
        
        // Load CSS starter
        if (lesson.starterCode.css) {
            const cssResponse = await fetch(lesson.starterCode.css);
            const cssCode = await cssResponse.text();
            cssEditor.value = cssCode;
        }
        
        // Load JS starter
        if (lesson.starterCode.js) {
            const jsResponse = await fetch(lesson.starterCode.js);
            const jsCode = await jsResponse.text();
            jsEditor.value = jsCode;
        }
        
        // Trigger initial preview update
        updatePreview();
        
    } catch (error) {
        console.error('Error loading starter code:', error);
    }
}

// Setup editor panels based on activePanels
function setupEditorPanels(lesson) {
    const editorTabs = document.querySelectorAll('.editor-tab');
    
    editorTabs.forEach(tab => {
        const editorType = tab.getAttribute('data-editor');
        
        // Enable/disable tabs based on activePanels
        if (lesson.activePanels.includes(editorType)) {
            tab.classList.remove('disabled');
        } else {
            tab.classList.add('disabled');
        }
    });
    
    // Activate the first available panel
    const firstActivePanel = lesson.activePanels[0];
    const firstTab = document.querySelector(`[data-editor="${firstActivePanel}"]`);
    if (firstTab) {
        firstTab.click();
    }
}

// Populate hints in the hint modal
function populateHints(lesson) {
    const hintContent = document.getElementById('hintContent');
    
    if (!lesson.hints || lesson.hints.length === 0) {
        hintContent.innerHTML = '<p>No hints available for this lesson.</p>';
        return;
    }
    
    // Build hints list with hint-item class
    let hintsHTML = '';
    lesson.hints.forEach((hint, index) => {
        hintsHTML += `
            <div class="hint-item">
                <strong>Hint ${index + 1}:</strong>
                <p>${hint}</p>
            </div>
        `;
    });
    
    hintContent.innerHTML = hintsHTML;
}

// Populate menu modal with lesson list
function populateMenuModal(unit, lessons, currentLessonId) {
    const menuModal = document.getElementById('menuModal');
    const modalHeader = menuModal.querySelector('.modal-header h3');
    const lessonList = menuModal.querySelector('.lesson-list');
    
    // Update modal title
    modalHeader.textContent = unit.title;
    
    // Build lesson list
    let lessonsHTML = '';
    lessons.forEach(lesson => {
        const isActive = lesson.id === currentLessonId;
        const isComplete = checkLessonComplete(moduleId, unitId, lesson.id);
        const statusIcon = isComplete ? '✓' : '○';
        const activeClass = isActive ? 'active' : '';
        
        lessonsHTML += `
            <a href="?module=${moduleId}&unit=${unitId}&lesson=${lesson.id}" class="lesson-item ${activeClass}">
                <span class="lesson-status">${statusIcon}</span>
                <span class="lesson-name">${lesson.title}</span>
            </a>
        `;
    });
    
    lessonList.innerHTML = lessonsHTML;
}

// Mark lesson as complete
function markLessonComplete() {
    // Get existing progress from localStorage
    const progressKey = `progress_${moduleId}_${unitId}`;
    let progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    
    // Add current lesson if not already in progress
    if (!progress.includes(lessonId)) {
        progress.push(lessonId);
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        // Update UI
        updateCompletionUI();
        
        // Show confirmation
        alert('Lesson marked as complete! ✓');
    } else {
        alert('This lesson is already marked as complete.');
    }
}

// Reset unit progress
function resetUnitProgress() {
    const confirmReset = confirm(
        `Are you sure you want to reset all progress for "${currentUnit.title}"?\n\n` +
        `This will mark all lessons as incomplete and cannot be undone.`
    );
    
    if (confirmReset) {
        // Clear progress from localStorage
        const progressKey = `progress_${moduleId}_${unitId}`;
        localStorage.removeItem(progressKey);
        
        // Update UI
        populateMenuModal(currentUnit, allLessons, lessonId);
        
        // Show confirmation
        alert('Unit progress has been reset. All lessons are now marked as incomplete.');
        
        console.log(`Progress reset for ${moduleId} - Unit ${unitId}`);
    }
}

// Navigate to previous lesson
function goToPreviousLesson() {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    if (currentIndex > 0) {
        const previousLesson = allLessons[currentIndex - 1];
        window.location.href = `?module=${moduleId}&unit=${unitId}&lesson=${previousLesson.id}`;
    }
}

// Navigate to next lesson
function goToNextLesson() {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    if (currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        window.location.href = `?module=${moduleId}&unit=${unitId}&lesson=${nextLesson.id}`;
    }
}

// Update navigation button states
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevLesson');
    const nextBtn = document.getElementById('nextLesson');
    
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    // Disable Previous if on first lesson
    if (currentIndex === 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    
    // Disable Next if on last lesson
    if (currentIndex === allLessons.length - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// Update completion status in UI
function updateCompletionUI() {
    // Update menu modal status icon
    populateMenuModal(currentUnit, allLessons, lessonId);
    
    // Could also update a visual indicator on the page
    console.log('Lesson completed!');
}

// Update checkLessonComplete to actually read from localStorage
function checkLessonComplete(moduleId, unitId, lessonId) {
    const progressKey = `progress_${moduleId}_${unitId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    return progress.includes(lessonId);
}

// Load lesson on page load
loadLesson();