import React, { useState, useRef } from 'react';

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });
    
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setBaseSize({ width: img.clientWidth, height: img.clientHeight });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale === 1) return;
        e.preventDefault();
        setIsDragging(true);
        setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(0.1, scale * scaleAmount), 10);
        
        // Zoom towards the mouse pointer
        const rect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newX = mouseX - (mouseX - position.x) * (newScale / scale);
        const newY = mouseY - (mouseY - position.y) * (newScale / scale);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    };

    const zoomIn = () => setScale(s => Math.min(s * 1.2, 10));
    const zoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));
    
    const fitToScreen = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const zoomToOriginal = () => {
        if (baseSize.width > 0 && naturalSize.width > 0) {
            const originalScale = naturalSize.width / baseSize.width;
            setScale(originalScale);
            setPosition({ x: 0, y: 0 });
        }
    };

    const cursor = isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default');

    const displayPercentage = baseSize.width > 0 && naturalSize.width > 0
        ? (baseSize.width * scale / naturalSize.width) * 100
        : scale * 100;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50"
            onClick={onClose}
        >
            <div 
                ref={containerRef}
                className="relative w-full h-full flex justify-center items-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <img 
                    ref={imageRef}
                    src={imageUrl} 
                    alt="Enlarged preview" 
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-100"
                    style={{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`, cursor }}
                    onMouseDown={handleMouseDown}
                    onLoad={handleImageLoad}
                />
            </div>
            <div 
                className="absolute bottom-4 bg-gray-800 bg-opacity-70 text-white rounded-full p-2 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={zoomOut} className="p-2 hover:bg-gray-700 rounded-full" title="Zoom Out">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6" /></svg>
                </button>
                <span className="min-w-[50px] text-center font-semibold">{displayPercentage.toFixed(0)}%</span>
                <button onClick={zoomIn} className="p-2 hover:bg-gray-700 rounded-full" title="Zoom In">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" /></svg>
                </button>
                <div className="border-l border-gray-600 h-6 mx-2"></div>
                <button onClick={fitToScreen} className="p-2 hover:bg-gray-700 rounded-full" title="Fit to Screen">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5" /></svg>
                </button>
                <button onClick={zoomToOriginal} className="p-2 hover:bg-gray-700 rounded-full" title="Original Size (1:1)">
                    <span className="font-bold text-sm">1:1</span>
                </button>
            </div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close image preview"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};
