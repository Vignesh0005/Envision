class ImageProcessor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  // Load image to canvas
  loadImage(imageSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx.drawImage(img, 0, 0);
          resolve();
        } catch (error) {
          reject(new Error('Failed to draw image to canvas: ' + error.message));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSrc;
    });
  }

  // Get image data
  getImageData() {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  // Put image data back to canvas
  putImageData(imageData) {
    this.ctx.putImageData(imageData, 0, 0);
  }

  // Convert canvas to data URL
  toDataURL(format = 'image/png', quality = 0.9) {
    return this.canvas.toDataURL(format, quality);
  }

  // Basic Operations
  rotate(angle) {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');
    
    // Calculate new dimensions
    const width = this.canvas.width;
    const height = this.canvas.height;
    const newWidth = Math.abs(width * cos) + Math.abs(height * sin);
    const newHeight = Math.abs(width * sin) + Math.abs(height * cos);
    
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;
    
    // Move to center and rotate
    newCtx.translate(newWidth / 2, newHeight / 2);
    newCtx.rotate(radians);
    newCtx.drawImage(this.canvas, -width / 2, -height / 2);
    
    // Update main canvas
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.ctx.drawImage(newCanvas, 0, 0);
  }

  flip(direction) {
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');
    
    newCanvas.width = this.canvas.width;
    newCanvas.height = this.canvas.height;
    
    if (direction === 'horizontal') {
      newCtx.scale(-1, 1);
      newCtx.translate(-this.canvas.width, 0);
    } else {
      newCtx.scale(1, -1);
      newCtx.translate(0, -this.canvas.height);
    }
    
    newCtx.drawImage(this.canvas, 0, 0);
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(newCanvas, 0, 0);
  }

  // Brightness and Contrast
  adjustBrightnessContrast(brightness, contrast) {
    const imageData = this.getImageData();
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness));     // R
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness)); // G
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness)); // B
    }
    
    this.putImageData(imageData);
  }

  // Grayscale
  grayscale() {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;     // R
        data[i + 1] = gray; // G
        data[i + 2] = gray; // B
      }
      
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in grayscale:', error);
      throw new Error('Failed to apply grayscale: ' + error.message);
    }
  }

  // Invert
  invert() {
    const imageData = this.getImageData();
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];         // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
    }
    
    this.putImageData(imageData);
  }

  // Gaussian Blur
  gaussianBlur(kernelSize = 5, sigma = 1.0) {
    try {
      const kernel = this.createGaussianKernel(kernelSize, sigma);
      this.applyConvolution(kernel);
    } catch (error) {
      console.error('Error in gaussianBlur:', error);
      throw new Error('Failed to apply Gaussian blur: ' + error.message);
    }
  }

  createGaussianKernel(size, sigma) {
    const kernel = [];
    const center = Math.floor(size / 2);
    let sum = 0;
    
    for (let i = 0; i < size; i++) {
      kernel[i] = [];
      for (let j = 0; j < size; j++) {
        const x = i - center;
        const y = j - center;
        const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
        kernel[i][j] = value;
        sum += value;
      }
    }
    
    // Normalize
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        kernel[i][j] /= sum;
      }
    }
    
    return kernel;
  }

  // Median Filter
  medianFilter(kernelSize = 5) {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const halfKernel = Math.floor(kernelSize / 2);
      
      const newData = new Uint8ClampedArray(data);
      
      for (let y = halfKernel; y < height - halfKernel; y++) {
        for (let x = halfKernel; x < width - halfKernel; x++) {
          const idx = (y * width + x) * 4;
          const rValues = [];
          const gValues = [];
          const bValues = [];
          
          // Collect values in kernel for each channel
          for (let ky = -halfKernel; ky <= halfKernel; ky++) {
            for (let kx = -halfKernel; kx <= halfKernel; kx++) {
              const kIdx = ((y + ky) * width + (x + kx)) * 4;
              rValues.push(data[kIdx]);
              gValues.push(data[kIdx + 1]);
              bValues.push(data[kIdx + 2]);
            }
          }
          
          // Sort and get median for each channel
          rValues.sort((a, b) => a - b);
          gValues.sort((a, b) => a - b);
          bValues.sort((a, b) => a - b);
          
          const medianIdx = Math.floor(rValues.length / 2);
          
          newData[idx] = rValues[medianIdx];     // R
          newData[idx + 1] = gValues[medianIdx]; // G
          newData[idx + 2] = bValues[medianIdx]; // B
        }
      }
      
      imageData.data.set(newData);
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in medianFilter:', error);
      throw new Error('Failed to apply median filter: ' + error.message);
    }
  }

  // Edge Detection - Sobel
  sobelEdgeDetection() {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      
      // Convert to grayscale first
      this.grayscale();
      const grayData = this.getImageData().data;
      
      const newData = new Uint8ClampedArray(data);
      
      const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
      const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          let gx = 0, gy = 0;
          
          // Apply Sobel kernels
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const kIdx = ((y + ky) * width + (x + kx)) * 4;
              const pixel = grayData[kIdx];
              gx += pixel * sobelX[ky + 1][kx + 1];
              gy += pixel * sobelY[ky + 1][kx + 1];
            }
          }
          
          const magnitude = Math.sqrt(gx * gx + gy * gy);
          const edgeValue = Math.min(255, magnitude);
          
          newData[idx] = edgeValue;     // R
          newData[idx + 1] = edgeValue; // G
          newData[idx + 2] = edgeValue; // B
        }
      }
      
      imageData.data.set(newData);
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in sobelEdgeDetection:', error);
      throw new Error('Failed to apply Sobel edge detection: ' + error.message);
    }
  }

  // Histogram Equalization
  histogramEqualization() {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      
      // Convert to grayscale first
      this.grayscale();
      const grayData = this.getImageData().data;
      
      // Calculate histogram
      const histogram = new Array(256).fill(0);
      for (let i = 0; i < grayData.length; i += 4) {
        histogram[grayData[i]]++;
      }
      
      // Calculate cumulative distribution
      const cdf = new Array(256).fill(0);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }
      
      // Normalize CDF
      const cdfMin = cdf.find(val => val > 0);
      const cdfMax = cdf[255];
      for (let i = 0; i < 256; i++) {
        cdf[i] = ((cdf[i] - cdfMin) / (cdfMax - cdfMin)) * 255;
      }
      
      // Apply equalization
      for (let i = 0; i < data.length; i += 4) {
        const gray = grayData[i];
        const newValue = Math.round(cdf[gray]);
        data[i] = newValue;     // R
        data[i + 1] = newValue; // G
        data[i + 2] = newValue; // B
      }
      
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in histogramEqualization:', error);
      throw new Error('Failed to apply histogram equalization: ' + error.message);
    }
  }

  // Threshold
  threshold(value = 128) {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const binary = gray > value ? 255 : 0;
        data[i] = binary;     // R
        data[i + 1] = binary; // G
        data[i + 2] = binary; // B
      }
      
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in threshold:', error);
      throw new Error('Failed to apply threshold: ' + error.message);
    }
  }

  // Noise Reduction (Simple)
  noiseReduction() {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      
      const newData = new Uint8ClampedArray(data);
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          // Simple 3x3 averaging
          let r = 0, g = 0, b = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const kIdx = ((y + ky) * width + (x + kx)) * 4;
              r += data[kIdx];
              g += data[kIdx + 1];
              b += data[kIdx + 2];
            }
          }
          
          newData[idx] = Math.round(r / 9);     // R
          newData[idx + 1] = Math.round(g / 9); // G
          newData[idx + 2] = Math.round(b / 9); // B
        }
      }
      
      imageData.data.set(newData);
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in noiseReduction:', error);
      throw new Error('Failed to apply noise reduction: ' + error.message);
    }
  }

  // Sharpening
  sharpen() {
    try {
      const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ];
      this.applyConvolution(kernel);
    } catch (error) {
      console.error('Error in sharpen:', error);
      throw new Error('Failed to apply sharpening: ' + error.message);
    }
  }

  // Apply convolution kernel
  applyConvolution(kernel) {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const kernelSize = kernel.length;
      const halfKernel = Math.floor(kernelSize / 2);
      
      const newData = new Uint8ClampedArray(data);
      
      for (let y = halfKernel; y < height - halfKernel; y++) {
        for (let x = halfKernel; x < width - halfKernel; x++) {
          const idx = (y * width + x) * 4;
          
          let r = 0, g = 0, b = 0;
          
          // Apply kernel
          for (let ky = 0; ky < kernelSize; ky++) {
            for (let kx = 0; kx < kernelSize; kx++) {
              const kIdx = ((y + ky - halfKernel) * width + (x + kx - halfKernel)) * 4;
              const weight = kernel[ky][kx];
              r += data[kIdx] * weight;
              g += data[kIdx + 1] * weight;
              b += data[kIdx + 2] * weight;
            }
          }
          
          newData[idx] = Math.max(0, Math.min(255, Math.round(r)));     // R
          newData[idx + 1] = Math.max(0, Math.min(255, Math.round(g))); // G
          newData[idx + 2] = Math.max(0, Math.min(255, Math.round(b))); // B
        }
      }
      
      imageData.data.set(newData);
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in applyConvolution:', error);
      throw new Error('Failed to apply convolution: ' + error.message);
    }
  }

  // Morphological Operations
  erosion(kernelSize = 3) {
    try {
      this.morphologicalOperation('erosion', kernelSize);
    } catch (error) {
      console.error('Error in erosion:', error);
      throw new Error('Failed to apply erosion: ' + error.message);
    }
  }

  dilation(kernelSize = 3) {
    try {
      this.morphologicalOperation('dilation', kernelSize);
    } catch (error) {
      console.error('Error in dilation:', error);
      throw new Error('Failed to apply dilation: ' + error.message);
    }
  }

  morphologicalOperation(operation, kernelSize) {
    try {
      const imageData = this.getImageData();
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const halfKernel = Math.floor(kernelSize / 2);
      
      // Convert to binary first
      this.threshold(128);
      const binaryData = this.getImageData().data;
      
      const newData = new Uint8ClampedArray(data);
      
      for (let y = halfKernel; y < height - halfKernel; y++) {
        for (let x = halfKernel; x < width - halfKernel; x++) {
          const idx = (y * width + x) * 4;
          let result;
          
          if (operation === 'erosion') {
            result = 255; // Start with white
            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
              for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                const kIdx = ((y + ky) * width + (x + kx)) * 4;
                if (binaryData[kIdx] === 0) { // If any pixel is black
                  result = 0;
                  break;
                }
              }
              if (result === 0) break;
            }
          } else { // dilation
            result = 0; // Start with black
            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
              for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                const kIdx = ((y + ky) * width + (x + kx)) * 4;
                if (binaryData[kIdx] === 255) { // If any pixel is white
                  result = 255;
                  break;
                }
              }
              if (result === 255) break;
            }
          }
          
          newData[idx] = result;     // R
          newData[idx + 1] = result; // G
          newData[idx + 2] = result; // B
        }
      }
      
      imageData.data.set(newData);
      this.putImageData(imageData);
    } catch (error) {
      console.error('Error in morphologicalOperation:', error);
      throw new Error('Failed to apply morphological operation: ' + error.message);
    }
  }
}

export default ImageProcessor;
