from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "app://*", "*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Add a simple test endpoint
@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'success',
        'message': 'Server is working!',
        'timestamp': datetime.now().isoformat()
    })

# Default save path
DEFAULT_SAVE_PATH = "C:\\Users\\Public\\MicroScope_Images"

@app.route('/api/import-image', methods=['POST'])
def import_image():
    try:
        logger.info("=== IMPORT IMAGE REQUEST RECEIVED ===")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request files: {list(request.files.keys())}")
        logger.info(f"Request form: {list(request.form.keys())}")
        
        logger.info("Starting import process...")
        
        if 'file' not in request.files:
            logger.error("No file part in request. Files received: %s", request.files)
            return jsonify({
                'status': 'error',
                'message': 'No file part'
            }), 400
            
        file = request.files['file']
        logger.info(f"Received file: {file.filename}")
        
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({
                'status': 'error',
                'message': 'No selected file'
            }), 400

        if file:
            try:
                filename = secure_filename(file.filename)
                save_dir = DEFAULT_SAVE_PATH
                logger.info(f"Using save directory: {save_dir}")
                
                os.makedirs(save_dir, exist_ok=True)
                
                # Add timestamp to filename to avoid conflicts
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                base, ext = os.path.splitext(filename)
                filename = f"{base}_{timestamp}{ext}"
                
                filepath = os.path.join(save_dir, filename)
                logger.info(f"Attempting to save file to: {filepath}")
                
                # Save the file
                file.save(filepath)
                logger.info(f"File saved successfully")
                
                # Verify file exists and is readable
                if os.path.exists(filepath):
                    try:
                        # Try to open the file to verify it's valid
                        with open(filepath, 'rb') as test_file:
                            test_file.read(1024)  # Read first 1KB to verify file
                        
                        logger.info(f"File verified at: {filepath}")
                        return jsonify({
                            'status': 'success',
                            'filepath': filepath
                        })
                    except Exception as read_error:
                        logger.error(f"File exists but cannot be read: {str(read_error)}")
                        return jsonify({
                            'status': 'error',
                            'message': 'File saved but cannot be read'
                        }), 500
                else:
                    logger.error(f"File not found after saving")
                    return jsonify({
                        'status': 'error',
                        'message': 'File not found after saving'
                    }), 500
                    
            except Exception as save_error:
                logger.error(f"Error saving file: {str(save_error)}")
                return jsonify({
                    'status': 'error',
                    'message': f'Error saving file: {str(save_error)}'
                }), 500
            
    except Exception as e:
        logger.error(f"Error in import process: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/set-save-path', methods=['POST'])
def set_save_path():
    try:
        data = request.get_json()
        new_path = data.get('path')
        
        if new_path and os.path.exists(new_path):
            global DEFAULT_SAVE_PATH
            DEFAULT_SAVE_PATH = new_path
            logger.info(f"Save path updated to: {new_path}")
            return jsonify({
                'status': 'success',
                'message': 'Save path updated successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid path provided'
            }), 400
    except Exception as e:
        logger.error(f"Error setting save path: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': 'Server is running',
        'save_path': DEFAULT_SAVE_PATH
    })

@app.route('/api/list-images', methods=['GET'])
def list_images():
    try:
        # Get the folder path from query parameters or use default
        folder_path = request.args.get('path', DEFAULT_SAVE_PATH)
        
        if not os.path.exists(folder_path):
            return jsonify({
                'status': 'error',
                'message': 'Folder does not exist'
            }), 404
        
        images = []
        for filename in os.listdir(folder_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
                filepath = os.path.join(folder_path, filename)
                try:
                    stat = os.stat(filepath)
                    images.append({
                        'name': filename,
                        'path': filepath,
                        'size': stat.st_size,
                        'modifiedTime': stat.st_mtime * 1000,  # Convert to milliseconds for JavaScript
                        'thumbnail': f'/api/get-image?path={filepath}'  # Use get-image endpoint for thumbnails
                    })
                except Exception as e:
                    logger.error(f"Error processing file {filename}: {str(e)}")
                    continue
        
        # Sort by modification time (newest first)
        images.sort(key=lambda x: x['modifiedTime'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'images': images
        })
        
    except Exception as e:
        logger.error(f"Error listing images: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/get-image', methods=['GET'])
def get_image():
    try:
        image_path = request.args.get('path')
        if not image_path or not os.path.exists(image_path):
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404
        
        # Check if it's a valid image file
        if not image_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
            return jsonify({
                'status': 'error',
                'message': 'Invalid image file'
            }), 400
        
        # Return the image file
        return send_file(image_path, mimetype='image/jpeg')
        
    except Exception as e:
        logger.error(f"Error serving image: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/watch-folder', methods=['GET'])
def watch_folder():
    try:
        folder_path = request.args.get('path', DEFAULT_SAVE_PATH)
        
        if not os.path.exists(folder_path):
            return jsonify({
                'status': 'error',
                'message': 'Folder does not exist'
            }), 404
        
        # For now, just return success - in a real implementation this would set up file watching
        return jsonify({
            'status': 'success',
            'message': 'Folder watching enabled',
            'path': folder_path
        })
        
    except Exception as e:
        logger.error(f"Error setting up folder watching: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    logger.info(f"Default save path: {DEFAULT_SAVE_PATH}")
    app.run(host='0.0.0.0', port=5000, debug=True) 