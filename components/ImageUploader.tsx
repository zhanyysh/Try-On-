import React, { useRef, useCallback } from 'react';

interface ImageUploaderProps {
  title: string;
  description: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  imageSrc: string | null;
  icon: React.ReactNode;
  className?: string;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, onImageUpload, onImageRemove, imageSrc, icon, className = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove();
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [onImageRemove]);

  const hasImage = !!imageSrc;

  return (
    <div className={`group relative flex flex-col p-3 rounded-xl transition-all duration-300 ${className}
        ${hasImage 
            ? 'bg-gray-800/50 backdrop-blur-sm shadow-lg border border-gray-700 hover:border-purple-500'
            : 'border-2 border-dashed border-gray-600 hover:border-purple-500'}`
        }
    >
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-xs text-gray-400 mb-2">{description}</p>
        <div 
            className="relative flex-grow flex items-center justify-center text-center rounded-lg cursor-pointer min-h-0"
            onClick={handleClick}
        >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
        />
        {imageSrc ? (
            <>
                <img src={imageSrc} alt="Upload preview" className="max-w-full max-h-full object-contain rounded-md" />
                <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 hover:scale-110 transition-all z-10"
                    aria-label="Remove image"
                >
                    <CloseIcon />
                </button>
            </>
        ) : (
            <div className="flex flex-col items-center text-gray-500 transition-colors duration-300 group-hover:text-gray-300">
                {icon}
                <p className="mt-2 text-xs">
                    <span className="font-semibold text-purple-400">Click to upload</span>
                </p>
            </div>
        )}
        </div>
    </div>
  );
};