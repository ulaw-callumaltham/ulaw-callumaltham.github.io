// ===========================
// Confirmation Modal System
// ===========================

// Confirmation Modal System
function showConfirmation(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        const confirmModal = document.getElementById('confirmModal');
        const confirmTitle = document.getElementById('confirmTitle');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmOk = document.getElementById('confirmOk');
        const confirmCancel = document.getElementById('confirmCancel');
        const closeBtn = document.getElementById('closeConfirmModal');
        
        // Set content
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmOk.textContent = confirmText;  // ← Customizable
        confirmCancel.textContent = cancelText;  // ← Customizable
        
        // Show modal
        confirmModal.classList.add('active');
        
        // Handle confirmation
        const handleConfirm = () => {
            confirmModal.classList.remove('active');
            cleanup();
            resolve(true);
        };
        
        // Handle cancel
        const handleCancel = () => {
            confirmModal.classList.remove('active');
            cleanup();
            resolve(false);
        };
        
        // Cleanup listeners
        const cleanup = () => {
            confirmOk.removeEventListener('click', handleConfirm);
            confirmCancel.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleCancel);
            confirmModal.removeEventListener('click', handleOutsideClick);
        };
        
        // Outside click
        const handleOutsideClick = (e) => {
            if (e.target === confirmModal) {
                handleCancel();
            }
        };
        
        // Add listeners
        confirmOk.addEventListener('click', handleConfirm);
        confirmCancel.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
        confirmModal.addEventListener('click', handleOutsideClick);
    });
}

// // ===========================
// // Live Preview Auto-Refresh
// // ===========================

// function updatePreview() {
//     const previewFrame = document.getElementById('preview');
//     const htmlEditor = document.getElementById('htmlEditor');
//     const cssEditor = document.getElementById('cssEditor');
//     const jsEditor = document.getElementById('jsEditor');
    
//     const htmlCode = htmlEditor.value;
//     const cssCode = cssEditor.value;
//     const jsCode = jsEditor.value;
    
//     const previewContent = 
//         '<!DOCTYPE html>' +
//         '<html>' +
//         '<head>' +
//         '<style>' + cssCode + '</style>' +
//         '</head>' +
//         '<body>' +
//         htmlCode +
//         '<script>' + jsCode + '<' + '/script>' +
//         '</body>' +
//         '</html>';
    
//     const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
//     previewDoc.open();
//     previewDoc.write(previewContent);
//     previewDoc.close();
// }

// ===========================
// Live Preview Auto-Refresh
// ===========================

function updatePreview() {
    const previewFrame = document.getElementById('preview');
    const htmlEditor = document.getElementById('htmlEditor');
    const cssEditor = document.getElementById('cssEditor');
    const jsEditor = document.getElementById('jsEditor');
    
    let htmlCode = htmlEditor.value;
    const cssCode = cssEditor.value;
    const jsCode = jsEditor.value;
    
    // Replace <link rel="stylesheet"> with inline <style>
    htmlCode = htmlCode.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["'][^"']+["']\s*\/?>/gi,
        '<style>' + cssCode + '</style>'
    );
    
    // Replace <script src="..."></script> with inline <script>
    htmlCode = htmlCode.replace(
        /<script\s+src=["'][^"']+["']\s*><\/script>/gi,
        '<script>' + jsCode + '</script>'
    );
    
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    previewDoc.open();
    previewDoc.write(htmlCode);
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
    const debouncedUpdate = debounce(() => {
        updatePreview();
        // Also update popout if open
        if (typeof popoutWindow !== 'undefined' && popoutWindow && !popoutWindow.closed) {
            if (typeof updatePopoutPreview === 'function') {
                updatePopoutPreview();
            }
        }
        // Also update fullscreen if open
        if (typeof updateFullscreenPreview === 'function') {
            updateFullscreenPreview();
        }
    }, 500);
    
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
const moduleId = urlParams.get('module') || 'Module Not Identified';
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
        updateLessonTitle(module, currentUnit, currentLesson);
        updatePageTitle(currentLesson);  // ← ADD THIS LINE
        await loadInstructionContent(currentLesson);

        // Check if WIP exists before loading starter code
        const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
        const hasWip = localStorage.getItem(wipKey);
        
        if (!hasWip) {
            // Only load starter code if no saved work exists
            await loadStarterCode(currentLesson);
        }

        setupEditorPanels(currentLesson);
        // populateHints(currentLesson);  // ← ADD THIS LINE
        // populateMenuModal(currentUnit, allLessons, lessonId);
        updateNavigationButtons();  // ← ADD THIS LINE
        updateCompleteButtonState();  // ← ADD THIS LINE
        updateCompletionNotice();  // ← ADD THIS LINE
        updateProgressIndicator();  // ← ADD THIS LINE

        // populate sidebar
        populateSidebarLessons();
        populateSidebarHints();

        // Restore work in progress if available
        restoreWorkInProgress();

        // Start auto-saving work in progress
        startAutoSave();
    } catch (error) {
        console.error('Error loading lesson:', error);
        showToast('Error loading lesson. Please try again.', 'error');
    }
}

// Update the lesson title in nav bar
function updateLessonTitle(module, unit, lesson) {
    lessonUnitTitle.innerHTML = `
        <span class="unit-name">${unit.title}</span>
        <span class="title-separator">→</span>
        <span class="lesson-name">${lesson.title}</span>
    `;
}

async function loadInstructionContent(lesson) {
    try {
        const response = await fetch(lesson.instructionFile);
        const html = await response.text();
        
        // Query element when needed
        const instructionPanel = document.querySelector('.instruction-content');
        
        // Update instruction content
        instructionPanel.querySelector('.instruction-text').innerHTML = html;
        
        // Apply syntax highlighting
        Prism.highlightAllUnder(instructionPanel);
        
    } catch (error) {
        console.error('Error loading instruction content:', error);
        const instructionPanel = document.querySelector('.instruction-content');
        if (instructionPanel) {
            instructionPanel.querySelector('.instruction-text').innerHTML = 
                '<p>Error loading instructions.</p>';
        }
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

// // Populate hints in the hint modal
// function populateHints(lesson) {
//     const hintContent = document.getElementById('hintContent');
    
//     if (!lesson.hints || lesson.hints.length === 0) {
//         hintContent.innerHTML = '<p>No hints available for this lesson.</p>';
//         return;
//     }
    
//     // Build hints list with hint-item class
//     let hintsHTML = '';
//     lesson.hints.forEach((hint, index) => {
//         hintsHTML += `
//             <div class="hint-item">
//                 <strong>Hint ${index + 1}:</strong>
//                 <p>${hint}</p>
//             </div>
//         `;
//     });
    
//     hintContent.innerHTML = hintsHTML;
// }

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

function markLessonComplete() {
    const progressKey = `progress_${moduleId}_${unitId}`;
    let progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    
    const isComplete = progress.includes(lessonId);
    
    if (isComplete) {
        // Lesson is complete → Reset it
        resetLessonProgress();
    } else {
        // Lesson is incomplete → Mark it complete
        progress.push(lessonId);
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        // Update UI
        // updateCompletionUI();
        updateCompleteButtonState();
        updateCompletionNotice();
        updateProgressIndicator();
        populateSidebarLessons();  // ← Update sidebar status
        
        // Check if there's a next lesson
        const currentIndex = allLessons.findIndex(l => l.id === lessonId);
        const hasNextLesson = currentIndex < allLessons.length - 1;
        
        if (hasNextLesson) {
            // Show next lesson prompt
            showNextLessonPrompt();
        } else {
            // Last lesson in unit
            showToast('Lesson complete! You\'ve finished this unit! 🎉', 'success');
        }
    }
}

// Reset unit progress
async function resetUnitProgress() {
    const confirmReset = await showConfirmation(
        'Reset Unit Progress?',
        `Are you sure you want to reset all progress for "${currentUnit.title}"? This will mark all lessons as incomplete and cannot be undone.`
    );
    
    if (confirmReset) {
        // Clear progress from localStorage
        const progressKey = `progress_${moduleId}_${unitId}`;
        localStorage.removeItem(progressKey);
        
        // Clear WIP for all lessons in this unit
        allLessons.forEach(lesson => {
            const wipKey = `wip_${moduleId}_${unitId}_${lesson.id}`;
            localStorage.removeItem(wipKey);
        });
        
        // Update UI
        // populateMenuModal(currentUnit, allLessons, lessonId);
        updateCompleteButtonState();
        updateCompletionNotice();
        populateSidebarLessons();  // ← Update sidebar status
        updateSaveIndicator('saved');
        
        // Show confirmation
        showToast('Unit progress has been reset. All lessons are now marked as incomplete.', 'info');
        
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

// Update Mark Complete button state
function updateCompleteButtonState() {
    const completeBtn = document.getElementById('completeBtn');
    const isComplete = checkLessonComplete(moduleId, unitId, lessonId);
    
    if (isComplete) {
        completeBtn.disabled = false;  // ← Enable it
        completeBtn.textContent = 'Reset Progress';
        completeBtn.classList.add('completed');
        completeBtn.classList.remove('btn-success');
        completeBtn.classList.add('btn-secondary');  // Different style
    } else {
        completeBtn.disabled = false;
        completeBtn.textContent = 'Mark Complete (Ctrl+Enter)';
        completeBtn.classList.remove('completed');
        completeBtn.classList.remove('btn-secondary');
        completeBtn.classList.add('btn-success');
    }
}

// Update lesson progress indicator in footer
function updateProgressIndicator() {
    const progressIndicator = document.getElementById('lessonProgress');
    
    // Get current lesson number (position in array)
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    const lessonNumber = currentIndex + 1;
    const totalLessons = allLessons.length;
    
    // Get unit completion progress
    const progressKey = `progress_${moduleId}_${unitId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    const completedCount = progress.length;
    const completionPercent = Math.round((completedCount / totalLessons) * 100);
    
    // Build progress text
    progressIndicator.innerHTML = `
        <span class="progress-lesson">Lesson ${lessonNumber}/${totalLessons}</span>
        <span class="progress-separator">•</span>
        <span class="progress-unit">Unit Progress: ${completionPercent}%</span>
    `;
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

// ===========================
// Auto-Save Work in Progress
// ===========================

let autoSaveInterval;
let hasUnsavedChanges = false;

// Start auto-save (every 30 seconds)
function startAutoSave() {
    // Set up change detection
    const editors = [
        document.getElementById('htmlEditor'),
        document.getElementById('cssEditor'),
        document.getElementById('jsEditor')
    ];
    
    editors.forEach(editor => {
        editor.addEventListener('input', () => {
            hasUnsavedChanges = true;
            updateSaveIndicator('unsaved');
        });
    });
    
    // Auto-save interval
    autoSaveInterval = setInterval(() => {
        if (hasUnsavedChanges) {
            saveWorkInProgress();
        }
    }, 10000); // 10 seconds
}

// Save current editor content to localStorage
function saveWorkInProgress() {
    updateSaveIndicator('saving');
    
    const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
    
    const wip = {
        html: document.getElementById('htmlEditor').value,
        css: document.getElementById('cssEditor').value,
        js: document.getElementById('jsEditor').value,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(wipKey, JSON.stringify(wip));
    hasUnsavedChanges = false;
    
    console.log('Work in progress auto-saved');
    
    // Show saved state briefly
    setTimeout(() => {
        updateSaveIndicator('saved');
    }, 500);
}

// Update save indicator UI
function updateSaveIndicator(state) {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;
    
    const statusText = indicator.querySelector('.save-text');
    
    // Remove all state classes
    indicator.classList.remove('saved', 'saving', 'unsaved');
    
    // Add current state
    indicator.classList.add(state);
    
    // Update text
    if (state === 'saved') {
        statusText.textContent = 'Saved';
    } else if (state === 'saving') {
        statusText.textContent = 'Saving...';
    } else if (state === 'unsaved') {
        statusText.textContent = 'Unsaved changes';
    }
}

// Restore work in progress from localStorage
function restoreWorkInProgress() {
    const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
    const savedWip = localStorage.getItem(wipKey);
    
    if (savedWip) {
        try {
            const wip = JSON.parse(savedWip);
            
            // Restore without asking
            document.getElementById('htmlEditor').value = wip.html;
            document.getElementById('cssEditor').value = wip.css;
            document.getElementById('jsEditor').value = wip.js;
            
            // Update preview
            if (typeof updatePreview === 'function') {
                updatePreview();
            }
            
            updateSaveIndicator('saved');
            console.log('Work in progress restored');
            
        } catch (error) {
            console.error('Error restoring work in progress:', error);
            updateSaveIndicator('saved');
        }
    } else {
        updateSaveIndicator('saved');
    }
}

// Clear work in progress from localStorage
function clearWorkInProgress() {
    const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
    localStorage.removeItem(wipKey);
    hasUnsavedChanges = false;
    updateSaveIndicator('saved');
    console.log('Work in progress cleared');
}

// Update completion notice banner
function updateCompletionNotice() {
    const notice = document.getElementById('completionNotice');
    const isComplete = checkLessonComplete(moduleId, unitId, lessonId);
    
    if (isComplete) {
        notice.classList.remove('hidden');
    } else {
        notice.classList.add('hidden');
    }
}


// Reset current lesson progress
async function resetLessonProgress() {
    const confirmReset = await showConfirmation(
        'Reset Lesson Progress?',
        `Are you sure you want to reset your progress for this lesson? This will clear your saved work and mark it as incomplete.`
    );
    
    if (confirmReset) {
        // Remove from progress
        const progressKey = `progress_${moduleId}_${unitId}`;
        let progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
        progress = progress.filter(id => id !== lessonId);
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        // Clear WIP
        const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
        localStorage.removeItem(wipKey);
        
        // Reload starter code
        await loadStarterCode(currentLesson);
        
        // Update preview
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
        
        // Update UI
        // updateCompletionUI();
        updateCompleteButtonState();
        updateCompletionNotice();
        populateSidebarLessons();  // ← Update sidebar status
        updateProgressIndicator();  // ← ADD THIS
        updateSaveIndicator('saved');

        
        // Show confirmation
        showToast('Lesson progress has been reset.', 'success');
    }
}

// ===========================
// Save Code Download
// ===========================

function saveCode() {
    const htmlCode = document.getElementById('htmlEditor').value;
    const cssCode = document.getElementById('cssEditor').value;
    const jsCode = document.getElementById('jsEditor').value;
    
    // Create filename based on module, unit, lesson
    const filename = `${moduleId}-Unit${unitId}-Lesson${lessonId}`;
    
    // Create a zip file with all three files
    const zip = new JSZip();
    
    // Save files with proper names
    zip.file('index.html', htmlCode);  // HTML already has <link> and <script> tags
    zip.file('styles.css', cssCode);
    zip.file('script.js', jsCode);
    
    // Generate zip and trigger download
    zip.generateAsync({type: 'blob'}).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Code downloaded successfully!', 'success');
    });
}

// Update browser page title
function updatePageTitle(lesson) {
    document.title = `${lesson.title} | CS WTP`;
}

// ===========================
// Pop-Out Preview
// ===========================

let popoutWindow = null;

function openPopoutPreview() {
    // Open new window
    popoutWindow = window.open('', 'PreviewWindow');
    
    if (!popoutWindow) {
        showToast('Pop-up blocked! Please allow pop-ups for this site.', 'error');
        return;
    }
    
    // Write initial content
    updatePopoutPreview();
    
    // Hide main preview frame
    document.getElementById('preview').style.display = 'none';

    // Create and insert message
    const previewPane = document.querySelector('.preview-pane');
    const messageDiv = document.createElement('div');
    messageDiv.id = 'popoutMessage';
    messageDiv.className = 'popout-message';
    messageDiv.innerHTML = `
        <p>Preview opened in new tab</p>
        <p>Click <strong>↙ Close</strong> to return it here</p>
    `;
    previewPane.appendChild(messageDiv);
    
    // Update button state
    const popoutBtn = document.getElementById('popoutBtn');
    const popoutIcon = popoutBtn.querySelector('.popout-icon');
    const popoutText = popoutBtn.querySelector('.popout-text');
    
    popoutBtn.classList.add('active');
    popoutIcon.textContent = '↙';
    popoutText.textContent = 'Close';
    
    // Listen for window close
    const checkClosed = setInterval(() => {
        if (popoutWindow.closed) {
            closePopoutPreview();
            clearInterval(checkClosed);
        }
    }, 500);
}

function closePopoutPreview() {
    if (popoutWindow && !popoutWindow.closed) {
        popoutWindow.close();
    }
    
    popoutWindow = null;

    // Remove message
    const messageDiv = document.getElementById('popoutMessage');
    if (messageDiv) {
        messageDiv.remove();
    }
    
    // Show main preview frame
    document.getElementById('preview').style.display = 'block';
    
    // Update button state
    const popoutBtn = document.getElementById('popoutBtn');
    const popoutIcon = popoutBtn.querySelector('.popout-icon');
    const popoutText = popoutBtn.querySelector('.popout-text');
    
    popoutBtn.classList.remove('active');
    popoutIcon.textContent = '↗';
    popoutText.textContent = 'Pop Out';
    
    // Refresh main preview
    updatePreview();
}

function updatePopoutPreview() {
    if (!popoutWindow || popoutWindow.closed) return;
    
    const htmlEditor = document.getElementById('htmlEditor');
    const cssEditor = document.getElementById('cssEditor');
    const jsEditor = document.getElementById('jsEditor');
    
    let htmlCode = htmlEditor.value;
    const cssCode = cssEditor.value;
    const jsCode = jsEditor.value;
    
    // Replace <link> and <script> tags
    htmlCode = htmlCode.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["'][^"']+["']\s*\/?>/gi,
        '<style>' + cssCode + '</style>'
    );
    
    htmlCode = htmlCode.replace(
        /<script\s+src=["'][^"']+["']\s*><\/script>/gi,
        '<script>' + jsCode + '</script>'
    );
    
    // Write to popout window
    popoutWindow.document.open();
    popoutWindow.document.write(htmlCode);
    popoutWindow.document.close();
}

// ===========================
// Fullscreen Preview
// ===========================

function openFullscreenPreview() {
    const overlay = document.getElementById('fullscreenOverlay');
    const fullscreenPreview = document.getElementById('fullscreenPreview');
    
    // Show overlay
    overlay.classList.add('active');
    
    // Update fullscreen preview with current content
    updateFullscreenPreview();
}

function closeFullscreenPreview() {
    const overlay = document.getElementById('fullscreenOverlay');
    overlay.classList.remove('active');
}

function updateFullscreenPreview() {
    const fullscreenPreview = document.getElementById('fullscreenPreview');
    const overlay = document.getElementById('fullscreenOverlay');
    
    // Only update if fullscreen is active
    if (!overlay.classList.contains('active')) return;
    
    const htmlEditor = document.getElementById('htmlEditor');
    const cssEditor = document.getElementById('cssEditor');
    const jsEditor = document.getElementById('jsEditor');
    
    let htmlCode = htmlEditor.value;
    const cssCode = cssEditor.value;
    const jsCode = jsEditor.value;
    
    // Replace <link> and <script> tags
    htmlCode = htmlCode.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["'][^"']+["']\s*\/?>/gi,
        '<style>' + cssCode + '</style>'
    );
    
    htmlCode = htmlCode.replace(
        /<script\s+src=["'][^"']+["']\s*><\/script>/gi,
        '<script>' + jsCode + '</script>'
    );
    
    // Write to fullscreen iframe
    const fullscreenDoc = fullscreenPreview.contentDocument || fullscreenPreview.contentWindow.document;
    fullscreenDoc.open();
    fullscreenDoc.write(htmlCode);
    fullscreenDoc.close();
}

// Show next lesson prompt after completion
function showNextLessonPrompt() {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    const nextLesson = allLessons[currentIndex + 1];
    
    // Populate modal
    const modal = document.getElementById('nextLessonModal');
    const nextLessonTitle = document.getElementById('nextLessonTitle');
    const goBtn = document.getElementById('nextLessonGo');
    const stayBtn = document.getElementById('nextLessonStay');
    const closeBtn = document.getElementById('closeNextLessonModal');
    
    nextLessonTitle.textContent = nextLesson.title;
    
    // Show modal
    modal.classList.add('active');
    
    // Handle navigation
    const handleGo = () => {
        modal.classList.remove('active');
        window.location.href = `?module=${moduleId}&unit=${unitId}&lesson=${nextLesson.id}`;
    };
    
    const handleStay = () => {
        modal.classList.remove('active');
        showToast('Lesson marked as complete!', 'success');
    };
    
    // Add event listeners (remove old ones first to prevent duplicates)
    const newGoBtn = goBtn.cloneNode(true);
    const newStayBtn = stayBtn.cloneNode(true);
    const newCloseBtn = closeBtn.cloneNode(true);
    
    goBtn.parentNode.replaceChild(newGoBtn, goBtn);
    stayBtn.parentNode.replaceChild(newStayBtn, stayBtn);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    newGoBtn.addEventListener('click', handleGo);
    newStayBtn.addEventListener('click', handleStay);
    newCloseBtn.addEventListener('click', handleStay);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            handleStay();
        }
    });
}

// ===========================
// Sidebar Population
// ===========================

// Populate lesson list in sidebar
function populateSidebarLessons() {
    const lessonListSidebar = document.getElementById('lessonListSidebar');
    const unitTitleSidebar = document.getElementById('sidebarUnitTitle');
    const unitDescriptionSidebar = document.getElementById('sidebarUnitDescription');
    
    // Set unit title
    if (currentUnit) {
        unitTitleSidebar.textContent = currentUnit.title;
        unitDescriptionSidebar.textContent = currentUnit.description;
    }
    
    // Clear existing lessons
    lessonListSidebar.innerHTML = '';
    
    // Get completion status
    const progressKey = `progress_${moduleId}_${unitId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    
    // Add each lesson
    allLessons.forEach(lesson => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `?module=${moduleId}&unit=${unitId}&lesson=${lesson.id}`;
        a.className = 'lesson-item';
        
        // Check if current lesson
        if (lesson.id === lessonId) {
            a.classList.add('active');
        }
        
        // Check if completed
        const isComplete = progress.includes(lesson.id);
        if (isComplete) {
            a.classList.add('completed');
        }
        
        // Status icon
        const status = document.createElement('span');
        status.className = 'lesson-status';
        status.textContent = isComplete ? '✓' : '○';
        
        // Lesson content (title + description)
        const content = document.createElement('div');
        content.className = 'lesson-content';
        
        const title = document.createElement('div');
        title.className = 'lesson-title';
        title.textContent = lesson.title;
        
        const desc = document.createElement('div');
        desc.className = 'lesson-description';
        desc.textContent = lesson.description || '';
        
        content.appendChild(title);
        if (lesson.description) {
            content.appendChild(desc);
        }
        
        a.appendChild(status);
        a.appendChild(content);
        li.appendChild(a);
        lessonListSidebar.appendChild(li);
    });
}

// Populate hints in sidebar
function populateSidebarHints() {
    const hintsSidebarContent = document.getElementById('hintsSidebarContent');
    
    if (!currentLesson || !currentLesson.hints || currentLesson.hints.length === 0) {
        hintsSidebarContent.innerHTML = '<p class="no-hints">No hints available for this lesson.</p>';
        return;
    }
    
    // Build hints HTML
    let hintsHTML = '';
    currentLesson.hints.forEach((hint, index) => {
        hintsHTML += `
            <div class="hint-item">
                <h4 class="hint-title">Hint ${index + 1}</h4>
                <p class="hint-text">${hint}</p>
            </div>
        `;
    });
    
    hintsSidebarContent.innerHTML = hintsHTML;
}

// Load lesson on page load
loadLesson();