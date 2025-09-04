import React from 'react';

interface HeaderProps {
    onManageApiKey: () => void;
    apiKeyIsSet: boolean;
    onStartOver: () => void;
    hasHistory: boolean;
}


export const Header: React.FC<HeaderProps> = ({ onManageApiKey, apiKeyIsSet, onStartOver, hasHistory }) => {
    return (
        <header className="text-center relative">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                AI Image Editor
            </h1>
            <p className="mt-2 text-lg text-gray-400">
                Powered by Nano Banana <span role="img" aria-label="banana">🍌</span>
            </p>
            <div className="absolute top-0 right-0 mt-2 flex items-center gap-2">
                {hasHistory && (
                    <button
                        onClick={onStartOver}
                        className="bg-red-800 text-white p-2 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-colors duration-300"
                        aria-label="Start Over"
                        title="Start Over"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
                {apiKeyIsSet && (
                     <button
                        onClick={onManageApiKey}
                        className="bg-gray-700 text-gray-300 p-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors duration-300"
                        aria-label="Manage API Key"
                        title="Manage API Key"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    );
};
