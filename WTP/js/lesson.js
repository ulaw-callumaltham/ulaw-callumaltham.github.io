// ===========================
// Global Variables
// ===========================

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
let pyodide = null;  // Pyodide instance for Python execution
let pythonExecutionController = null;

// CodeMirror editor instances
let htmlEditorCM = null;
let cssEditorCM = null;
let jsEditorCM = null;
let pythonEditorCM = null;

let isResetting = false;

// Initialize CodeMirror editors
function initializeCodeMirrorEditors() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' 
        ? 'material-darker' 
        : 'default';
    
    // HTML Editor
    htmlEditorCM = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
        mode: 'htmlmixed',
        theme: theme,
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        autoCloseBrackets: true,
        autoCloseTags: true,
        matchBrackets: true
    });
    
    // CSS Editor
    cssEditorCM = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
        mode: 'css',
        theme: theme,
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        autoCloseBrackets: true,
        matchBrackets: true
    });
    
    // JavaScript Editor
    jsEditorCM = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
        mode: 'javascript',
        theme: theme,
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        autoCloseBrackets: true,
        matchBrackets: true
    });
    
    // Python Editor
    pythonEditorCM = CodeMirror.fromTextArea(document.getElementById('pythonEditor'), {
        mode: 'python',
        theme: theme,
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        autoCloseBrackets: true,
        matchBrackets: true
    });
    
    // Set initial heights
    htmlEditorCM.setSize(null, '100%');
    htmlEditorCM.refresh();
    cssEditorCM.setSize(null, '100%');
    cssEditorCM.refresh();
    jsEditorCM.setSize(null, '100%');
    jsEditorCM.refresh();
    pythonEditorCM.setSize(null, '100%');
    pythonEditorCM.refresh();
}


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
    
    let htmlCode = htmlEditorCM.getValue();  // ← Change const to let
    const cssCode = cssEditorCM.getValue();
    const jsCode = jsEditorCM.getValue();
        
    // Check if HTML has a <link> tag for stylesheet
    const hasLinkTag = /<link\s+rel=["']stylesheet["']\s+href=["'][^"']+["']\s*\/?>/gi.test(htmlCode);
    
    if (hasLinkTag) {
        // Replace <link> with inline <style>
        htmlCode = htmlCode.replace(
            /<link\s+rel=["']stylesheet["']\s+href=["'][^"']+["']\s*\/?>/gi,
            '<style>' + cssCode + '</style>'
        );
    } else {
        // No <link> tag - inject CSS into <head> if it exists, otherwise add before </body>
        if (/<head>/i.test(htmlCode)) {
            htmlCode = htmlCode.replace(
                /<\/head>/i,
                '<style>' + cssCode + '</style></head>'
            );
        } else if (/<\/body>/i.test(htmlCode)) {
            htmlCode = htmlCode.replace(
                /<\/body>/i,
                '<style>' + cssCode + '</style></body>'
            );
        } else {
            // No head or body - just prepend CSS
            htmlCode = '<style>' + cssCode + '</style>' + htmlCode;
        }
    }
    
    // Check if HTML has a <script src> tag
    const hasScriptTag = /<script\s+src=["'][^"']+["']\s*><\/script>/gi.test(htmlCode);
    
    if (hasScriptTag) {
        // Replace <script src> with inline <script>
        htmlCode = htmlCode.replace(
            /<script\s+src=["'][^"']+["']\s*><\/script>/gi,
            '<script>' + jsCode + '</script>'
        );
    } else {
        // No <script src> tag - inject JS before </body> if it exists, otherwise append
        if (/<\/body>/i.test(htmlCode)) {
            htmlCode = htmlCode.replace(
                /<\/body>/i,
                '<script>' + jsCode + '</script></body>'
            );
        } else {
            // No body tag - just append
            htmlCode = htmlCode + '<script>' + jsCode + '</script>';
        }
    }
    
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

// Set up preview update listeners AFTER CodeMirror is initialized
function setupPreviewListeners() {
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
    
    htmlEditorCM.on('change', debouncedUpdate);
    cssEditorCM.on('change', debouncedUpdate);
    jsEditorCM.on('change', debouncedUpdate);
}

// Rest of lesson.js code below...



// // ===========================
// // Lesson Platform - Load and Display Lesson
// // ===========================

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

        // Initialize CodeMirror editors (do this once)
        if (!htmlEditorCM) {                              // ← ADD THIS
            initializeCodeMirrorEditors();                // ← ADD THIS
            setupPreviewListeners();                     // ← ADD THIS
        } 

        // Detect language and setup UI
        const language = currentLesson.language || 'web';  // ← ADD THIS
        if (language === 'python') {                       // ← ADD THIS
            setupPythonLesson();                           // ← ADD THIS
        } else {                                           // ← ADD THIS
            setupWebLesson();                              // ← ADD THIS
        }                                                  // ← ADD THIS
        
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

// ===========================
// Language-Based Setup
// ===========================

function setupWebLesson() {
    // Show web editors and preview
    document.querySelector('.editor-pane').style.display = 'flex';
    document.querySelector('.preview-pane').style.display = 'flex';
    
    // Hide Python elements
    document.getElementById('pythonEditorContainer').style.display = 'none';
    document.getElementById('pythonOutputPanel').style.display = 'none';
}

function setupPythonLesson() {
    // Hide web editors and preview
    document.querySelector('.editor-pane').style.display = 'none';
    document.querySelector('.preview-pane').style.display = 'none';
    
    // Show Python elements
    document.getElementById('pythonEditorContainer').style.display = 'flex';
    document.getElementById('pythonOutputPanel').style.display = 'flex';
    
    if (!pyodide) {
        // Initialize Pyodide (async - doesn't block page load)
        initializePyodide();
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
        const language = lesson.language || 'web';
        
        if (language === 'python') {
            // Load Python starter code
            if (lesson.starterCode && lesson.starterCode.python) {
                const pythonResponse = await fetch(lesson.starterCode.python);
                const pythonCode = await pythonResponse.text();
                pythonEditorCM.setValue(pythonCode);
            } else {
                // No starter code - clear editor
                pythonEditorCM.setValue('');
            }
        } else {
            // Load or clear HTML editor
            if (lesson.starterCode && lesson.starterCode.html) {
                const htmlResponse = await fetch(lesson.starterCode.html);
                const htmlCode = await htmlResponse.text();
                htmlEditorCM.setValue(htmlCode);
            } else {
                htmlEditorCM.setValue('');
            }
            
            // Load or clear CSS editor
            if (lesson.starterCode && lesson.starterCode.css) {
                const cssResponse = await fetch(lesson.starterCode.css);
                const cssCode = await cssResponse.text();
                cssEditorCM.setValue(cssCode);
            } else {
                cssEditorCM.setValue('');
            }
            
            // Load or clear JS editor
            if (lesson.starterCode && lesson.starterCode.js) {
                const jsResponse = await fetch(lesson.starterCode.js);
                const jsCode = await jsResponse.text();
                jsEditorCM.setValue(jsCode);
            } else {
                jsEditorCM.setValue('');
            }
            
            // Trigger preview update
            updatePreview();
        }
        
    } catch (error) {
        console.error('Error loading starter code:', error);
    }
}

// Setup editor panels based on activePanels
function setupEditorPanels(lesson) {
    // Only set up panels for web lessons
    const language = lesson.language || 'web';
    
    if (language !== 'web') {
        return; // Skip for Python lessons
    }
    
    const editorTabs = document.querySelectorAll('.editor-tab');
    
    editorTabs.forEach(tab => {
        const editorType = tab.getAttribute('data-editor');
        
        // Enable/disable tabs based on activePanels
        if (lesson.activePanels && lesson.activePanels.includes(editorType)) {
            tab.classList.remove('disabled');
        } else {
            tab.classList.add('disabled');
        }
    });
    
    // Activate the first available panel
    if (lesson.activePanels && lesson.activePanels.length > 0) {
        const firstActivePanel = lesson.activePanels[0];
        const firstTab = document.querySelector(`[data-editor="${firstActivePanel}"]`);
        if (firstTab) {
            firstTab.click();
        }
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
        
        // If we're currently viewing a lesson in this unit, reload its starter code
        const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
        
        // Set flag to prevent auto-save
        isResetting = true;
        
        // Reload current lesson's starter code
        await loadStarterCode(currentLesson);
        
        const language = currentLesson.language || 'web';
        if (language === 'web' && typeof updatePreview === 'function') {
            updatePreview();
        }
        
        // Re-enable auto-save
        setTimeout(() => {
            isResetting = false;
        }, 500);
        
        // Update UI
        updateCompleteButtonState();
        updateCompletionNotice();
        populateSidebarLessons();
        updateProgressIndicator();
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

// Start auto-saving work in progress
function startAutoSave() {
    const language = currentLesson.language || 'web';
    
    if (language === 'python') {
        // Show unsaved immediately on change
        pythonEditorCM.on('change', () => {
            updateSaveIndicator('unsaved');
        });
        
        // Auto-save Python editor after delay
        pythonEditorCM.on('change', debounce(() => {
            updateSaveIndicator('saving');
            saveWorkInProgress();
        }, 10000));
        
    } else {
        // Show unsaved immediately on change
        htmlEditorCM.on('change', () => {
            updateSaveIndicator('unsaved');
        });
        cssEditorCM.on('change', () => {
            updateSaveIndicator('unsaved');
        });
        jsEditorCM.on('change', () => {
            updateSaveIndicator('unsaved');
        });
        
        // Auto-save Web editors after delay
        htmlEditorCM.on('change', debounce(() => {
            updateSaveIndicator('saving');
            saveWorkInProgress();
        }, 10000));
        
        cssEditorCM.on('change', debounce(() => {
            updateSaveIndicator('saving');
            saveWorkInProgress();
        }, 10000));
        
        jsEditorCM.on('change', debounce(() => {
            updateSaveIndicator('saving');
            saveWorkInProgress();
        }, 10000));
    }
}

// Save work in progress to localStorage
function saveWorkInProgress() {

    if (isResetting) {
        return; // Skip saving if we're in the middle of resetting progress
    }

    const language = currentLesson.language || 'web';
    const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
    
    if (language === 'python') {
        // Save Python code
        const pythonCode = pythonEditorCM.getValue();
        
        const workInProgress = {
            python: pythonCode,
            timestamp: Date.now()
        };
        
        localStorage.setItem(wipKey, JSON.stringify(workInProgress));
        
    } else {
        // Save Web code
        const htmlCode = htmlEditorCM.getValue();
        const cssCode = cssEditorCM.getValue();
        const jsCode = jsEditorCM.getValue();
        
        const workInProgress = {
            html: htmlCode,
            css: cssCode,
            js: jsCode,
            timestamp: Date.now()
        };
        
        localStorage.setItem(wipKey, JSON.stringify(workInProgress));
    }
    
    updateSaveIndicator('saved');
}

// Update save indicator
function updateSaveIndicator(status) {
    const language = currentLesson?.language || 'web';
    const indicatorId = language === 'python' ? 'pythonSaveIndicator' : 'saveIndicator';
    const saveIndicator = document.getElementById(indicatorId);
    
    if (!saveIndicator) return;
    
    const saveStatus = saveIndicator.querySelector('.save-status');
    const saveText = saveIndicator.querySelector('.save-text');
    
    if (status === 'saving') {
        saveStatus.style.color = '#fbbf24';  // Yellow
        saveText.textContent = 'Saving...';
    } else if (status === 'saved') {
        saveStatus.style.color = '#10b981';  // Green
        saveText.textContent = 'Saved';
    } else if (status === 'unsaved') {      // ← ADD THIS
        saveStatus.style.color = '#ef4444';  // Red
        saveText.textContent = 'Unsaved changes';
    }
}

// Restore work in progress from localStorage
function restoreWorkInProgress() {
    const language = currentLesson.language || 'web';
    const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
    const savedWork = localStorage.getItem(wipKey);
    
    if (savedWork) {
        const workInProgress = JSON.parse(savedWork);
        
        if (language === 'python') {
            // Restore Python code
            if (workInProgress.python !== undefined) {
                pythonEditorCM.setValue(workInProgress.python);
                updateSaveIndicator('saved');
            }
            
        } else {
            // Restore Web code
            if (workInProgress.html !== undefined) {
                htmlEditorCM.setValue(workInProgress.html);
            }
            if (workInProgress.css !== undefined) {
                cssEditorCM.setValue(workInProgress.css);
            }
            if (workInProgress.js !== undefined) {
                jsEditorCM.setValue(workInProgress.js);
            }
            
            updateSaveIndicator('saved');
            updatePreview();
        }
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


// // Reset current lesson progress
// async function resetLessonProgress() {
//     const confirmReset = await showConfirmation(
//         'Reset Lesson Progress?',
//         `Are you sure you want to reset your progress for this lesson? This will clear your saved work and mark it as incomplete.`
//     );
    
//     if (confirmReset) {
//         // Remove from progress
//         const progressKey = `progress_${moduleId}_${unitId}`;
//         let progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
//         progress = progress.filter(id => id !== lessonId);
//         localStorage.setItem(progressKey, JSON.stringify(progress));
        
//         // Clear WIP
//         const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
//         localStorage.removeItem(wipKey);
        
//         // Reload starter code
//         await loadStarterCode(currentLesson);
        
//         // Update preview
//         if (typeof updatePreview === 'function') {
//             updatePreview();
//         }
        
//         // Update UI
//         // updateCompletionUI();
//         updateCompleteButtonState();
//         updateCompletionNotice();
//         populateSidebarLessons();  // ← Update sidebar status
//         updateProgressIndicator();  // ← ADD THIS
//         updateSaveIndicator('saved');

        
//         // Show confirmation
//         showToast('Lesson progress has been reset.', 'success');
//     }
// }

// Reset current lesson progress
async function resetLessonProgress() {
    const confirmReset = await showConfirmation(
        'Reset Lesson Progress?',
        `Are you sure you want to reset your progress for this lesson? This will clear your saved work and mark it as incomplete.`
    );
    
    if (confirmReset) {
        const language = currentLesson.language || 'web';

        isResetting = true;
        
        // Remove from progress
        const progressKey = `progress_${moduleId}_${unitId}`;
        let progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
        progress = progress.filter(id => id !== lessonId);
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        // Clear WIP from localStorage FIRST
        const wipKey = `wip_${moduleId}_${unitId}_${lessonId}`;
        localStorage.removeItem(wipKey);
        
        // THEN reload starter code based on language
        if (language === 'python') {
            // Load Python starter code
            await loadStarterCode(currentLesson);
        } else {
            // Load web starter code
            await loadStarterCode(currentLesson);
            
            // Update preview for web lessons
            if (typeof updatePreview === 'function') {
                updatePreview();
            }
        }

        // Re-enable auto-save after a short delay
        setTimeout(() => {
            isResetting = false;
        }, 500);
        
        // Update UI
        updateCompleteButtonState();
        updateCompletionNotice();
        populateSidebarLessons();
        updateProgressIndicator();
        updateSaveIndicator('saved');
        
        // Show confirmation
        showToast('Lesson progress has been reset.', 'success');
    }
}

// ===========================
// Save Code Download
// ===========================

// function saveCode() {
//     const htmlCode = document.getElementById('htmlEditor').value;
//     const cssCode = document.getElementById('cssEditor').value;
//     const jsCode = document.getElementById('jsEditor').value;
    
//     // Create filename based on module, unit, lesson
//     const filename = `${moduleId}-Unit${unitId}-Lesson${lessonId}`;
    
//     // Create a zip file with all three files
//     const zip = new JSZip();
    
//     // Save files with proper names
//     zip.file('index.html', htmlCode);  // HTML already has <link> and <script> tags
//     zip.file('styles.css', cssCode);
//     zip.file('script.js', jsCode);
    
//     // Generate zip and trigger download
//     zip.generateAsync({type: 'blob'}).then(function(content) {
//         const url = URL.createObjectURL(content);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `${filename}.zip`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
        
//         showToast('Code downloaded successfully!', 'success');
//     });
// }

function saveCode() {
    const language = currentLesson.language || 'web';
    const filename = `${moduleId}-Unit${unitId}-Lesson${lessonId}`;
    
    if (language === 'python') {
        // Python lesson - download single .py file (no zip needed)
        const pythonCode = pythonEditorCM.getValue();
        const blob = new Blob([pythonCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.py`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Python code downloaded successfully!', 'success');
        
    } else {
        // Web lesson - download HTML/CSS/JS as zip (multiple files)
        const htmlCode = htmlEditorCM.getValue();
        const cssCode = cssEditorCM.getValue();
        const jsCode = jsEditorCM.getValue();
        
        const zip = new JSZip();
        zip.file('index.html', htmlCode);
        zip.file('styles.css', cssCode);
        zip.file('script.js', jsCode);
        
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
    
    let htmlCode = htmlEditorCM.getValue();
    const cssCode = cssEditorCM.getValue();
    const jsCode = jsEditorCM.getValue();
    
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

        // Update back to units link
        const backToUnitsBtn = document.getElementById('backToUnitsBtn');
        if (backToUnitsBtn) {
            backToUnitsBtn.href = `units.html?module=${moduleId}`;
        }
        
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

// // Initialize Pyodide for Python lessons
// async function initializePyodide() {
//     if (pyodide) {
//         // Already initialized in this page load
//         return pyodide;
//     }
    
//     // Check if already initialized in this session
//     const pyodideReady = sessionStorage.getItem('pyodideReady');    
    
//     try {
//         if (!pyodideReady) {
//             // First time loading in this session
//             showToast('Loading Python environment...', 'info');
//         }
        
//         // Load Pyodide from CDN
//         pyodide = await loadPyodide();
        
//         // Mark as ready in session
//         sessionStorage.setItem('pyodideReady', 'true');
        
//         if (!pyodideReady) {
//             // Only show success toast on first load
//             showToast('Python environment ready!', 'success');
//         }
        
//         return pyodide;
        
//     } catch (error) {
//         console.error('Failed to initialize Pyodide:', error);
//         showToast('Failed to load Python environment. Please refresh the page.', 'error');
//         return null;
//     }
// }

// Initialize Pyodide for Python lessons
async function initializePyodide() {
    if (pyodide) {
        // Already initialized
        return pyodide;
    }
    
    try {
        showToast('Loading Python environment...', 'info');
        
        // Load Pyodide from CDN
        pyodide = await loadPyodide();
        
        showToast('Python environment ready!', 'success');
        return pyodide;
        
    } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
        showToast('Failed to load Python environment. Please refresh the page.', 'error');
        return null;
    }
}

// // Execute Python code
// async function executePythonCode() {
//     // Ensure Pyodide is loaded
//     if (!pyodide) {
//         showToast('Python environment not ready. Please wait...', 'warning');
//         await initializePyodide();
//         if (!pyodide) {
//             showToast('Failed to load Python. Please refresh.', 'error');
//             return;
//         }
//     }
    
//     const pythonEditor = document.getElementById('pythonEditor');
//     const outputConsole = document.getElementById('outputConsole');
//     const consoleInput = document.getElementById('consoleInput');
//     const code = pythonEditor.value;
    
//     // Clear previous output
//     outputConsole.innerHTML = '';
    
//     if (!code.trim()) {
//         outputConsole.innerHTML = '<div class="output-placeholder">No code to run</div>';
//         return;
//     }
    
//     // Disable Run button during execution
//     const runBtn = document.getElementById('runPythonBtn');
//     runBtn.disabled = true;
//     runBtn.textContent = '⏳ Running...';
    
//     try {
//         // Capture stdout
//         let output = '';
        
//         pyodide.setStdout({
//             batched: (text) => {
//                 output += text + '\n';
//                 // Display output in real-time
//                 const outputLine = document.createElement('div');
//                 outputLine.className = 'output-line';
//                 outputLine.textContent = text;
//                 outputConsole.appendChild(outputLine);
//                 // Auto-scroll to bottom
//                 outputConsole.scrollTop = outputConsole.scrollHeight;
//             }
//         });
        
//         // Override Python's input() function
//         pyodide.globals.set('js_input', async (prompt) => {
//             return await getConsoleInput(prompt || '');
//         });
        
//         await pyodide.runPythonAsync(`
// import builtins
// import asyncio

// async def custom_input(prompt=''):
//     # Display prompt in console
//     if prompt:
//         print(prompt, end='')
//     # Get input from JavaScript
//     result = await js_input(prompt)
//     return result

// # Override built-in input
// builtins.input = custom_input
//         `);
        
//         // Run the user's code
//         await pyodide.runPythonAsync(code);
        
//         // If no output was produced
//         if (!output.trim() && outputConsole.children.length === 0) {
//             outputConsole.innerHTML = '<div class="output-placeholder">Code executed successfully (no output)</div>';
//         }
        
//     } catch (error) {
//         // Display formatted error
//         displayPythonError(error);
//     } finally {
//         // Re-enable Run button
//         runBtn.disabled = false;
//         runBtn.innerHTML = '<span>▶</span><span>Run Code</span>';
        
//         // Disable and clear input field
//         consoleInput.disabled = true;
//         consoleInput.value = '';
//     }
// }

// Execute Python code
async function executePythonCode() {
    // Ensure Pyodide is loaded
    if (!pyodide) {
        showToast('Python environment not ready. Please wait...', 'warning');
        await initializePyodide();
        if (!pyodide) {
            showToast('Failed to load Python. Please refresh.', 'error');
            return;
        }
    }
    
    // const pythonEditor = document.getElementById('pythonEditor');
    const outputConsole = document.getElementById('outputConsole');
    const consoleInput = document.getElementById('consoleInput');
    const code = pythonEditorCM.getValue();
    
    // Clear previous output
    outputConsole.innerHTML = '';
    
    if (!code.trim()) {
        outputConsole.innerHTML = '<div class="output-placeholder">No code to run</div>';
        return;
    }
    
    // Create abort controller
    pythonExecutionController = new AbortController();
    
    // Show Stop button, hide Run button
    const runBtn = document.getElementById('runPythonBtn');
    const stopBtn = document.getElementById('stopPythonBtn');
    runBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    
    try {
        // Capture stdout
        let output = '';
        
        pyodide.setStdout({
            batched: (text) => {
                // Check if execution was stopped
                if (pythonExecutionController.signal.aborted) {
                    return;
                }
                
                // Display each line immediately
                text.split('\n').forEach(line => {
                    if (line) {
                        const outputLine = document.createElement('div');
                        outputLine.className = 'output-line';
                        outputLine.textContent = line;
                        outputConsole.appendChild(outputLine);
                    }
                });
                outputConsole.scrollTop = outputConsole.scrollHeight;
            }
        });
        
        // Create input handler
        pyodide.globals.set('_js_input_handler', getConsoleInput);
        
        // Override input as async
        await pyodide.runPythonAsync(`
import builtins
import sys

async def custom_input(prompt=''):
    result = await _js_input_handler(prompt)
    return result

builtins.input = custom_input
`);
        
        // Transform user code - CORRECT ORDER:

        // Step 1: Make all function definitions async
        let transformedCode = code.split('\n').map(line => {
            if (line.match(/^\s*def\s+\w+\s*\(/) && !line.includes('async')) {
                return line.replace(/^(\s*)def\s+/, '$1async def ');
            }
            return line;
        }).join('\n');

        // Step 2: Find all user-defined function names (BEFORE adding awaits)
        const builtins = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'type', 'isinstance', 'open', 'sum', 'min', 'max', 'abs', 'round', 'sorted', 'enumerate', 'zip', 'bool', 'chr', 'ord', 'bin', 'hex', 'oct', 'format', 'repr', 'ascii', 'hash', 'id', 'dir', 'help', 'vars', 'eval', 'exec', 'compile', 'any', 'all', 'next', 'iter', 'reversed', 'filter', 'map'];
        const userFunctions = [...transformedCode.matchAll(/async def\s+(\w+)\s*\(/g)].map(match => match[1]);

        // Step 3: Replace input() with await input() (but NOT in lambdas)
        transformedCode = transformedCode.split('\n').map(line => {
            // Skip lambda lines
            if (line.includes('lambda')) {
                return line;
            }
            return line.replace(/(\b)input\s*\(/g, '$1await input(');
        }).join('\n');

        // Check for unsupported patterns before transformation
        if (code.includes('lambda') && code.includes('input(')) {
            throw new Error('Unfortunately due to tech limitations, input() cannot be used inside lambda functions in this Python environment. Please use a regular function with def instead.');
        }

        // Step 4: Await all user function calls (but NOT in function definitions)
        userFunctions.forEach(funcName => {
            if (builtins.includes(funcName)) return;
            
            transformedCode = transformedCode.split('\n').map(line => {
                // Skip function definition lines
                if (line.includes('async def ')) {
                    return line;
                }
                
                // Match standalone calls: function_name(
                let result = line.replace(new RegExp(`(?<!await )(?<!\\.)\\b(${funcName})\\s*\\(`, 'g'), 'await $1(');
                
                // Match method calls: something.function_name(
                result = result.replace(new RegExp(`(?<!await )(\\w+\\.)(${funcName})\\s*\\(`, 'g'), 'await $1$2(');
                
                return result;
            }).join('\n');
        });

        // 3. Indent all lines by 4 spaces for wrapping
        const indentedCode = transformedCode.split('\n').map(line => {
            if (line.trim()) {
                return '    ' + line;
            }
            return line;
        }).join('\n');

        console.log('=== TRANSFORMED CODE ===');
        console.log(transformedCode);
        console.log('=== END ===');

        // Wrap in async function
        const wrappedCode = `
async def __user_main__():
${indentedCode}

await __user_main__()
`;

        // Run transformed code with interrupt check
        const executionPromise = pyodide.runPythonAsync(wrappedCode);
        
        // Wait for either completion or abort
        await Promise.race([
            executionPromise,
            new Promise((_, reject) => {
                pythonExecutionController.signal.addEventListener('abort', () => {
                    reject(new Error('Execution stopped by user'));
                });
            })
        ]);
        
        // If no output was produced
        if (outputConsole.children.length === 0) {
            outputConsole.innerHTML = '<div class="output-placeholder">Code executed successfully (no output)</div>';
        }
        
    } catch (error) {
        if (error.message === 'Execution stopped by user') {
            // Show stopped message
            const stoppedLine = document.createElement('div');
            stoppedLine.className = 'output-line';
            stoppedLine.style.color = '#fbbf24';
            stoppedLine.textContent = '⏹ Execution stopped';
            outputConsole.appendChild(stoppedLine);
        } else {
            // Display formatted error
            displayPythonError(error);
        }
    } finally {
        // Reset buttons
        runBtn.style.display = 'flex';
        stopBtn.style.display = 'none';
        
        // Disable and clear input field
        consoleInput.disabled = true;
        consoleInput.value = '';
        
        // Clear controller
        pythonExecutionController = null;
    }
}

// Get input from console
function getConsoleInput(prompt) {
    return new Promise((resolve) => {
        const consoleInput = document.getElementById('consoleInput');
        const outputConsole = document.getElementById('outputConsole');
        
        // Display the prompt in the console FIRST
        if (prompt) {
            const promptLine = document.createElement('div');
            promptLine.className = 'output-line';
            promptLine.textContent = prompt;
            outputConsole.appendChild(promptLine);
            outputConsole.scrollTop = outputConsole.scrollHeight;
        }
        
        // THEN enable input field
        consoleInput.disabled = false;
        consoleInput.value = '';
        consoleInput.placeholder = 'Type here and press Enter...';
        consoleInput.focus();
        
        // Create a live echo line for user's typing
        const echoLine = document.createElement('div');
        echoLine.className = 'output-line';
        echoLine.style.color = '#60a5fa';
        echoLine.textContent = '';
        outputConsole.appendChild(echoLine);
        
        // Echo input as user types
        const handleInputChange = () => {
            echoLine.textContent = consoleInput.value;
            outputConsole.scrollTop = outputConsole.scrollHeight;
        };
        
        consoleInput.addEventListener('input', handleInputChange);
        
        // Handle Enter key
        const handleInput = (e) => {
            if (e.key === 'Enter') {
                const value = consoleInput.value;
                
                // Final value already visible in echo line
                echoLine.textContent = value;
                
                // Disable input
                consoleInput.disabled = true;
                consoleInput.value = '';
                
                // Remove listeners
                consoleInput.removeEventListener('input', handleInputChange);
                consoleInput.removeEventListener('keypress', handleInput);
                
                // Auto-scroll
                outputConsole.scrollTop = outputConsole.scrollHeight;
                
                // Return value to Python
                resolve(value);
            }
        };
        
        consoleInput.addEventListener('keypress', handleInput);
    });
}

// Display formatted Python error
function displayPythonError(error) {
    const outputConsole = document.getElementById('outputConsole');
    
    let errorMessage = error.message || String(error);
    
    // Split into lines
    const lines = errorMessage.split('\n');
    
    // Find the actual error line (usually last non-empty line)
    let errorLine = '';
    let errorType = 'Error';
    
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim()) {
            errorLine = lines[i].trim();
            // Extract error type (e.g., "SyntaxError: message")
            const match = errorLine.match(/^(\w+Error):\s*(.+)/);
            if (match) {
                errorType = match[1];
                errorLine = match[2];
                break;
            }
        }
    }
    
    // Try to find line number in user's code (look for File "<exec>", line X)
    let userLineNumber = null;
    for (const line of lines) {
        const match = line.match(/File "<exec>", line (\d+)/);
        if (match) {
            userLineNumber = match[1];
            break;
        }
    }
    
    // Create error header
    const errorHeader = document.createElement('div');
    errorHeader.className = 'output-line output-error';
    errorHeader.style.fontWeight = 'bold';
    errorHeader.textContent = userLineNumber 
        ? `${errorType} on line ${userLineNumber}:`
        : `${errorType}:`;
    outputConsole.appendChild(errorHeader);
    
    // Create error message
    const errorBody = document.createElement('div');
    errorBody.className = 'output-line output-error';
    errorBody.style.marginLeft = '20px';
    errorBody.textContent = errorLine;
    outputConsole.appendChild(errorBody);
    
    // Add helpful hint
    const hint = getErrorHint(errorType);
    if (hint) {
        const hintLine = document.createElement('div');
        hintLine.className = 'output-line';
        hintLine.style.color = '#fbbf24';
        hintLine.style.marginTop = '10px';
        hintLine.style.fontStyle = 'italic';
        hintLine.textContent = `💡 Tip: ${hint}`;
        outputConsole.appendChild(hintLine);
    }
    
    // Add "Show Full Error" button for debugging
    const showFullBtn = document.createElement('button');
    showFullBtn.textContent = '▼ Show Full Error';
    showFullBtn.className = 'show-full-error-btn';
    showFullBtn.style.cssText = `
        margin-top: 10px;
        padding: 5px 10px;
        background: transparent;
        border: 1px solid #6b7280;
        color: #9ca3af;
        cursor: pointer;
        font-size: 12px;
        border-radius: 3px;
    `;
    
    const fullErrorDiv = document.createElement('pre');
    fullErrorDiv.className = 'output-line';
    fullErrorDiv.style.cssText = `
        display: none;
        margin-top: 10px;
        padding: 10px;
        background: #0d0d0d;
        border: 1px solid #374151;
        border-radius: 3px;
        font-size: 12px;
        color: #d4d4d4;
        overflow-x: auto;
    `;
    fullErrorDiv.textContent = errorMessage;
    
    showFullBtn.addEventListener('click', () => {
        if (fullErrorDiv.style.display === 'none') {
            fullErrorDiv.style.display = 'block';
            showFullBtn.textContent = '▲ Hide Full Error';
        } else {
            fullErrorDiv.style.display = 'none';
            showFullBtn.textContent = '▼ Show Full Error';
        }
    });
    
    outputConsole.appendChild(showFullBtn);
    outputConsole.appendChild(fullErrorDiv);
}

// Get helpful hint for common Python errors
function getErrorHint(errorType) {
    const hints = {
        'SyntaxError': 'Check for missing colons, parentheses, or quotes',
        'NameError': 'Make sure the variable is defined before using it',
        'TypeError': 'Check that you\'re using the right data types',
        'IndentationError': 'Python uses indentation to group code - check your spacing',
        'IndexError': 'Make sure you\'re not accessing an index that doesn\'t exist',
        'KeyError': 'The key you\'re looking for doesn\'t exist in the dictionary',
        'ValueError': 'Check that the value is appropriate for the operation',
        'ZeroDivisionError': 'You can\'t divide by zero',
        'AttributeError': 'The object doesn\'t have that attribute or method',
        'ImportError': 'The module you\'re trying to import isn\'t available'
    };
    
    return hints[errorType] || null;
}

// Load lesson on page load
loadLesson();