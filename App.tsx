import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { editImageWithNanoBanana } from './services/geminiService';
import { HistoryDisplay } from './components/HistoryDisplay';

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
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    // State to manage what's displayed in the main view
    const [displayImageLeft, setDisplayImageLeft] = useState<string | null>(null);
    const [displayImageRight, setDisplayImageRight] = useState<string | null>(null);
    const [editedText, setEditedText] = useState<string | null>(null);

    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Derived values from state
    const currentImageForEditing = currentIndex > -1 && history[currentIndex] ? history[currentIndex] : null;
    const originalImage = history.length > 0 ? history[0] : null;

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
            setDisplayImageLeft(imageDataUrl); // Show the uploaded image
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
        
        // Prefill the prompt with what was used on this version, or empty string if nothing was.
        setPrompt(history[index].promptUsedOnThisImage || '');
    }, [history]);

    const handleSubmit = useCallback(async () => {
        if (!currentImageForEditing || !prompt) {
            setError('Please ensure an image is uploaded and provide an editing prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);

        // The "before" image for the display is the one we are currently editing.
        setDisplayImageLeft(currentImageForEditing.imageDataUrl);
        setDisplayImageRight(null);
        setEditedText(null);

        try {
            const result = await editImageWithNanoBanana(currentImageForEditing.file, prompt);
            
            setDisplayImageRight(result.imageBase64);
            setEditedText(result.text);

            if (result.imageBase64) {
                const newImageFile = await dataUrlToFile(result.imageBase64, `edited-${Date.now()}.png`);
                
                // If we've reverted and are now editing, this creates a new branch.
                // We truncate the history from the current point forward.
                const newHistory = history.slice(0, currentIndex + 1);
                
                // Update the item we just used with the prompt that was applied to it
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
                setCurrentIndex(updatedHistory.length - 1); // Move index to the newly created version
                setPrompt('');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate image: ${errorMessage}`);
            // Revert display to show the last good state
            setDisplayImageLeft(currentImageForEditing.imageDataUrl);
            setDisplayImageRight(null);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentImageForEditing, prompt, history, currentIndex]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
            <div className="w-full max-w-5xl mx-auto">
                <Header />
                <main className="mt-8 bg-gray-800/50 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700 backdrop-blur-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-6">
                            <ImageUploader onImageUpload={handleImageUpload} />
                            {history.length > 0 && (
                                <>
                                    {history.length > 1 && (
                                        <HistoryDisplay
                                            history={history}
                                            onRevert={handleRevertToHistory}
                                            currentIndex={currentIndex}
                                        />
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <PromptInput
                                            prompt={prompt}
                                            setPrompt={setPrompt}
                                            onSubmit={handleSubmit}
                                            isLoading={isLoading}
                                            disabled={!currentImageForEditing}
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
                                </>
                            )}
                        </div>

                        <div className="flex flex-col justify-center items-center bg-gray-900/50 p-6 rounded-lg border border-gray-700 min-h-[300px] lg:min-h-0">
                            {isLoading && <Loader />}
                            {error && !isLoading && <ErrorDisplay message={error} />}
                            
                            {!isLoading && !error && displayImageLeft && displayImageRight && (
                                <ImageDisplay
                                    previousImage={displayImageLeft}
                                    editedImage={displayImageRight}
                                    editedText={editedText}
                                />
                            )}
                            
                            {!isLoading && !error && displayImageLeft && !displayImageRight && (
                               <div className="text-center text-gray-400">
                                    <h3 className="text-lg font-semibold mb-2">Image Ready for Editing</h3>
                                    <img src={displayImageLeft} alt="Ready for editing" className="max-w-full max-h-96 rounded-lg shadow-md" />
                                </div>
                            )}

                             {!isLoading && !error && !displayImageLeft && (
                                <div className="text-center text-gray-500">
                                    <p>Your edited image will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
