
import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Warming up the AI's creative circuits...",
    "Mixing digital paints...",
    "Consulting with nano bananas for inspiration...",
    "Pixel by pixel, your vision comes to life...",
    "This might take a moment, great art needs time!"
];

export const Loader: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
            <p className="mt-4 text-lg font-semibold text-gray-300 transition-opacity duration-500">{message}</p>
        </div>
    );
};
