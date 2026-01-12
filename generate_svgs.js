const fs = require('fs');
const path = require('path');

const outputDir = 'c:/Users/Public/thelokals.com/apps/web-client/public/images/services';
const primaryColor = '#00BCD4'; // Teal

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const template = (content) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#ffffff"/>
  <rect width="800" height="600" fill="${primaryColor}" fill-opacity="0.05"/>
  <circle cx="400" cy="300" r="200" fill="${primaryColor}" fill-opacity="0.1"/>
  <g transform="translate(250, 150) scale(3)" fill="none" stroke="${primaryColor}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    ${content}
  </g>
</svg>
`;

const icons = {
    'plumber': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M10 12V2"/><path d="M14 2c0 2-2 2-2 2H8c0-2-2-4-2-4"/>',
    'electrician': '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    'maid': '<path d="M16 2v6"/><path d="M3 21a11 11 0 0 1 11-11h1a11 11 0 0 1 11 11"/><path d="M16 8v3"/>',
    'carpenter': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>',
    'painter': '<path d="M10 2v7.31"/><path d="M6 14v6"/><path d="M14 14v6"/><rect x="2" y="9.31" width="16" height="4.69" rx="2"/>',
    'gardener': '<path d="M12 22v-9"/><path d="M12 13s-4-3-4-9a4 4 0 0 1 8 0c0 6-4 9-4 9z"/>',
    'house-cleaning': '<path d="M3 3h18v18H3z"/>',
    'laundry-service': '<rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M12 18a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>',
    'pest-control': '<path d="M12 2v2"/><path d="M12 20v2"/><path d="M4 12H2"/><path d="M22 12h-2"/><path d="M19.07 4.93L17.66 6.34"/><path d="M4.93 19.07l1.41-1.41"/><path d="M4.93 4.93l1.41 1.41"/><path d="M19.07 19.07l-1.41-1.41"/>',
    'locksmith': '<circle cx="12" cy="10" r="3"/><path d="M12 13v6"/><path d="M12 22h3"/>',
    'packers-movers': '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    'mechanic': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    'driver': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M22 12h-3"/><path d="M5 12H2"/>',
    'bike-repair': '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>',
    'roadside-assistance': '<rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'tutor': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    'fitness-trainer': '<path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M9 2v20"/><path d="M15 2v20"/>',
    'doctor': '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="4" y="6" width="16" height="16" rx="2"/><path d="M12 11v6"/><path d="M9 14h6"/>',
    'beautician': '<circle cx="12" cy="12" r="10"/><path d="M12 16a4 4 0 0 0 4-2.43"/>',
    'babysitter': '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>',
    'pet-sitter': '<path d="M12 2l3 5h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/>',
    'cook': '<path d="M6 13.87A8 8 0 0 1 6 10a6 6 0 0 1 12 0 8 8 0 0 1 0 3.87"/><path d="M6 13.87h12"/><path d="M6 17h12"/>',
    'security': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'photography': '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    'videography': '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 16l-6-3.5v-5L22 4v12z"/>',
    'appliance-repair': '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/>',
    'bike-rental': '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>',
    'car-rental': '<rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'car-washing': '<rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><path d="M8 8v4"/><path d="M12 8v4"/>',
    'bike-wash': '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M8 8v4"/>',
};

// Generate SVGs
Object.entries(icons).forEach(([name, svgPath]) => {
    const fileName = `${name}.svg`;
    const content = template(svgPath);
    fs.writeFileSync(path.join(outputDir, fileName), content.trim());
    console.log(`Generated ${fileName}`);
});

console.log('Done generating SVGs.');
