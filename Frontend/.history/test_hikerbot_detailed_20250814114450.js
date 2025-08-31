// Detailed HIKERBOT Camera Test
const API_BASE_URL = 'http://localhost:5000';

async function testHikerbotDetailed() {
    console.log('🔍 Detailed HIKERBOT Camera Diagnostic');
    console.log('=====================================');
    console.log('');
    
    // Test 1: Check backend status
    console.log('1️⃣ Backend Status Check...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/get-image?path=test`);
        console.log('✅ Backend is responding');
    } catch (error) {
        console.error('❌ Backend not responding:', error.message);
        return;
    }
    
    // Test 2: Test camera start with detailed error handling
    console.log('');
    console.log('2️⃣ HIKERBOT Camera Start Test...');
    try {
        console.log('🚀 Sending start camera request...');
        const startTime = Date.now();
        
        const response = await fetch(`${API_BASE_URL}/api/start-camera`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cameraType: 'HIKERBOT'
            })
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`📡 Response received in ${responseTime}ms`);
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📄 Raw response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📊 Parsed response:', data);
        } catch (parseError) {
            console.log('⚠️ Response is not valid JSON');
        }
        
        if (response.ok && data && data.status === 'success') {
            console.log('✅ HIKERBOT camera started successfully!');
            
            // Test video feed
            console.log('');
            console.log('3️⃣ Testing video feed...');
            try {
                const videoResponse = await fetch(`${API_BASE_URL}/api/video-feed`);
                console.log('📹 Video feed status:', videoResponse.status);
                
                if (videoResponse.ok) {
                    console.log('✅ Video feed is working');
                    console.log('🎥 You should see video at: http://localhost:5000/api/video-feed');
                } else {
                    console.log('⚠️ Video feed not accessible');
                }
            } catch (videoError) {
                console.error('❌ Video feed error:', videoError.message);
            }
            
            // Stop camera after 3 seconds
            setTimeout(async () => {
                try {
                    console.log('');
                    console.log('4️⃣ Stopping camera...');
                    const stopResponse = await fetch(`${API_BASE_URL}/api/stop-camera`, {
                        method: 'POST'
                    });
                    
                    if (stopResponse.ok) {
                        console.log('✅ Camera stopped successfully');
                    } else {
                        console.log('⚠️ Camera stop failed:', stopResponse.status);
                    }
                } catch (stopError) {
                    console.error('❌ Stop camera error:', stopError.message);
                }
            }, 3000);
            
        } else {
            console.log('❌ Camera start failed');
            console.log('');
            console.log('🔧 USB Connection Troubleshooting:');
            console.log('');
            console.log('📋 Hardware Checks:');
            console.log('• Is the HIKERBOT camera physically connected via USB?');
            console.log('• Is the USB cable properly seated?');
            console.log('• Try a different USB port (preferably USB 3.0)');
            console.log('• Check if the camera has power (LED indicator)');
            console.log('');
            console.log('🔧 Software Checks:');
            console.log('• Check Device Manager for USB device errors');
            console.log('• Make sure no other application is using the camera');
            console.log('• Try unplugging and reconnecting the USB cable');
            console.log('• Restart the backend server after connecting');
            console.log('');
            console.log('📋 Driver Checks:');
            console.log('• We installed 16 HIKERBOT SDK DLL files');
            console.log('• Check if HIKERBOT drivers are properly installed');
            console.log('• Try reinstalling HIKERBOT drivers from manufacturer');
            console.log('');
            console.log('💡 Next Steps:');
            console.log('1. Check the backend console for detailed error messages');
            console.log('2. Verify camera settings in the frontend (select HIKERBOT)');
            console.log('3. Try connecting the camera before starting the backend');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
        console.log('💡 Make sure the backend server is running');
    }
}

// Run the test
testHikerbotDetailed();
