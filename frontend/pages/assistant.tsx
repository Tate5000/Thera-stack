import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../components/auth/AuthGuard';
import { useAuth } from '../context/AuthContext';
import aiAssistantService, { Message, AssistantContext } from '../services/aiAssistantService';

const AIAssistantPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [aiContext, setAiContext] = useState<AssistantContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load message history and context on initial load
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;
      
      try {
        // Load context and message history concurrently
        const [contextResult, messagesResult] = await Promise.all([
          aiAssistantService.getAssistantContext(user.id),
          aiAssistantService.getMessageHistory(user.id)
        ]);
        
        setAiContext(contextResult);
        setMessages(messagesResult);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, [user?.id]);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.id) return;
    
    // Add user message to UI immediately for responsiveness
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to AI service
      const aiResponse = await aiAssistantService.sendMessage({
        userId: user.id,
        content: input
      });
      
      // Update messages with the AI response
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message if the request fails
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">AI Therapy Assistant</h1>
            <p className="text-gray-600">Your personal therapy support companion</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden bg-white shadow rounded-lg">
          {/* Sidebar for context and settings */}
          <div className="hidden md:block w-1/4 border-r p-4 overflow-auto">
            <h2 className="text-lg font-semibold mb-2">Assistant Context</h2>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Available data:</div>
              <div className="space-y-1">
                {aiContext.accessibleData.map((dataType, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm capitalize">{dataType}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-medium mb-2">Capabilities</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Schedule and manage appointments</li>
                <li>• Access billing and payment information</li>
                <li>• Review session history and notes</li>
                <li>• Provide therapeutic resources</li>
                <li>• Assist with insurance claims</li>
              </ul>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-medium mb-2">Privacy Notice</h3>
              <p className="text-sm text-gray-600">
                Your conversations with the AI assistant are private and encrypted. Data is used only to provide assistance and improve your therapy experience.
              </p>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`max-w-3/4 mb-4 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div className={`rounded-lg p-3 ${message.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.sender === 'user' ? 'You' : 'AI Assistant'} • {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center text-gray-500 mb-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="ml-2 text-sm">AI Assistant is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t p-4">
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-r-md ${
                    isLoading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  Send
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                The AI can access your appointments, billing, and session information to provide personalized assistance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AIAssistantPage;