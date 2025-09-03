import cv2
import numpy as np
from scipy import ndimage
from skimage import measure, morphology, filters, segmentation
from sklearn.cluster import KMeans
import logging

logger = logging.getLogger(__name__)

class StructuralAnalyzer:
    """Structural analysis module for grain size, dendritic spacing, and particle analysis"""
    
    def __init__(self):
        self.default_params = {
            'grain_size': {
                'min_grain_size': 5,
                'max_grain_size': 200,
                'detection_sensitivity': 0.5,
                'watershed_seed_threshold': 0.8
            },
            'dendritic': {
                'min_spacing': 10,
                'max_spacing': 500,
                'angle_threshold': 30,
                'line_detection_threshold': 0.1
            },
            'particles': {
                'min_size': 2,
                'max_size': 100,
                'shape_threshold': 0.6,
                'intensity_threshold': 0.3
            }
        }
    
    def analyze_grain_size(self, image, params=None):
        """Analyze grain size distribution"""
        if params is None:
            params = self.default_params['grain_size']
        
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Thresholding to separate grains from matrix
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations
            kernel = np.ones((3, 3), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
            cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)
            
            # Watershed segmentation for grain separation
            dist_transform = cv2.distanceTransform(cleaned, cv2.DIST_L2, 5)
            _, sure_fg = cv2.threshold(dist_transform, 
                                     params['watershed_seed_threshold'] * dist_transform.max(), 
                                     255, 0)
            sure_fg = np.uint8(sure_fg)
            
            # Watershed
            unknown = cv2.subtract(cleaned, sure_fg)
            _, markers = cv2.connectedComponents(sure_fg)
            markers = markers + 1
            markers[unknown == 255] = 0
            markers = cv2.watershed(image, markers)
            
            # Find contours of grains
            contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Analyze each grain
            grains = []
            total_area = gray.shape[0] * gray.shape[1]
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if params['min_grain_size'] <= area <= params['max_grain_size']:
                    # Calculate grain properties
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        
                        # Calculate equivalent diameter
                        equivalent_diameter = np.sqrt(4 * area / np.pi)
                        
                        # Calculate bounding rectangle
                        x, y, w, h = cv2.boundingRect(contour)
                        aspect_ratio = w / h if h > 0 else 0
                        
                        grains.append({
                            'contour': contour,
                            'area': area,
                            'perimeter': perimeter,
                            'circularity': circularity,
                            'equivalent_diameter': equivalent_diameter,
                            'aspect_ratio': aspect_ratio,
                            'centroid': self._get_contour_centroid(contour)
                        })
            
            # Calculate statistics
            grain_areas = [g['area'] for g in grains]
            total_grain_area = sum(grain_areas)
            grain_percentage = (total_grain_area / total_area) * 100
            
            if grain_areas:
                grain_size_stats = {
                    'min': min(grain_areas),
                    'max': max(grain_areas),
                    'mean': np.mean(grain_areas),
                    'std': np.std(grain_areas),
                    'median': np.median(grain_areas)
                }
            else:
                grain_size_stats = {'min': 0, 'max': 0, 'mean': 0, 'std': 0, 'median': 0}
            
            # Create annotated image
            annotated_image = image.copy()
            
            # Draw grains in different colors
            for i, grain in enumerate(grains):
                color = self._get_color_by_index(i)
                cv2.drawContours(annotated_image, [grain['contour']], -1, color, 2)
                
                # Add grain number
                x, y = grain['centroid']
                cv2.putText(annotated_image, str(i+1), (int(x), int(y)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
            
            results = {
                'grain_count': len(grains),
                'grain_percentage': grain_percentage,
                'total_grain_area': total_grain_area,
                'grain_size_statistics': grain_size_stats,
                'grains': grains,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Grain size analysis completed: {len(grains)} grains detected")
            return results
            
        except Exception as e:
            logger.error(f"Error in grain size analysis: {e}")
            raise
    
    def analyze_dendritic_spacing(self, image, params=None):
        """Analyze dendritic arm spacing"""
        if params is None:
            params = self.default_params['dendritic']
        
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Edge detection
            edges = cv2.Canny(blurred, 50, 150)
            
            # Line detection using Hough transform
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, 
                                   threshold=50, 
                                   minLineLength=params['min_spacing'],
                                   maxLineGap=params['max_spacing'])
            
            # Analyze line spacing
            spacings = []
            if lines is not None:
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
                    
                    if params['min_spacing'] <= length <= params['max_spacing']:
                        # Calculate angle
                        angle = np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi
                        if abs(angle) <= params['angle_threshold']:
                            spacings.append({
                                'start': (x1, y1),
                                'end': (x2, y2),
                                'length': length,
                                'angle': angle
                            })
            
            # Calculate statistics
            if spacings:
                spacing_lengths = [s['length'] for s in spacings]
                spacing_stats = {
                    'min': min(spacing_lengths),
                    'max': max(spacing_lengths),
                    'mean': np.mean(spacing_lengths),
                    'std': np.std(spacing_lengths),
                    'median': np.median(spacing_lengths)
                }
            else:
                spacing_stats = {'min': 0, 'max': 0, 'mean': 0, 'std': 0, 'median': 0}
            
            # Create annotated image
            annotated_image = image.copy()
            
            # Draw dendritic lines
            for i, spacing in enumerate(spacings):
                color = (0, 255, 0)  # Green for dendritic lines
                cv2.line(annotated_image, spacing['start'], spacing['end'], color, 2)
                
                # Add length label
                mid_x = (spacing['start'][0] + spacing['end'][0]) // 2
                mid_y = (spacing['start'][1] + spacing['end'][1]) // 2
                cv2.putText(annotated_image, f"{spacing['length']:.1f}", 
                           (mid_x, mid_y), cv2.FONT_HERSHEY_SIMPLEX, 0.3, color, 1)
            
            results = {
                'spacing_count': len(spacings),
                'spacing_statistics': spacing_stats,
                'spacings': spacings,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Dendritic spacing analysis completed: {len(spacings)} spacings measured")
            return results
            
        except Exception as e:
            logger.error(f"Error in dendritic spacing analysis: {e}")
            raise
    
    def analyze_particles(self, image, params=None):
        """Analyze particle distribution and characteristics"""
        if params is None:
            params = self.default_params['particles']
        
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Thresholding to separate particles
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations
            kernel = np.ones((3, 3), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Analyze particles
            particles = []
            total_area = gray.shape[0] * gray.shape[1]
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if params['min_size'] <= area <= params['max_size']:
                    # Calculate particle properties
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        
                        # Calculate equivalent diameter
                        equivalent_diameter = np.sqrt(4 * area / np.pi)
                        
                        # Calculate bounding rectangle
                        x, y, w, h = cv2.boundingRect(contour)
                        aspect_ratio = w / h if h > 0 else 0
                        
                        # Calculate intensity statistics
                        mask = np.zeros(gray.shape, np.uint8)
                        cv2.drawContours(mask, [contour], -1, 255, -1)
                        mean_intensity = cv2.mean(gray, mask=mask)[0]
                        
                        if (circularity >= params['shape_threshold'] and 
                            mean_intensity >= params['intensity_threshold'] * 255):
                            
                            particles.append({
                                'contour': contour,
                                'area': area,
                                'perimeter': perimeter,
                                'circularity': circularity,
                                'equivalent_diameter': equivalent_diameter,
                                'aspect_ratio': aspect_ratio,
                                'mean_intensity': mean_intensity,
                                'centroid': self._get_contour_centroid(contour)
                            })
            
            # Calculate statistics
            particle_areas = [p['area'] for p in particles]
            total_particle_area = sum(particle_areas)
            particle_percentage = (total_particle_area / total_area) * 100
            
            if particle_areas:
                particle_size_stats = {
                    'min': min(particle_areas),
                    'max': max(particle_areas),
                    'mean': np.mean(particle_areas),
                    'std': np.std(particle_areas)
                }
            else:
                particle_size_stats = {'min': 0, 'max': 0, 'mean': 0, 'std': 0}
            
            # Create annotated image
            annotated_image = image.copy()
            
            # Draw particles in different colors
            for i, particle in enumerate(particles):
                color = self._get_color_by_index(i)
                cv2.drawContours(annotated_image, [particle['contour']], -1, color, 2)
                
                # Add particle number
                x, y = particle['centroid']
                cv2.putText(annotated_image, str(i+1), (int(x), int(y)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.3, color, 1)
            
            results = {
                'particle_count': len(particles),
                'particle_percentage': particle_percentage,
                'total_particle_area': total_particle_area,
                'particle_size_statistics': particle_size_stats,
                'particles': particles,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Particle analysis completed: {len(particles)} particles detected")
            return results
            
        except Exception as e:
            logger.error(f"Error in particle analysis: {e}")
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
    
    def _get_color_by_index(self, index):
        """Get a color for visualization based on index"""
        colors = [
            (255, 0, 0),    # Blue
            (0, 255, 0),    # Green
            (0, 0, 255),    # Red
            (255, 255, 0),  # Cyan
            (255, 0, 255),  # Magenta
            (0, 255, 255),  # Yellow
            (128, 0, 0),    # Dark Blue
            (0, 128, 0),    # Dark Green
            (0, 0, 128),    # Dark Red
            (128, 128, 0),  # Dark Cyan
        ]
        return colors[index % len(colors)]
    
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
