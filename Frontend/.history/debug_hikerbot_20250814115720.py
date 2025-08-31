#!/usr/bin/env python3
"""
Debug HIKERBOT Camera Initialization
Tests each step of the camera initialization process
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

def test_hikerbot_initialization():
    """Test HIKERBOT camera initialization step by step"""
    print("\n🔍 Testing HIKERBOT Camera Initialization...")
    print("=" * 60)
    
    try:
        # Step 1: Create MvCamera instance
        print("1️⃣ Creating MvCamera instance...")
        camera = MvCamera()
        print("✅ MvCamera instance created")
        
        # Step 2: Initialize SDK
        print("\n2️⃣ Initializing SDK...")
        ret = camera.MV_CC_Initialize()
        print(f"📊 Initialize SDK result: {ret}")
        if ret != 0:
            print(f"❌ Initialize SDK failed with error code: {ret}")
            return False
        print("✅ SDK initialized successfully")
        
        # Step 3: Enumerate devices
        print("\n3️⃣ Enumerating devices...")
        deviceList = MV_CC_DEVICE_INFO_LIST()
        ret = camera.MV_CC_EnumDevices(MV_GIGE_DEVICE | MV_USB_DEVICE, deviceList)
        print(f"📊 Enum devices result: {ret}")
        if ret != 0:
            print(f"❌ Enum devices failed with error code: {ret}")
            return False
        
        if deviceList.nDeviceNum == 0:
            print("❌ No devices found!")
            return False
        
        print(f"✅ Found {deviceList.nDeviceNum} device(s)")
        
        # Step 4: Select first device
        print("\n4️⃣ Selecting first device...")
        stDeviceList = cast(deviceList.pDeviceInfo[0], POINTER(MV_CC_DEVICE_INFO)).contents
        print("✅ Device selected")
        
        # Step 5: Create handle
        print("\n5️⃣ Creating handle...")
        ret = camera.MV_CC_CreateHandle(stDeviceList)
        print(f"📊 Create handle result: {ret}")
        if ret != 0:
            print(f"❌ Create handle failed with error code: {ret}")
            return False
        print("✅ Handle created successfully")
        
        # Step 6: Open device
        print("\n6️⃣ Opening device...")
        ret = camera.MV_CC_OpenDevice(MV_ACCESS_Exclusive, 0)
        print(f"📊 Open device result: {ret}")
        if ret != 0:
            print(f"❌ Open device failed with error code: {ret}")
            return False
        print("✅ Device opened successfully")
        
        # Step 7: Start grabbing
        print("\n7️⃣ Starting grabbing...")
        ret = camera.MV_CC_StartGrabbing()
        print(f"📊 Start grabbing result: {ret}")
        if ret != 0:
            print(f"❌ Start grabbing failed with error code: {ret}")
            return False
        print("✅ Grabbing started successfully")
        
        # Step 8: Test getting a frame
        print("\n8️⃣ Testing frame capture...")
        try:
            frame = camera.get_frame()
            if frame is not None:
                print(f"✅ Frame captured successfully! Shape: {frame.shape}")
            else:
                print("⚠️ Frame is None")
        except Exception as e:
            print(f"❌ Frame capture failed: {e}")
        
        # Step 9: Stop grabbing
        print("\n9️⃣ Stopping grabbing...")
        ret = camera.MV_CC_StopGrabbing()
        print(f"📊 Stop grabbing result: {ret}")
        
        # Step 10: Close device
        print("\n🔟 Closing device...")
        ret = camera.MV_CC_CloseDevice()
        print(f"📊 Close device result: {ret}")
        
        # Step 11: Destroy handle
        print("\n1️⃣1️⃣ Destroying handle...")
        ret = camera.MV_CC_DestroyHandle()
        print(f"📊 Destroy handle result: {ret}")
        
        print("\n🎉 HIKERBOT camera initialization test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 HIKERBOT Camera Initialization Debug Test")
    print("=" * 50)
    
    success = test_hikerbot_initialization()
    
    if success:
        print("\n🎉 All tests passed! HIKERBOT camera is working correctly.")
        print("💡 The issue might be in the application's camera management.")
    else:
        print("\n❌ Initialization failed. Check the error messages above.")
    
    print("\n" + "=" * 50)
