import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
    apiKey?: string;
    onSave: (apiKey: string) => void;
    onCancel?: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onSave, onCancel }) => {
    const [key, setKey] = useState(apiKey || '');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        setKey(apiKey || '');
    }, [apiKey]);

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
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>

                        )}
                    </button>
                </div>
                <div className="flex items-center gap-4 mt-6">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors duration-300"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!key.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {onCancel ? 'Save Key' : 'Save & Start Editing'}
                    </button>
                </div>
            </form>
        </main>
    );
};
