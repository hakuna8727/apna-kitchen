#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

// Usage:
//  node scripts/infer_categories.js        -> dry-run, shows counts and sample updates
//  node scripts/infer_categories.js --apply -> actually updates documents

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/apna_kitchen';
const doApply = process.argv.includes('--apply');

const CATEGORY_KEYWORDS = {
    soups: ['soup','broth','bisque','consomm','stock'],
    stews: ['stew','curry','ragout'],
    grains: ['rice','pilaf','risotto','quinoa','couscous','grain','starch','noodle','pasta'],
    baked: ['bread','cake','bake','pastry','cookie','pie','tart'],
    meat: ['chicken','beef','pork','lamb','meat','steak','roast'],
    salads: ['salad','side','coleslaw','greens'],
    desserts: ['dessert','pudding','sweet','tart','cake','pie','ice cream']
};

function inferCategory(recipe){
    if(!recipe) return 'any';
    if(recipe.category) return String(recipe.category).toLowerCase();
    const bag = ((recipe.title||'') + ' ' + (recipe.description||'') + ' ' + (recipe.ingredients||'')).toLowerCase();
    for(const cat of Object.keys(CATEGORY_KEYWORDS)){
        const keys = CATEGORY_KEYWORDS[cat];
        if(keys.some(k => bag.indexOf(k) !== -1)) return cat;
    }
    return 'any';
}

async function run(){
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const recipeSchema = new mongoose.Schema({}, { strict: false, collection: 'recipes' });
    const Recipe = mongoose.model('RecipeForInfer', recipeSchema);

    const all = await Recipe.find({}).lean().exec();
    console.log(`Found ${all.length} recipes in DB`);

    const toUpdate = [];
    for(const r of all){
        const current = r.category ? String(r.category).toLowerCase() : '';
        if(!current || current === 'uncategorized' || current === 'any'){
            const inferred = inferCategory(r);
            if(inferred && inferred !== 'any'){
                toUpdate.push({ id: r._id, inferred });
            }
        }
    }

    console.log(`Candidates to update: ${toUpdate.length}`);
    if(toUpdate.length){
        console.log('Sample updates (first 10):');
        toUpdate.slice(0,10).forEach(u => console.log(` - ${u.id} -> ${u.inferred}`));
    }

    if(!doApply){
        console.log('\nDry-run mode. To apply updates, re-run with: node scripts/infer_categories.js --apply');
        await mongoose.disconnect();
        return;
    }

    console.log('\nApplying updates...');
    let applied = 0;
    for(const u of toUpdate){
        try{
            const res = await Recipe.updateOne({ _id: u.id }, { $set: { category: u.inferred } }).exec();
            if(res.modifiedCount && res.modifiedCount > 0) applied++;
        }catch(err){
            console.error('Failed to update', u.id, err.message);
        }
    }
    console.log(`Applied updates: ${applied}/${toUpdate.length}`);
    await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
