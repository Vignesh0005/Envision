const fs = require('fs');
const path = require('path');

const sourceDir = 'C:/Program Files (x86)/Common Files/MVS/Runtime/Win64_x64/';
const targetDir = path.join(__dirname, '../backend/dist');

// List of essential HIKERBOT SDK DLL files
const requiredDlls = [
    'MvCameraControl.dll',
    'GenApi_MD_VC120_v3_0_MV.dll',
    'GCBase_MD_VC120_v3_0_MV.dll',
    'CLAllSerial_MD_VC120_v3_0_MV.dll',
    'CLProtocol_MD_VC120_v3_0_MV.dll',
    'CLSerCOM.dll',
    'CLSerHvc.dll',
    'FormatConversion.dll',
    'MediaProcess.dll',
    'Log_MD_VC120_v3_0_MV.dll',
    'log4cpp_MD_VC120_v3_0_MV.dll',
    'MathParser_MD_VC120_v3_0_MV.dll',
    'libusb0.dll',
    'libwinpthread-1.dll',
    'libmmd.dll',
    'avutil-57.dll'
];

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('Created target directory:', targetDir);
}

console.log('Installing HIKERBOT SDK files...');
console.log('Source:', sourceDir);
console.log('Target:', targetDir);
console.log('');

let successCount = 0;
let errorCount = 0;

// Copy each required DLL file
requiredDlls.forEach(dllName => {
    const sourcePath = path.join(sourceDir, dllName);
    const targetPath = path.join(targetDir, dllName);
    
    try {
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`✅ Copied: ${dllName}`);
            successCount++;
        } else {
            console.log(`⚠️  Not found: ${dllName}`);
            errorCount++;
        }
    } catch (error) {
        console.log(`❌ Error copying ${dllName}:`, error.message);
        errorCount++;
    }
});

console.log('');
console.log('Installation Summary:');
console.log(`✅ Successfully copied: ${successCount} files`);
console.log(`❌ Errors: ${errorCount} files`);

if (successCount > 0) {
    console.log('');
    console.log('🎉 HIKERBOT SDK installation completed!');
    console.log('You can now test HIKERBOT camera connection in your application.');
} else {
    console.log('');
    console.log('❌ Installation failed. Please check if HIKERBOT SDK is properly installed.');
    process.exit(1);
}
