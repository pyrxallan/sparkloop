import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, MessageCircle, Zap } from 'lucide-react';

const DiscoverPage = ({ matches, onNewMatch }) => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const potentialMatches = [
    {
      id: 'potential_1',
      name: 'Jordan Lee',
      age: 26,
      bio: 'Foodie & travel enthusiast 🌍',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
      interests: ['Cooking', 'Travel', 'Photography']
    },
    {
      id: 'potential_2',
      name: 'Taylor Park',
      age: 28,
      bio: 'Yoga instructor & nature lover 🧘',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor',
      interests: ['Yoga', 'Hiking', 'Meditation']
    },
    {
      id: 'potential_3',
      name: 'Morgan Smith',
      age: 25,
      bio: 'Artist & coffee connoisseur ☕',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morgan',
      interests: ['Art', 'Coffee', 'Music']
    }
  ];

  const currentCard = potentialMatches[currentCardIndex];

  const handleSwipe = (liked) => {
    if (liked && currentCard) {
      const newMatch = {
        id: 'match_' + Date.now(),
        userId: currentCard.id,
        name: currentCard.name,
        age: currentCard.age,
        bio: currentCard.bio,
        photoUrl: currentCard.photoUrl,
        matchedAt: Date.now(),
        expiresAt: Date.now() + 86400000, // 24 hours
        messageCount: 0,
        iceBreaker: `Hey! I noticed we both love ${currentCard.interests[0]}. What got you into it?`
      };
      onNewMatch(newMatch);
    }
    
    setCurrentCardIndex((currentCardIndex + 1) % potentialMatches.length);
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">No more profiles to show</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header matchCount={matches.length} onMatchesClick={() => navigate('/matches')} />

      {/* Profile Card */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <ProfileCard profile={currentCard} onSwipe={handleSwipe} />
      </div>
    </div>
  );
};

const Header = ({ matchCount, onMatchesClick }) => (
  <div className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Zap className="w-8 h-8 text-purple-600" />
        <span className="font-bold text-xl">SparkLoop</span>
      </div>
      <button onClick={onMatchesClick} className="relative">
        <MessageCircle className="w-6 h-6 text-gray-600" />
        {matchCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {matchCount}
          </span>
        )}
      </button>
    </div>
  </div>
);

const ProfileCard = ({ profile, onSwipe }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <img
      src={profile.photoUrl}
      alt={profile.name}
      className="w-full h-96 object-cover"
    />
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-2">
        {profile.name}, {profile.age}
      </h3>
      <p className="text-gray-600 mb-4">{profile.bio}</p>
      
      {/* Interests */}
      <div className="flex flex-wrap gap-2 mb-6">
        {profile.interests.map((interest, idx) => (
          <span
            key={idx}
            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
          >
            {interest}
          </span>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onSwipe(false)}
          className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Pass
        </button>
        <button
          onClick={() => onSwipe(true)}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5" />
          Like
        </button>
      </div>
    </div>
  </div>
);

export default DiscoverPage;