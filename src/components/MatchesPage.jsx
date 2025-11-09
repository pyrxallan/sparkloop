import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Zap, Clock } from 'lucide-react';

const MatchesPage = ({ matches, onSelectMatch }) => {
  const navigate = useNavigate();

  const openChat = (match) => {
    onSelectMatch?.(match);
    navigate(`/chat/${match.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header count={matches.length} />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {matches.length === 0 ? (
          <EmptyState />)
          : (
          <ul className="space-y-3">
            {matches.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => openChat(m)}
                  className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition"
                >
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{m.name}</p>
                      {typeof m.messageCount === 'number' && m.messageCount > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">
                          {m.messageCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {m.iceBreaker || 'Say hi to start the chat'}
                    </p>
                    <ExpireIn expiresAt={m.expiresAt} />
                  </div>
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const Header = ({ count }) => (
  <div className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Zap className="w-7 h-7 text-purple-600" />
        <span className="font-bold text-xl">Matches</span>
      </div>
      <span className="text-sm text-gray-500">{count} active</span>
    </div>
  </div>
);

const ExpireIn = ({ expiresAt }) => {
  const remaining = (expiresAt || 0) - Date.now();
  if (!expiresAt || remaining <= 0) return null;
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  return (
    <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
      <Clock className="w-3 h-3" />
      <span>Expires in {hours > 0 ? `${hours}h` : `${minutes}m`}</span>
    </div>
  );
};

const EmptyState = () => (
  <div className="bg-white rounded-xl p-8 text-center text-gray-600">
    No matches yet. Start discovering people and make your first connection!
  </div>
);

export default MatchesPage;