class CaptureManager {
  constructor() {
    this.storageKey = 'envision_captures';
    this.loadCaptures();
  }

  loadCaptures() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.captures = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading captures:', error);
      this.captures = [];
    }
  }

  saveCaptures() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.captures));
    } catch (error) {
      console.error('Error saving captures:', error);
    }
  }

  addCapture(imageData, metadata = {}) {
    const capture = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      imageData: imageData,
      metadata: {
        resolution: metadata.resolution || 'Unknown',
        magnification: metadata.magnification || 'Unknown',
        camera: metadata.camera || 'Unknown',
        notes: metadata.notes || '',
        tags: metadata.tags || [],
        analysisType: metadata.analysisType || 'general',
        ...metadata
      }
    };

    this.captures.unshift(capture);
    this.saveCaptures();
    return capture;
  }

  getCaptures() {
    return this.captures;
  }

  getCapturesByType(analysisType) {
    return this.captures.filter(capture => 
      capture.metadata.analysisType === analysisType
    );
  }

  getRecentCaptures(limit = 10) {
    return this.captures.slice(0, limit);
  }

  deleteCapture(id) {
    const index = this.captures.findIndex(capture => capture.id === id);
    if (index > -1) {
      this.captures.splice(index, 1);
      this.saveCaptures();
      return true;
    }
    return false;
  }

  clearAllCaptures() {
    this.captures = [];
    this.saveCaptures();
  }
}

const captureManager = new CaptureManager();
export default captureManager;
