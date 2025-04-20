import React, { RefObject } from 'react';
import { CheckSquare, Square, Star, ExternalLink, Play, Pause, Search } from 'lucide-react';
import { IFuseOptions } from 'fuse.js';
import { Card } from '../types';
import { AUDIO_DIR } from '../config';
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
  isPlaying: boolean;
  audioRef: RefObject<HTMLAudioElement>;
  onFlip: () => void;
  onToggleLearned: () => void;
  onToggleStarred: () => void;
  onTogglePlayPause: (e: React.MouseEvent) => void;
  onAudioPlay: () => void;
  onAudioPause: () => void;
  onAudioEnded: () => void;
}

/**
 * Flashcard Component
 */
const Flashcard = React.forwardRef<HTMLDivElement, FlashcardProps>((
  {
    audioSrc,
    imgSrc,
    displayName,
    isFlipped,
    isLearned,
    isStarred,
    isPlaying,
    audioRef,
    onFlip,
    onToggleLearned,
    onToggleStarred,
    onTogglePlayPause,
    onAudioPlay,
    onAudioPause,
    onAudioEnded
  },
  ref
) => {
  const LearnedIcon = isLearned ? CheckSquare : Square;
  const StarIcon = isStarred ? () => <Star size={16} fill="currentColor" /> : Star;

  const wikipediaSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(displayName)}`;

  return (
    <div
      ref={ref}
      className={`relative w-full aspect-16/10 rounded-card shadow-card cursor-pointer [transform-style:preserve-3d] transition-transform duration-500 ease-in-out ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      onClick={onFlip}
      role="button"
      aria-pressed={isFlipped}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onFlip()}
    >
      <div className="absolute inset-0 w-full h-full bg-gray-100 rounded-card flex flex-col items-center justify-center [backface-visibility:hidden] p-6 text-center overflow-hidden">
        {audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            onPlay={onAudioPlay}
            onPause={onAudioPause}
            onEnded={onAudioEnded}
            onError={(e) => console.error("Audio Error:", e)}
            preload="auto"
          />
        )}
        <h3 className="text-lg font-semibold mb-6 text-gray-600">Listen</h3>
        <button
          onClick={onTogglePlayPause}
          className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:shadow-md"
          disabled={!audioSrc}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause size={48} strokeWidth={1.5} fill="currentColor" />
          ) : (
            <Play size={48} strokeWidth={1.5} fill="currentColor" className="ml-1.5"/>
          )}
        </button>
        <p className="text-tiny text-gray-500 mt-6">(Tap to reveal bird)</p>
        <div className="absolute bottom-3 left-3 z-10 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStarred(); }}
            className={`p-1.5 rounded-full transition-colors bg-black/10 hover:bg-black/20 ${
              isStarred ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-400'
            }`}
            aria-label={isStarred ? 'Unstar card' : 'Star card'}
            title={isStarred ? 'Unstar card' : 'Star card'}
          >
            <StarIcon size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
            className={`p-1.5 rounded-full transition-colors bg-black/10 hover:bg-black/20 ${
              isLearned ? 'text-primary' : 'text-gray-500 hover:text-primary'
            }`}
            aria-label={isLearned ? 'Mark as not learned' : 'Mark as learned'}
            title={isLearned ? 'Mark as not learned' : 'Mark as learned'}
          >
            <LearnedIcon size={16} />
          </button>
        </div>
      </div>
      <div className="absolute inset-0 w-full h-full bg-black rounded-card flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
        {imgSrc ? (
          <BirdImage
            src={imgSrc}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 z-0">
            (No Image Available)
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10 pointer-events-none"></div>
        <div className="relative z-20 w-full h-full flex flex-col justify-end p-4">
          <div className="text-left">
            <h2 className="text-card-title font-bold text-white drop-shadow-md mb-0.5">
              {displayName}
            </h2>
            <a
              href={wikipediaSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-tiny text-sky-200 hover:text-sky-100 hover:underline transition-colors drop-shadow-sm"
            >
              Wikipedia <ExternalLink size={12} />
            </a>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStarred(); }}
              className={`p-1.5 rounded-full transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm ${
                isStarred ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'
              }`}
              aria-label={isStarred ? 'Unstar card' : 'Star card'}
              title={isStarred ? 'Unstar card' : 'Star card'}
            >
              <StarIcon size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
              className={`p-1.5 rounded-full transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm ${
                isLearned ? 'text-green-400' : 'text-gray-200 hover:text-green-300'
              }`}
              aria-label={isLearned ? 'Mark as not learned' : 'Mark as learned'}
              title={isLearned ? 'Mark as not learned' : 'Mark as learned'}
            >
              <LearnedIcon size={16} />
            </button>
          </div>
        </div>
        <p className="absolute top-4 left-4 text-tiny text-white/60 z-20 pointer-events-none">(Tap to reveal audio)</p>
      </div>
    </div>
  );
});

export default Flashcard; 