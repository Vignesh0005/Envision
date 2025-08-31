// Test script to verify image import functionality
const API_BASE_URL = 'http://localhost:5000';

async function testImageImport() {
    console.log('Testing Image Import functionality...');
    
    // Test 1: Check if import endpoint is accessible
    try {
        const response = await fetch(`${API_BASE_URL}/api/import-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // This should fail because we're not sending a file, but it should reach the endpoint
        console.log('✅ Import endpoint is accessible, status:', response.status);
    } catch (error) {
        console.error('❌ Import endpoint failed:', error);
    }
    
    // Test 2: Check if get-image endpoint works with a known image
    try {
        const testImagePath = 'C:\\Users\\Public\\MicroScope_Images\\8fb80710-6dd7-4657-bbec-4deab7fa27d9_20250814_105606.jpg';
        const response = await fetch(`${API_BASE_URL}/api/get-image?path=${encodeURIComponent(testImagePath)}`);
        console.log('✅ Get-image endpoint test status:', response.status);
        
        if (response.ok) {
            console.log('✅ Get-image endpoint working correctly');
        } else {
            console.log('❌ Get-image endpoint failed');
        }
    } catch (error) {
        console.error('❌ Get-image endpoint test failed:', error);
    }
}

// Run the test
testImageImport();
