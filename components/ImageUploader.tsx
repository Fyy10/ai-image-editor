import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface ImageUploaderProps {
    onImageUpload: (files: File[]) => void;
    imageCount: number;
}

export interface ImageUploaderRef {
    reset: () => void;
}

export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(({ onImageUpload, imageCount }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    useImperativeHandle(ref, () => ({
        reset: () => {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }));

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            onImageUpload(fileArray);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleDragEvent = useCallback((e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(isEntering);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const imageFiles = Array.from(files).filter((file: File) => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                onImageUpload(imageFiles);
            }
        }
    }, [onImageUpload]);

    const uploaderClasses = `flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${dragging ? 'border-purple-400 bg-gray-700' : 'border-gray-600 hover:border-purple-500 hover:bg-gray-800'}`;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-200">Upload Image(s) (Optional)</h2>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            <label
                onClick={handleClick}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDrop={handleDrop}
                className={uploaderClasses}
            >
                 <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">To start by editing an existing image.</p>
                {imageCount > 0 && <p className="mt-4 text-xs text-green-400 bg-green-900/50 px-3 py-1 rounded-full">{imageCount} image{imageCount > 1 ? 's' : ''} selected</p>}
            </label>
        </div>
    );
});
