import React from 'react';

interface HistoryItem {
    id: string;
    imageDataUrls: string[];
}

interface HistoryDisplayProps {
    history: HistoryItem[];
    onRevert: (index: number) => void;
    currentIndex: number;
    selectedIndices: number[];
    onSelect: (index: number) => void;
    onRemove: (index: number) => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onRevert, currentIndex, selectedIndices, onSelect, onRemove }) => {

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

    const handleItemClick = (index: number) => {
        if (selectedIndices.length > 0) {
            onSelect(index);
        } else {
            onRevert(index);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-200">Edit History</h2>
            <p className="text-sm text-gray-400 mb-2">Click to revert. Long-press or right-click to select multiple images for editing.</p>
            <div className="flex flex-wrap gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                {history.map((item, index) => (
                     <div key={item.id} className="relative group">
                        <button
                            onClick={() => handleItemClick(index)}
                            onContextMenu={(e) => { e.preventDefault(); onSelect(index); }}
                            className={`rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                selectedIndices.includes(index)
                                    ? 'border-blue-500 scale-105 shadow-lg'
                                : index === currentIndex
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                         <button
                            onClick={(e) => handleDownload(e, item, index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label={`Download version ${index + 1}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
