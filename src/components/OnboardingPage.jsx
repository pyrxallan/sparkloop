import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = ({ onProfileComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: []
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 18) newErrors.age = 'Must be 18 or older';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onProfileComplete(formData);
      navigate('/verify');
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Create Your Profile
        </h2>
        
        <div className="space-y-4">
          {/* Name Input */}
          <InputField
            label="Name"
            type="text"
            value={formData.name}
            onChange={(value) => handleChange('name', value)}
            error={errors.name}
            placeholder="Enter your name"
          />

          {/* Age Input */}
          <InputField
            label="Age"
            type="number"
            value={formData.age}
            onChange={(value) => handleChange('age', value)}
            error={errors.age}
            placeholder="Must be 18+"
            min="18"
          />

          {/* Bio Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Continue to Verification
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, type, value, onChange, error, placeholder, min }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder={placeholder}
      min={min}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default OnboardingPage;