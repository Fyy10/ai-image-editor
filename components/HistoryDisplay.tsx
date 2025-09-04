import React from 'react';

interface HistoryItem {
    id: string;
    imageDataUrl: string;
}

interface HistoryDisplayProps {
    history: HistoryItem[];
    onRevert: (index: number) => void;
    currentIndex: number;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onRevert, currentIndex }) => {

    const handleDownload = (e: React.MouseEvent, item: HistoryItem, index: number) => {
        e.stopPropagation(); // Prevent the revert action from firing

        const link = document.createElement('a');
        link.href = item.imageDataUrl;

        const mimeType = item.imageDataUrl.substring(item.imageDataUrl.indexOf(':') + 1, item.imageDataUrl.indexOf(';'));
        const extension = mimeType.split('/')[1] || 'png';
        
        const version = index === 0 ? 'original' : `v${index + 1}`;
        link.download = `edited-${version}-by-nano-banana.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-200">3. Edit History</h2>
            <div className="flex flex-wrap gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                {history.map((item, index) => (
                     <div key={item.id} className="relative group">
                        <button
                            onClick={() => onRevert(index)}
                            className={`rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                index === currentIndex
                                    ? 'border-purple-500 scale-105 shadow-lg'
                                    : 'border-transparent hover:border-purple-400'
                            }`}
                            aria-label={`Revert to version ${index + 1}`}
                        >
                            <img
                                src={item.imageDataUrl}
                                alt={`History version ${index + 1}`}
                                className="w-20 h-20 object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5 pointer-events-none">
                                {index === 0 ? 'Original' : `V${index + 1}`}
                            </div>
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
