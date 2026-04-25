// All UI interactions (collapse, tabs, modals, etc.)
// This code is specific to the lesson page structure

// ===========================
// Toast Notification System
// ===========================

function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" aria-label="Close">×</button>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
}

function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
        toast.remove();
    }, 300); // Match animation duration
}

// ===========================
// Collapsible Instruction Panel
// ===========================

const instructionPanel = document.getElementById('instructionPanel');
const instructionCollapseBtn = document.getElementById('instructionCollapseBtn');
const instructionCollapseIcon = document.getElementById('instructionCollapseIcon');
const instructionHeaderBar = document.querySelector('.instruction-header-bar');

// Click button to toggle
instructionCollapseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleInstructions();
});

// Click bar to toggle
instructionHeaderBar.addEventListener('click', (e) => {
    if (e.target === instructionHeaderBar || e.target.classList.contains('instruction-header-title')) {
        toggleInstructions();
    }
});

function toggleInstructions() {
    instructionPanel.classList.toggle('collapsed');
    
    if (instructionPanel.classList.contains('collapsed')) {
        instructionCollapseIcon.textContent = '▶';  // ← Changed to right arrow
    } else {
        instructionCollapseIcon.textContent = '◀';  // ← Changed to left arrow
    }
}

// ===========================
// Editor Tabs
// ===========================

const editorTabs = document.querySelectorAll('.editor-tab');
const htmlEditor = document.getElementById('htmlEditor');
const cssEditor = document.getElementById('cssEditor');
const jsEditor = document.getElementById('jsEditor');

editorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active from all tabs
        editorTabs.forEach(t => t.classList.remove('active'));
        
        // Add active to clicked tab
        tab.classList.add('active');
        
        // Hide all CodeMirror editors
        htmlEditorCM.getWrapperElement().style.display = 'none';
        cssEditorCM.getWrapperElement().style.display = 'none';
        jsEditorCM.getWrapperElement().style.display = 'none';
        
        // Show selected editor
        const editorType = tab.getAttribute('data-editor');
        if (editorType === 'html') {
            htmlEditorCM.getWrapperElement().style.display = 'block';
            htmlEditorCM.refresh(); // Refresh to fix rendering
        } else if (editorType === 'css') {
            cssEditorCM.getWrapperElement().style.display = 'block';
            cssEditorCM.refresh();
        } else if (editorType === 'js') {
            jsEditorCM.getWrapperElement().style.display = 'block';
            jsEditorCM.refresh();
        }
    });
});
// ===========================
// Modals
// ===========================

// ===========================
// Reference Tabs
// ===========================

const referenceTabs = document.querySelectorAll('.reference-tab');
const htmlReference = document.getElementById('htmlReference');
const cssReference = document.getElementById('cssReference');
const jsReference = document.getElementById('jsReference');
const linksReference = document.getElementById('linksReference');

referenceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        referenceTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all reference sections
        htmlReference.style.display = 'none';
        cssReference.style.display = 'none';
        jsReference.style.display = 'none';
        linksReference.style.display = 'none';

        // Show the relevant reference section
        const refType = tab.getAttribute('data-ref');
        if (refType === 'html') {
            htmlReference.style.display = 'block';
        } else if (refType === 'css') {
            cssReference.style.display = 'block';
        } else if (refType === 'js') {
            jsReference.style.display = 'block';
        } else if (refType === 'links') {
            linksReference.style.display = 'block';
        }
    });
});

// Mark Complete Button (add with other button handlers)
const completeBtn = document.getElementById('completeBtn');

completeBtn.addEventListener('click', () => {
    if (typeof markLessonComplete === 'function') {
        markLessonComplete();
    }
});

// // Reset Unit Progress Button
// const resetUnitBtn = document.getElementById('resetUnitBtn');

// resetUnitBtn.addEventListener('click', () => {
//     if (typeof resetUnitProgress === 'function') {
//         resetUnitProgress();
//     }
// });
// Previous/Next Navigation
const prevLessonBtn = document.getElementById('prevLesson');
const nextLessonBtn = document.getElementById('nextLesson');

prevLessonBtn.addEventListener('click', () => {
    if (typeof goToPreviousLesson === 'function') {
        goToPreviousLesson();
    }
});

nextLessonBtn.addEventListener('click', () => {
    if (typeof goToNextLesson === 'function') {
        goToNextLesson();
    }
});

// Keyboard Shortcut: Ctrl/Cmd + Enter to Mark Complete
document.addEventListener('keydown', (e) => {
    // Check for Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        
        const completeBtn = document.getElementById('completeBtn');
        
        // Only trigger if button is not disabled
        if (!completeBtn.disabled && typeof markLessonComplete === 'function') {
            markLessonComplete();
        }
    }
});

// Prevent tab from switching focus, insert tab character instead
function handleEditorTab(editor) {
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Insert tab character at cursor position
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const value = editor.value;
            
            // Insert tab
            editor.value = value.substring(0, start) + '\t' + value.substring(end);
            
            // Move cursor after inserted tab
            editor.selectionStart = editor.selectionEnd = start + 1;
            
            // Trigger preview update
            if (typeof updatePreview === 'function') {
                updatePreview();
            }
        }
    });
}

// Apply to all editors
handleEditorTab(htmlEditor);
handleEditorTab(cssEditor);
handleEditorTab(jsEditor);

// Auto-indent on Enter key
function handleEditorAutoIndent(editor) {
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const start = editor.selectionStart;
            const value = editor.value;
            
            // Get current line
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const currentLine = value.substring(lineStart, start);
            
            // Count leading spaces/tabs
            const indent = currentLine.match(/^[\s\t]*/)[0];
            
            // Check if current line ends with opening tag or brace
            const trimmedLine = currentLine.trim();
            let extraIndent = '';
            
            if (trimmedLine.endsWith('{') || 
                trimmedLine.endsWith('[') || 
                (trimmedLine.match(/<[^\/][^>]*>$/) && !trimmedLine.match(/<[^>]*\/>/))) {
                extraIndent = '\t'; // Add tab character for nested content
            }
            
            // Insert newline with indent
            const newText = '\n' + indent + extraIndent;
            editor.value = value.substring(0, start) + newText + value.substring(start);
            
            // Move cursor to correct position
            editor.selectionStart = editor.selectionEnd = start + newText.length;
            
            // Trigger preview update
            if (typeof updatePreview === 'function') {
                updatePreview();
            }
        }
    });
}

// Save Code Button
const saveCodeBtn = document.getElementById('saveCodeBtn');

saveCodeBtn.addEventListener('click', () => {
    if (typeof saveCode === 'function') {
        saveCode();
    }
});

// Pop-out Preview Button
const popoutBtn = document.getElementById('popoutBtn');

popoutBtn.addEventListener('click', () => {
    if (popoutWindow && !popoutWindow.closed) {
        // Close popout
        if (typeof closePopoutPreview === 'function') {
            closePopoutPreview();
        }
    } else {
        // Open popout
        if (typeof openPopoutPreview === 'function') {
            openPopoutPreview();
        }
    }
});

// Fullscreen Preview Button
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenOverlay = document.getElementById('fullscreenOverlay');
const fullscreenClose = document.getElementById('fullscreenClose');

fullscreenBtn.addEventListener('click', () => {
    if (typeof openFullscreenPreview === 'function') {
        openFullscreenPreview();
    }
});

fullscreenClose.addEventListener('click', () => {
    if (typeof closeFullscreenPreview === 'function') {
        closeFullscreenPreview();
    }
});

// Close modals and fullscreen with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        confirmModal.classList.remove('active');
        document.getElementById('nextLessonModal').classList.remove('active');

        // close sidebar
        closeSidebar();
        
        // Close fullscreen preview
        if (fullscreenOverlay.classList.contains('active')) {
            if (typeof closeFullscreenPreview === 'function') {
                closeFullscreenPreview();
            }
        }
    }
});

// ===========================
// Unified Sidebar
// ===========================

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarClose = document.getElementById('sidebarClose');
const menuBtn = document.getElementById('menuBtn');

// Open sidebar
menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
});

// Close sidebar
sidebarClose.addEventListener('click', () => {
    closeSidebar();
});

sidebarOverlay.addEventListener('click', () => {
    closeSidebar();
});

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

// Sidebar Tab Switching
const sidebarTabs = document.querySelectorAll('.sidebar-tab');
const sidebarPanels = document.querySelectorAll('.sidebar-panel');

sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Remove active from all tabs
        sidebarTabs.forEach(t => t.classList.remove('active'));
        
        // Add active to clicked tab
        tab.classList.add('active');
        
        // Hide all panels
        sidebarPanels.forEach(p => p.classList.remove('active'));
        
        // Show target panel
        if (targetTab === 'lessons') {
            document.getElementById('lessonsPanel').classList.add('active');
        } else if (targetTab === 'reference') {
            document.getElementById('referencePanel').classList.add('active');
        } else if (targetTab === 'hints') {
            document.getElementById('hintsPanel').classList.add('active');
        }
    });
});

// Reference Sub-tabs in Sidebar
const referenceTabsSidebar = document.querySelectorAll('.reference-tab-sidebar');
const referenceSectionsSidebar = document.querySelectorAll('.reference-section-sidebar');

referenceTabsSidebar.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetRef = tab.getAttribute('data-ref');
        
        // Remove active from all reference tabs
        referenceTabsSidebar.forEach(t => t.classList.remove('active'));
        
        // Add active to clicked tab
        tab.classList.add('active');
        
        // Hide all reference sections
        referenceSectionsSidebar.forEach(s => s.classList.remove('active'));
        
        // Show target section
        document.getElementById(targetRef + 'ReferenceSidebar').classList.add('active');
    });
});

// Reset Unit Progress from Sidebar
const resetUnitBtnSidebar = document.getElementById('resetUnitBtnSidebar');

resetUnitBtnSidebar.addEventListener('click', () => {
    if (typeof resetUnitProgress === 'function') {
        resetUnitProgress();
    }
});

// Add to inline script in lesson.html
const clearOutputBtn = document.getElementById('clearOutputBtn');

clearOutputBtn?.addEventListener('click', () => {
    const outputConsole = document.getElementById('outputConsole');
    outputConsole.innerHTML = '<div class="output-placeholder">Click "Run Code" to execute your Python code</div>';
});

// Python Download Button
const downloadPythonBtn = document.getElementById('downloadPythonBtn');

downloadPythonBtn?.addEventListener('click', () => {
    if (typeof saveCode === 'function') {
        saveCode();
    }
});

// Python Run Button - Execute Real Code
const runPythonBtn = document.getElementById('runPythonBtn');

runPythonBtn?.addEventListener('click', () => {
    if (typeof executePythonCode === 'function') {
        executePythonCode();
    }
});

// ===========================
// Dark Mode Toggle
// ===========================

const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeIcon = document.getElementById('darkModeIcon');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateDarkModeIcon(savedTheme);

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme);
});

function updateDarkModeIcon(theme) {
    if (theme === 'dark') {
        darkModeIcon.textContent = '◑';
        
        // Update CodeMirror themes (only if initialized)
        if (typeof htmlEditorCM !== 'undefined' && htmlEditorCM) {
            htmlEditorCM.setOption('theme', 'material-darker');
            cssEditorCM.setOption('theme', 'material-darker');
            jsEditorCM.setOption('theme', 'material-darker');
            pythonEditorCM.setOption('theme', 'material-darker');
        }
    } else {
        darkModeIcon.textContent = '◐';
        
        // Update CodeMirror themes (only if initialized)
        if (typeof htmlEditorCM !== 'undefined' && htmlEditorCM) {
            htmlEditorCM.setOption('theme', 'default');
            cssEditorCM.setOption('theme', 'default');
            jsEditorCM.setOption('theme', 'default');
            pythonEditorCM.setOption('theme', 'default');
        }
    }
}

// Stop Python execution
const stopPythonBtn = document.getElementById('stopPythonBtn');

stopPythonBtn?.addEventListener('click', () => {
    if (pythonExecutionController) {
        pythonExecutionController.abort();
    }
});

// Keyboard shortcut: Shift+Enter to run Python code
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'Enter') {
        // Check if we're in a Python lesson
        const language = currentLesson?.language || 'web';
        
        if (language === 'python') {
            // Check if Python editor is focused
            if (pythonEditorCM && pythonEditorCM.hasFocus()) {
                e.preventDefault(); // Prevent new line
                
                // Trigger run button
                const runBtn = document.getElementById('runPythonBtn');
                if (runBtn && runBtn.style.display !== 'none') {
                    executePythonCode();
                }
            }
        }
    }
});