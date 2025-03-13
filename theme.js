// Theme Management
document.addEventListener('DOMContentLoaded', function() {
    // Get theme toggle elements
    const darkModeToggles = document.querySelectorAll('#darkModeToggle, #checkbox');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        // Update toggle states
        darkModeToggles.forEach(toggle => {
            toggle.checked = savedTheme === 'dark';
        });
    }
    
    // Add event listeners to all theme toggles
    darkModeToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            
            // Update HTML theme attribute
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Save preference
            localStorage.setItem('theme', newTheme);
            
            // Sync other toggles
            darkModeToggles.forEach(otherToggle => {
                if (otherToggle !== this) {
                    otherToggle.checked = this.checked;
                }
            });
        });
    });
    
    // Check system preference on first load if no saved preference
    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        darkModeToggles.forEach(toggle => {
            toggle.checked = prefersDark;
        });
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
}); 