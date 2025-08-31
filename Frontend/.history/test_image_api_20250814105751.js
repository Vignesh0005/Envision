// Test script to verify image listing API
const API_BASE_URL = 'http://localhost:5000';

async function testImageAPI() {
    console.log('Testing Image API endpoints...');
    
    // Test 1: List images from the default folder
    try {
        const response = await fetch(`${API_BASE_URL}/api/list-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                path: 'C:\\Users\\Public\\MicroScope_Images',
                filters: {
                    extensions: ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
                }
            })
        });
        
        const data = await response.json();
        console.log('✅ List images response:', data);
        
        if (data.status === 'success' && data.images && data.images.length > 0) {
            console.log(`Found ${data.images.length} images`);
            
            // Test 2: Try to get the first image
            const firstImage = data.images[0];
            console.log('Testing with image:', firstImage.path);
            
            const imageResponse = await fetch(`${API_BASE_URL}/api/get-image?path=${encodeURIComponent(firstImage.path)}`);
            console.log('✅ Get image response status:', imageResponse.status);
            
            if (imageResponse.ok) {
                console.log('✅ Image fetch successful');
            } else {
                console.log('❌ Image fetch failed');
            }
        } else {
            console.log('❌ No images found or API error');
        }
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

// Run the test
testImageAPI();
