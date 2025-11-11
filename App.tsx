
import React, { useState, useCallback, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { generateTryOnImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export type ClothingCategory = 'head' | 'top' | 'bottom' | 'shoes';

export interface ClothingItems {
    head: UploadedImage | null;
    top: UploadedImage | null;
    bottom: UploadedImage | null;
    shoes: UploadedImage | null;
}


// SVG Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const HeadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4.5 4.5 0 01-6.364 0M9 10h6M9 14h6m-6-8a2 2 0 100-4 2 2 0 000 4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.172 18.172a4.5 4.5 0 016.364 0" />
    </svg>
);

const TopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const BottomIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6v12M18 6v12M6 18h12M6 12h12" />
    </svg>
);

const ShoesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5m-6 0V21M3 21h18M3 13.5h18" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.6-2.6L11.063 18l1.938-.648a3.375 3.375 0 002.6-2.6L16.25 13l.648 1.938a3.375 3.375 0 002.6 2.6l1.938.648-1.938.648a3.375 3.375 0 00-2.6 2.6z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItems>({
    head: null,
    top: null,
    bottom: null,
    shoes: null,
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonImageUpload = useCallback(async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setPersonImage({ base64, mimeType: file.type });
    } catch (err) {
      setError('Failed to load person image.');
    }
  }, []);

  const handleClothingImageUpload = useCallback(async (file: File, category: ClothingCategory) => {
    try {
      const base64 = await fileToBase64(file);
      setClothingItems(prev => ({ ...prev, [category]: { base64, mimeType: file.type } }));
    } catch (err) {
      setError(`Failed to load ${category} image.`);
    }
  }, []);
  
  const handleClothingImageRemove = useCallback((category: ClothingCategory) => {
    setClothingItems(prev => ({ ...prev, [category]: null }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!personImage || Object.values(clothingItems).every(item => item === null)) {
      setError('Please upload your photo and at least one clothing item.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateTryOnImage(personImage, clothingItems);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingItems]);

  const canGenerate = useMemo(() => personImage && Object.values(clothingItems).some(item => item !== null) && !isLoading, [personImage, clothingItems, isLoading]);

  const clothingCategories: { category: ClothingCategory; title: string; description: string; icon: React.ReactNode; }[] = [
    { category: 'head', title: 'Head', description: 'Caps, beanies', icon: <HeadIcon /> },
    { category: 'top', title: 'Top', description: 'Shirts, jackets', icon: <TopIcon /> },
    { category: 'bottom', title: 'Bottom', description: 'Pants, jeans', icon: <BottomIcon /> },
    { category: 'shoes', title: 'Shoes', description: 'Sneakers, boots', icon: <ShoesIcon /> },
  ];

  const ResultPanel = () => {
    const handleDownload = useCallback(() => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        const mimeType = generatedImage.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1] || 'png';
        link.download = `virtual-try-on.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [generatedImage]);

    let content;
    if (isLoading) {
      content = (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <Spinner className="h-10 w-10" />
          <p className="mt-4 text-xl font-semibold animate-pulse">Generating your new look...</p>
          <p className="text-sm text-gray-400">This can take up to a minute. Please wait.</p>
        </div>
      );
    } else if (error) {
      content = (
        <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold">Generation Failed</p>
          <p className="text-sm mt-2 max-w-sm">{error}</p>
        </div>
      );
    } else if (generatedImage) {
      content = (
        <div className="group relative w-full h-full p-2 flex items-center justify-center">
            <img 
                src={generatedImage} 
                alt="Generated try-on" 
                className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full p-3 shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Download image"
            >
                <DownloadIcon />
            </button>
        </div>
      );
    } else {
        content = (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 01-3.388-1.62m-1.622-3.385a15.998 15.998 0 013.388-1.622m0 0a4.5 4.5 0 10-6.364-6.364m6.364 6.364a4.5 4.5 0 10-6.364 6.364m-6.364-6.364a4.5 4.5 0 106.364-6.364m-6.364 6.364L12 12" />
                </svg>
                <p className="mt-6 text-xl font-semibold text-gray-400">Your virtual try-on will appear here</p>
                <p className="text-sm mt-1 max-w-xs">Upload your photo and outfit, then click "Try It On!" to see the magic.</p>
            </div>
        );
    }

    return (
        <div className={`w-full h-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-300 ${isLoading ? 'border-purple-500/50' : 'border-gray-700'}`}>
            {content}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#14182B] text-white p-4 md:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center py-8">
            <h1 className="text-3xl font-bold tracking-tight">
                Virtual Cloth Try-On
            </h1>
            <p className="text-md text-gray-400 mt-2">Create your perfect outfit with the power of AI</p>
        </header>
        
        <main className="w-full flex flex-col items-center gap-12">
            <section className="w-full flex flex-col md:flex-row justify-center items-start gap-8 md:gap-12">
                {/* User Photo Section */}
                <div className="w-full md:w-auto flex flex-col items-center gap-4">
                    <h2 className="text-xl font-semibold">1. Upload Your Photo</h2>
                    <ImageUploader
                        title="Your Photo"
                        description="A clear, front view."
                        onImageUpload={handlePersonImageUpload}
                        onImageRemove={() => setPersonImage(null)}
                        imageSrc={personImage?.base64 || null}
                        icon={<UserIcon />}
                        className="w-[240px] h-[320px]"
                    />
                </div>

                {/* Clothing Section */}
                <div className="w-full md:w-auto flex flex-col items-center gap-4">
                     <h2 className="text-xl font-semibold">2. Add Your Outfit</h2>
                     <div className="grid grid-cols-2 gap-4">
                        {clothingCategories.map(({ category, title, description, icon }) => (
                            <ImageUploader
                                key={category}
                                title={title}
                                description={description}
                                onImageUpload={(file) => handleClothingImageUpload(file, category)}
                                onImageRemove={() => handleClothingImageRemove(category)}
                                imageSrc={clothingItems[category]?.base64 || null}
                                icon={icon}
                                className="w-[160px] h-[200px]"
                            />
                        ))}
                     </div>
                </div>
            </section>
            
            <section>
                <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-purple-500/40 transform"
                >
                    {isLoading ? <Spinner className="-ml-1 mr-3 h-6 w-6" /> : <SparklesIcon />}
                    <span className="ml-2">{isLoading ? 'Generating...' : 'Try It On!'}</span>
                </button>
            </section>
          
            <section className="w-full max-w-2xl h-[600px] flex flex-col items-center gap-4">
                 <h2 className="text-xl font-semibold">Result</h2>
                <ResultPanel />
            </section>
        </main>
      </div>
    </div>
  );
};

export default App;
