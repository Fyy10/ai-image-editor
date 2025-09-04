import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
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
    imageDataUrl: string;
    file: File;
    promptUsedOnThisImage?: string; // Prompt used on THIS image to generate the NEXT one
}

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isEditingApiKey, setIsEditingApiKey] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    const [displayImageLeft, setDisplayImageLeft] = useState<string | null>(null);
    const [displayImageRight, setDisplayImageRight] = useState<string | null>(null);
    const [editedText, setEditedText] = useState<string | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
        setDisplayImageLeft(null);
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
        setDisplayImageLeft(null);
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

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            const initialHistoryItem: HistoryItem = {
                id: `v0-${Date.now()}`,
                imageDataUrl,
                file,
            };
            setHistory([initialHistoryItem]);
            setCurrentIndex(0);
            setDisplayImageLeft(imageDataUrl);
            setDisplayImageRight(null);
            setEditedText(null);
            setError(null);
            setPrompt('');
        };
        reader.readAsDataURL(file);
    };

    const handleReset = useCallback(() => {
        if (!originalImage) return;
        setHistory([originalImage]);
        setCurrentIndex(0);
        setDisplayImageLeft(originalImage.imageDataUrl);
        setDisplayImageRight(null);
        setEditedText(null);
        setError(null);
        setPrompt('');
    }, [originalImage]);

    const handleRevertToHistory = useCallback((index: number) => {
        if (index < 0 || index >= history.length) return;

        setCurrentIndex(index);
        
        const selectedVersion = history[index];
        setDisplayImageLeft(selectedVersion.imageDataUrl);
        setDisplayImageRight(null);
        setEditedText(null);
        setError(null);
        
        setPrompt(history[index].promptUsedOnThisImage || '');
    }, [history]);

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

        // If there's an image, we're editing. Otherwise, we're generating.
        if (currentImageForEditing) {
            setDisplayImageLeft(currentImageForEditing.imageDataUrl);
            setDisplayImageRight(null);
            setEditedText(null);

            try {
                const result = await editImageWithNanoBanana(currentImageForEditing.file, prompt, apiKey);
                
                setDisplayImageRight(result.imageBase64);
                setEditedText(result.text);

                if (result.imageBase64) {
                    const newImageFile = await dataUrlToFile(result.imageBase64, `edited-${Date.now()}.png`);
                    
                    const newHistory = history.slice(0, currentIndex + 1);
                    
                    newHistory[currentIndex] = {
                        ...newHistory[currentIndex],
                        promptUsedOnThisImage: prompt,
                    };

                    const newHistoryItem: HistoryItem = {
                        id: `v${newHistory.length}-${Date.now()}`,
                        imageDataUrl: result.imageBase64,
                        file: newImageFile,
                    };

                    const updatedHistory = [...newHistory, newHistoryItem];
                    setHistory(updatedHistory);
                    setCurrentIndex(updatedHistory.length - 1);
                    setPrompt('');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to edit image: ${errorMessage}`);
                setDisplayImageLeft(currentImageForEditing.imageDataUrl);
                setDisplayImageRight(null);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Generate a new image
            setDisplayImageLeft(null);
            setDisplayImageRight(null);
            setEditedText(null);
            try {
                const result = await generateImageWithNanoBanana(prompt, apiKey);
                
                if (result.imageBase64) {
                    const newImageFile = await dataUrlToFile(result.imageBase64, `generated-${Date.now()}.png`);
                    
                    const newHistoryItem: HistoryItem = {
                        id: `v0-${Date.now()}`,
                        imageDataUrl: result.imageBase64,
                        file: newImageFile,
                        promptUsedOnThisImage: prompt,
                    };
                    
                    setHistory([newHistoryItem]);
                    setCurrentIndex(0);
                    setDisplayImageLeft(result.imageBase64);
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
                                <ImageUploader onImageUpload={handleImageUpload} />
                                
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
                                    />
                                )}
                            </div>

                            <div className="flex flex-col justify-center items-center bg-gray-900/50 p-6 rounded-lg border border-gray-700 min-h-[300px] lg:min-h-0">
                                {isLoading && <Loader />}
                                
                                {!isLoading && !error && displayImageLeft && displayImageRight && (
                                    <ImageDisplay
                                        previousImage={displayImageLeft}
                                        editedImage={displayImageRight}
                                        editedText={editedText}
                                        onPreview={setPreviewImageUrl}
                                        onDownload={handleDownload}
                                    />
                                )}
                                
                                {!isLoading && !error && displayImageLeft && !displayImageRight && (
                                   <div className="text-center text-gray-400">
                                        <h3 className="text-lg font-semibold mb-2">Image Ready for Editing</h3>
                                        <img 
                                            src={displayImageLeft} 
                                            alt="Ready for editing" 
                                            className="max-w-full max-h-96 rounded-lg shadow-md cursor-pointer"
                                            onClick={() => setPreviewImageUrl(displayImageLeft)}
                                        />
                                        <button
                                            onClick={() => handleDownload(displayImageLeft!)}
                                            className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all duration-300 ease-in-out transform hover:scale-105"
                                            aria-label="Download image"
                                        >
                                            Download Image
                                        </button>
                                    </div>
                                )}

                                 {!isLoading && !error && !displayImageLeft && (
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
                <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
            )}
        </div>
    );
};

export default App;
