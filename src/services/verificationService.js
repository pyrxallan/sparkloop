/**
 * Face++ Photo Verification Service
 * Compares a live selfie with a profile photo
 */

const FACEPP_API_URL = 'https://api-us.faceplusplus.com/facepp/v3/compare';
const FACEPP_API_KEY = import.meta.env.VITE_FACEPP_API_KEY;
const FACEPP_API_SECRET = import.meta.env.VITE_FACEPP_API_SECRET;
const CONFIDENCE_THRESHOLD = 80; // 80% similarity threshold

/**
 * Verify photo using Face++ Compare API
 * @param {Blob} profileImage - Profile photo blob
 * @param {Blob} selfieImage - Live selfie blob
 * @returns {Promise<Object>} Verification result
 */
export const verifyPhoto = async (profileImage, selfieImage) => {
  try {
    // Create FormData for API request
    const formData = new FormData();
    formData.append('api_key', FACEPP_API_KEY);
    formData.append('api_secret', FACEPP_API_SECRET);
    formData.append('image_file1', profileImage, 'profile.jpg');
    formData.append('image_file2', selfieImage, 'selfie.jpg');

    // Call Face++ Compare API
    const response = await fetch(FACEPP_API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Face++ API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.error_message) {
      throw new Error(data.error_message);
    }

    // Extract confidence score
    const confidence = data.confidence || 0;
    const verified = confidence >= CONFIDENCE_THRESHOLD;

    return {
      success: true,
      verified,
      confidence,
      threshold: CONFIDENCE_THRESHOLD,
      message: verified 
        ? 'Photo verified successfully!' 
        : 'Photos do not match. Please try again.',
      details: {
        face1Detected: data.faces1?.length > 0,
        face2Detected: data.faces2?.length > 0,
        confidence
      }
    };
  } catch (error) {
    console.error('Photo verification error:', error);
    return {
      success: false,
      verified: false,
      error: error.message,
      message: 'Verification failed. Please try again.'
    };
  }
};

/**
 * Capture photo from video stream
 * @param {HTMLVideoElement} videoElement - Video element with active stream
 * @returns {Promise<Blob>} Photo blob
 */
export const capturePhotoFromVideo = (videoElement) => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture photo'));
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Request camera access
 * @returns {Promise<MediaStream>} Camera stream
 */
export const requestCameraAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user', // Front camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    return stream;
  } catch (error) {
    console.error('Camera access error:', error);
    throw new Error('Camera access denied. Please allow camera permissions.');
  }
};

/**
 * Stop camera stream
 * @param {MediaStream} stream - Active camera stream
 */
export const stopCameraStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

/**
 * Convert data URL to Blob
 * @param {string} dataUrl - Data URL string
 * @returns {Blob} Blob object
 */
export const dataUrlToBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Validate image before verification
 * @param {Blob} imageBlob - Image blob to validate
 * @returns {Promise<boolean>} Validation result
 */
export const validateImage = async (imageBlob) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Check minimum dimensions (e.g., 200x200)
      const isValid = img.width >= 200 && img.height >= 200;
      resolve(isValid);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    
    img.src = url;
  });
};