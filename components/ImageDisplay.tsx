import React from 'react';
import { ImagePreviewModal } from './ImagePreviewModal';

interface ImageDisplayProps {
    previousImages: string[];
    editedImage: string;
    editedText: string | null;
    onPreview: (url: string) => void;
    onDownload: (url: string) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ previousImages, editedImage, editedText, onPreview, onDownload }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-2 gap-4 items-start">
                {/* Before */}
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-400">Before</h3>
                    <div className="w-full p-2 bg-gray-800/50 rounded-lg max-h-96 overflow-y-auto">
                        <div className={`grid ${previousImages.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
                            {previousImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Previous version ${index + 1}`}
                                    className="w-full h-auto rounded-md cursor-pointer"
                                    onClick={() => onPreview(image)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* After */}
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-400">After</h3>
                    <div className="w-full relative group">
                        <img
                            src={editedImage}
                            alt="Edited version"
                            className="w-full h-auto rounded-md cursor-pointer"
                            onClick={() => onPreview(editedImage)}
                        />
                        <button
                            onClick={() => onDownload(editedImage)}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Download edited image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* AI's Note */}
            {editedText && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-purple-300 mb-2">AI's Note:</h4>
                    <p className="text-gray-300 italic">"{editedText}"</p>
                </div>
            )}
        </div>
    );
};
