import React from 'react';

interface ImageDisplayProps {
    previousImage: string;
    editedImage: string | null;
    editedText: string | null;
    onPreview: (imageUrl: string) => void;
    onDownload: (imageUrl: string) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ previousImage, editedImage, editedText, onPreview, onDownload }) => {

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Before</h3>
                    <img 
                        src={previousImage} 
                        alt="Before edit" 
                        className="w-full h-auto rounded-lg shadow-lg cursor-pointer"
                        onClick={() => onPreview(previousImage)}
                    />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">After</h3>
                    {editedImage ? (
                        <div>
                             <img 
                                src={editedImage} 
                                alt="Edited by AI" 
                                className="w-full h-auto rounded-lg shadow-lg cursor-pointer"
                                onClick={() => onPreview(editedImage)}
                             />
                             <button
                                onClick={() => onDownload(editedImage)}
                                className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all duration-300 ease-in-out transform hover:scale-105"
                                aria-label="Download edited image"
                            >
                                Download Image
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">No image generated.</p>
                        </div>
                    )}
                </div>
            </div>
            {editedText && (
                 <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-purple-300 mb-2">AI's Note:</h4>
                    <p className="text-gray-300 italic">"{editedText}"</p>
                </div>
            )}
        </div>
    );
};
