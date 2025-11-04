import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Shield, CheckCircle } from 'lucide-react';

const VerificationPage = ({ onVerificationComplete }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [verificationStep, setVerificationStep] = useState('idle');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCapturing(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Please allow camera access for verification');
    }
  };

  const capturePhoto = async () => {
    setVerificationStep('verifying');
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      // Here you would call Face++ API
      // For now, simulate verification
      setTimeout(() => {
        setVerificationStep('verified');
        stopCamera();
        onVerificationComplete({ verified: true, timestamp: Date.now() });
        setTimeout(() => navigate('/discover'), 2000);
      }, 2000);
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCapturing(false);
    }
  };

  const skipVerification = () => {
    stopCamera();
    navigate('/discover');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            Photo Verification
          </h2>
          <p className="text-gray-600">
            Take a quick selfie to verify your identity
          </p>
        </div>

        {/* Idle State */}
        {!capturing && verificationStep === 'idle' && (
          <button
            onClick={startCamera}
            className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-3"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        )}

        {/* Camera Active */}
        {capturing && verificationStep === 'idle' && (
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg mb-4 transform -scale-x-100"
            />
            <div className="space-y-2">
              <button
                onClick={capturePhoto}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Capture & Verify
              </button>
              <button
                onClick={stopCamera}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Verifying State */}
        {verificationStep === 'verifying' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your photo...</p>
            <p className="text-sm text-gray-500 mt-2">
              Comparing with profile picture
            </p>
          </div>
        )}

        {/* Verified State */}
        {verificationStep === 'verified' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-800 font-semibold text-xl">
              Verified Successfully!
            </p>
            <p className="text-gray-600 mt-2">Redirecting to discover...</p>
          </div>
        )}

        {/* Skip Button */}
        {verificationStep === 'idle' && (
          <button
            onClick={skipVerification}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 transition text-sm"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;