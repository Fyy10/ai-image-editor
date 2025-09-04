import React from 'react';

interface PromptInputProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    disabled: boolean;
    isEditing: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, disabled, isEditing }) => {
    const buttonText = isLoading 
        ? (isEditing ? 'Editing...' : 'Generating...')
        : (isEditing ? 'Apply Edit' : 'Generate Image');

    const placeholderText = isEditing
        ? "e.g., 'Add a birthday hat on the dog'"
        : "e.g., 'A cute dog wearing a birthday hat'";

    const titleText = isEditing ? "2. Describe Your Edit" : "1. Describe Image to Generate";

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-200">{titleText}</h2>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholderText}
                className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none disabled:opacity-50"
                disabled={disabled}
            />
            <button
                onClick={onSubmit}
                disabled={isLoading || disabled || !prompt}
                className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {buttonText}
            </button>
        </div>
    );
};
