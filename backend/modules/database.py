import os
import json
import sqlite3
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Simple database manager for storing analysis results and calibration data"""
    
    def __init__(self, db_path="envision.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create analyses table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL,
                    analysis_type TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    results TEXT NOT NULL,
                    processed_image TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create calibrations table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS calibrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pixel_size REAL NOT NULL,
                    known_distance REAL NOT NULL,
                    pixel_count INTEGER NOT NULL,
                    timestamp TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create camera_settings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS camera_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id TEXT NOT NULL,
                    resolution TEXT NOT NULL,
                    frame_rate INTEGER NOT NULL,
                    exposure TEXT,
                    gain TEXT,
                    white_balance TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise
    
    def save_analysis(self, analysis_data):
        """Save analysis results to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO analyses (filename, analysis_type, timestamp, results, processed_image)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                analysis_data['filename'],
                analysis_data['analysis_type'],
                analysis_data['timestamp'],
                json.dumps(analysis_data['results']),
                analysis_data.get('processed_image', '')
            ))
            
            analysis_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            logger.info(f"Analysis saved with ID: {analysis_id}")
            return analysis_id
            
        except Exception as e:
            logger.error(f"Error saving analysis: {e}")
            raise
    
    def get_analysis(self, analysis_id):
        """Get specific analysis by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM analyses WHERE id = ?
            ''', (analysis_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return {
                    'id': row[0],
                    'filename': row[1],
                    'analysis_type': row[2],
                    'timestamp': row[3],
                    'results': json.loads(row[4]),
                    'processed_image': row[5],
                    'created_at': row[6]
                }
            return None
            
        except Exception as e:
            logger.error(f"Error getting analysis: {e}")
            raise
    
    def get_recent_analyses(self, limit=10):
        """Get recent analyses"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM analyses 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            conn.close()
            
            analyses = []
            for row in rows:
                analyses.append({
                    'id': row[0],
                    'filename': row[1],
                    'analysis_type': row[2],
                    'timestamp': row[3],
                    'results': json.loads(row[4]),
                    'processed_image': row[5],
                    'created_at': row[6]
                })
            
            return analyses
            
        except Exception as e:
            logger.error(f"Error getting recent analyses: {e}")
            raise
    
    def save_calibration(self, calibration_data):
        """Save calibration data to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO calibrations (pixel_size, known_distance, pixel_count, timestamp)
                VALUES (?, ?, ?, ?)
            ''', (
                calibration_data['pixel_size'],
                calibration_data['known_distance'],
                calibration_data['pixel_count'],
                calibration_data['timestamp']
            ))
            
            calibration_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            logger.info(f"Calibration saved with ID: {calibration_id}")
            return calibration_id
            
        except Exception as e:
            logger.error(f"Error saving calibration: {e}")
            raise
    
    def get_latest_calibration(self):
        """Get the most recent calibration data"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM calibrations 
                ORDER BY created_at DESC 
                LIMIT 1
            ''')
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return {
                    'id': row[0],
                    'pixel_size': row[1],
                    'known_distance': row[2],
                    'pixel_count': row[3],
                    'timestamp': row[4],
                    'created_at': row[5]
                }
            return None
            
        except Exception as e:
            logger.error(f"Error getting latest calibration: {e}")
            raise
    
    def save_camera_settings(self, settings_data):
        """Save camera settings to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO camera_settings (device_id, resolution, frame_rate, exposure, gain, white_balance)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                settings_data['device_id'],
                settings_data['resolution'],
                settings_data['frame_rate'],
                settings_data.get('exposure', 'auto'),
                settings_data.get('gain', 'auto'),
                settings_data.get('white_balance', 'auto')
            ))
            
            settings_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            logger.info(f"Camera settings saved with ID: {settings_id}")
            return settings_id
            
        except Exception as e:
            logger.error(f"Error saving camera settings: {e}")
            raise
    
    def get_camera_settings(self, device_id):
        """Get camera settings for a specific device"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM camera_settings 
                WHERE device_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ''', (device_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return {
                    'id': row[0],
                    'device_id': row[1],
                    'resolution': row[2],
                    'frame_rate': row[3],
                    'exposure': row[4],
                    'gain': row[5],
                    'white_balance': row[6],
                    'created_at': row[7]
                }
            return None
            
        except Exception as e:
            logger.error(f"Error getting camera settings: {e}")
            raise
    
    def search_analyses(self, query, analysis_type=None, date_from=None, date_to=None):
        """Search analyses with filters"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            sql = "SELECT * FROM analyses WHERE 1=1"
            params = []
            
            if query:
                sql += " AND (filename LIKE ? OR analysis_type LIKE ?)"
                params.extend([f"%{query}%", f"%{query}%"])
            
            if analysis_type:
                sql += " AND analysis_type = ?"
                params.append(analysis_type)
            
            if date_from:
                sql += " AND created_at >= ?"
                params.append(date_from)
            
            if date_to:
                sql += " AND created_at <= ?"
                params.append(date_to)
            
            sql += " ORDER BY created_at DESC"
            
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            conn.close()
            
            analyses = []
            for row in rows:
                analyses.append({
                    'id': row[0],
                    'filename': row[1],
                    'analysis_type': row[2],
                    'timestamp': row[3],
                    'results': json.loads(row[4]),
                    'processed_image': row[5],
                    'created_at': row[6]
                })
            
            return analyses
            
        except Exception as e:
            logger.error(f"Error searching analyses: {e}")
            raise
    
    def delete_analysis(self, analysis_id):
        """Delete an analysis by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM analyses WHERE id = ?', (analysis_id,))
            
            if cursor.rowcount > 0:
                conn.commit()
                conn.close()
                logger.info(f"Analysis {analysis_id} deleted successfully")
                return True
            else:
                conn.close()
                logger.warning(f"Analysis {analysis_id} not found")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting analysis: {e}")
            raise
    
    def get_statistics(self):
        """Get analysis statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Total analyses
            cursor.execute('SELECT COUNT(*) FROM analyses')
            total_analyses = cursor.fetchone()[0]
            
            # Analyses by type
            cursor.execute('''
                SELECT analysis_type, COUNT(*) 
                FROM analyses 
                GROUP BY analysis_type
            ''')
            analyses_by_type = dict(cursor.fetchall())
            
            # Recent activity (last 7 days)
            cursor.execute('''
                SELECT COUNT(*) 
                FROM analyses 
                WHERE created_at >= datetime('now', '-7 days')
            ''')
            recent_analyses = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'total_analyses': total_analyses,
                'analyses_by_type': analyses_by_type,
                'recent_analyses': recent_analyses
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            raise
    
    def backup_database(self, backup_path):
        """Create a backup of the database"""
        try:
            import shutil
            shutil.copy2(self.db_path, backup_path)
            logger.info(f"Database backed up to: {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Error backing up database: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        # SQLite connections are automatically closed, but this method is provided for consistency
        pass
