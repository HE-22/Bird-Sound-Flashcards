import React from 'react';
import { CheckSquare, Square, Star, Bird, ExternalLink, RefreshCw } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import BirdImage from './BirdImage';

/**
 * Flashcard Component Props
 */
interface FlashcardProps {
  audioSrc: string | null;
  imgSrc: string | null;
  displayName: string;
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
// Use React.forwardRef to allow passing ref to AudioPlayer
const Flashcard = React.forwardRef<HTMLDivElement, FlashcardProps>((
  {
    audioSrc,
    imgSrc,
    displayName,
    isFlipped,
    isLearned,
    isStarred,
    onFlip,
    onToggleLearned,
    onToggleStarred
  },
  _ref // Parent ref not used internally
) => {
  const LearnedIcon = isLearned ? CheckSquare : Square;
  const StarIcon = isStarred ? () => <Star size={16} fill="currentColor" /> : Star;

  const wikipediaSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(displayName)}`;

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div
      className="relative w-full aspect-16/10 rounded-card shadow-card overflow-hidden"
      onClick={onFlip}
    >
      {isFlipped ? (
        /* Back Side */
        <div className="absolute inset-0 w-full h-full bg-gray-800 rounded-card overflow-hidden">
          <BirdImage
            src={imgSrc}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 w-full h-full flex flex-col justify-end items-start p-4 bg-gradient-to-t from-black/45 via-black/10 to-transparent">
            <p className="text-card-heading font-semibold text-white drop-shadow-md mb-1">{displayName}</p>
            <a
              href={wikipediaSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-tiny text-sky-200 hover:text-white hover:underline transition-colors"
            >
              See on Wikipedia <ExternalLink size={12} />
            </a>
          </div>
          <div className="absolute bottom-3 right-3 z-10 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStarred(); }}
              className={`p-1.5 rounded-full transition-colors ${
                isStarred
                  ? 'text-yellow-400 bg-black/30 hover:bg-black/50'
                  : 'text-white/70 bg-black/30 hover:bg-black/50 hover:text-yellow-400'
              }`}
              aria-label={isStarred ? 'Unstar card' : 'Star card'}
              title={isStarred ? 'Unstar card' : 'Star card'}
            >
              <StarIcon size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
              className={`p-1.5 rounded-full transition-colors ${
                isLearned
                  ? 'text-primary bg-black/30 hover:bg-black/50'
                  : 'text-white/70 bg-black/30 hover:bg-black/50 hover:text-primary'
              }`}
              aria-label={isLearned ? 'Mark as not learned' : 'Mark as learned'}
              title={isLearned ? 'Mark as not learned' : 'Mark as learned'}
            >
              <LearnedIcon size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Front Side */
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 rounded-card bg-gradient-radial from-[#EFFaF4] to-[#DFF4EA]">
          <button
            onClick={handleReplay}
            className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-primary transition-colors z-10"
            aria-label="Replay audio"
            title="Replay audio"
          >
            <RefreshCw size={18} />
          </button>
          <h3 className="text-card-heading font-semibold text-primary mb-4">Listen</h3>
          <AudioPlayer src={audioSrc} ref={audioRef} />
          <div className="absolute bottom-3 left-3 z-10 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStarred(); }}
              className={`p-1.5 rounded-full transition-colors ${
                isStarred
                  ? 'text-yellow-400 bg-black/10 hover:bg-black/20'
                  : 'text-text-muted/60 bg-black/10 hover:bg-black/20 hover:text-yellow-400'
              }`}
              aria-label={isStarred ? 'Unstar card' : 'Star card'}
              title={isStarred ? 'Unstar card' : 'Star card'}
            >
              <StarIcon size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
              className={`p-1.5 rounded-full transition-colors ${
                isLearned
                  ? 'text-primary bg-black/10 hover:bg-black/20'
                  : 'text-text-muted/60 bg-black/10 hover:bg-black/20 hover:text-primary'
              }`}
              aria-label={isLearned ? 'Mark as not learned' : 'Mark as learned'}
              title={isLearned ? 'Mark as not learned' : 'Mark as learned'}
            >
              <LearnedIcon size={16} />
            </button>
          </div>
          <div className="absolute top-4 left-4 text-primary/30">
            <Bird size={32} />
          </div>
        </div>
      )}
    </div>
  );
});

export default Flashcard; 