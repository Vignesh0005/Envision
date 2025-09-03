import cv2
import numpy as np
from scipy import ndimage
from scipy.fft import fft2, ifft2, fftshift, ifftshift
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Advanced image processing module for microscopy images"""
    
    def __init__(self):
        self.supported_filters = {
            'gaussian_blur': self._gaussian_blur,
            'median_filter': self._median_filter,
            'bilateral_filter': self._bilateral_filter,
            'unsharp_mask': self._unsharp_mask,
            'edge_detection': self._edge_detection,
            'morphological_erosion': self._morphological_erosion,
            'morphological_dilation': self._morphological_dilation,
            'morphological_opening': self._morphological_opening,
            'morphological_closing': self._morphological_closing,
            'fourier_low_pass': self._fourier_low_pass,
            'fourier_high_pass': self._fourier_high_pass,
            'fourier_band_pass': self._fourier_band_pass,
            'histogram_equalization': self._histogram_equalization,
            'adaptive_threshold': self._adaptive_threshold,
            'otsu_threshold': self._otsu_threshold,
            'noise_reduction': self._noise_reduction,
            'contrast_enhancement': self._contrast_enhancement,
            'sharpen': self._sharpen
        }
    
    def apply_filters(self, image, filters):
        """
        Apply multiple filters to an image
        
        Args:
            image: Input image (numpy array)
            filters: List of filter configurations
            
        Returns:
            Processed image
        """
        if not isinstance(filters, list):
            filters = [filters]
        
        processed_image = image.copy()
        
        for filter_config in filters:
            if isinstance(filter_config, str):
                filter_name = filter_config
                params = {}
            elif isinstance(filter_config, dict):
                filter_name = filter_config.get('name')
                params = filter_config.get('params', {})
            else:
                continue
            
            if filter_name in self.supported_filters:
                try:
                    processed_image = self.supported_filters[filter_name](processed_image, **params)
                    logger.info(f"Applied filter: {filter_name}")
                except Exception as e:
                    logger.error(f"Error applying filter {filter_name}: {e}")
            else:
                logger.warning(f"Unsupported filter: {filter_name}")
        
        return processed_image
    
    def _gaussian_blur(self, image, kernel_size=5, sigma=1.0):
        """Apply Gaussian blur"""
        if kernel_size % 2 == 0:
            kernel_size += 1
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), sigma)
    
    def _median_filter(self, image, kernel_size=5):
        """Apply median filter for noise reduction"""
        if kernel_size % 2 == 0:
            kernel_size += 1
        return cv2.medianBlur(image, kernel_size)
    
    def _bilateral_filter(self, image, d=15, sigma_color=75, sigma_space=75):
        """Apply bilateral filter for edge-preserving smoothing"""
        return cv2.bilateralFilter(image, d, sigma_color, sigma_space)
    
    def _unsharp_mask(self, image, kernel_size=5, sigma=1.0, amount=1.0, threshold=0):
        """Apply unsharp mask for sharpening"""
        blurred = cv2.GaussianBlur(image, (kernel_size, kernel_size), sigma)
        sharpened = cv2.addWeighted(image, 1.0 + amount, blurred, -amount, 0)
        if threshold > 0:
            low_contrast_mask = np.absolute(image - blurred) < threshold
            np.copyto(sharpened, image, where=low_contrast_mask)
        return sharpened
    
    def _edge_detection(self, image, method='canny', low_threshold=50, high_threshold=150):
        """Apply edge detection"""
        if method == 'canny':
            return cv2.Canny(image, low_threshold, high_threshold)
        elif method == 'sobel':
            grad_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
            return np.sqrt(grad_x**2 + grad_y**2)
        elif method == 'laplacian':
            return cv2.Laplacian(image, cv2.CV_64F)
        else:
            return image
    
    def _morphological_erosion(self, image, kernel_size=3, iterations=1):
        """Apply morphological erosion"""
        kernel = np.ones((kernel_size, kernel_size), np.uint8)
        return cv2.erode(image, kernel, iterations=iterations)
    
    def _morphological_dilation(self, image, kernel_size=3, iterations=1):
        """Apply morphological dilation"""
        kernel = np.ones((kernel_size, kernel_size), np.uint8)
        return cv2.dilate(image, kernel, iterations=iterations)
    
    def _morphological_opening(self, image, kernel_size=3):
        """Apply morphological opening (erosion followed by dilation)"""
        kernel = np.ones((kernel_size, kernel_size), np.uint8)
        return cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)
    
    def _morphological_closing(self, image, kernel_size=3):
        """Apply morphological closing (dilation followed by erosion)"""
        kernel = np.ones((kernel_size, kernel_size), np.uint8)
        return cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
    
    def _fourier_low_pass(self, image, cutoff_frequency=30):
        """Apply Fourier low-pass filter"""
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply FFT
        f_transform = fft2(gray)
        f_shift = fftshift(f_transform)
        
        # Create low-pass filter
        rows, cols = gray.shape
        crow, ccol = rows // 2, cols // 2
        mask = np.zeros((rows, cols), np.uint8)
        mask[crow-cutoff_frequency:crow+cutoff_frequency, ccol-cutoff_frequency:ccol+cutoff_frequency] = 1
        
        # Apply filter
        f_shift_filtered = f_shift * mask
        f_ishift = ifftshift(f_shift_filtered)
        img_back = ifft2(f_ishift)
        img_back = np.abs(img_back)
        
        # Normalize and convert back to uint8
        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        # Convert back to BGR if original was color
        if len(image.shape) == 3:
            return cv2.cvtColor(img_back, cv2.COLOR_GRAY2BGR)
        return img_back
    
    def _fourier_high_pass(self, image, cutoff_frequency=30):
        """Apply Fourier high-pass filter"""
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply FFT
        f_transform = fft2(gray)
        f_shift = fftshift(f_transform)
        
        # Create high-pass filter
        rows, cols = gray.shape
        crow, ccol = rows // 2, cols // 2
        mask = np.ones((rows, cols), np.uint8)
        mask[crow-cutoff_frequency:crow+cutoff_frequency, ccol-cutoff_frequency:ccol+cutoff_frequency] = 0
        
        # Apply filter
        f_shift_filtered = f_shift * mask
        f_ishift = ifftshift(f_shift_filtered)
        img_back = ifft2(f_ishift)
        img_back = np.abs(img_back)
        
        # Normalize and convert back to uint8
        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        # Convert back to BGR if original was color
        if len(image.shape) == 3:
            return cv2.cvtColor(img_back, cv2.COLOR_GRAY2BGR)
        return img_back
    
    def _fourier_band_pass(self, image, low_cutoff=10, high_cutoff=50):
        """Apply Fourier band-pass filter"""
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply FFT
        f_transform = fft2(gray)
        f_shift = fftshift(f_transform)
        
        # Create band-pass filter
        rows, cols = gray.shape
        crow, ccol = rows // 2, cols // 2
        mask = np.zeros((rows, cols), np.uint8)
        mask[crow-high_cutoff:crow+high_cutoff, ccol-high_cutoff:ccol+high_cutoff] = 1
        mask[crow-low_cutoff:crow+low_cutoff, ccol-low_cutoff:ccol+low_cutoff] = 0
        
        # Apply filter
        f_shift_filtered = f_shift * mask
        f_ishift = ifftshift(f_shift_filtered)
        img_back = ifft2(f_ishift)
        img_back = np.abs(img_back)
        
        # Normalize and convert back to uint8
        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        # Convert back to BGR if original was color
        if len(image.shape) == 3:
            return cv2.cvtColor(img_back, cv2.COLOR_GRAY2BGR)
        return img_back
    
    def _histogram_equalization(self, image):
        """Apply histogram equalization"""
        if len(image.shape) == 3:
            # Convert to YUV for better color preservation
            yuv = cv2.cvtColor(image, cv2.COLOR_BGR2YUV)
            yuv[:,:,0] = cv2.equalizeHist(yuv[:,:,0])
            return cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)
        else:
            return cv2.equalizeHist(image)
    
    def _adaptive_threshold(self, image, block_size=11, C=2):
        """Apply adaptive thresholding"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        return cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block_size, C)
    
    def _otsu_threshold(self, image):
        """Apply Otsu's thresholding"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        _, thresholded = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresholded
    
    def _noise_reduction(self, image, method='nlm', h=10):
        """Apply noise reduction"""
        if method == 'nlm':
            # Non-local means denoising
            return cv2.fastNlMeansDenoisingColored(image, None, h, h, 7, 21)
        elif method == 'tv':
            # Total variation denoising
            return cv2.denoise_TVL1(image)
        else:
            return image
    
    def _contrast_enhancement(self, image, alpha=1.5, beta=0):
        """Enhance contrast using alpha and beta parameters"""
        return cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    
    def _sharpen(self, image, kernel_size=3, sigma=1.0, amount=1.0):
        """Sharpen image using unsharp mask"""
        return self._unsharp_mask(image, kernel_size, sigma, amount)
    
    def get_available_filters(self):
        """Get list of available filters"""
        return list(self.supported_filters.keys())
    
    def get_filter_parameters(self, filter_name):
        """Get default parameters for a specific filter"""
        # This could be extended to return parameter ranges and descriptions
        return {
            'gaussian_blur': {'kernel_size': 5, 'sigma': 1.0},
            'median_filter': {'kernel_size': 5},
            'bilateral_filter': {'d': 15, 'sigma_color': 75, 'sigma_space': 75},
            'edge_detection': {'method': 'canny', 'low_threshold': 50, 'high_threshold': 150},
            'fourier_low_pass': {'cutoff_frequency': 30},
            'fourier_high_pass': {'cutoff_frequency': 30},
            'fourier_band_pass': {'low_cutoff': 10, 'high_cutoff': 50}
        }.get(filter_name, {})
