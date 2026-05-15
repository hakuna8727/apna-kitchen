// public/js/my-recipes.js
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + `... <a href="#" onclick="var a=this.closest('.recipe-card').querySelector('a.read-more'); if(a) window.location.href=a.href; return false;"><b>Read more</b></a>`;
    }
    return text;
}
document.addEventListener('DOMContentLoaded', () => {
    const recipesContainer = document.getElementById('recipes-container');

    fetch('/api/my-recipes', {
        credentials: 'include'  // Send cookies with request
    })
        .then(response => response.json())
        .then(recipes => {
            if (recipes.length === 0) {
                recipesContainer.innerHTML = '<p>You have not submitted any recipes yet.</p>';
                return;
            }

            recipes.forEach(recipe => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';
                recipeCard.innerHTML = `
                    <img src="${recipe.imageUrl}" alt="${recipe.title}">
                    <h3>${truncateText(recipe.title || '', 50)}</h3>
                    <p>${truncateText(recipe.description || '', 80)}</p>
                    <a href="recipe-detail.html?id=${recipe._id}" class="read-more">View Recipe</a>
                    <div class="card-actions">
                        <button class="edit-btn" data-id="${recipe._id}">Edit</button>
                        <button class="delete-btn" data-id="${recipe._id}">Delete</button>
                    </div>
                `;
                recipesContainer.appendChild(recipeCard);
            });

            // Add event listeners for the new buttons
            recipesContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    const recipeId = e.target.dataset.id;
                    if (confirm('Are you sure you want to delete this recipe?')) {
                        deleteRecipe(recipeId);
                    }
                }
                if (e.target.classList.contains('edit-btn')) {
                    const recipeId = e.target.dataset.id;
                    editRecipe(recipeId);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            recipesContainer.innerHTML = '<p style = color:red;>You need to login first.</p>';
        });

    function deleteRecipe(id) {
        fetch(`/api/recipes/${id}`, {
            method: 'DELETE',
            credentials: 'include'  // Send cookies with request
        })
        .then(response => {
            if (response.ok) {
                // Remove the recipe card from the page
                window.location.reload(); // A simple way to refresh and show changes
            } else {
                alert('Error deleting recipe.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting recipe.');
        });
    }

    function editRecipe(id) {
        // Redirect to the edit page with the recipe ID in the URL
        window.location.href = `/edit-recipe.html?id=${id}`;
    }
});
