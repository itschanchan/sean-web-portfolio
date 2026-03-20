document.addEventListener('DOMContentLoaded', function() {
    const loadComponent = (url, elementId) => {
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                return response.text();
            })
            .then(data => {
                const container = document.getElementById(elementId);
                container.innerHTML = data;

                // Execute scripts found in the loaded component
                container.querySelectorAll('script').forEach(script => {
                    const newScript = document.createElement('script');
                    Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(script.innerHTML));
                    script.parentNode.replaceChild(newScript, script);
                });
            })
            .catch(error => console.error(error));
    };

    async function main() {
        // Load all HTML components concurrently
        await Promise.all([
            loadComponent('components/header.html', 'header-container'),
            loadComponent('components/activity_bar.html', 'activity-bar-container'),
            loadComponent('pages/intro.html', 'intro-container'),
            loadComponent('components/advertisment.html', 'advertisment-container'),
            loadComponent('pages/my_works.html', 'my-works-container'),
            loadComponent('pages/my_skills.html', 'my-skills-container'),
            loadComponent('pages/my_resume.html', 'my-resume-container'),
            loadComponent('pages/contact.html', 'contact-me-container')
        ]);

    }

    main().catch(error => console.error("Initialization failed:", error));
});