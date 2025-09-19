import React from 'react';

interface HistoryItem {
    id: string;
    imageDataUrls: string[];
}

interface HistoryDisplayProps {
    history: HistoryItem[];
    onRevert: (index: number) => void;
    currentIndex: number;
    onRemove: (index: number) => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onRevert, currentIndex, onRemove }) => {

    const handleDownload = (e: React.MouseEvent, item: HistoryItem, index: number) => {
        e.stopPropagation(); // Prevent the revert action from firing

        const link = document.createElement('a');
        link.href = item.imageDataUrls[0];

        const mimeType = item.imageDataUrls[0].substring(item.imageDataUrls[0].indexOf(':') + 1, item.imageDataUrls[0].indexOf(';'));
        const extension = mimeType.split('/')[1] || 'png';

        const version = index === 0 ? 'original' : `v${index + 1}`;
        link.download = `edited-${version}-by-nano-banana.${extension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-200">Edit History</h2>
            <p className="text-sm text-gray-400 mb-2">Click an item to revert to that version.</p>
            <div className="flex flex-wrap gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                {history.map((item, index) => (
                    <div key={item.id} className="relative group">
                        <button
                            onClick={() => onRevert(index)}
                            className={`rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${index === currentIndex
                                    ? 'border-purple-500 scale-105 shadow-lg'
                                    : 'border-transparent hover:border-purple-400'
                                }`}
                            aria-label={`Revert to version ${index + 1}`}
                        >
                            <img
                                src={item.imageDataUrls[0]}
                                alt={`History version ${index + 1}`}
                                className="w-20 h-20 object-cover"
                            />
                            {item.imageDataUrls.length > 1 && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                                    {item.imageDataUrls.length}
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5 pointer-events-none">
                                {index === 0 ? 'Original' : `V${index + 1}`}
                            </div>
                        </button>
                        <button
                            onClick={() => onRemove(index)}
                            className="absolute top-1 left-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label={`Remove version ${index + 1}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => handleDownload(e, item, index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label={`Download version ${index + 1}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
