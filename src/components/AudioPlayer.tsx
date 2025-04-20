import React from 'react';

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

export default AudioPlayer; 