// Deployment Validation Script
// This script checks if the footer and all functionality is working correctly

console.log('🚀 FOOTER DEPLOYMENT VALIDATION STARTED');
console.log('========================================');

// Check 1: Footer exists
const footer = document.querySelector('footer[role="contentinfo"]');
if (footer) {
    console.log('✅ Footer element found');
    
    // Check footer content
    const brand = footer.querySelector('.footer-brand h3');
    const version = footer.querySelector('.footer-brand p');
    const email = footer.querySelector('.footer-contact a[href^="mailto:"]');
    const copyright = footer.querySelector('.footer-legal p');
    const privacyBtn = footer.querySelector('button[onclick*="mostrarPoliticaPrivacidade"]');
    const termsBtn = footer.querySelector('button[onclick*="mostrarTermosUso"]');
    
    console.log('📝 Footer Content Validation:');
    console.log('  - Brand:', brand?.textContent || 'Missing');
    console.log('  - Version:', version?.textContent || 'Missing');
    console.log('  - Email:', email?.href || 'Missing');
    console.log('  - Copyright:', copyright?.textContent || 'Missing');
    console.log('  - Privacy Button:', privacyBtn ? 'Found' : 'Missing');
    console.log('  - Terms Button:', termsBtn ? 'Found' : 'Missing');
    
} else {
    console.log('❌ Footer element NOT found');
}

// Check 2: Footer functions exist
if (typeof mostrarPoliticaPrivacidade === 'function') {
    console.log('✅ Privacy Policy function exists');
} else {
    console.log('❌ Privacy Policy function missing');
}

if (typeof mostrarTermosUso === 'function') {
    console.log('✅ Terms of Use function exists');
} else {
    console.log('❌ Terms of Use function missing');
}

// Check 3: CSS styling
const footerStyles = getComputedStyle(footer);
console.log('🎨 Footer Styling:');
console.log('  - Display:', footerStyles.display);
console.log('  - Background:', footerStyles.backgroundColor);
console.log('  - Padding:', footerStyles.padding);

// Check 4: Responsive behavior
console.log('📱 Responsive Check:');
console.log('  - Viewport width:', window.innerWidth);
console.log('  - Footer width:', footer.offsetWidth);

// Check 5: Dark mode support
const isDarkMode = document.documentElement.classList.contains('dark') || 
                   document.body.classList.contains('dark-mode');
console.log('🌙 Dark Mode:', isDarkMode ? 'Active' : 'Inactive');

console.log('========================================');
console.log('🏁 VALIDATION COMPLETE');

// Return summary
return {
    footerExists: !!footer,
    functionsExist: typeof mostrarPoliticaPrivacidade === 'function' && typeof mostrarTermosUso === 'function',
    timestamp: new Date().toISOString(),
    buildVersion: document.querySelector('meta[name="version"]')?.content || 'Unknown'
};
