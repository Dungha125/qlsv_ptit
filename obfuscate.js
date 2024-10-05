const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Path to the build folder where React outputs JS files
const buildDir = path.join(__dirname, 'build/static/js');

// Read all files in the build directory
fs.readdirSync(buildDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(buildDir, file);
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Obfuscate the JavaScript code
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
      compact: true,  // Makes the code as compact as possible
      controlFlowFlattening: true,  // Makes the control flow harder to follow
    }).getObfuscatedCode();

    // Write the obfuscated code back to the file
    fs.writeFileSync(filePath, obfuscatedCode, 'utf-8');
    console.log(`Obfuscated: ${file}`);
  }
});
