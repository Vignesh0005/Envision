import cv2
import numpy as np
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class CameraController:
    """Camera controller for managing microscopy camera operations"""
    
    def __init__(self):
        self.current_camera = None
        self.camera_stream = None
        self.camera_settings = {}
        self.available_cameras = []
        self._discover_cameras()
    
    def _discover_cameras(self):
        """Discover available camera devices"""
        try:
            # Try to find available cameras
            available_cameras = []
            
            # Check for cameras (try indices 0-9)
            for i in range(10):
                cap = cv2.VideoCapture(i)
                if cap.isOpened():
                    # Get camera properties
                    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    
                    available_cameras.append({
                        'device_id': str(i),
                        'name': f'Camera {i}',
                        'resolution': f'{width}x{height}',
                        'frame_rate': fps,
                        'index': i
                    })
                    
                    cap.release()
            
            self.available_cameras = available_cameras
            logger.info(f"Discovered {len(available_cameras)} cameras")
            
        except Exception as e:
            logger.error(f"Error discovering cameras: {e}")
            self.available_cameras = []
    
    def get_available_cameras(self) -> List[Dict]:
        """Get list of available cameras"""
        return self.available_cameras
    
    def start_camera(self, camera_id: str, settings: Dict = None) -> bool:
        """
        Start camera capture
        
        Args:
            camera_id: Camera device ID
            settings: Camera settings dictionary
            
        Returns:
            True if camera started successfully, False otherwise
        """
        try:
            if self.camera_stream is not None:
                self.stop_camera()
            
            # Find camera by ID
            camera = None
            for cam in self.available_cameras:
                if cam['device_id'] == camera_id:
                    camera = cam
                    break
            
            if camera is None:
                logger.error(f"Camera {camera_id} not found")
                return False
            
            # Open camera
            self.camera_stream = cv2.VideoCapture(camera['index'])
            
            if not self.camera_stream.isOpened():
                logger.error(f"Failed to open camera {camera_id}")
                return False
            
            # Apply settings if provided
            if settings:
                self._apply_camera_settings(settings)
            
            self.current_camera = camera
            self.camera_settings = settings or {}
            
            logger.info(f"Camera {camera_id} started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error starting camera: {e}")
            return False
    
    def stop_camera(self) -> bool:
        """
        Stop camera capture
        
        Returns:
            True if camera stopped successfully, False otherwise
        """
        try:
            if self.camera_stream is not None:
                self.camera_stream.release()
                self.camera_stream = None
                self.current_camera = None
                self.camera_settings = {}
                logger.info("Camera stopped successfully")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error stopping camera: {e}")
            return False
    
    def capture_image(self) -> Optional[np.ndarray]:
        """
        Capture image from current camera
        
        Returns:
            Captured image as numpy array, or None if failed
        """
        try:
            if self.camera_stream is None or not self.camera_stream.isOpened():
                logger.error("No camera is currently active")
                return None
            
            ret, frame = self.camera_stream.read()
            if not ret:
                logger.error("Failed to capture image from camera")
                return None
            
            logger.info("Image captured successfully")
            return frame
            
        except Exception as e:
            logger.error(f"Error capturing image: {e}")
            return None
    
    def get_frame(self) -> Optional[np.ndarray]:
        """
        Get current frame from camera (for streaming)
        
        Returns:
            Current frame as numpy array, or None if failed
        """
        try:
            if self.camera_stream is None or not self.camera_stream.isOpened():
                return None
            
            ret, frame = self.camera_stream.read()
            if not ret:
                return None
            
            return frame
            
        except Exception as e:
            logger.error(f"Error getting frame: {e}")
            return None
    
    def _apply_camera_settings(self, settings: Dict):
        """Apply camera settings"""
        try:
            if self.camera_stream is None:
                return
            
            # Apply resolution
            if 'resolution' in settings:
                width, height = map(int, settings['resolution'].split('x'))
                self.camera_stream.set(cv2.CAP_PROP_FRAME_WIDTH, width)
                self.camera_stream.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
            
            # Apply frame rate
            if 'frame_rate' in settings:
                self.camera_stream.set(cv2.CAP_PROP_FPS, settings['frame_rate'])
            
            # Apply exposure (if supported)
            if 'exposure' in settings and settings['exposure'] != 'auto':
                try:
                    exposure_value = float(settings['exposure'])
                    self.camera_stream.set(cv2.CAP_PROP_EXPOSURE, exposure_value)
                except ValueError:
                    logger.warning(f"Invalid exposure value: {settings['exposure']}")
            
            # Apply gain (if supported)
            if 'gain' in settings and settings['gain'] != 'auto':
                try:
                    gain_value = float(settings['gain'])
                    self.camera_stream.set(cv2.CAP_PROP_GAIN, gain_value)
                except ValueError:
                    logger.warning(f"Invalid gain value: {settings['gain']}")
            
            logger.info("Camera settings applied successfully")
            
        except Exception as e:
            logger.error(f"Error applying camera settings: {e}")
    
    def get_camera_info(self) -> Optional[Dict]:
        """
        Get information about current camera
        
        Returns:
            Camera information dictionary, or None if no camera active
        """
        try:
            if self.current_camera is None:
                return None
            
            # Get current camera properties
            if self.camera_stream is not None and self.camera_stream.isOpened():
                current_width = int(self.camera_stream.get(cv2.CAP_PROP_FRAME_WIDTH))
                current_height = int(self.camera_stream.get(cv2.CAP_PROP_FRAME_HEIGHT))
                current_fps = self.camera_stream.get(cv2.CAP_PROP_FPS)
                
                return {
                    **self.current_camera,
                    'current_resolution': f'{current_width}x{current_height}',
                    'current_frame_rate': current_fps,
                    'settings': self.camera_settings
                }
            
            return self.current_camera
            
        except Exception as e:
            logger.error(f"Error getting camera info: {e}")
            return None
    
    def is_camera_active(self) -> bool:
        """Check if camera is currently active"""
        return (self.camera_stream is not None and 
                self.camera_stream.isOpened())
    
    def get_supported_resolutions(self, camera_id: str) -> List[str]:
        """
        Get supported resolutions for a camera
        
        Args:
            camera_id: Camera device ID
            
        Returns:
            List of supported resolutions
        """
        try:
            # Find camera
            camera = None
            for cam in self.available_cameras:
                if cam['device_id'] == camera_id:
                    camera = cam
                    break
            
            if camera is None:
                return []
            
            # Test common resolutions
            test_resolutions = [
                (640, 480),
                (800, 600),
                (1024, 768),
                (1280, 720),
                (1280, 1024),
                (1920, 1080),
                (2560, 1440),
                (3840, 2160)
            ]
            
            supported = []
            temp_cap = cv2.VideoCapture(camera['index'])
            
            for width, height in test_resolutions:
                temp_cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
                temp_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
                
                actual_width = int(temp_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                actual_height = int(temp_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                
                if actual_width == width and actual_height == height:
                    supported.append(f'{width}x{height}')
            
            temp_cap.release()
            return supported
            
        except Exception as e:
            logger.error(f"Error getting supported resolutions: {e}")
            return []
    
    def get_supported_frame_rates(self, camera_id: str) -> List[int]:
        """
        Get supported frame rates for a camera
        
        Args:
            camera_id: Camera device ID
            
        Returns:
            List of supported frame rates
        """
        try:
            # Find camera
            camera = None
            for cam in self.available_cameras:
                if cam['device_id'] == camera_id:
                    camera = cam
                    break
            
            if camera is None:
                return []
            
            # Test common frame rates
            test_fps = [15, 24, 25, 30, 50, 60, 120]
            
            supported = []
            temp_cap = cv2.VideoCapture(camera['index'])
            
            for fps in test_fps:
                temp_cap.set(cv2.CAP_PROP_FPS, fps)
                actual_fps = temp_cap.get(cv2.CAP_PROP_FPS)
                
                if abs(actual_fps - fps) < 1:  # Allow small tolerance
                    supported.append(fps)
            
            temp_cap.release()
            return supported
            
        except Exception as e:
            logger.error(f"Error getting supported frame rates: {e}")
            return []
    
    def refresh_cameras(self):
        """Refresh the list of available cameras"""
        self._discover_cameras()
    
    def __del__(self):
        """Cleanup when object is destroyed"""
        self.stop_camera()
