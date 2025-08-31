// Comprehensive HIKERBOT USB Connection Test
const API_BASE_URL = 'http://localhost:5000';

async function testHikerbotUSBConnection() {
    console.log('🔍 HIKERBOT USB Connection Diagnostic Test');
    console.log('==========================================');
    console.log('');
    
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connectivity...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/get-image?path=test`);
        console.log('✅ Backend is running (got response)');
    } catch (error) {
        console.error('❌ Backend is not running:', error.message);
        console.log('💡 Please start the backend server first: cd backend && python camera_server.py');
        return;
    }
    
    // Test 2: Check camera settings
    console.log('');
    console.log('2️⃣ Checking camera settings...');
    const savedSettings = localStorage.getItem('cameraSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            console.log('📋 Camera settings found:', settings);
            if (settings.camera === 'HIKERBOT') {
                console.log('✅ HIKERBOT is configured as camera type');
            } else {
                console.log('⚠️ Camera type is:', settings.camera, '(should be HIKERBOT)');
            }
        } catch (error) {
            console.error('❌ Error parsing camera settings:', error);
        }
    } else {
        console.log('⚠️ No camera settings found in localStorage');
        console.log('💡 Please configure camera settings first (select HIKERBOT)');
    }
    
    // Test 3: Test HIKERBOT camera start
    console.log('');
    console.log('3️⃣ Testing HIKERBOT camera start...');
    try {
        console.log('🚀 Attempting to start HIKERBOT camera...');
        const response = await fetch(`${API_BASE_URL}/api/start-camera`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cameraType: 'HIKERBOT'
            })
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ HIKERBOT camera started successfully!');
            console.log('📊 Response data:', data);
            
            // Test 4: Check video feed
            console.log('');
            console.log('4️⃣ Testing video feed...');
            try {
                const videoResponse = await fetch(`${API_BASE_URL}/api/video-feed`);
                if (videoResponse.ok) {
                    console.log('✅ Video feed endpoint is accessible');
                    console.log('📹 Video feed URL: http://localhost:5000/api/video-feed');
                } else {
                    console.log('⚠️ Video feed endpoint returned status:', videoResponse.status);
                }
            } catch (error) {
                console.error('❌ Video feed test failed:', error.message);
            }
            
            // Test 5: Stop camera after 5 seconds
            setTimeout(async () => {
                try {
                    console.log('');
                    console.log('5️⃣ Stopping HIKERBOT camera...');
                    const stopResponse = await fetch(`${API_BASE_URL}/api/stop-camera`, {
                        method: 'POST'
                    });
                    
                    if (stopResponse.ok) {
                        const stopData = await stopResponse.json();
                        console.log('✅ Camera stopped successfully:', stopData);
                    } else {
                        console.log('⚠️ Camera stop returned status:', stopResponse.status);
                    }
                } catch (error) {
                    console.error('❌ Error stopping camera:', error);
                }
            }, 5000);
            
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to start HIKERBOT camera');
            console.error('📄 Error response:', errorText);
            
            // Provide troubleshooting tips
            console.log('');
            console.log('🔧 USB Connection Troubleshooting Tips:');
            console.log('1. Make sure HIKERBOT camera is physically connected via USB');
            console.log('2. Check if USB cable is properly seated and not loose');
            console.log('3. Try a different USB port (preferably USB 3.0)');
            console.log('4. Check if camera is not being used by another application');
            console.log('5. Verify HIKERBOT drivers are installed (we installed 16 DLL files)');
            console.log('6. Try unplugging and reconnecting the USB cable');
            console.log('7. Check Device Manager for any USB device errors');
            console.log('8. Restart the backend server after connecting the camera');
        }
    } catch (error) {
        console.error('❌ Network error during camera start:', error.message);
        console.log('💡 Make sure the backend server is running on port 5000');
    }
}

// Run the diagnostic test
testHikerbotUSBConnection();
