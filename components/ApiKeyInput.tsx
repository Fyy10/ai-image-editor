import React, { useState } from 'react';

interface ApiKeyInputProps {
    onSave: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <main className="mt-8 w-full max-w-md mx-auto bg-gray-800/50 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700 backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-4">Enter Your Gemini API Key</h2>
                <p className="text-center text-gray-400 mb-6">
                    You can get your API key from Google AI Studio. The key will be saved in your browser's local storage.
                </p>
                <div className="relative">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Enter your API key..."
                        className="w-full p-3 pr-10 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                        required
                        aria-label="Gemini API Key Input"
                    />
                    <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
                        aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    >
                        {showKey ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              <path d="M10 17a9.953 9.953 0 01-4.522-.992l.938-1.002a8.003 8.003 0 008.168-8.168l1.002-.938A9.953 9.953 0 0110 17z" />
                           </svg>
                        )}
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={!key.trim()}
                    className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save & Start Editing
                </button>
            </form>
        </main>
    );
};
