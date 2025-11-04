import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, MessageCircle, Zap, Users } from 'lucide-react';

const LandingPage = ({ onSocialLogin }) => {
  const navigate = useNavigate();

  const handleLogin = async (provider) => {
    try {
      await onSocialLogin(provider);
      navigate('/onboarding');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center text-white mb-16">
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-16 h-16 mr-3" />
            <h1 className="text-6xl font-bold">SparkLoop</h1>
          </div>
          <p className="text-2xl mb-8">
            Real connections. Real conversations. 24 hours to spark.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Clock className="w-12 h-12 mb-4 mx-auto" />}
            title="24-Hour Timer"
            description="Matches expire if no one speaks. No ghosting, just real conversations."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 mb-4 mx-auto" />}
            title="Verified Selfies"
            description="Real-time photo verification. No catfishing, guaranteed authenticity."
          />
          <FeatureCard
            icon={<MessageCircle className="w-12 h-12 mb-4 mx-auto" />}
            title="AI Ice Breakers"
            description="Smart conversation starters based on shared interests."
          />
        </div>

        {/* Auth Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={() => handleLogin('google')}
            className="w-full bg-white text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-3"
          >
            <Users className="w-5 h-5" />
            Continue with Google
          </button>
          <button
            onClick={() => handleLogin('github')}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-3"
          >
            <Users className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white">
    {icon}
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p>{description}</p>
  </div>
);

export default LandingPage;