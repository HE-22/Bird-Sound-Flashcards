import React, { RefObject } from 'react';
import { CheckSquare, Square, Star, ExternalLink, RefreshCw, Play, Pause } from 'lucide-react';
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

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.warn("Replay failed:", err));
    }
  };

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
      <div className="absolute inset-0 w-full h-full bg-gradient-radial from-[#DFF4EA] to-[#bde4cf] rounded-card flex flex-col items-center justify-center [backface-visibility:hidden] p-6 text-center overflow-hidden">
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
        <h3 className="text-lg font-semibold mb-6 text-text-muted">Listen</h3>
        <button
          onClick={onTogglePlayPause}
          className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#DFF4EA] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          disabled={!audioSrc}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause size={40} strokeWidth={1.5} fill="currentColor" />
          ) : (
            <Play size={40} strokeWidth={1.5} fill="currentColor" className="ml-1"/>
          )}
        </button>
        <button
          onClick={handleReplay}
          className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-primary transition-colors z-10"
          aria-label="Replay audio"
          title="Replay audio"
        >
          <RefreshCw size={18} />
        </button>
        <p className="text-tiny text-text-muted mt-6">(Tap to reveal name & image)</p>
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
      </div>
      <div className="absolute inset-0 w-full h-full bg-card rounded-card flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] p-6 text-center overflow-hidden">
        <h2 className="text-card-title font-bold mb-4 text-text">
          {displayName}
        </h2>
        <div className="flex-grow flex items-center justify-center w-full max-h-[60%]">
          {imgSrc ? (
            <BirdImage
              src={imgSrc}
              alt={displayName}
              className="max-h-full max-w-full object-contain rounded"
            />
          ) : (
            <div className="text-text-muted">(No Image)</div>
          )}
        </div>
        <p className="text-tiny text-text-muted mt-4">(Tap to reveal audio)</p>
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
        <div className="absolute top-4 right-4 z-10">
          <a
            href={wikipediaSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-tiny text-sky-600 hover:text-sky-800 hover:underline transition-colors p-1 bg-white/50 rounded"
            title="View on Wikipedia"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
});

export default Flashcard; 