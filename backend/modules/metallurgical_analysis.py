import cv2
import numpy as np
from scipy import ndimage
from skimage import measure, morphology, filters, segmentation
from skimage.feature import peak_local_max
from sklearn.cluster import KMeans
import logging

logger = logging.getLogger(__name__)

class MetallurgicalAnalyzer:
    """Metallurgical analysis module for porosity, phases, and inclusions"""
    
    def __init__(self):
        self.default_params = {
            'porosity': {
                'min_area': 10,
                'max_area': 10000,
                'circularity_threshold': 0.3,
                'contrast_threshold': 0.1
            },
            'phases': {
                'n_clusters': 3,
                'min_area': 50,
                'smoothing_factor': 1.0
            },
            'inclusions': {
                'min_size': 5,
                'max_size': 500,
                'shape_threshold': 0.6,
                'intensity_threshold': 0.3
            }
        }
    
    def analyze_porosity(self, image, params=None):
        """
        Analyze porosity in metallurgical samples
        
        Args:
            image: Input image (numpy array)
            params: Analysis parameters
            
        Returns:
            Dictionary with analysis results
        """
        if params is None:
            params = self.default_params['porosity']
        
        try:
            # Convert to grayscale if needed
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Adaptive thresholding for pore detection
            thresh = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
            )
            
            # Morphological operations to clean up
            kernel = np.ones((3, 3), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
            cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours based on area and circularity
            valid_pores = []
            total_area = gray.shape[0] * gray.shape[1]
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if params['min_area'] <= area <= params['max_area']:
                    # Calculate circularity
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        if circularity >= params['circularity_threshold']:
                            valid_pores.append({
                                'contour': contour,
                                'area': area,
                                'circularity': circularity,
                                'centroid': self._get_contour_centroid(contour)
                            })
            
            # Calculate statistics
            pore_areas = [pore['area'] for pore in valid_pores]
            porosity_percentage = (sum(pore_areas) / total_area) * 100
            
            # Create annotated image
            annotated_image = image.copy()
            cv2.drawContours(annotated_image, [pore['contour'] for pore in valid_pores], -1, (0, 255, 0), 2)
            
            # Add measurements
            for pore in valid_pores:
                x, y = pore['centroid']
                cv2.putText(annotated_image, f"{pore['area']:.1f}", (int(x), int(y)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
            
            results = {
                'porosity_percentage': porosity_percentage,
                'pore_count': len(valid_pores),
                'pore_details': valid_pores,
                'pore_areas': pore_areas,
                'total_area': total_area,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Porosity analysis completed: {porosity_percentage:.2f}% porosity, {len(valid_pores)} pores")
            return results
            
        except Exception as e:
            logger.error(f"Error in porosity analysis: {e}")
            raise
    
    def analyze_phases(self, image, params=None):
        """
        Analyze material phases using clustering
        
        Args:
            image: Input image (numpy array)
            params: Analysis parameters
            
        Returns:
            Dictionary with analysis results
        """
        if params is None:
            params = self.default_params['phases']
        
        try:
            # Convert to grayscale if needed
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Normalize image
            normalized = cv2.normalize(blurred, None, 0, 1, cv2.NORM_MINMAX)
            
            # Reshape for clustering
            pixels = normalized.reshape(-1, 1)
            
            # Apply K-means clustering
            kmeans = KMeans(n_clusters=params['n_clusters'], random_state=42)
            labels = kmeans.fit_predict(pixels)
            
            # Reshape labels back to image dimensions
            segmented = labels.reshape(gray.shape)
            
            # Analyze each phase
            phase_analysis = []
            total_pixels = gray.shape[0] * gray.shape[1]
            
            for i in range(params['n_clusters']):
                phase_mask = (segmented == i).astype(np.uint8)
                
                # Find contours
                contours, _ = cv2.findContours(phase_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                # Filter small regions
                valid_regions = []
                for contour in contours:
                    area = cv2.contourArea(contour)
                    if area >= params['min_area']:
                        valid_regions.append({
                            'contour': contour,
                            'area': area,
                            'centroid': self._get_contour_centroid(contour)
                        })
                
                # Calculate phase statistics
                phase_pixels = np.sum(phase_mask)
                phase_percentage = (phase_pixels / total_pixels) * 100
                
                phase_analysis.append({
                    'phase_id': i,
                    'percentage': phase_percentage,
                    'pixel_count': phase_pixels,
                    'regions': valid_regions,
                    'mean_intensity': np.mean(gray[phase_mask > 0]) if np.sum(phase_mask) > 0 else 0
                })
            
            # Create annotated image
            annotated_image = image.copy()
            colors = [(0, 255, 0), (255, 0, 0), (0, 0, 255), (255, 255, 0), (255, 0, 255)]
            
            for phase in phase_analysis:
                color = colors[phase['phase_id'] % len(colors)]
                for region in phase['regions']:
                    cv2.drawContours(annotated_image, [region['contour']], -1, color, 2)
                    x, y = region['centroid']
                    cv2.putText(annotated_image, f"P{phase['phase_id']}", (int(x), int(y)), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
            
            results = {
                'phases': phase_analysis,
                'total_phases': len(phase_analysis),
                'annotated_image': annotated_image,
                'segmented_image': segmented,
                'parameters': params
            }
            
            logger.info(f"Phase analysis completed: {len(phase_analysis)} phases identified")
            return results
            
        except Exception as e:
            logger.error(f"Error in phase analysis: {e}")
            raise
    
    def analyze_inclusions(self, image, params=None):
        """
        Analyze inclusions and particles in metallurgical samples
        
        Args:
            image: Input image (numpy array)
            params: Analysis parameters
            
        Returns:
            Dictionary with analysis results
        """
        if params is None:
            params = self.default_params['inclusions']
        
        try:
            # Convert to grayscale if needed
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Edge detection for inclusion boundaries
            edges = cv2.Canny(blurred, 50, 150)
            
            # Morphological operations
            kernel = np.ones((3, 3), np.uint8)
            edges = cv2.dilate(edges, kernel, iterations=1)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Analyze inclusions
            inclusions = []
            total_area = gray.shape[0] * gray.shape[1]
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if params['min_size'] <= area <= params['max_size']:
                    # Calculate shape properties
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        
                        # Calculate bounding rectangle
                        x, y, w, h = cv2.boundingRect(contour)
                        aspect_ratio = w / h if h > 0 else 0
                        
                        # Calculate intensity properties
                        mask = np.zeros(gray.shape, np.uint8)
                        cv2.drawContours(mask, [contour], -1, 255, -1)
                        mean_intensity = cv2.mean(gray, mask=mask)[0]
                        
                        # Filter based on shape and intensity
                        if (circularity >= params['shape_threshold'] and 
                            mean_intensity >= params['intensity_threshold'] * 255):
                            
                            inclusions.append({
                                'contour': contour,
                                'area': area,
                                'circularity': circularity,
                                'aspect_ratio': aspect_ratio,
                                'mean_intensity': mean_intensity,
                                'centroid': self._get_contour_centroid(contour),
                                'bounding_box': (x, y, w, h)
                            })
            
            # Calculate statistics
            inclusion_areas = [inc['area'] for inc in inclusions]
            total_inclusion_area = sum(inclusion_areas)
            inclusion_percentage = (total_inclusion_area / total_area) * 100
            
            # Size distribution analysis
            if inclusion_areas:
                size_distribution = {
                    'small': len([a for a in inclusion_areas if a < 50]),
                    'medium': len([a for a in inclusion_areas if 50 <= a < 200]),
                    'large': len([a for a in inclusion_areas if a >= 200])
                }
            else:
                size_distribution = {'small': 0, 'medium': 0, 'large': 0}
            
            # Create annotated image
            annotated_image = image.copy()
            
            for inclusion in inclusions:
                # Draw contour
                cv2.drawContours(annotated_image, [inclusion['contour']], -1, (0, 255, 0), 2)
                
                # Draw bounding box
                x, y, w, h = inclusion['bounding_box']
                cv2.rectangle(annotated_image, (x, y), (x + w, y + h), (255, 0, 0), 1)
                
                # Add measurements
                cx, cy = inclusion['centroid']
                cv2.putText(annotated_image, f"{inclusion['area']:.1f}", (int(cx), int(cy)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 0), 1)
            
            results = {
                'inclusion_count': len(inclusions),
                'inclusion_percentage': inclusion_percentage,
                'total_inclusion_area': total_inclusion_area,
                'inclusions': inclusions,
                'size_distribution': size_distribution,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Inclusion analysis completed: {len(inclusions)} inclusions, {inclusion_percentage:.2f}% area")
            return results
            
        except Exception as e:
            logger.error(f"Error in inclusion analysis: {e}")
            raise
    
    def _get_contour_centroid(self, contour):
        """Calculate centroid of a contour"""
        M = cv2.moments(contour)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
        else:
            cx, cy = 0, 0
        return (cx, cy)
    
    def get_analysis_parameters(self, analysis_type):
        """Get default parameters for a specific analysis type"""
        return self.default_params.get(analysis_type, {})
    
    def set_analysis_parameters(self, analysis_type, params):
        """Set parameters for a specific analysis type"""
        if analysis_type in self.default_params:
            self.default_params[analysis_type].update(params)
            logger.info(f"Updated parameters for {analysis_type} analysis")
        else:
            logger.warning(f"Unknown analysis type: {analysis_type}")
    
    def validate_image(self, image):
        """Validate input image"""
        if image is None:
            raise ValueError("Image is None")
        
        if len(image.shape) < 2:
            raise ValueError("Image must be 2D or 3D")
        
        if image.size == 0:
            raise ValueError("Image is empty")
        
        return True
