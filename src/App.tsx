import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, RotateCcw, ChevronLeft, ChevronRight, Bird } from 'lucide-react';
import './App.css'; // Keep default CSS import

// --- Configuration ---
const AUDIO_DIR = '/audio/'; // Path relative to the public folder
const MANIFEST_URL = `${AUDIO_DIR}manifest.json`; // Path to the manifest file

// --- Helper Function ---
/**
 * Extracts the bird name from a filename.
 * Assumes filename format like "Common_Blackbird.mp3" -> "Common Blackbird"
 * @param {string} filename - The full filename (e.g., "Robin.mp3").
 * @returns {string} The extracted and formatted bird name.
 */
const getBirdNameFromFilename = (filename: string | undefined): string => {
  if (!filename) return 'Unknown Bird';
  // Remove extension
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;
  // Replace underscores/hyphens with spaces
  const formattedName = nameWithoutExtension.replace(/[_-]/g, ' ');
  // Basic title case (capitalize first letter of each word)
  return formattedName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// --- Components ---

/**
 * Audio Player Component Props
 */
interface AudioPlayerProps {
  src: string | null;
}

/**
 * Audio Player Component
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  if (!src) return null; // Don't render if no source

  return (
    <audio controls key={src} className="w-full rounded-md">
      {/* Use key={src} to force re-render when src changes */}
      <source src={src} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
};

/**
 * Flashcard Component Props
 */
interface FlashcardProps {
  audioSrc: string | null;
  birdName: string;
  isFlipped: boolean;
  onFlip: () => void;
}

/**
 * Flashcard Component
 */
const Flashcard: React.FC<FlashcardProps> = ({ audioSrc, birdName, isFlipped, onFlip }) => {
  return (
    <div className="w-full max-w-md h-64 perspective"> {/* Perspective for 3D flip */}
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d rounded-xl shadow-lg ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={onFlip} // Allow clicking anywhere on the card to flip
      >
        {/* Front Side (Audio) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 p-6 rounded-xl backface-hidden">
          <h3 className="text-lg font-semibold text-sky-800 mb-4">Listen</h3>
          <AudioPlayer src={audioSrc} />
          <button
            onClick={(e) => { e.stopPropagation(); onFlip(); }} // Prevent card flip when clicking button directly
            className="absolute bottom-4 right-4 text-sky-600 hover:text-sky-800 transition-colors"
            aria-label="Flip card"
          >
            <RotateCcw size={24} />
          </button>
           <div className="absolute top-4 left-4 text-sky-500 opacity-50">
             <Bird size={32} />
           </div>
        </div>

        {/* Back Side (Bird Name) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-green-200 p-6 rounded-xl backface-hidden rotate-y-180">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Bird Name</h3>
          <p className="text-2xl font-bold text-center text-emerald-900">{birdName}</p>
          <button
             onClick={(e) => { e.stopPropagation(); onFlip(); }} // Prevent card flip when clicking button directly
            className="absolute bottom-4 right-4 text-emerald-600 hover:text-emerald-800 transition-colors"
            aria-label="Flip card"
          >
            <RotateCcw size={24} />
          </button>
           <div className="absolute top-4 right-4 text-emerald-500 opacity-50">
             <Bird size={32} />
           </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Application Component
 */
function App() {
  const [audioFiles, setAudioFiles] = useState<string[]>([]); // Array of audio filenames (e.g., "Robin.mp3")
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // For displaying errors

  // Fetch the list of audio files from the manifest
  useEffect(() => {
    const fetchAudioFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(MANIFEST_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - Could not fetch ${MANIFEST_URL}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.some(item => typeof item !== 'string')) {
            throw new Error(`Invalid manifest format at ${MANIFEST_URL}. Expected an array of strings.`);
        }
        console.log(`Loaded ${data.length} audio file names from manifest.`); // Debugging
        setAudioFiles(data);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      } catch (err) {
        console.error("Error fetching or parsing manifest:", err);
        let errorMessage = "Could not load audio manifest. ";
        if (err instanceof Error) {
            errorMessage += err.message;
        } else {
            errorMessage += "An unknown error occurred.";
        }
        // Specific guidance for common issues
        if (errorMessage.includes('404')) {
            errorMessage += `
Ensure '/public${AUDIO_DIR}manifest.json' exists and contains a JSON array of filenames (e.g., ["bird1.mp3", "bird2.mp3"]).`;
        } else if (errorMessage.includes('Unexpected token') || errorMessage.includes('Invalid JSON')) {
             errorMessage += `
Check if '/public${AUDIO_DIR}manifest.json' contains valid JSON. It should look like: ["file1.mp3", "file2.mp3"]`;
        }
        setError(errorMessage);
        setAudioFiles([]); // Clear files on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudioFiles();
  }, []); // Run only once on mount

  // Memoize current file name, audio source URL, and bird name
  const currentFilename = useMemo(() => {
    return audioFiles.length > 0 ? audioFiles[currentCardIndex] : undefined;
  }, [audioFiles, currentCardIndex]);

  const audioSrc = useMemo(() => {
    return currentFilename ? `${AUDIO_DIR}${currentFilename}` : null;
  }, [currentFilename]);

  const birdName = useMemo(() => {
    return getBirdNameFromFilename(currentFilename);
  }, [currentFilename]);


  // --- Event Handlers ---

  /** Flips the current card */
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  /** Navigates to the next card */
  const handleNext = useCallback(() => {
    if (audioFiles.length === 0) return;
    setCurrentCardIndex(prevIndex => (prevIndex + 1) % audioFiles.length);
    setIsFlipped(false); // Show front side of the new card
  }, [audioFiles.length]);

  /** Navigates to the previous card */
  const handlePrevious = useCallback(() => {
    if (audioFiles.length === 0) return;
    setCurrentCardIndex(prevIndex => (prevIndex - 1 + audioFiles.length) % audioFiles.length);
    setIsFlipped(false); // Show front side of the new card
  }, [audioFiles.length]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-lime-50 to-yellow-50 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center justify-center gap-3">
          <Bird className="text-green-600" size={36} /> Bird Sound Flashcards
        </h1>
        <p className="text-lg text-green-700">Learn bird calls by ear!</p>
      </header>

      {/* Loading and Error States */}
       {isLoading && (
        <div className="text-center text-gray-500 mt-8">
          <p>Loading audio files...</p>
          {/* Optional: Add a spinner */}
        </div>
      )}

      {error && !isLoading && (
         <div className="mt-8 w-full max-w-xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2 whitespace-pre-wrap">{error}</span>
         </div>
      )}


      {/* Flashcard and Navigation Section - Only show if not loading, no error, and files exist */}
      {!isLoading && !error && audioFiles.length > 0 ? (
        <div className="flex flex-col items-center w-full">
          {/* Card Counter */}
           <p className="text-gray-600 mb-4">
             Card {currentCardIndex + 1} of {audioFiles.length}
           </p>

          {/* Flashcard */}
          <Flashcard
            audioSrc={audioSrc}
            birdName={birdName}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-6 mt-8 w-full max-w-md">
            <button
              onClick={handlePrevious}
              disabled={audioFiles.length <= 1}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg shadow-md hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous card"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button
              onClick={handleNext}
              disabled={audioFiles.length <= 1}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next card"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : !isLoading && !error && audioFiles.length === 0 ? (
         // Placeholder when no files are loaded (and not loading/error)
         <div className="text-center text-gray-500 mt-8">
           <p>No audio files were found.</p>
            <p>Make sure '/public/audio/manifest.json' exists and contains a list of your MP3 filenames.</p>
           <Bird size={48} className="mx-auto mt-4 opacity-30" />
         </div>
      ) : null /* Don't show placeholder during loading or error */}


      {/* Footer/Info */}
      {!isLoading && !error && audioFiles.length > 0 && (
          <footer className="mt-12 text-center text-xs text-gray-500">
              <p>Tip: Click the card itself to flip it!</p>
              <p>Filenames like "Common_Blackbird.mp3" work best.</p>
          </footer>
      )}

      {/* Add Tailwind utility classes for 3D transforms (keep this if using Tailwind) */}
      {/* If not using Tailwind, these classes would need to be defined in App.css */}
      <style>{`
        .perspective { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        /* Ensure gradients show correctly on both sides */
        .backface-hidden.rotate-y-180 {
            /* No special style needed usually, but keeping structure */
        }
      `}</style>
    </div>
  );
}

export default App;
