#!/usr/bin/env python3
"""
HIKERBOT Camera Detection Test
Tests if the HIKERBOT camera can be detected and initialized
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from MvImport.MvCameraControl_class import MvCamera
    from MvImport.CameraParams_const import *
    from MvImport.MvErrorDefine_const import *
    from MvImport.CameraParams_header import MV_CC_DEVICE_INFO_LIST, MV_CC_DEVICE_INFO_
    print("✅ HIKERBOT SDK imported successfully")
except ImportError as e:
    print(f"❌ Failed to import HIKERBOT SDK: {e}")
    sys.exit(1)

def test_camera_detection():
    """Test if HIKERBOT camera can be detected"""
    print("\n🔍 Testing HIKERBOT Camera Detection...")
    print("=" * 50)
    
    try:
        # Create camera instance
        print("1️⃣ Creating MvCamera instance...")
        camera = MvCamera()
        print("✅ MvCamera instance created")
        
        # Enumerate devices using static method
        print("\n2️⃣ Enumerating USB devices...")
        deviceList = MV_CC_DEVICE_INFO_LIST()
        ret = MvCamera.MV_CC_EnumDevices(MV_USB_DEVICE | MV_GIGE_DEVICE, deviceList)
        
        if ret != 0:
            print(f"❌ Failed to enumerate devices: {ret}")
            return False
        
        if deviceList.nDeviceNum == 0:
            print("❌ No HIKERBOT devices found!")
            print("\n🔧 Troubleshooting Tips:")
            print("• Make sure HIKERBOT camera is connected via USB")
            print("• Check if USB cable is properly seated")
            print("• Try a different USB port")
            print("• Check Device Manager for USB device errors")
            print("• Make sure HIKERBOT drivers are installed")
            return False
        
        print(f"✅ Found {deviceList.nDeviceNum} HIKERBOT device(s)")
        
        # List device information
        for i in range(deviceList.nDeviceNum):
            device_info = deviceList.pDeviceInfo[i]
            print(f"\n📷 Device {i+1}:")
            if device_info.nTLayerType == MV_USB_DEVICE:
                usb_info = device_info.SpecialInfo.stUsb3VInfo
                print(f"   Type: USB Device")
                print(f"   Device Name: {usb_info.chDeviceGUID}")
                print(f"   Vendor Name: {usb_info.chVendorName}")
                print(f"   Model Name: {usb_info.chModelName}")
                print(f"   Serial Number: {usb_info.chSerialNumber}")
                print(f"   Device Version: {usb_info.chDeviceVersion}")
            else:
                print(f"   Type: GigE Device")
        
        # Try to open the first device
        print(f"\n3️⃣ Attempting to open device 0...")
        ret = camera.MV_CC_CreateHandle(deviceList.pDeviceInfo[0])
        if ret != 0:
            print(f"❌ Failed to create device handle: {ret}")
            return False
        
        print("✅ Device handle created successfully")
        
        # Try to open device
        ret = camera.MV_CC_OpenDevice()
        if ret != 0:
            print(f"❌ Failed to open device: {ret}")
            return False
        
        print("✅ Device opened successfully")
        
        # Get device info
        print("\n4️⃣ Getting device information...")
        stDeviceInfo = MV_CC_DEVICE_INFO_()
        ret = camera.MV_CC_GetDeviceInfo(stDeviceInfo)
        if ret == 0:
            print("✅ Device info retrieved successfully")
        else:
            print(f"⚠️ Failed to get device info: {ret}")
        
        # Close device
        print("\n5️⃣ Closing device...")
        ret = camera.MV_CC_CloseDevice()
        if ret == 0:
            print("✅ Device closed successfully")
        else:
            print(f"⚠️ Failed to close device: {ret}")
        
        # Destroy device
        ret = camera.MV_CC_DestroyHandle()
        if ret == 0:
            print("✅ Device handle destroyed successfully")
        else:
            print(f"⚠️ Failed to destroy device handle: {ret}")
        
        print("\n🎉 HIKERBOT camera detection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during camera detection: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

def test_usb_connection():
    """Test USB connection specifically"""
    print("\n🔌 Testing USB Connection...")
    print("=" * 30)
    
    try:
        # Enumerate only USB devices using static method
        print("1️⃣ Enumerating USB devices only...")
        deviceList = MV_CC_DEVICE_INFO_LIST()
        ret = MvCamera.MV_CC_EnumDevices(MV_USB_DEVICE, deviceList)
        
        if ret != 0:
            print(f"❌ Failed to enumerate USB devices: {ret}")
            return False
        
        if deviceList.nDeviceNum == 0:
            print("❌ No USB devices found!")
            print("\n🔧 USB Connection Issues:")
            print("• Check USB cable connection")
            print("• Try different USB port")
            print("• Check Device Manager for USB errors")
            print("• Verify camera power (LED indicator)")
            return False
        
        print(f"✅ Found {deviceList.nDeviceNum} USB device(s)")
        
        # Check USB device info
        for i in range(deviceList.nDeviceNum):
            device_info = deviceList.pDeviceInfo[i]
            usb_info = device_info.SpecialInfo.stUsb3VInfo
            print(f"\n📷 USB Device {i+1}:")
            print(f"   Device Name: {usb_info.chDeviceGUID}")
            print(f"   Vendor Name: {usb_info.chVendorName}")
            print(f"   Model Name: {usb_info.chModelName}")
            print(f"   Serial Number: {usb_info.chSerialNumber}")
            print(f"   Device Version: {usb_info.chDeviceVersion}")
            print(f"   USB Protocol: {usb_info.nbcdUSB}")
        
        return True
        
    except Exception as e:
        print(f"❌ USB connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 HIKERBOT Camera Detection Test")
    print("=" * 40)
    
    # Test USB connection first
    usb_ok = test_usb_connection()
    
    if usb_ok:
        # Test full camera detection
        camera_ok = test_camera_detection()
        
        if camera_ok:
            print("\n🎉 All tests passed! HIKERBOT camera is properly connected.")
            print("💡 You can now try starting the camera in your application.")
        else:
            print("\n❌ Camera detection failed. Check the error messages above.")
    else:
        print("\n❌ USB connection test failed. Check USB connection first.")
    
    print("\n" + "=" * 40)
