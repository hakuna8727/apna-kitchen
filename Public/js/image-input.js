// public/js/image-input.js
// Adds mutual exclusivity between an image URL input and a file input, and shows a preview.

document.addEventListener('DOMContentLoaded', () => {
    function initImageInputs(urlSelector, fileSelector, previewSelector) {
        const urlInput = document.querySelector(urlSelector);
        const fileInput = document.querySelector(fileSelector);
        const previewContainer = previewSelector ? document.querySelector(previewSelector) : null;

        if (!urlInput || !fileInput) return;

        function clearPreview() {
            if (!previewContainer) return;
            previewContainer.innerHTML = '';
        }

        function showPreviewFromUrl(url) {
            if (!previewContainer) return;
            clearPreview();
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Image preview';
            img.className = 'file-preview-image';
            previewContainer.appendChild(img);
        }

        function showPreviewFromFile(file) {
            if (!previewContainer) return;
            clearPreview();
            const img = document.createElement('img');
            img.alt = 'Image preview';
            img.className = 'file-preview-image';
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);
            previewContainer.appendChild(img);
            // add a cancel/remove button for chosen file
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'image-cancel-btn';
            btn.textContent = 'Remove';
            btn.addEventListener('click', () => {
                fileInput.value = '';
                fileInput.disabled = false;
                urlInput.disabled = false;
                clearPreview();
                btn.remove();
            });
            previewContainer.appendChild(btn);
        }

        // When user types a URL, clear file input
        urlInput.addEventListener('input', (e) => {
            const v = e.target.value.trim();
            if (v.length > 0) {
                fileInput.value = '';
                fileInput.disabled = true;
                showPreviewFromUrl(v);
            } else {
                fileInput.disabled = false;
                clearPreview();
            }
        });

        // When user chooses a file, clear URL input
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                urlInput.value = '';
                urlInput.disabled = true;
                showPreviewFromFile(file);
            } else {
                urlInput.disabled = false;
                clearPreview();
            }
        });

        // If the URL input loses focus, validate basic image URL and show preview
        urlInput.addEventListener('blur', (e) => {
            const v = e.target.value.trim();
            if (!v) return;
            // quick check for image extension
            if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(v)) {
                showPreviewFromUrl(v);
            }
        });
    }

    // Initialize common selectors for submit and edit forms if present
    initImageInputs('#recipe-image', '#recipe-file', '#image-preview'); // submit page
    initImageInputs('#imageUrl', '#image-file', '#image-preview-edit'); // edit page
});