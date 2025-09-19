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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                                <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                                <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
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
