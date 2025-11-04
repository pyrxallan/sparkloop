import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Send } from 'lucide-react';

const ChatPage = ({ selectedMatch, onSendMessage }) => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: selectedMatch?.iceBreaker || 'Hey there! Nice to match with you!',
      sender: 'them',
      timestamp: Date.now() - 3600000
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'me',
      timestamp: Date.now()
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // Notify parent component
    if (onSendMessage) {
      onSendMessage(matchId, message);
    }

    // Simulate response (in real app, this would come from Firestore)
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: 'Thanks for your message! This is a demo response.',
        sender: 'them',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedMatch) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Match not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <ChatHeader match={selectedMatch} onBack={() => navigate('/matches')} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

const ChatHeader = ({ match, onBack }) => {
  const getTimeRemaining = (expiresAt) => {
    const remaining = expiresAt - Date.now();
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          ← Back
        </button>
        
        <img
          src={match.photoUrl}
          alt={match.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <h3 className="font-semibold">{match.name}</h3>
          <div className="flex items-center gap-1 text-xs text-orange-500">
            <Clock className="w-3 h-3" />
            <span>Expires in {getTimeRemaining(match.expiresAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isMe = message.sender === 'me';
  
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-3 rounded-2xl ${
          isMe
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
        }`}
      >
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};

const MessageInput = ({ value, onChange, onSend, onKeyPress }) => (
  <div className="bg-white border-t p-4">
    <div className="flex gap-2 max-w-4xl mx-auto">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Type a message..."
        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
      />
      <button
        onClick={onSend}
        disabled={!value.trim()}
        className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        Send
      </button>
    </div>
  </div>
);

export default ChatPage;