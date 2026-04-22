<script>
        console.log('Lesson page script loaded');
    // // All UI interactions (collapse, tabs, modals, etc.)
    // // This code is specific to the lesson page structure

    // // ===========================
    // // Collapsible Instruction Panel
    // // ===========================

    // const collapseBtn = document.getElementById('collapseBtn');
    // const instructionPanel = document.getElementById('instructionPanel');

    // collapseBtn.addEventListener('click', () => {
    //     instructionPanel.classList.toggle('collapsed');
        
    //     // Change button text
    //     if (instructionPanel.classList.contains('collapsed')) {
    //         collapseBtn.textContent = 'Expand ▼';
    //     } else {
    //         collapseBtn.textContent = 'Collapse ▲';
    //     }
    // });
    // // ===========================
    // // Editor Tabs
    // // ===========================

    // const editorTabs = document.querySelectorAll('.editor-tab');
    // const htmlEditor = document.getElementById('htmlEditor');
    // const cssEditor = document.getElementById('cssEditor');
    // const jsEditor = document.getElementById('jsEditor');

    // editorTabs.forEach(tab => {
    //     tab.addEventListener('click', () => {
    //         // Don't do anything if tab is disabled
    //         if (tab.classList.contains('disabled')) {
    //             return;
    //         }
            
    //         // Remove active class from all tabs
    //         editorTabs.forEach(t => t.classList.remove('active'));
            
    //         // Add active class to clicked tab
    //         tab.classList.add('active');
            
    //         // Hide all editors
    //         htmlEditor.style.display = 'none';
    //         cssEditor.style.display = 'none';
    //         jsEditor.style.display = 'none';
            
    //         // Show the relevant editor
    //         const editorType = tab.getAttribute('data-editor');
    //         if (editorType === 'html') {
    //             htmlEditor.style.display = 'block';
    //         } else if (editorType === 'css') {
    //             cssEditor.style.display = 'block';
    //         } else if (editorType === 'js') {
    //             jsEditor.style.display = 'block';
    //         }
    //     });
    // });
    // // ===========================
    // // Modals
    // // ===========================

    // // Menu Modal
    // const menuBtn = document.getElementById('menuBtn');
    // const menuModal = document.getElementById('menuModal');
    // const closeMenuModal = document.getElementById('closeMenuModal');

    // menuBtn.addEventListener('click', () => {
    //     menuModal.classList.add('active');
    // });

    // closeMenuModal.addEventListener('click', () => {
    //     menuModal.classList.remove('active');
    // });

    // // Reference Modal
    // const referenceBtn = document.getElementById('referenceBtn');
    // const referenceModal = document.getElementById('referenceModal');
    // const closeReferenceModal = document.getElementById('closeReferenceModal');

    // referenceBtn.addEventListener('click', () => {
    //     referenceModal.classList.add('active');
    // });

    // closeReferenceModal.addEventListener('click', () => {
    //     referenceModal.classList.remove('active');
    // });

    // // Close modals when clicking outside
    // menuModal.addEventListener('click', (e) => {
    //     if (e.target === menuModal) {
    //         menuModal.classList.remove('active');
    //     }
    // });

    // referenceModal.addEventListener('click', (e) => {
    //     if (e.target === referenceModal) {
    //         referenceModal.classList.remove('active');
    //     }
    // });

    // // Close modals with Escape key
    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'Escape') {
    //         menuModal.classList.remove('active');
    //         referenceModal.classList.remove('active');
    //     }
    // });

    // // ===========================
    // // Reference Tabs
    // // ===========================

    // const referenceTabs = document.querySelectorAll('.reference-tab');
    // const htmlReference = document.getElementById('htmlReference');
    // const cssReference = document.getElementById('cssReference');
    // const jsReference = document.getElementById('jsReference');

    // referenceTabs.forEach(tab => {
    //     tab.addEventListener('click', () => {
    //         // Remove active class from all tabs
    //         referenceTabs.forEach(t => t.classList.remove('active'));
            
    //         // Add active class to clicked tab
    //         tab.classList.add('active');
            
    //         // Hide all reference sections
    //         htmlReference.style.display = 'none';
    //         cssReference.style.display = 'none';
    //         jsReference.style.display = 'none';
            
    //         // Show the relevant reference section
    //         const refType = tab.getAttribute('data-ref');
    //         if (refType === 'html') {
    //             htmlReference.style.display = 'block';
    //         } else if (refType === 'css') {
    //             cssReference.style.display = 'block';
    //         } else if (refType === 'js') {
    //             jsReference.style.display = 'block';
    //         }
    //     });
    // });

    // ===========================
    // Live Preview Auto-Refresh
    // ===========================

    const previewFrame = document.getElementById('preview');

    function updatePreview() {
        const htmlCode = htmlEditor.value;
        const cssCode = cssEditor.value;
        const jsCode = jsEditor.value;
        
        // Combine HTML, CSS, and JS into a complete document
        const previewContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}<\/script>
            </body>
            </html>
        `;
        
        // Write to iframe
        const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        previewDoc.open();
        previewDoc.write(previewContent);
        previewDoc.close();
    }

    // Debounce function to avoid updating too frequently
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

    // Create debounced version of updatePreview (500ms delay)
    const debouncedUpdate = debounce(updatePreview, 500);

    // Listen for changes in all editors
    htmlEditor.addEventListener('input', debouncedUpdate);
    cssEditor.addEventListener('input', debouncedUpdate);
    jsEditor.addEventListener('input', debouncedUpdate);

    // Initial preview update on page load
    updatePreview();
    </script>

    // ===========================
        // Live Preview Auto-Refresh
        // ===========================

        const previewFrame = document.getElementById('preview');

        function updatePreview() {
            const htmlCode = htmlEditor.value;
            const cssCode = cssEditor.value;
            const jsCode = jsEditor.value;
            
            // Combine HTML, CSS, and JS into a complete document
            const previewContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>${cssCode}</style>
                </head>
                <body>
                    ${htmlCode}
                    <script>${jsCode}<\/script>
                </body>
                </html>
            `;
            
            // Write to iframe
            const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            previewDoc.open();
            previewDoc.write(previewContent);
            previewDoc.close();
        }

        // Debounce function to avoid updating too frequently
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

        // Create debounced version of updatePreview (500ms delay)
        const debouncedUpdate = debounce(updatePreview, 500);

        // Listen for changes in all editors
        htmlEditor.addEventListener('input', debouncedUpdate);
        cssEditor.addEventListener('input', debouncedUpdate);
        jsEditor.addEventListener('input', debouncedUpdate);

        // Initial preview update on page load
        updatePreview();
