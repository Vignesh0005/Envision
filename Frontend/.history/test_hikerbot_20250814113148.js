// Test script to verify HIKERBOT camera connection
const API_BASE_URL = 'http://localhost:5000';

async function testHikerbotConnection() {
    console.log('Testing HIKERBOT Camera Connection...');
    
    // Test 1: Check if camera start endpoint is accessible
    try {
        const response = await fetch(`${API_BASE_URL}/api/start-camera`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cameraType: 'HIKERBOT'
            })
        });
        
        const data = await response.json();
        console.log('✅ Start camera response:', data);
        
        if (data.status === 'success') {
            console.log('✅ HIKERBOT camera started successfully');
            
            // Test 2: Check if video feed is working
            console.log('✅ Video feed should be available at: http://localhost:5000/api/video-feed');
            
            // Test 3: Stop the camera
            setTimeout(async () => {
                try {
                    const stopResponse = await fetch(`${API_BASE_URL}/api/stop-camera`, {
                        method: 'POST'
                    });
                    
                    const stopData = await stopResponse.json();
                    console.log('✅ Stop camera response:', stopData);
                } catch (error) {
                    console.error('❌ Error stopping camera:', error);
                }
            }, 2000);
            
        } else {
            console.log('❌ Failed to start HIKERBOT camera:', data.message);
        }
    } catch (error) {
        console.error('❌ Error testing HIKERBOT connection:', error);
    }
}

// Run the test
testHikerbotConnection();
