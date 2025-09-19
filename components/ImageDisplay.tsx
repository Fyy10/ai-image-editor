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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
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
