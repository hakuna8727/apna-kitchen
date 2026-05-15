// public/js/recipe-detail.js

// ----------------------------------------------------
// 🌟 FIX 1: DEFINE GLOBAL recipeId AND GET CURRENT USER ID 🌟
// ----------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');
let currentUserId = null; // Will be set after fetching user status

// ----------------------------------------------------
// 🌟 FIX 2: CREATE CORE FUNCTIONS FOR PAGE LOAD 🌟
// ----------------------------------------------------

// Function to fetch and display the main recipe details
async function fetchRecipeDetails() {
    if (!recipeId) {
        document.getElementById('recipe-title').innerText = "Recipe Not Found";
        return;
    }

    try {
        // This is the newly UNPROTECTED route in server.js
        const response = await fetch(`/api/recipes/${recipeId}`, {
            credentials: 'include'  // Include session cookie
        });
        if (!response.ok) {
            throw new Error('Failed to fetch recipe data.');
        }
        const recipe = await response.json();

        // Populate the page elements
        document.getElementById('recipe-title').innerText = recipe.title;
        document.getElementById('recipe-image').src = recipe.imageUrl || '';
        document.getElementById('recipe-image').style.display = 'block';
        document.getElementById('recipe-description').innerText = recipe.description;
        document.getElementById('recipe-ingredients').innerText = recipe.ingredients;
        document.getElementById('recipe-instructions').innerText = recipe.instructions;

    } catch (error) {
        console.error('Error fetching recipe details:', error);
        document.getElementById('recipe-title').innerText = "Error Loading Recipe";
    }
}


// Function to fetch the logged-in user's ID
async function fetchUserStatus() {
    // Get the elements created in recipe-detail.html
    const formContainer = document.getElementById('review-form-container');
    const loginMessage = document.getElementById('login-to-comment-message');

    try {
        const response = await fetch('/api/user/status', {
            credentials: 'include'  // Include session cookie
        });
        const data = await response.json();
        
        if (data.isLoggedIn) {
            currentUserId = data.userId;
            
            // 🟢 NEW: Show the form, hide the login prompt
            if (formContainer) formContainer.style.display = 'block';
            if (loginMessage) loginMessage.style.display = 'none';

        } else {
            // 🟢 NEW: Hide the form, show the login prompt
            if (formContainer) formContainer.style.display = 'none';
            if (loginMessage) loginMessage.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error fetching user status:', error);
        // Ensure the form is hidden if there is a network error
        if (formContainer) formContainer.style.display = 'none';
        if (loginMessage) loginMessage.style.display = 'block';
    }
}


// ----------------------------------------------------
// 🌟 REVIEW LOGIC 🌟
// ----------------------------------------------------

// 1. Add the delete logic GLOBALLY 
window.deleteReview = async function(id) {
    if(!confirm("Are you sure you want to delete this review?")) return;
    try {
        // Use the dedicated DELETE route
        const res = await fetch(`/api/reviews/${id}`, { 
            method: 'DELETE',
            credentials: 'include'  // Include session cookie
        });
        const data = await res.json();
        if(data.success) {
            alert("Review deleted successfully!");
            // Reload page to update the list
            location.reload(); 
        } else {
            alert("Failed to delete review: " + (data.message || "Server Error"));
        }
    } catch (err) {
        alert("Network Error: " + err.message);
    }
};


// 2. Fetch and display reviews
async function fetchAndDisplayReviews() {
    if (!recipeId) return;

    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '<p>Loading reviews...</p>';

    try {
        const response = await fetch(`/api/recipes/${recipeId}/reviews`, {
            credentials: 'include'  // Include session cookie
        });
        const reviews = await response.json();

        reviewsContainer.innerHTML = '';

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to share your thoughts!</p>';
            return;
        }

        reviews.forEach(review => {
            // Check if the current logged-in user wrote this review
            const isOwner = currentUserId && 
                            review.userId && 
                            review.userId.toString() === currentUserId.toString();
            
            let deleteButtonHTML = '';

            // Only display the button if the user is logged in AND is the owner
            if (isOwner) {
                deleteButtonHTML = `
                    <button 
                        onclick="deleteReview('${review._id}')"
                        style="float: right; background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">
                        DELETE
                    </button>
                `;
            }

            const div = document.createElement('div');
            div.classList.add('review-card');
            
            // Add some style to the card
            div.style.border = "1px solid #ddd";
            div.style.padding = "15px";
            div.style.marginBottom = "10px";
            div.style.backgroundColor = "#fff";
            div.style.borderRadius = "5px";

            div.innerHTML = `
                <div style="overflow:hidden; margin-bottom: 5px;">
                    <h3 style="float:left; margin:0;">${review.username}</h3>
                    ${deleteButtonHTML} 
                </div>
                <div style="color: gold;">${"⭐".repeat(review.rating || 0)}</div>
                <p>${review.text}</p>
                <small style="color: grey;">Posted on: ${new Date(review.createdAt).toLocaleDateString()}</small>
            `;

            reviewsContainer.appendChild(div);
        });

    } catch (err) {
        console.error('Error in fetchAndDisplayReviews:', err);
        reviewsContainer.innerHTML = '<p>Error loading reviews. Try refreshing the page.</p>';
    }
}

// ----------------------------------------------------
// 🌟 RUN ALL FUNCTIONS ON PAGE LOAD 🌟
// ----------------------------------------------------
async function initializePage() {
    // 1. Get user status first to populate currentUserId and show/hide form
    await fetchUserStatus();

    // 2. Fetch and display the main recipe details
    await fetchRecipeDetails();
    
    // 3. Fetch and display reviews (which relies on currentUserId)
    await fetchAndDisplayReviews();
    // Add a class so CSS animations run after content is populated
    const detailSection = document.querySelector('.recipe-detail-section');
    if (detailSection) {
        // Small timeout ensures DOM updates are painted before animation
        window.requestAnimationFrame(() => detailSection.classList.add('loaded'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    
    // Setup review form submission listener
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 🛑 CRITICAL FIX: The server will now get the username/userId from the session. 
            // We only need to send rating and text.
            const rating = document.getElementById('review-rating').value;
            const text = document.getElementById('review-text').value;

            try {
                const response = await fetch(`/api/recipes/${recipeId}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',  // Include session cookie
                    // 🛑 CRITICAL FIX: Only send rating and text
                    body: JSON.stringify({ rating, text }),
                });
                
                if (response.ok) {
                    alert('Review submitted successfully!');
                    reviewForm.reset();
                    // Reload reviews section instead of whole page for better UX
                    await fetchAndDisplayReviews(); 
                } else if (response.status === 401) {
                     // Handle unauthorized response from the server (if they bypass the hidden form)
                     alert('Failed to submit review. Please log in first.');
                }
                else {
                    alert('Failed to submit review. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                alert('An error occurred while submitting your review.');
            }
        });
    }
});