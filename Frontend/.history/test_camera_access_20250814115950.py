#!/usr/bin/env python3
"""
Test Camera Access
Checks if HIKERBOT camera is accessible and provides solutions
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from MvCameraControl_class import *
    from CameraParams_const import *
    from CameraParams_header import MV_CC_DEVICE_INFO_LIST, MV_CC_DEVICE_INFO
    from ctypes import cast, POINTER
    print("✅ HIKERBOT SDK imported successfully")
except ImportError as e:
    print(f"❌ Failed to import HIKERBOT SDK: {e}")
    sys.exit(1)

def test_camera_access():
    """Test if camera is accessible"""
    print("\n🔍 Testing HIKERBOT Camera Access...")
    print("=" * 50)
    
    try:
        # Create camera instance
        camera = MvCamera()
        
        # Initialize SDK
        ret = camera.MV_CC_Initialize()
        if ret != 0:
            print(f"❌ Initialize SDK failed: {ret}")
            return False
        
        # Enumerate devices
        deviceList = MV_CC_DEVICE_INFO_LIST()
        ret = camera.MV_CC_EnumDevices(MV_GIGE_DEVICE | MV_USB_DEVICE, deviceList)
        if ret != 0:
            print(f"❌ Enum devices failed: {ret}")
            return False
        
        if deviceList.nDeviceNum == 0:
            print("❌ No devices found!")
            return False
        
        print(f"✅ Found {deviceList.nDeviceNum} device(s)")
        
        # Try to open device
        stDeviceList = cast(deviceList.pDeviceInfo[0], POINTER(MV_CC_DEVICE_INFO)).contents
        ret = camera.MV_CC_CreateHandle(stDeviceList)
        if ret != 0:
            print(f"❌ Create handle failed: {ret}")
            return False
        
        # Try to open device
        ret = camera.MV_CC_OpenDevice(MV_ACCESS_Exclusive, 0)
        if ret != 0:
            print(f"❌ Open device failed with error code: {ret}")
            print("\n🔧 This error means the camera is being used by another application!")
            print("\n💡 Solutions:")
            print("1. Close HIKERBOT application completely")
            print("2. Check Task Manager for MVS or camera processes")
            print("3. End any camera-related processes")
            print("4. Try unplugging and reconnecting the USB cable")
            print("5. Restart your computer if needed")
            return False
        
        print("✅ Camera is accessible!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 HIKERBOT Camera Access Test")
    print("=" * 40)
    
    success = test_camera_access()
    
    if success:
        print("\n🎉 Camera is accessible! You can now use it in your application.")
    else:
        print("\n❌ Camera is not accessible. Please follow the solutions above.")
    
    print("\n" + "=" * 40)
