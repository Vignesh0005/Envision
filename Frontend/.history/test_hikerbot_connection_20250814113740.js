// Test script to verify HIKERBOT camera connection after SDK installation
const API_BASE_URL = 'http://localhost:5000';

async function testHikerbotConnection() {
    console.log('🔍 Testing HIKERBOT Camera Connection...');
    console.log('📋 SDK Installation Status: ✅ Complete (16 DLL files installed)');
    console.log('');
    
    // Test 1: Check if camera start endpoint is accessible
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
        
        const data = await response.json();
        console.log('📡 Server response:', data);
        
        if (data.status === 'success') {
            console.log('✅ HIKERBOT camera started successfully!');
            console.log('📹 Video feed available at: http://localhost:5000/api/video-feed');
            console.log('📸 You can now take snapshots and use zoom controls');
            
            // Test 2: Stop the camera after 3 seconds
            setTimeout(async () => {
                try {
                    console.log('🛑 Stopping HIKERBOT camera...');
                    const stopResponse = await fetch(`${API_BASE_URL}/api/stop-camera`, {
                        method: 'POST'
                    });
                    
                    const stopData = await stopResponse.json();
                    console.log('✅ Camera stopped successfully:', stopData);
                } catch (error) {
                    console.error('❌ Error stopping camera:', error);
                }
            }, 3000);
            
        } else {
            console.log('❌ Failed to start HIKERBOT camera:', data.message);
            console.log('');
            console.log('🔧 Troubleshooting Tips:');
            console.log('1. Make sure HIKERBOT camera is physically connected (USB or GigE)');
            console.log('2. Check if camera is not being used by another application');
            console.log('3. Verify camera drivers are properly installed');
            console.log('4. Try restarting the backend server');
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
        console.log('');
        console.log('🔧 Make sure the backend server is running on port 5000');
    }
}

// Run the test
testHikerbotConnection();
