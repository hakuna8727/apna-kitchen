const APNA_AVATARS = [
    { id: 'chef-classic', name: 'Classic Chef', initials: 'CC', personality: 'friendly', color: '#e67e22' },
    { id: 'quick-cook', name: 'Quick Cook', initials: 'QC', personality: 'fast', color: '#3498db' },
    { id: 'spice-master', name: 'Spice Master', initials: 'SM', personality: 'bold', color: '#c0392b' },
    { id: 'sweet-baker', name: 'Sweet Baker', initials: 'SB', personality: 'sweet', color: '#d35488' },
    { id: 'healthy-green', name: 'Healthy Green', initials: 'HG', personality: 'healthy', color: '#27ae60' },
    { id: 'family-feast', name: 'Family Feast', initials: 'FF', personality: 'caring', color: '#8e44ad' },
    { id: 'street-foodie', name: 'Street Foodie', initials: 'SF', personality: 'adventurous', color: '#f39c12' },
    { id: 'royal-thali', name: 'Royal Thali', initials: 'RT', personality: 'premium', color: '#7f4f24' },
    { id: 'student-snack', name: 'Student Snack', initials: 'SS', personality: 'simple', color: '#16a085' },
    { id: 'night-craver', name: 'Night Craver', initials: 'NC', personality: 'chill', color: '#34495e' },
    { id: 'party-planner', name: 'Party Planner', initials: 'PP', personality: 'social', color: '#e84393' },
    { id: 'grandma-secret', name: 'Grandma Secret', initials: 'GS', personality: 'traditional', color: '#a05a2c' }
];

const PERSONALITY_LABELS = {
    friendly: 'Friendly',
    fast: 'Fast',
    bold: 'Bold',
    sweet: 'Sweet',
    healthy: 'Healthy',
    caring: 'Caring',
    adventurous: 'Adventurous',
    premium: 'Premium',
    simple: 'Simple',
    chill: 'Chill',
    social: 'Social',
    traditional: 'Traditional'
};

function getApnaAvatar(avatarId) {
    return APNA_AVATARS.find((avatar) => avatar.id === avatarId) || APNA_AVATARS[0];
}

function createAvatarBadge(avatarId, sizeClass = '') {
    const avatar = getApnaAvatar(avatarId);
    const badge = document.createElement('span');
    badge.className = `avatar-badge ${sizeClass}`.trim();
    badge.style.setProperty('--avatar-color', avatar.color);
    badge.textContent = avatar.initials;
    badge.title = avatar.name;
    return badge;
}
