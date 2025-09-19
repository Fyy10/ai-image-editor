import React, { useState, useRef } from 'react';

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
    onDownload: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose, onDownload }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, imageX: 0, imageY: 0 });
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });

    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPositionRef = useRef({ x: 0, y: 0 });
    const [useTransition, setUseTransition] = useState(true);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setBaseSize({ width: img.clientWidth, height: img.clientHeight });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale === 1) return;
        e.preventDefault();
        setUseTransition(false);
        setIsDragging(true);
        setDragStart({
            mouseX: e.clientX,
            mouseY: e.clientY,
            imageX: position.x,
            imageY: position.y,
        });
        lastPositionRef.current = position;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !imageRef.current) return;
        e.preventDefault();
        const deltaX = e.clientX - dragStart.mouseX;
        const deltaY = e.clientY - dragStart.mouseY;
        const newX = dragStart.imageX + deltaX / scale;
        const newY = dragStart.imageY + deltaY / scale;

        lastPositionRef.current = { x: newX, y: newY };
        imageRef.current.style.transform = `scale(${scale}) translate(${newX}px, ${newY}px)`;
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        setUseTransition(true);
        setPosition(lastPositionRef.current);
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
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Enlarged preview"
                    className={`max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl ${useTransition ? 'transition-transform duration-100' : ''}`}
                    style={{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`, cursor }}
                    onMouseDown={handleMouseDown}
                    onLoad={handleImageLoad}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <div
                className="absolute bottom-4 bg-gray-800 bg-opacity-70 text-white rounded-full p-2 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={zoomOut} className="p-2 hover:bg-gray-700 rounded-full" title="Zoom Out">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Zm4.5 0a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                    </svg>
                </button>
                <span className="min-w-[50px] text-center font-semibold">{displayPercentage.toFixed(0)}%</span>
                <button onClick={zoomIn} className="p-2 hover:bg-gray-700 rounded-full" title="Zoom In">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Zm8.25-3.75a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25v2.25a.75.75 0 0 1-1.5 0v-2.25H7.5a.75.75 0 0 1 0-1.5h2.25V7.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                </button>
                <div className="border-l border-gray-600 h-6 mx-2"></div>
                <button onClick={fitToScreen} className="p-2 hover:bg-gray-700 rounded-full" title="Fit to Screen">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l3.97-3.97h-2.69a.75.75 0 0 1-.75-.75Zm-12 0A.75.75 0 0 1 3.75 3h4.5a.75.75 0 0 1 0 1.5H5.56l3.97 3.97a.75.75 0 0 1-1.06 1.06L4.5 5.56v2.69a.75.75 0 0 1-1.5 0v-4.5Zm11.47 11.78a.75.75 0 1 1 1.06-1.06l3.97 3.97v-2.69a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h2.69l-3.97-3.97Zm-4.94-1.06a.75.75 0 0 1 0 1.06L5.56 19.5h2.69a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                    </svg>
                </button>
                <button onClick={zoomToOriginal} className="p-2 hover:bg-gray-700 rounded-full" title="Original Size (1:1)">
                    <span className="font-bold text-sm">1:1</span>
                </button>
                <div className="border-l border-gray-600 h-6 mx-2"></div>
                <button onClick={onDownload} className="p-2 hover:bg-gray-700 rounded-full" title="Download Image">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
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
