import React from 'react';

// --- Components ---

/**
 * Audio Player Component Props
 */
interface AudioPlayerProps {
  src: string | null;
  // Removed className as it's applied directly below
}

/**
 * Audio Player Component - Forwarding Ref
 */
const AudioPlayer = React.forwardRef<HTMLAudioElement, AudioPlayerProps>(({ src }, ref) => {
  if (!src) return null; // Don't render if no source

  // Basic styling - can be customized further
  // Note: Styling the default HTML5 audio player track/thumb requires pseudo-elements
  // which are difficult to style reliably with Tailwind alone. Consider CSS or a library.
  const audioClasses = "w-full rounded-md h-10 bg-border/50";

  return (
    <audio 
      ref={ref} // Attach the forwarded ref here
      controls 
      key={src} 
      className={audioClasses}
    >
      <source src={src} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
});

export default AudioPlayer; 