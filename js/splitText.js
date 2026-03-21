class SplitTextEffect {
    constructor(selector) {
        this.element = document.querySelector(selector);
        if (this.element) {
            this.init();
        }
    }

    init() {
        this.splitText();
        this.animate();
    }

    splitText() {
        const originalContent = this.element.innerHTML;
        this.element.innerHTML = '';
        this.chars = [];

        // Create a temporary container to traverse nodes
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent;

        Array.from(tempDiv.childNodes).forEach(node => {
            if (node.nodeType === 3) { // Text Node
                const text = node.nodeValue;
                text.split('').forEach(char => {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.style.display = 'inline-block';
                    span.style.opacity = '0';
                    span.style.transform = 'translateY(40px)';
                    span.style.willChange = 'transform, opacity';
                    
                    // Preserve spaces
                    if (char.trim() === '') span.innerHTML = '&nbsp;';
                    
                    this.element.appendChild(span);
                    this.chars.push(span);
                });
            } else { // Element Node (e.g. <br>)
                this.element.appendChild(node.cloneNode(true));
            }
        });
    }

    animate() {
        // Retry if GSAP hasn't loaded yet (due to async loading)
        if (typeof gsap === 'undefined') {
            setTimeout(() => this.animate(), 50);
            return;
        }

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        gsap.to(this.chars, {
            opacity: 1,
            y: 0,
            duration: 1.25,
            ease: 'power3.out',
            stagger: 0.05,
            scrollTrigger: {
                trigger: this.element,
                start: 'top 80%', // Start animation when the element is visible
                once: true
            }
        });
    }
}

// Initialize specifically for the Intro page main title
if (document.querySelector('.main-title h1')) {
    new SplitTextEffect('.main-title h1');
}