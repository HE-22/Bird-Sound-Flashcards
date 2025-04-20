import React from 'react';
import { CheckSquare, Square, Star, RotateCcw, Bird } from 'lucide-react';
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

  return (
    <div className="w-full max-w-md h-80 perspective relative group">
       {/* Status Buttons Container - Remains the same */}
       <div className="absolute top-2 right-2 z-20 flex gap-2">
          {/* Star Button */}
          <button
              onClick={(e) => { e.stopPropagation(); onToggleStarred(); }}
              className={`p-1.5 rounded-full transition-colors bg-black bg-opacity-20 hover:bg-opacity-40 ${ // Adjusted style for visibility
                isStarred
                  ? 'text-yellow-400'
                  : 'text-white text-opacity-80 hover:text-yellow-400'
              }`}
              aria-label={isStarred ? "Unstar card" : "Star card"}
              title={isStarred ? "Unstar card" : "Star card"}
          >
              <StarIcon size={18} />
          </button>
          {/* Learned Button */}
         <button
             onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
             className={`p-1.5 rounded-full transition-colors bg-black bg-opacity-20 hover:bg-opacity-40 ${ // Adjusted style for visibility
             isLearned
                 ? 'text-green-400'
                 : 'text-white text-opacity-80 hover:text-green-400'
             }`}
             aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
             title={isLearned ? "Mark as not learned" : "Mark as learned"}
         >
             <LearnedIcon size={18} />
         </button>
       </div>

      {/* Flipping Container */}
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d rounded-xl shadow-lg cursor-pointer overflow-hidden ${ // Added overflow-hidden here
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={onFlip}
      >
        {/* Front Side (Audio) - Remains largely the same */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 p-6 rounded-xl backface-hidden">
          <h3 className="text-lg font-semibold text-sky-800 mb-4">Listen</h3>
          <AudioPlayer src={audioSrc} />
          <button
            onClick={(e) => { e.stopPropagation(); onFlip(); }}
            className="absolute bottom-4 right-4 text-sky-600 hover:text-sky-800 transition-colors"
            aria-label="Show bird name"
            title="Show bird name"
          >
            <RotateCcw size={24} />
          </button>
          <div className="absolute top-4 left-4 text-sky-500 opacity-50">
            <Bird size={32} />
          </div>
        </div>

        {/* Back Side (Image & Overlays) */}
        <div className="absolute inset-0 w-full h-full bg-gray-200 rounded-xl backface-hidden rotate-y-180 overflow-hidden"> {/* Base background if image fails, remove gradient */} 
          {/* Bird Image - Covers the whole area */}
          <BirdImage 
             src={imgSrc} 
             alt={displayName}
             className="absolute inset-0 w-full h-full object-cover rounded-xl" // Cover the area
          />
          {/* Overlay Container for Name and Button */}
          <div className="absolute inset-0 w-full h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black/50 via-black/20 to-transparent"> {/* Gradient overlay for text contrast */} 
             {/* Bird Name */} 
             <p className="text-xl font-bold text-center text-white drop-shadow-md mb-8">{displayName}</p> {/* White text, bottom aligned */} 
          </div>

          {/* Flip Button - Overlay */}
          <button
            onClick={(e) => { e.stopPropagation(); onFlip(); }}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-black bg-opacity-20 text-white text-opacity-80 hover:bg-opacity-40 hover:text-opacity-100 transition-all"
            aria-label="Show audio player"
            title="Show audio player"
          >
            <RotateCcw size={20} />
          </button>
          {/* Decorative Bird Icon REMOVED */}
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 