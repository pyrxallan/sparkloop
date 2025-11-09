import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Shield, CheckCircle } from 'lucide-react';
import { requestCameraAccess, capturePhotoFromVideo, verifyPhoto, stopCameraStream } from '../services/verificationService';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const VerificationPage = ({ onVerificationComplete }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [verificationStep, setVerificationStep] = useState('idle');
  const [error, setError] = useState('');

  const startCamera = async () => {
    try {
      const mediaStream = await requestCameraAccess();
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCapturing(true);
      setError('');
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Please allow camera access for verification');
      alert('Please allow camera access for verification');
    }
  };

  const capturePhoto = async () => {
    try {
      setVerificationStep('verifying');

      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      // Resolve profile photo URL (prefer Firestore user.photoURL, fallback to auth.photoURL)
      let profilePhotoUrl = null;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data()?.photoURL) {
        profilePhotoUrl = userSnap.data().photoURL;
      } else if (user.photoURL) {
        profilePhotoUrl = user.photoURL;
      }
      if (!profilePhotoUrl) {
        throw new Error('No profile photo found. Please add a profile photo during onboarding.');
      }

      // Fetch profile photo blob
      const profileResp = await fetch(profilePhotoUrl);
      const profileBlob = await profileResp.blob();

      // Capture selfie blob
      const selfieBlob = await capturePhotoFromVideo(videoRef.current);

      // Verify via Face++
      const result = await verifyPhoto(profileBlob, selfieBlob);

      if (result.success && result.verified) {
        // Update Firestore user document
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          verified: true,
          verifiedAt: new Date().toISOString(),
          verificationConfidence: result.confidence
        });

        setVerificationStep('verified');
        stopCamera();
        onVerificationComplete({ verified: true, timestamp: Date.now() });
        setTimeout(() => navigate('/discover'), 1200);
      } else {
        setVerificationStep('idle');
        setError(result.message || 'Verification failed. Please try again.');
        alert(result.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStep('idle');
      setError(err.message);
      alert(err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stopCameraStream(stream);
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

        {!capturing && verificationStep === 'idle' && (
          <button
            onClick={startCamera}
            className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-3"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        )}

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

        {verificationStep === 'verifying' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your photo...</p>
            <p className="text-sm text-gray-500 mt-2">
              Comparing with profile picture
            </p>
          </div>
        )}

        {verificationStep === 'verified' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-800 font-semibold text-xl">
              Verified Successfully!
            </p>
            <p className="text-gray-600 mt-2">Redirecting to discover...</p>
          </div>
        )}

        {verificationStep === 'idle' && (
          <button
            onClick={skipVerification}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 transition text-sm"
          >
            Skip for now
          </button>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;