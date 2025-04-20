import React from 'react';
import { CheckSquare, Square, Star, RotateCcw, Bird, ExternalLink } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import BirdImage from './BirdImage';

/**
 * Flashcard Component Props
 */
interface FlashcardProps {
  audioSrc: string | null;
  imgSrc: string | null;
  displayName: string; // Use displayName from mapping
  isFlipped: boolean;
  isLearned: boolean;
  isStarred: boolean;
  onFlip: () => void;
  onToggleLearned: () => void;
  onToggleStarred: () => void;
  // audioFilename is no longer needed here, can be derived from audioSrc
}

/**
 * Flashcard Component
 */
const Flashcard: React.FC<FlashcardProps> = ({
    audioSrc,
    imgSrc,
    displayName,
    isFlipped,
    isLearned,
    isStarred,
    onFlip,
    onToggleLearned,
    onToggleStarred
}) => {
  console.log(`[Flashcard] Received imgSrc: ${imgSrc}, DisplayName: ${displayName}`); // Log received props
  const LearnedIcon = isLearned ? CheckSquare : Square;
  const StarIcon = isStarred ? () => <Star size={20} fill="currentColor" /> : Star;

  // Extract filename from audioSrc
  const audioFilename = audioSrc ? audioSrc.split('/').pop() : 'N/A';

  // Construct Wikipedia search URL
  const wikipediaSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(displayName)}`;

  return (
    // Main container - Removed perspective class
    <div className="w-full max-w-md h-80 relative group bg-white rounded-xl shadow-lg overflow-hidden">
       {/* Status Buttons Container - Positioned absolutely */}
       <div className="absolute top-2 right-2 z-20 flex gap-2">
          {/* Star Button */}
          <button
              onClick={(e) => { e.stopPropagation(); onToggleStarred(); }}
              // Adjusted styles for visibility on potentially varied backgrounds
              className={`p-1.5 rounded-full transition-colors ${
                isStarred
                  ? 'text-yellow-400 bg-black/30 hover:bg-black/50'
                  : 'text-white/80 bg-black/30 hover:bg-black/50 hover:text-yellow-400'
              }`}
              aria-label={isStarred ? "Unstar card" : "Star card"}
              title={isStarred ? "Unstar card" : "Star card"}
          >
              <StarIcon size={18} />
          </button>
          {/* Learned Button */}
         <button
             onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
             // Adjusted styles for visibility on potentially varied backgrounds
             className={`p-1.5 rounded-full transition-colors ${
               isLearned
                 ? 'text-green-400 bg-black/30 hover:bg-black/50'
                 : 'text-white/80 bg-black/30 hover:bg-black/50 hover:text-green-400'
             }`}
             aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
             title={isLearned ? "Mark as not learned" : "Mark as learned"}
         >
             <LearnedIcon size={18} />
         </button>
       </div>

      {/* Conditional Rendering */}
      {!isFlipped ? (
        /* Front Side (Audio) */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 p-6">
          <h3 className="text-lg font-semibold text-sky-800 mb-4">Listen</h3>
          <AudioPlayer src={audioSrc} />
          <button
            onClick={onFlip} // Direct call to onFlip
            className="absolute bottom-4 right-4 text-sky-600 hover:text-sky-800 transition-colors p-2 rounded-full bg-white/30 hover:bg-white/50"
            aria-label="Show bird name and image"
            title="Show bird name and image"
          >
            <RotateCcw size={24} />
          </button>
          <div className="absolute top-4 left-4 text-sky-500 opacity-50">
            <Bird size={32} />
          </div>
        </div>
      ) : (
        /* Back Side (Image & Info) */
        <div className="relative w-full h-full bg-gray-800"> {/* Darker background for contrast */}
          {/* Bird Image - Covers the whole area */}
          <BirdImage
             src={imgSrc}
             alt={displayName}
             className="absolute inset-0 w-full h-full object-cover opacity-80" // Slightly reduced opacity
          />
          {/* Overlay Container for Name and Button */}
          <div className="absolute inset-0 w-full h-full flex flex-col justify-end items-center p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent"> {/* Stronger gradient */}
             {/* Bird Name */}
             <p className="text-xl font-bold text-center text-white drop-shadow-lg">{displayName}</p>
             {/* Audio Filename */}
             <p className="text-xs font-mono text-center text-gray-300 mt-1 mb-1 drop-shadow-md">{audioFilename}</p> {/* Reduced bottom margin */}
             {/* Wikipedia Link */}
             <a
                href={wikipediaSearchUrl}
                target="_blank" // Open in new tab
                rel="noopener noreferrer" // Security best practice
                onClick={(e) => e.stopPropagation()} // Prevent flipping when clicking link
                className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-100 hover:underline mb-8 transition-colors"
             >
                See on Wikipedia <ExternalLink size={12} />
             </a>
          </div>

          {/* Flip Button - Overlay */}
          <button
            onClick={onFlip} // Direct call to onFlip
            className="absolute bottom-4 right-4 p-2 rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-all"
            aria-label="Show audio player"
            title="Show audio player"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard; 