// public/js/nav.js

document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    
    // FIX: Try to get the list by ID, but fallback to 'nav ul' if ID is missing
    const navList = document.getElementById('user-nav') || document.querySelector('nav ul');

    // Fetch user status from the server
    fetch('/api/user/status', {
        credentials: 'include'  // Include session cookie
    })
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                // If logged in, hide "Register" and "Login" (Safety checks added)
                if (registerLink) registerLink.style.display = 'none';
                if (loginLink) loginLink.style.display = 'none';

                const existingUserDisplay = document.getElementById('username-display');
                if (existingUserDisplay) existingUserDisplay.remove();

                // Create a new list item for the username
                const usernameLi = document.createElement('li');
                usernameLi.id = 'username-display';

                const userLink = document.createElement('a');
                userLink.href = '#';
                userLink.className = 'nav-user-profile';

                if (typeof createAvatarBadge === 'function') {
                    userLink.appendChild(createAvatarBadge(data.avatarId, 'avatar-badge-nav'));
                } else {
                    const fallbackAvatar = document.createElement('span');
                    fallbackAvatar.className = 'avatar-badge avatar-badge-nav';
                    fallbackAvatar.textContent = (data.username || 'AK').slice(0, 2).toUpperCase();
                    userLink.appendChild(fallbackAvatar);
                }

                const userText = document.createElement('span');
                userText.className = 'nav-user-text';
                userText.textContent = `Welcome, ${data.username}`;
                userLink.appendChild(userText);

                const personality = data.personality || localStorage.getItem('personality');
                if (personality) {
                    const personalityText = document.createElement('span');
                    personalityText.className = 'nav-user-personality';
                    personalityText.textContent = typeof PERSONALITY_LABELS === 'object'
                        ? PERSONALITY_LABELS[personality] || personality
                        : personality;
                    userLink.appendChild(personalityText);
                }

                usernameLi.appendChild(userLink);

                localStorage.setItem('user_id', data.userId || '');
                localStorage.setItem('avatar_id', data.avatarId || 'chef-classic');
                localStorage.setItem('personality', data.personality || 'friendly');

                // FIX: Only try to add the username if the list exists
                if (navList) {
                    // We insert it BEFORE the logout link so it looks like: 
                    // Home | Recipes | Welcome Name | Logout
                    if (logoutLink) {
                        navList.insertBefore(usernameLi, logoutLink);
                    } else {
                        navList.appendChild(usernameLi); // Fallback: add to end
                    }
                }

                // Show logout link
                if (logoutLink) logoutLink.style.display = 'block';

            } else {
                // If not logged in, ensure "Login" and "Register" are visible
                if (loginLink) loginLink.style.display = 'block';
                if (registerLink) registerLink.style.display = 'block';
                if (logoutLink) logoutLink.style.display = 'none';
                
                // Remove username if it exists (clean up)
                const existingUserDisplay = document.getElementById('username-display');
                if (existingUserDisplay) existingUserDisplay.remove();
            }
        })
        .catch(error => {
            console.error('Error fetching user status:', error);
        });
});
