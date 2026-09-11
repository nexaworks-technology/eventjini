const fs = require('fs');
const file = 'src/app/e/[slug]/registration-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: setShowGuestForm -> setShowForm (line 64)
content = content.replace(/setShowGuestForm\(true\);/g, 'setShowForm(true);');

// Fix 2: The malformed {!isLoggedIn && (<div inside the ternary on line 263
content = content.replace(/\{!isLoggedIn && \(<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/g, '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">');

// Fix 3: Button onClick logic (line 355)
content = content.replace(/showForm && !isLoggedIn/g, 'showForm');

// Fix 4: Button text logic (line 363)
content = content.replace(/\(!isLoggedIn && !showForm\)/g, '(needsForm && !showForm)');

fs.writeFileSync(file, content);
