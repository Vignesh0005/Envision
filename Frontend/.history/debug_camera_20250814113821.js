// Debug script to check camera settings and test connection
console.log('🔍 Debugging Camera Settings...');

// Check localStorage
const savedSettings = localStorage.getItem('cameraSettings');
console.log('📋 Saved camera settings:', savedSettings);

if (savedSettings) {
    try {
        const settings = JSON.parse(savedSettings);
        console.log('📊 Parsed settings:', settings);
        console.log('📷 Camera type:', settings.camera);
        console.log('📐 Resolution:', settings.resolution);
    } catch (error) {
        console.error('❌ Error parsing settings:', error);
    }
} else {
    console.log('⚠️ No camera settings found in localStorage');
}

// Test camera start with explicit HIKERBOT type
async function testCameraStart() {
    console.log('🚀 Testing camera start with explicit HIKERBOT type...');
    
    try {
        const response = await fetch('http://localhost:5000/api/start-camera', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cameraType: 'HIKERBOT'
            })
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Camera started successfully:', data);
        } else {
            const errorText = await response.text();
            console.error('❌ Camera start failed:', errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Run the test
testCameraStart();
