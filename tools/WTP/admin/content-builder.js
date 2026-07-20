// ===========================
// TinyMCE Initialization
// ===========================

tinymce.init({
    selector: '#editor',
    license_key: 'gpl',  // ← ADD THIS LINE
    height: 500,
    menubar: false,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | ' +
             'bullist numlist | codeblock infobox tipbox warningbox | removeformat | preview',
    
    content_style: `
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            padding: 20px;
        }
        pre { 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        .info-box, .tip-box, .warning-box {
            padding: 15px;
            margin: 15px 0;
            border: 1px solid;
            border-radius: 4px;
        }
        .info-box {
            background: rgba(139, 92, 246, 0.05);
            border-color: #8b5cf6;
        }
        .tip-box {
            background: rgba(14, 123, 66, 0.05);
            border-color: #10b981;
        }
        .warning-box {
            background: rgba(255, 193, 7, 0.05);
            border-color: #ffc107;
        }
    `,
    
    setup: function(editor) {
        // Custom Code Block Button
        editor.ui.registry.addButton('codeblock', {
            text: 'Code Block',
            onAction: function() {
                openCodeBlockModal(editor);
            }
        });
        
        // Info Box Button
        editor.ui.registry.addButton('infobox', {
            text: '💡 Info',
            onAction: function() {
                editor.insertContent(`<div class="info-box"><strong>ℹ️ Info:</strong> Click here to edit info box content...</div><p>&nbsp;</p>`);
            }
        });

        // Tip Box Button
        editor.ui.registry.addButton('tipbox', {
            text: '✅ Tip',
            onAction: function() {
                editor.insertContent(`<div class="tip-box"><strong>💡 Tip:</strong> Click here to edit tip content...</div><p>&nbsp;</p>`);
            }
        });

        // Warning Box Button
        editor.ui.registry.addButton('warningbox', {
            text: '⚠️ Warning',
            onAction: function() {
                editor.insertContent(`<div class="warning-box"><strong>⚠️ Warning:</strong> Click here to edit warning content...</div><p>&nbsp;</p>`);
            }
        });
    }
});

// ===========================
// Code Block Modal
// ===========================

function openCodeBlockModal(editor) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 8px; width: 600px; max-width: 90%;">
            <h3 style="margin: 0 0 20px 0;">Insert Code Block</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Language:</label>
                <select id="codeLanguage" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Code:</label>
                <textarea id="codeContent" rows="10" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;" placeholder="Paste your code here..."></textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelCode" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
                <button id="insertCode" style="padding: 10px 20px; border: none; background: #8b5cf6; color: white; border-radius: 4px; cursor: pointer;">Insert Code</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus textarea
    document.getElementById('codeContent').focus();
    
    // Handle insert
    document.getElementById('insertCode').addEventListener('click', () => {
        const language = document.getElementById('codeLanguage').value;
        const code = document.getElementById('codeContent').value;
        
        if (code.trim()) {
            // Escape HTML entities
            const escaped = escapeHtml(code);
            
            // Insert into editor
            editor.insertContent(`<pre><code class="language-${language}">${escaped}</code></pre>`);
        }
        
        document.body.removeChild(modal);
    });
    
    // Handle cancel
    document.getElementById('cancelCode').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Escape HTML entities
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Build lesson metadata object (reusable)
function buildLessonMetadata() {
    const moduleId = document.getElementById('moduleId').value.trim();
    const unitNumber = document.getElementById('unitNumber').value.trim();
    const lessonNumber = document.getElementById('lessonNumber').value.trim();
    const title = document.getElementById('lessonTitle').value.trim();
    const description = document.getElementById('lessonDescription').value.trim();
    const language = document.getElementById('lessonLanguage').value;
    
    // Build lesson entry in correct order
    const lessonEntry = {
        id: parseInt(lessonNumber),
        title: title,
        description: description,
        language: language
    };
    
    // Add activePanels only for web lessons (before instructionFile)
    if (language === 'web') {
        const activePanels = [];
        if (document.getElementById('panelHtml').checked) activePanels.push('html');
        if (document.getElementById('panelCss').checked) activePanels.push('css');
        if (document.getElementById('panelJs').checked) activePanels.push('js');
        
        lessonEntry.activePanels = activePanels;
    }
    
    // Add instructionFile
    lessonEntry.instructionFile = `data/lessons/${moduleId}/unit-${unitNumber}/lesson-${lessonNumber}/instruction.html`;
    
    // Add starterCode for web lessons (always include, even if empty)
    if (language === 'web') {
        const starterCode = {};
        if (document.getElementById('starterHtml').checked) {
            starterCode.html = `data/lessons/${moduleId}/unit-${unitNumber}/lesson-${lessonNumber}/starter.html`;
        }
        if (document.getElementById('starterCss').checked) {
            starterCode.css = `data/lessons/${moduleId}/unit-${unitNumber}/lesson-${lessonNumber}/starter.css`;
        }
        if (document.getElementById('starterJs').checked) {
            starterCode.js = `data/lessons/${moduleId}/unit-${unitNumber}/lesson-${lessonNumber}/starter.js`;
        }
        
        lessonEntry.starterCode = starterCode;
        
    } else if (language === 'python') {
        // Python starter code - only add if checkbox is checked
        if (document.getElementById('starterPython').checked) {
            lessonEntry.starterCode = {
                python: `data/lessons/${moduleId}/unit-${unitNumber}/lesson-${lessonNumber}/starter.py`
            };
        }
    }
    
    // Add hints (always last)
    lessonEntry.hints = hints.filter(h => h.trim() !== '');
    
    return lessonEntry;
}

// ===========================
// Hints Management
// ===========================

let hints = [];

function renderHints() {
    const hintsList = document.getElementById('hintsList');
    
    if (hints.length === 0) {
        hintsList.innerHTML = '<p style="color: #999; font-size: 14px;">No hints added yet. Click "Add Hint" below.</p>';
        return;
    }
    
    hintsList.innerHTML = hints.map((hint, index) => `
        <div class="hint-item">
            <input type="text" value="${hint}" data-index="${index}" class="hint-input" placeholder="Enter hint text">
            <button class="btn btn-danger" onclick="removeHint(${index})">Remove</button>
        </div>
    `).join('');
    
    // Add change listeners
    document.querySelectorAll('.hint-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            hints[index] = e.target.value;
        });
    });
}

function addHint() {
    hints.push('');
    renderHints();
}

function removeHint(index) {
    hints.splice(index, 1);
    renderHints();
}

document.getElementById('addHintBtn').addEventListener('click', addHint);

// ===========================
// Preview
// ===========================

function updatePreview() {
    const content = tinymce.get('editor').getContent();
    const previewPanel = document.getElementById('previewPanel');
    previewPanel.innerHTML = content;
}

document.getElementById('previewBtn').addEventListener('click', (e) => {
    e.preventDefault();  // ← ADD THIS
    updatePreview();
});

// ===========================
// Download Functions
// ===========================

function downloadHtml() {
    const content = tinymce.get('editor').getContent();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${content}
</body>
</html>`;
    
    downloadFile('instruction.html', html);
}

function downloadJson() {
    const moduleId = document.getElementById('moduleId').value.trim();
    const unitNumber = document.getElementById('unitNumber').value.trim();
    const lessonNumber = document.getElementById('lessonNumber').value.trim();
    const title = document.getElementById('lessonTitle').value.trim();
    const description = document.getElementById('lessonDescription').value.trim();
    
    // Validation - only if they're trying to download metadata
    if (!moduleId || !unitNumber || !lessonNumber || !title || !description) {
        alert('To download metadata JSON, please fill in: Module ID, Unit Number, Lesson Number, Title, and Description');
        return;
    }
    
    const lessonEntry = buildLessonMetadata();
    const json = JSON.stringify(lessonEntry, null, 2);
    downloadFile('lesson-entry.json', json);
}

function downloadLessonPackage() {
    const includeMetadata = document.getElementById('includeMetadata').checked;
    const language = document.getElementById('lessonLanguage').value;
    
    // Validate metadata fields only if including metadata
    if (includeMetadata) {
        const moduleId = document.getElementById('moduleId').value.trim();
        const unitNumber = document.getElementById('unitNumber').value.trim();
        const lessonNumber = document.getElementById('lessonNumber').value.trim();
        const title = document.getElementById('lessonTitle').value.trim();
        const description = document.getElementById('lessonDescription').value.trim();
        
        if (!moduleId || !unitNumber || !lessonNumber || !title || !description) {
            alert('To include metadata JSON, please fill in: Module ID, Unit Number, Lesson Number, Title, and Description');
            return;
        }
    }
    
    // Get lesson number for filename (use default if not provided)
    const lessonNumber = document.getElementById('lessonNumber').value.trim() || 'new';
    
    // Get instruction HTML from TinyMCE
    const instructionContent = tinymce.get('editor').getContent();
    
    // Get starter file selections
    const includeHtml = document.getElementById('starterHtml').checked;
    const includeCss = document.getElementById('starterCss').checked;
    const includeJs = document.getElementById('starterJs').checked;
    const includePython = document.getElementById('starterPython').checked;
    
    // Create zip using JSZip
    const zip = new JSZip();
    
    // Add instruction.html
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${instructionContent}
</body>
</html>`;
    
    zip.file('instruction.html', fullHtml);
    
    // Add metadata JSON if checked
    if (includeMetadata) {
        const lessonEntry = buildLessonMetadata();
        const json = JSON.stringify(lessonEntry, null, 2);
        zip.file('lesson-metadata.json', json);
    }
    
    // Add empty starter files based on language
    if (language === 'web') {
        if (includeHtml) {
            zip.file('starter.html', '<!-- Add your starter HTML here -->\n');
        }
        if (includeCss) {
            zip.file('starter.css', '/* Add your starter CSS here */\n');
        }
        if (includeJs) {
            zip.file('starter.js', '// Add your starter JavaScript here\n');
        }
    } else if (language === 'python') {
        if (includePython) {
            zip.file('starter.py', '# Add your starter Python code here\n');
        }
    }
    
    // Generate and download zip
    zip.generateAsync({type: 'blob'}).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lesson-${lessonNumber}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// document.getElementById('downloadHtmlBtn').addEventListener('click', (e) => {
//     e.preventDefault();  // ← ADD THIS
//     downloadHtml();
// });

// document.getElementById('downloadJsonBtn').addEventListener('click', (e) => {
//     e.preventDefault();  // ← ADD THIS
//     downloadJson();
// });

document.getElementById('downloadPackageBtn').addEventListener('click', (e) => {
    e.preventDefault();
    downloadLessonPackage();
});

document.getElementById('clearBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to clear all content? This cannot be undone.')) {
        // Clear form fields
        document.getElementById('moduleId').value = '';
        document.getElementById('unitNumber').value = '';
        document.getElementById('lessonNumber').value = '';
        document.getElementById('lessonTitle').value = '';
        document.getElementById('lessonDescription').value = '';
        document.getElementById('lessonLanguage').value = 'web';
        
        // Reset checkboxes
        document.getElementById('panelHtml').checked = true;
        document.getElementById('panelCss').checked = true;
        document.getElementById('panelJs').checked = true;

        // Reset starter file checkboxes
        document.getElementById('starterHtml').checked = false;
        document.getElementById('starterCss').checked = false;
        document.getElementById('starterJs').checked = false;
        document.getElementById('starterPython').checked = false;

        // Reset metadata checkbox
        document.getElementById('includeMetadata').checked = true;
        
        // Clear editor
        tinymce.get('editor').setContent('');
        
        // Clear hints
        hints = [];
        renderHints();
        
        // Clear preview
        document.getElementById('previewPanel').innerHTML = '<p style="color: #999;">Preview will appear here...</p>';
    }
});

// ===========================
// Initialize
// ===========================

renderHints();