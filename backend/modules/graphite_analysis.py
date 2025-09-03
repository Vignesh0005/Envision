import cv2
import numpy as np
from scipy import ndimage
from skimage import measure, morphology, filters
import logging

logger = logging.getLogger(__name__)

class GraphiteAnalyzer:
    """Graphite analysis module for nodularity and flake analysis"""
    
    def __init__(self):
        self.default_params = {
            'nodularity': {
                'min_circularity': 0.7,
                'min_area': 20,
                'max_area': 10000,
                'shape_factor_threshold': 0.8
            },
            'flakes': {
                'min_length': 10,
                'max_length': 500,
                'aspect_ratio_threshold': 3.0,
                'type_classification': True
            },
            'coating': {
                'min_thickness': 1,
                'max_thickness': 100,
                'detection_sensitivity': 0.5
            }
        }
    
    def analyze_nodularity(self, image, params=None):
        """Analyze graphite nodularity"""
        if params is None:
            params = self.default_params['nodularity']
        
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Thresholding to separate graphite from matrix
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations
            kernel = np.ones((3, 3), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
            cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Analyze each graphite particle
            nodules = []
            flakes = []
            total_area = gray.shape[0] * gray.shape[1]
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if params['min_area'] <= area <= params['max_area']:
                    # Calculate shape properties
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        
                        # Calculate bounding rectangle
                        x, y, w, h = cv2.boundingRect(contour)
                        aspect_ratio = w / h if h > 0 else 0
                        
                        # Classify as nodule or flake
                        if (circularity >= params['min_circularity'] and 
                            aspect_ratio <= params['shape_factor_threshold']):
                            nodules.append({
                                'contour': contour,
                                'area': area,
                                'circularity': circularity,
                                'aspect_ratio': aspect_ratio,
                                'centroid': self._get_contour_centroid(contour),
                                'type': 'nodule'
                            })
                        else:
                            flakes.append({
                                'contour': contour,
                                'area': area,
                                'circularity': circularity,
                                'aspect_ratio': aspect_ratio,
                                'centroid': self._get_contour_centroid(contour),
                                'type': 'flake'
                            })
            
            # Calculate nodularity
            total_graphite_area = sum([n['area'] for n in nodules]) + sum([f['area'] for f in flakes])
            nodularity_percentage = (sum([n['area'] for n in nodules]) / total_graphite_area * 100) if total_graphite_area > 0 else 0
            
            # Create annotated image
            annotated_image = image.copy()
            
            # Draw nodules in green
            cv2.drawContours(annotated_image, [n['contour'] for n in nodules], -1, (0, 255, 0), 2)
            
            # Draw flakes in red
            cv2.drawContours(annotated_image, [f['contour'] for f in flakes], -1, (0, 0, 255), 2)
            
            # Add measurements
            for nodule in nodules:
                x, y = nodule['centroid']
                cv2.putText(annotated_image, f"N", (int(x), int(y)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            
            for flake in flakes:
                x, y = flake['centroid']
                cv2.putText(annotated_image, f"F", (int(x), int(y)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
            
            results = {
                'nodularity_percentage': nodularity_percentage,
                'nodule_count': len(nodules),
                'flake_count': len(flakes),
                'total_graphite_area': total_graphite_area,
                'nodules': nodules,
                'flakes': flakes,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Nodularity analysis completed: {nodularity_percentage:.2f}% nodularity")
            return results
            
        except Exception as e:
            logger.error(f"Error in nodularity analysis: {e}")
            raise
    
    def analyze_flakes(self, image, params=None):
        """Analyze graphite flake characteristics"""
        if params is None:
            params = self.default_params['flakes']
        
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Preprocessing
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Thresholding
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations
            kernel = np.ones((3, 3), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Analyze flakes
            flakes = []
            total_area = gray.shape[0] * gray.shape[1]
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area >= params['min_length']:
                    # Calculate flake properties
                    x, y, w, h = cv2.boundingRect(contour)
                    length = max(w, h)
                    width = min(w, h)
                    aspect_ratio = length / width if width > 0 else 0
                    
                    if (length >= params['min_length'] and 
                        length <= params['max_length'] and
                        aspect_ratio >= params['aspect_ratio_threshold']):
                        
                        # Classify flake type based on length
                        flake_type = self._classify_flake_type(length)
                        
                        flakes.append({
                            'contour': contour,
                            'area': area,
                            'length': length,
                            'width': width,
                            'aspect_ratio': aspect_ratio,
                            'type': flake_type,
                            'centroid': self._get_contour_centroid(contour)
                        })
            
            # Calculate statistics
            flake_areas = [f['area'] for f in flakes]
            total_flake_area = sum(flake_areas)
            flake_percentage = (total_flake_area / total_area) * 100
            
            # Type distribution
            type_distribution = {}
            for flake in flakes:
                flake_type = flake['type']
                type_distribution[flake_type] = type_distribution.get(flake_type, 0) + 1
            
            # Create annotated image
            annotated_image = image.copy()
            
            # Color code by type
            type_colors = {
                'Type A': (0, 255, 0),    # Green
                'Type B': (255, 255, 0),  # Yellow
                'Type C': (255, 165, 0),  # Orange
                'Type D': (255, 0, 0),    # Red
                'Type E': (128, 0, 128)   # Purple
            }
            
            for flake in flakes:
                color = type_colors.get(flake['type'], (255, 255, 255))
                cv2.drawContours(annotated_image, [flake['contour']], -1, color, 2)
                
                # Add type label
                x, y = flake['centroid']
                cv2.putText(annotated_image, flake['type'], (int(x), int(y)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
            
            results = {
                'flake_count': len(flakes),
                'flake_percentage': flake_percentage,
                'total_flake_area': total_flake_area,
                'flakes': flakes,
                'type_distribution': type_distribution,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Flake analysis completed: {len(flakes)} flakes detected")
            return results
            
        except Exception as e:
            logger.error(f"Error in flake analysis: {e}")
            raise
    
    def analyze_coating(self, image, params=None):
        """Analyze coating thickness and characteristics"""
        if params is None:
            params = self.default_params['coating']
        
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Edge detection for coating boundaries
            edges = cv2.Canny(gray, 50, 150)
            
            # Morphological operations
            kernel = np.ones((3, 3), np.uint8)
            edges = cv2.dilate(edges, kernel, iterations=1)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Analyze coating regions
            coating_regions = []
            total_area = gray.shape[0] * gray.shape[1]
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area >= 100:  # Minimum area threshold
                    # Calculate bounding rectangle
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # Estimate thickness (simplified approach)
                    thickness = min(w, h) / 2
                    
                    if (thickness >= params['min_thickness'] and 
                        thickness <= params['max_thickness']):
                        
                        coating_regions.append({
                            'contour': contour,
                            'area': area,
                            'thickness': thickness,
                            'bounding_box': (x, y, w, h),
                            'centroid': self._get_contour_centroid(contour)
                        })
            
            # Calculate statistics
            thicknesses = [r['thickness'] for r in coating_regions]
            total_coating_area = sum([r['area'] for r in coating_regions])
            coating_percentage = (total_coating_area / total_area) * 100
            
            if thicknesses:
                thickness_stats = {
                    'min': min(thicknesses),
                    'max': max(thicknesses),
                    'mean': np.mean(thicknesses),
                    'std': np.std(thicknesses)
                }
            else:
                thickness_stats = {'min': 0, 'max': 0, 'mean': 0, 'std': 0}
            
            # Create annotated image
            annotated_image = image.copy()
            
            for region in coating_regions:
                # Draw coating region
                cv2.drawContours(annotated_image, [region['contour']], -1, (0, 255, 255), 2)
                
                # Add thickness measurement
                x, y = region['centroid']
                cv2.putText(annotated_image, f"{region['thickness']:.1f}μm", (int(x), int(y)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
            
            results = {
                'coating_regions': len(coating_regions),
                'coating_percentage': coating_percentage,
                'total_coating_area': total_coating_area,
                'thickness_statistics': thickness_stats,
                'coating_regions': coating_regions,
                'annotated_image': annotated_image,
                'parameters': params
            }
            
            logger.info(f"Coating analysis completed: {len(coating_regions)} regions detected")
            return results
            
        except Exception as e:
            logger.error(f"Error in coating analysis: {e}")
            raise
    
    def _classify_flake_type(self, length):
        """Classify flake type based on length (ASTM A247)"""
        if length < 25:
            return 'Type A'
        elif length < 50:
            return 'Type B'
        elif length < 100:
            return 'Type C'
        elif length < 200:
            return 'Type D'
        else:
            return 'Type E'
    
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
