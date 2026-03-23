class FolderEffect {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.resumeUrl = options.resumeUrl || '';
        this.scale = options.scale || 3; // Default scale to make it visible
        this.init();
    }

    darkenColor(hex, percent) {
        let color = hex.startsWith('#') ? hex.slice(1) : hex;
        if (color.length === 3) {
            color = color.split('').map(c => c + c).join('');
        }
        const num = parseInt(color, 16);
        let r = (num >> 16) & 0xff;
        let g = (num >> 8) & 0xff;
        let b = num & 0xff;

        r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
        g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
        b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));

        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    init() {
        const color = '#e4bd69'; 
        const folderBackColor = this.darkenColor(color, 0.08);
        const paper1 = this.darkenColor('#ffffff', 0.1);
        const paper2 = this.darkenColor('#ffffff', 0.05);
        const paper3 = '#ffffff';
        const maxItems = 3;

        // Wrapper for scaling
        const wrapper = document.createElement('div');
        wrapper.style.transform = `scale(${this.scale})`;
        wrapper.style.transformOrigin = 'center';
        wrapper.className = 'folder-wrapper';

        // HTML Structure
        wrapper.innerHTML = `
            <div class="folder" style="--folder-color: ${color}; --folder-back-color: ${folderBackColor}; --paper-1: ${paper1}; --paper-2: ${paper2}; --paper-3: ${paper3};">
                <div class="folder__back">
                    <div class="paper"></div>
                    <div class="paper"></div>
                    <div class="paper" id="resume-paper" style="overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; background: #fff;">
                        <div style="text-align: center; pointer-events: none;">
                            <span style="display: block; font-size: 6px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Click to open</span>
                            <span style="display: block; font-size: 8px; font-weight: bold; text-transform: uppercase; color: #000;">Resume</span>
                        </div>
                    </div>
                    <div class="folder__front"></div>
                    <div class="folder__front right"></div>
                </div>
            </div>
        `;

        // Clear container and append new folder
        this.container.innerHTML = '';
        this.container.appendChild(wrapper);

        // Interactions
        const folder = wrapper.querySelector('.folder');
        folder.addEventListener('click', () => {
            folder.classList.toggle('open');
            // Reset offsets on close/open
            const papers = wrapper.querySelectorAll('.paper');
            papers.forEach(p => {
                p.style.setProperty('--magnet-x', '0px');
                p.style.setProperty('--magnet-y', '0px');
            });
        });

        // Resume Paper Interaction
        const resumePaper = wrapper.querySelector('#resume-paper');
        resumePaper.addEventListener('click', (e) => {
            if (folder.classList.contains('open')) {
                e.stopPropagation(); // Prevent folder from closing when clicking the paper
                
                const modalEl = document.getElementById('resumeModal');
                if (modalEl) {
                    const iframe = document.getElementById('resume-iframe');
                    if (iframe && !iframe.getAttribute('src')) {
                        iframe.src = this.resumeUrl;
                    }

                    // Fetch Last Modified Date of the PDF
                    const dateEl = document.getElementById('resume-date');
                    if (dateEl) {
                        fetch(this.resumeUrl, { method: 'HEAD' })
                            .then(response => {
                                const lastModified = response.headers.get('Last-Modified');
                                if (lastModified) {
                                    const date = new Date(lastModified);
                                    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                                    dateEl.textContent = `Published: ${formattedDate}`;
                                }
                            })
                            .catch(err => console.error('Error fetching resume date:', err));
                    }

                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                }
            }
        });

        // Magnet Effect (Mouse Move on Papers)
        const papers = wrapper.querySelectorAll('.paper');
        papers.forEach((paper, index) => {
            paper.addEventListener('mousemove', (e) => {
                if (!folder.classList.contains('open')) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const offsetX = (e.clientX - centerX) * 0.15;
                const offsetY = (e.clientY - centerY) * 0.15;
                paper.style.setProperty('--magnet-x', `${offsetX}px`);
                paper.style.setProperty('--magnet-y', `${offsetY}px`);
            });
            
            paper.addEventListener('mouseleave', () => {
                paper.style.setProperty('--magnet-x', '0px');
                paper.style.setProperty('--magnet-y', '0px');
            });
        });

        // Optional: Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                folder.classList.remove('open');
            }
        });
    }
}

// Initialize for Resume Page
const initResumeFolder = () => {
    // FIX: Move modal to body to prevent scrollSoap.js transform issues
    const modal = document.getElementById('resumeModal');
    if (modal && modal.parentNode !== document.body) {
        document.body.appendChild(modal);
    }

    if (document.getElementById('resume-folder-container')) {
        new FolderEffect('resume-folder-container', {
            resumeUrl: '../assets/docs/sean-lacson-resume.pdf' // Update the resume path here.
        });
    }
};

// Check if DOM is already ready (handles dynamic loading)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResumeFolder);
} else {
    initResumeFolder();
}