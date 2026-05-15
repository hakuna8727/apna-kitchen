// public/js/edit-recipe.js

document.addEventListener('DOMContentLoaded', () => {
	const params = new URLSearchParams(window.location.search);
	const recipeId = params.get('id');

	const form = document.getElementById('edit-recipe-form');
	const titleEl = document.getElementById('title');
	const descEl = document.getElementById('description');
	const ingrEl = document.getElementById('ingredients');
	const instrEl = document.getElementById('instructions');
	const imageUrlEl = document.getElementById('imageUrl');
	const imagePreview = document.getElementById('image-preview-edit');
	const categoryEl = document.getElementById('category');
	const statusMsg = document.getElementById('status-message');

	function showStatus(msg, isError){
		if(!statusMsg) return;
		statusMsg.textContent = msg || '';
		statusMsg.style.color = isError ? 'red' : 'green';
	}

	async function loadRecipe(){
		if(!recipeId) return;
		try{
			const res = await fetch(`/api/recipes/${recipeId}`, {
				credentials: 'include'  // Include session cookie
			});
			if(!res.ok) throw new Error('Recipe not found');
			const r = await res.json();
			titleEl.value = r.title || '';
			descEl.value = r.description || '';
			ingrEl.value = r.ingredients || '';
			instrEl.value = r.instructions || '';
			imageUrlEl.value = r.imageUrl || '';
			if(categoryEl) categoryEl.value = r.category || '';
			if(r.imageUrl && imagePreview){
				imagePreview.innerHTML = `<img src="${r.imageUrl}" alt="preview" style="max-width:200px; max-height:160px;">`;
			}
		}catch(err){
			console.error('Failed to load recipe:', err);
			showStatus('Failed to load recipe data.', true);
		}
	}

	// submit updated recipe
	if(form){
		form.addEventListener('submit', async (e)=>{
			e.preventDefault();
			if(!recipeId) return showStatus('Missing recipe id', true);

			const payload = {
				title: titleEl.value,
				description: descEl.value,
				ingredients: ingrEl.value,
				instructions: instrEl.value,
				imageUrl: imageUrlEl.value,
				category: categoryEl ? categoryEl.value : undefined
			};

			try{
				const res = await fetch(`/api/recipes/${recipeId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',  // Include session cookie
					body: JSON.stringify(payload)
				});
				if(!res.ok){
					const err = await res.text().catch(()=>null);
					throw new Error(err || 'Update failed');
				}
				showStatus('Recipe updated successfully.');
				// optionally redirect back to my-recipes or detail page
				setTimeout(()=> window.location.href = `/recipe-detail.html?id=${recipeId}`, 900);
			}catch(err){
				console.error('Update error:', err);
				showStatus('Failed to update recipe.', true);
			}
		});
	}

	// wire simple image preview when URL changes
	if(imageUrlEl && imagePreview){
		imageUrlEl.addEventListener('input', ()=>{
			const v = imageUrlEl.value.trim();
			if(!v) { imagePreview.innerHTML = ''; return; }
			imagePreview.innerHTML = `<img src="${v}" alt="preview" style="max-width:200px; max-height:160px;">`;
		});
	}

	loadRecipe();
});

