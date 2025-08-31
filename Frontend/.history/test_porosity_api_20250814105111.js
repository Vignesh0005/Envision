// Test script to verify porosity API endpoints
const API_BASE_URL = 'http://localhost:5000';

async function testPorosityAPI() {
    console.log('Testing Porosity API endpoints...');
    
    // Test 1: Check if server is running
    try {
        const response = await fetch(`${API_BASE_URL}/api/get-image?path=test`);
        console.log('✅ Server is running');
        console.log('Response status:', response.status);
    } catch (error) {
        console.error('❌ Server connection failed:', error);
        return;
    }
    
    // Test 2: Test histogram endpoint with a dummy path
    try {
        const response = await fetch(`${API_BASE_URL}/api/porosity/get-histogram`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_path: 'test_image.jpg' })
        });
        
        const data = await response.json();
        console.log('✅ Histogram endpoint response:', data);
    } catch (error) {
        console.error('❌ Histogram endpoint failed:', error);
    }
    
    // Test 3: Test intensity threshold endpoint
    try {
        const response = await fetch(`${API_BASE_URL}/api/porosity/apply-intensity-threshold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                image_path: 'test_image.jpg',
                min_threshold: 0,
                max_threshold: 255,
                features: 'dark'
            })
        });
        
        const data = await response.json();
        console.log('✅ Intensity threshold endpoint response:', data);
    } catch (error) {
        console.error('❌ Intensity threshold endpoint failed:', error);
    }
}

// Run the test
testPorosityAPI();
