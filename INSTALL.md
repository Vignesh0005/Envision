# ENVISION Installation Guide

## Quick Start

### Option 1: Automated Setup (Recommended)
- **macOS/Linux**: Run `./start.sh`
- **Windows**: Run `start.bat`

### Option 2: Manual Setup
Follow the detailed steps below.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: Minimum 8GB, Recommended 16GB+
- **Storage**: Minimum 5GB free space
- **Display**: 1920x1080 or higher resolution

### Required Software
1. **Node.js 18+** and **npm 9+**
2. **Python 3.8+** and **pip**
3. **PostgreSQL 12+**
4. **Git**

## Installation Steps

### 1. Install Node.js and npm

#### Windows
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the wizard
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

#### Ubuntu/Debian
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install Python

#### Windows
1. Download from [python.org](https://python.org/)
2. Run installer with "Add to PATH" checked
3. Verify installation:
   ```cmd
   python --version
   pip --version
   ```

#### macOS
```bash
# Using Homebrew
brew install python

# Or download from python.org
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### 3. Install PostgreSQL

#### Windows
1. Download from [postgresql.org](https://postgresql.org/)
2. Run installer with default settings
3. Note the password you set for the postgres user

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb envision_microscopy
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb envision_microscopy
```

### 4. Clone the Repository
```bash
git clone https://github.com/your-username/envision-microscopy.git
cd envision-microscopy
```

### 5. Install Frontend Dependencies
```bash
npm install
```

### 6. Install Backend Dependencies
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 7. Database Configuration

#### Set Environment Variables

**Windows (Command Prompt)**
```cmd
set DATABASE_URL=postgresql://postgres:your_password@localhost/envision_microscopy
set FLASK_ENV=development
```

**Windows (PowerShell)**
```powershell
$env:DATABASE_URL="postgresql://postgres:your_password@localhost/envision_microscopy"
$env:FLASK_ENV="development"
```

**macOS/Linux**
```bash
export DATABASE_URL="postgresql://postgres:your_password@localhost/envision_microscopy"
export FLASK_ENV="development"
```

#### Initialize Database
```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

python -c "from modules.database import DatabaseManager; db = DatabaseManager(); db.init_database()"
cd ..
```

### 8. Start the System

#### Development Mode
```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows
python app.py

# Terminal 2: Start frontend
npm start

# Terminal 3: Start Electron (optional)
npm run electron-dev
```

#### Production Mode
```bash
# Build the application
npm run build

# Package for distribution
npm run dist
```

## Verification

### Check Backend
- Open browser to `http://localhost:5000/api/health`
- Should see: `{"status": "healthy", "version": "1.0.0"}`

### Check Frontend
- Open browser to `http://localhost:3000`
- Should see the ENVISION dashboard

### Check Database
```bash
psql -U postgres -d envision_microscopy -c "\dt"
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in app.py
```

#### Python Module Errors
```bash
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Node.js Version Issues
```bash
# Use nvm to manage Node.js versions
nvm install 18
nvm use 18
npm install
```

#### Database Connection Issues
1. Verify PostgreSQL is running
2. Check connection string format
3. Ensure database exists
4. Verify user permissions

### Performance Issues
- Reduce image resolution for analysis
- Close unnecessary applications
- Ensure sufficient RAM is available
- Use SSD storage if possible

## Configuration Files

### Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql://username:password@localhost/envision_microscopy
FLASK_ENV=development
FLASK_DEBUG=1
CAMERA_DEVICE_ID=default
CAMERA_RESOLUTION=1920x1080
CAMERA_FRAME_RATE=30
```

### Analysis Parameters
Modify parameters in the respective analysis modules:
- `backend/modules/metallurgical_analysis.py`
- `backend/modules/graphite_analysis.py`
- `backend/modules/structural_analysis.py`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Create an issue on GitHub
4. Contact the development team

## Next Steps

After successful installation:
1. **Read the README.md** for usage instructions
2. **Explore the API endpoints** for integration
3. **Customize analysis parameters** for your materials
4. **Set up camera calibration** for accurate measurements
5. **Configure reporting templates** for your needs

---

**Happy Analyzing! 🧪🔬**
