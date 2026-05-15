// public/js/recipes.js

document.addEventListener('DOMContentLoaded', () => {
    const recipesContainer = document.getElementById('recipes-container');
    // Note: The main recipe container in your HTML is actually #recipe-container, 
    // but recipes.js is likely intended for the grid in the main section.
    // Assuming recipesContainer is the correct target for the grid display.
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const categorySelect = document.getElementById('categorySelect');
    
    // 🌟 NEW: Define the maximum length for the displayed description 🌟
    const MAX_DESC_LENGTH = 100;

    // 🌟 NEW: Truncation helper function 🌟
    function truncateText(text, maxLength) {
        if (text && text.length > maxLength) {
            return text.substring(0, maxLength).trim() + "... <a href=\"#\" class=\"read-more-inline\" onclick=\"var link=this.closest('.recipe-card').querySelector('.read-more'); if(link) location.href=link.href; return false;\">Read more</a>";
        }
        return text;
    }

    function fetchRecipes(query = '') {
        let url = '/api/recipes';
        if (query) {
            url += `?search=${encodeURIComponent(query)}`;
        }

        fetch(url, {
            credentials: 'include'  // Include session cookie
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(recipes => {
                recipesContainer.innerHTML = '';
                if (!Array.isArray(recipes) || recipes.length === 0) {
                    recipesContainer.innerHTML = '<p>No recipes found.</p>';
                    return;
                }

                // Category filtering: check for a category select on the page
                const categorySelect = document.getElementById('categorySelect');
                const selectedCat = categorySelect ? (categorySelect.value || 'any') : 'any';

                // keyword map used to infer category when recipe.category is missing
                const CATEGORY_KEYWORDS = {
                    soups: ['soup','broth','bisque','consomm','stock'],
                    stews: ['stew','curry','ragout'],
                    grains: ['rice','pilaf','risotto','quinoa','couscous','grain','starch','noodle','pasta'],
                    baked: ['bread','cake','bake','pastry','cookie','pie','tart'],
                    meal: ['tofu','paneer','dal','lentil','casserole','main','entree','dinner','lunch','mutton','turkey','duck','cutlet','fillet','kebab','burger','sandwich','wrap','biryani','curry','gravy','masala'],
                    salads: ['salad','side','coleslaw','greens'],
                    desserts: ['dessert','pudding','sweet','tart','cake','pie','ice cream']
                };

                function inferCategoryForRecipe(r){
                    if(!r) return 'any';
                    if(r.category) return String(r.category).toLowerCase();
                    const bag = ((r.title||'') + ' ' + (r.description||'') + ' ' + (r.ingredients||'')).toLowerCase();
                    for(const cat of Object.keys(CATEGORY_KEYWORDS)){
                        if(CATEGORY_KEYWORDS[cat].some(k => bag.indexOf(k) !== -1)) return cat;
                    }
                    return 'any';
                }

                // apply category filtering if a category was selected
                let filtered = recipes.slice();
                if (selectedCat && selectedCat !== 'any'){
                    filtered = filtered.filter(r => {
                        const cat = inferCategoryForRecipe(r) || 'any';
                        return cat === selectedCat;
                    });
                }

                if (filtered.length === 0){
                    recipesContainer.innerHTML = '<p>No recipes found for the selected filters.</p>';
                    return;
                }

                filtered.forEach(recipe => {
                    // 🌟 NEW: Apply truncation before rendering 🌟
                    const truncatedDescription = truncateText(recipe.description, MAX_DESC_LENGTH);
                    const categoryLabel = (recipe.category && String(recipe.category)) || inferCategoryForRecipe(recipe) || '';
                    
                    const recipeCard = document.createElement('div');
                    recipeCard.className = 'recipe-card';
                    recipeCard.innerHTML = `
                        <img src="${recipe.imageUrl}" alt="${recipe.title}">
                        <h3>${recipe.title}</h3>
                        <p>${truncatedDescription}</p>
                        <div class="card-meta"><span class="card-category">${categoryLabel || ''}</span></div>
                        <a href="recipe-detail.html?id=${recipe._id}" class="read-more">View Recipe</a>
                    `;
                    recipesContainer.appendChild(recipeCard);
                });
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                recipesContainer.innerHTML = '<p>An error occurred while loading recipes.</p>';
            });
    }

    fetchRecipes();

    // Debounce helper to avoid flooding the server while typing
    function debounce(fn, wait) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    const debouncedFetch = debounce((q) => fetchRecipes(q), 250);

    // Live search: trigger on input and send queries even for single characters
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length === 0) {
            // show all when input cleared
            fetchRecipes('');
            return;
        }
        // Use debounced fetch so rapid typing doesn't hammer the API
        debouncedFetch(query);
    });

    // When category selection changes, immediately refresh results
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            const q = (searchInput && searchInput.value.trim()) || '';
            // call fetchRecipes directly so the fetched results are filtered by selected category
            fetchRecipes(q);
        });
    }

    // Keep existing button/enter behaviour for accessibility
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        fetchRecipes(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            fetchRecipes(query);
        }
    });
});
