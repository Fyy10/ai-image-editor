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
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 pb-2">
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    );
};
