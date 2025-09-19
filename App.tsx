import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader, ImageUploaderRef } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { editImageWithNanoBanana, generateImageWithNanoBanana } from './services/geminiService';
import { HistoryDisplay } from './components/HistoryDisplay';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ImagePreviewModal } from './components/ImagePreviewModal';

const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};

interface HistoryItem {
    id: string;
    imageDataUrls: string[];
    files: File[];
    promptUsedOnThisImage?: string; // Prompt used on THIS image to generate the NEXT one
}

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isEditingApiKey, setIsEditingApiKey] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    const [displayImagesLeft, setDisplayImagesLeft] = useState<string[]>([]);
    const [displayImageRight, setDisplayImageRight] = useState<string | null>(null);
    const [editedText, setEditedText] = useState<string | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const imageUploaderRef = useRef<ImageUploaderRef>(null);

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini-api-key');
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            setIsEditingApiKey(true);
        }
    }, []);

    const currentImageForEditing = currentIndex > -1 && history[currentIndex] ? history[currentIndex] : null;
    const originalImage = history.length > 0 ? history[0] : null;

    const handleSaveApiKey = (key: string) => {
        localStorage.setItem('gemini-api-key', key);
        setApiKey(key);
        setIsEditingApiKey(false);
        setError(null);
    };

    const handleClearApiKey = () => {
        localStorage.removeItem('gemini-api-key');
        setApiKey(null);
        setIsEditingApiKey(true);
        setHistory([]);
        setCurrentIndex(-1);
        setDisplayImagesLeft([]);
        setDisplayImageRight(null);
        setEditedText(null);
        setError(null);
        setPrompt('');
    };

    const handleManageApiKey = () => {
        setIsEditingApiKey(true);
    };

    const handleCancelEditApiKey = () => {
        if (apiKey) {
            setIsEditingApiKey(false);
        }
    };

    const handleStartOver = () => {
        setHistory([]);
        setCurrentIndex(-1);
        setDisplayImagesLeft([]);
        setDisplayImageRight(null);
        setEditedText(null);
        setError(null);
        setPrompt('');
    };

    const handleDownload = (imageUrl: string) => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;

        const mimeType = imageUrl.substring(imageUrl.indexOf(':') + 1, imageUrl.indexOf(';'));
        const extension = mimeType.split('/')[1] || 'png';

        link.download = `image-by-nano-banana.${extension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImageUpload = (files: File[]) => {
        const newHistoryItemsData: { url: string, file: File }[] = [];
        let loadedCount = 0;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageDataUrl = reader.result as string;
                newHistoryItemsData.push({ url: imageDataUrl, file });
                loadedCount++;

                if (loadedCount === files.length) {
                    if (currentImageForEditing) {
                        // Add to the current history item
                        const historyIndex = currentIndex;
                        const currentItem = history[historyIndex];

                        const updatedFiles = [...currentItem.files, ...newHistoryItemsData.map(d => d.file)];
                        const updatedImageDataUrls = [...currentItem.imageDataUrls, ...newHistoryItemsData.map(d => d.url)];

                        const newItem = {
                            ...currentItem,
                            files: updatedFiles,
                            imageDataUrls: updatedImageDataUrls,
                        };

                        const newHistory = [...history];
                        newHistory[historyIndex] = newItem;
                        setHistory(newHistory);
                    } else {
                        // Create a new history item
                        const newHistoryItem: HistoryItem = {
                            id: `v0-${Date.now()}`,
                            imageDataUrls: newHistoryItemsData.map(d => d.url),
                            files: newHistoryItemsData.map(d => d.file),
                        };

                        setHistory(prevHistory => [...prevHistory, newHistoryItem]);
                        if (currentIndex === -1) {
                            setCurrentIndex(0);
                            setDisplayImagesLeft(newHistoryItem.imageDataUrls);
                        }
                    }
                    setError(null);
                    setPrompt('');
                    setDisplayImageRight(null);
                    setEditedText(null);

                    // Reset the file input
                    if (imageUploaderRef.current) {
                        imageUploaderRef.current.reset();
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleReset = useCallback(() => {
        if (!originalImage) return;
        setHistory([originalImage]);
        setCurrentIndex(0);
        setDisplayImagesLeft(originalImage.imageDataUrls);
        setDisplayImageRight(null);
        setEditedText(null);
        setError(null);
        setPrompt('');
    }, [originalImage]);

    const handleRevertToHistory = useCallback((index: number) => {
        if (index < 0 || index >= history.length) return;

        setCurrentIndex(index);

        const selectedVersion = history[index];
        setDisplayImagesLeft(selectedVersion.imageDataUrls);
        setDisplayImageRight(null);
        setEditedText(null);
        setError(null);

        setPrompt(history[index].promptUsedOnThisImage || '');
    }, [history]);

    const handleRemoveHistoryItem = (indexToRemove: number) => {
        setHistory(prevHistory => {
            const newHistory = prevHistory.filter((_, index) => index !== indexToRemove);

            if (newHistory.length === 0) {
                setCurrentIndex(-1);
                setDisplayImagesLeft([]);
                setPrompt('');
            } else if (currentIndex >= indexToRemove) {
                const newIndex = Math.max(0, currentIndex - 1);
                setCurrentIndex(newIndex);
                setDisplayImagesLeft(newHistory[newIndex]?.imageDataUrls || []);
            }

            return newHistory;
        });
    };

    const handleRemoveImageFromCurrent = (imageIndexToRemove: number) => {
        if (!currentImageForEditing) return;

        const historyIndex = currentIndex;
        const currentItem = history[historyIndex];

        if (currentItem.files.length === 1) {
            // If it's the last image, remove the whole history item
            handleRemoveHistoryItem(historyIndex);
        } else {
            const newFiles = currentItem.files.filter((_, index) => index !== imageIndexToRemove);
            const newImageDataUrls = currentItem.imageDataUrls.filter((_, index) => index !== imageIndexToRemove);

            const newItem = {
                ...currentItem,
                files: newFiles,
                imageDataUrls: newImageDataUrls,
            };

            const newHistory = [...history];
            newHistory[historyIndex] = newItem;
            setHistory(newHistory);

            // Update display image if the first one was removed
            if (imageIndexToRemove === 0) {
                setDisplayImagesLeft(newItem.imageDataUrls || []);
            }
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!apiKey) {
            setError('API Key is not set. Please configure it first.');
            return;
        }
        if (!prompt) {
            setError('Please provide a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const imagesToEdit = currentImageForEditing ? currentImageForEditing.files : [];

        // If there's an image, we're editing. Otherwise, we're generating.
        if (imagesToEdit.length > 0) {
            const imagesForDisplay = currentImageForEditing!.imageDataUrls;
            setDisplayImagesLeft(imagesForDisplay);
            setDisplayImageRight(null);
            setEditedText(null);

            try {
                const result = await editImageWithNanoBanana(imagesToEdit, prompt, apiKey);

                setDisplayImageRight(result.imageBase64);
                setEditedText(result.text);

                if (result.imageBase64) {
                    const newImageFile = await dataUrlToFile(result.imageBase64, `edited-${Date.now()}.png`);

                    const newHistory = history.slice(0, currentIndex + 1);

                    if (newHistory[currentIndex]) {
                        newHistory[currentIndex] = {
                            ...newHistory[currentIndex],
                            promptUsedOnThisImage: prompt,
                        };
                    }

                    const newHistoryItem: HistoryItem = {
                        id: `v${newHistory.length}-${Date.now()}`,
                        imageDataUrls: [result.imageBase64],
                        files: [newImageFile],
                    };

                    const updatedHistory = [...newHistory, newHistoryItem];
                    setHistory(updatedHistory);
                    setCurrentIndex(updatedHistory.length - 1);
                    setPrompt('');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to edit image: ${errorMessage}`);
                const displayImages = currentImageForEditing ? currentImageForEditing.imageDataUrls : (history.length > 0 ? history[0].imageDataUrls : []);
                setDisplayImagesLeft(displayImages);
                setDisplayImageRight(null);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Generate a new image
            setDisplayImagesLeft([]);
            setDisplayImageRight(null);
            setEditedText(null);
            try {
                const result = await generateImageWithNanoBanana(prompt, apiKey);

                if (result.imageBase64) {
                    const newImageFile = await dataUrlToFile(result.imageBase64, `generated-${Date.now()}.png`);

                    const newHistoryItem: HistoryItem = {
                        id: `v0-${Date.now()}`,
                        imageDataUrls: [result.imageBase64],
                        files: [newImageFile],
                        promptUsedOnThisImage: prompt,
                    };

                    setHistory([newHistoryItem]);
                    setCurrentIndex(0);
                    setDisplayImagesLeft(result.imageBase64);
                    setDisplayImageRight(null);
                    setEditedText(result.text);
                    setPrompt('');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to generate image: ${errorMessage}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    }, [currentImageForEditing, prompt, history, currentIndex, apiKey]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
            <div className="w-full max-w-5xl mx-auto">
                <Header
                    onManageApiKey={handleManageApiKey}
                    apiKeyIsSet={!!apiKey}
                    onStartOver={handleStartOver}
                    hasHistory={history.length > 0}
                />

                {error && !isLoading && <div className="my-4"><ErrorDisplay message={error} /></div>}

                {isEditingApiKey || !apiKey ? (
                    <ApiKeyInput
                        onSave={handleSaveApiKey}
                        apiKey={apiKey || ''}
                        onCancel={apiKey ? handleCancelEditApiKey : undefined}
                    />
                ) : (
                    <main className="mt-8 bg-gray-800/50 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700 backdrop-blur-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-6">
                                <ImageUploader
                                    ref={imageUploaderRef}
                                    onImageUpload={handleImageUpload}
                                    imageCount={currentImageForEditing?.files.length || 0}
                                />

                                <div className="flex flex-col gap-2">
                                    <PromptInput
                                        prompt={prompt}
                                        setPrompt={setPrompt}
                                        onSubmit={handleSubmit}
                                        isLoading={isLoading}
                                        disabled={false} // Always enabled now
                                        isEditing={!!currentImageForEditing}
                                    />
                                    {history.length > 1 && (
                                        <button
                                            onClick={handleReset}
                                            disabled={isLoading}
                                            className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors duration-300 disabled:opacity-50"
                                        >
                                            Reset to Original
                                        </button>
                                    )}
                                </div>

                                {history.length > 1 && (
                                    <HistoryDisplay
                                        history={history}
                                        onRevert={handleRevertToHistory}
                                        currentIndex={currentIndex}
                                        onRemove={handleRemoveHistoryItem}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col justify-center items-center bg-gray-900/50 p-6 rounded-lg border border-gray-700 min-h-[300px] lg:min-h-0">
                                {isLoading && <Loader />}

                                {!isLoading && !error && displayImagesLeft.length > 0 && displayImageRight && (
                                    <ImageDisplay
                                        previousImages={displayImagesLeft}
                                        editedImage={displayImageRight}
                                        editedText={editedText}
                                        onPreview={setPreviewImageUrl}
                                        onDownload={handleDownload}
                                    />
                                )}

                                {!isLoading && !error && currentImageForEditing && !displayImageRight && (
                                    <div className="text-center text-gray-400 w-full">
                                        <h3 className="text-lg font-semibold mb-4">Image{currentImageForEditing.imageDataUrls.length > 1 ? 's' : ''} Ready for Editing</h3>
                                        <div className={`grid ${currentImageForEditing.imageDataUrls.length > 1 ? 'grid-cols-2 gap-4' : 'grid-cols-1'} max-h-[500px] overflow-y-auto p-2`}>
                                            {currentImageForEditing.imageDataUrls.map((imageUrl, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Ready for editing ${index + 1}`}
                                                        className="w-full h-auto rounded-lg shadow-md cursor-pointer"
                                                        onClick={() => setPreviewImageUrl(imageUrl)}
                                                    />
                                                    <button
                                                        onClick={() => handleRemoveImageFromCurrent(index)}
                                                        className="absolute top-2 left-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                                                        aria-label={`Remove image ${index + 1}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(imageUrl)}
                                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                                                        aria-label={`Download image ${index + 1}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                            <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!isLoading && !error && displayImagesLeft.length === 0 && (
                                    <div className="text-center text-gray-500">
                                        <p>Upload an image or generate one with a prompt to get started.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                )}
            </div>
            {previewImageUrl && (
                <ImagePreviewModal
                    imageUrl={previewImageUrl}
                    onClose={() => setPreviewImageUrl(null)}
                    onDownload={() => handleDownload(previewImageUrl)}
                />
            )}
        </div>
    );
};

export default App;
