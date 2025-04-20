import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Bird, List, Shuffle, Filter, Play, Pause } from 'lucide-react';
// Removed App.css import if Tailwind handles all base styles via index.css or similar
// import './App.css';
import { AUDIO_DIR, IMAGE_DIR, MANIFEST_URL, MAPPING_URL } from './config';
import { BirdData, Card, FilterMode } from './types';
import { shuffleArray } from './utils/arrayUtils';
import Flashcard from './components/Flashcard';
import AllCardsView from './components/AllCardsView';

/**
 * Main Application Component
 */
function App() {
  // --- State ---
  const [cards, setCards] = useState<Card[]>([]);
  const [currentFilteredIndex, setCurrentFilteredIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'study' | 'viewAll'>('study');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Data Fetching & Initial Shuffle ---
  useEffect(() => {
    const fetchAndSetCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both manifest and mapping concurrently
        const [manifestResponse, mappingResponse] = await Promise.all([
            fetch(MANIFEST_URL),
            fetch(MAPPING_URL)
        ]);

        if (!manifestResponse.ok) {
          throw new Error(`Manifest fetch error! status: ${manifestResponse.status} - Could not fetch ${MANIFEST_URL}`);
        }
        if (!mappingResponse.ok) {
             throw new Error(`Mapping fetch error! status: ${mappingResponse.status} - Could not fetch ${MAPPING_URL}`);
        }

        const audioFilenames = await manifestResponse.json();
        const birdMapping: Record<string, BirdData> = await mappingResponse.json(); // Type the mapping

        // Validate manifest format
        if (!Array.isArray(audioFilenames) || audioFilenames.some(item => typeof item !== 'string')) {
          throw new Error(`Invalid manifest format at ${MANIFEST_URL}. Expected an array of strings.`);
        }
        // Basic validation for mapping format (check if it's an object)
         if (typeof birdMapping !== 'object' || birdMapping === null) {
            throw new Error(`Invalid mapping format at ${MAPPING_URL}. Expected a JSON object.`);
         }

        console.log(`Loaded ${audioFilenames.length} audio file names from manifest.`);
        console.log(`Loaded mapping for ${Object.keys(birdMapping).length} birds.`);

        // Create Card objects using the mapping
        const initialCards: Card[] = audioFilenames
            .map(audioFilename => {
                const mappingData = birdMapping[audioFilename];
                if (!mappingData) {
                    console.warn(`No mapping found for audio file: ${audioFilename}. Skipping card.`);
                    return null; // Skip if no mapping exists for this audio file
                }

                // Construct full image path
                const imgSrc = mappingData.image ? `${IMAGE_DIR}${mappingData.image}` : null;

                return {
                    id: audioFilename, // Use audio filename as unique ID
                    audioFilename: audioFilename,
                    displayName: mappingData.displayName || 'Unknown Bird', // Fallback display name
                    imgSrc: imgSrc,
                    learned: false,
                    starred: false,
                };
            })
            .filter((card): card is Card => card !== null); // Filter out null entries

         console.log(`Successfully created ${initialCards.length} cards.`);

         // --- Auto-shuffle the initial deck ---
         const shuffledCards = shuffleArray(initialCards);
         console.log("Initial deck auto-shuffled.");

        setCards(shuffledCards); // Set the shuffled cards
        setCurrentFilteredIndex(0); // Reset index
        setIsFlipped(false);

      } catch (err) {
        console.error("Error fetching or processing data:", err);
        let errorMessage = "Could not load bird data. ";
        if (err instanceof Error) {
            errorMessage += err.message;
        } else {
            errorMessage += "An unknown error occurred.";
        }
        // Add specific guidance (optional)
        if (errorMessage.includes('404')) {
            errorMessage += `\nEnsure '/public${AUDIO_DIR}manifest.json' and '/public${MAPPING_URL}' exist.`;
        } else if (errorMessage.includes('Unexpected token') || errorMessage.includes('Invalid JSON')) {
             errorMessage += `\nCheck if the manifest and mapping files contain valid JSON.`;
        }
        setError(errorMessage);
        setCards([]); // Clear cards on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetCards();
  }, []); // Run only once on mount


  // --- Derived State (Memoized) ---
  const filteredCards = useMemo(() => {
    console.log(`Filtering cards with mode: ${filterMode}`); // Debugging
    switch (filterMode) {
      case 'learned':
        return cards.filter(card => card.learned);
      case 'unlearned':
        return cards.filter(card => !card.learned);
      case 'starred':
        return cards.filter(card => card.starred);
      case 'all':
      default:
        return cards; // Return the full list
    }
  }, [cards, filterMode]);

  const currentCard = useMemo(() => {
    if (!filteredCards || filteredCards.length === 0 || currentFilteredIndex >= filteredCards.length) {
      console.log("Current card calculation: No card available"); // Debugging
      return undefined;
    }
    const card = filteredCards[currentFilteredIndex];
    console.log(`Current card calculation: Index ${currentFilteredIndex}, Card ID: ${card?.id}`); // Debugging
    return card;
  }, [filteredCards, currentFilteredIndex]);

  // Log the derived currentCard and its imgSrc
  useEffect(() => {
    if (currentCard) {
      console.log(`[App] Current card updated. ID: ${currentCard.id}, imgSrc: ${currentCard.imgSrc}`);
    }
  }, [currentCard]);

  const audioSrc = useMemo(() => (currentCard ? `${AUDIO_DIR}${currentCard.audioFilename}` : null), [currentCard]);

  // --- Audio Playback Logic ---

  // Effect to handle autoplay when the card changes (audio is now the front face)
  useEffect(() => {
    // When card changes, reset flip state and attempt to play audio
    setIsFlipped(false);
    setIsPlaying(false); // Reset playing state initially

    if (audioRef.current && audioSrc) {
      // Important: Load the new source before trying to play
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Autoplay started!
          setIsPlaying(true);
        }).catch(error => {
          console.warn("Audio autoplay failed:", error);
          // Autoplay was prevented.
          setIsPlaying(false);
        });
      }
    } else if (audioRef.current) {
        // If no audioSrc, ensure player is paused
        audioRef.current.pause();
    }

    // Cleanup function to pause audio if component unmounts or card changes again
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentCard, audioSrc]); // Re-run ONLY when the card/audio source changes

  // Effect to pause audio when flipping TO the back (image side)
  useEffect(() => {
    if (isFlipped && audioRef.current) {
      audioRef.current.pause();
      // No need to set isPlaying false here, the onPause handler will do it
    }
    // Do not auto-play when flipping back to front (audio side) here,
    // let the user control it with the play button after the initial auto-play.
  }, [isFlipped]);

  // --- Event Handlers ---
  const handleFlip = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped(prev => !prev);
    // Note: Pause logic when flipping is now handled in the useEffect watching isFlipped
  }, [currentCard]);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentFilteredIndex(prevIndex => (prevIndex + 1) % filteredCards.length);
    // Autoplay/flip reset handled by useEffect watching currentCard
  }, [filteredCards.length]);

  const handlePrevious = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentFilteredIndex(prevIndex => (prevIndex - 1 + filteredCards.length) % filteredCards.length);
     // Autoplay/flip reset handled by useEffect watching currentCard
  }, [filteredCards.length]);

  // Toggle Play/Pause for custom button
  const togglePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio manually:", err);
      });
    }
  }, [isPlaying]);

  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleToggleLearned = useCallback((idToToggle: string) => {
     setCards(prevCards =>
        prevCards.map(card =>
          card.id === idToToggle ? { ...card, learned: !card.learned } : card
        )
     );
     // Note: currentCard derived state will update automatically due to `cards` dependency
  }, []);

  const handleToggleStarred = useCallback((idToToggle: string) => {
      setCards(prevCards =>
         prevCards.map(card =>
           card.id === idToToggle ? { ...card, starred: !card.starred } : card
         )
      );
   }, []);

  const handleShuffle = useCallback(() => {
      if (cards.length <= 1) return;
      setCards(prevCards => shuffleArray(prevCards));
      setCurrentFilteredIndex(0); // Reset index in (potentially new order) filtered list
      setIsFlipped(false);
      console.log("Deck shuffled.");
   }, [cards.length]);

  const handleToggleView = useCallback(() => {
        setViewMode(prevMode => (prevMode === 'study' ? 'viewAll' : 'study'));
        setIsFlipped(false);
        // Reset filter and index when switching back to study mode? Optional, but might be good UX.
        // setFilterMode('all');
        // setCurrentFilteredIndex(0);
    }, []);

  const handleSetFilterMode = useCallback((newMode: FilterMode) => {
        if (newMode !== filterMode) {
            console.log(`Setting filter mode to: ${newMode}`); // Debugging
            setFilterMode(newMode);
            setCurrentFilteredIndex(0); // Reset index when filter changes
            setIsFlipped(false);
        }
    }, [filterMode]);

  // Base classes for pill buttons
  const baseButtonClasses = "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill text-body font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-38 disabled:pointer-events-none";
  const primaryButtonClasses = `${baseButtonClasses} bg-primary text-white hover:bg-primary-700`;
  const accentButtonClasses = `${baseButtonClasses} bg-accent text-white hover:bg-blue-500`; // Using blue-500 for hover as example

  // --- Render ---
  const renderStudyMode = () => (
     <div className="col-span-12 lg:col-span-8 lg:col-start-3 flex flex-col items-center w-full">
        {/* Filter Controls - Update styles to segmented control */}
        <div className="mb-6 flex items-center border border-border rounded-pill p-0.5 bg-gray-100 shadow-inner">
           <span className="text-tiny text-text-muted font-medium mr-2 pl-3 flex items-center gap-1"><Filter size={16} /> Filter:</span>
           <div role="radiogroup" className="flex"> {/* Use radiogroup role */}
              {(['all', 'unlearned', 'learned', 'starred'] as FilterMode[]).map(mode => (
                  <button
                    key={mode}
                    role="radio" // Use radio role for segments
                    aria-checked={filterMode === mode} // Indicate checked state
                    onClick={() => handleSetFilterMode(mode)}
                    className={`px-3 py-1.5 rounded-pill text-filter-chip font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-gray-100 ${ 
                      filterMode === mode
                        ? 'bg-primary text-white shadow-sm border border-primary-700' 
                        : 'text-text-muted hover:bg-primary/10 hover:text-primary'
                    }`}
                    // No disabled needed as the active one is visually distinct
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
              ))}
           </div>
        </div>

        {/* Card Counter - Use new text styles */}
        <p className="text-tiny text-text-muted mb-4">
           Card {filteredCards.length > 0 ? currentFilteredIndex + 1 : 0} of {filteredCards.length}
           {filterMode !== 'all' && ` (${filterMode} filter - ${cards.length} total)`}
        </p>

        {/* Flashcard Area - Add perspective here for flip */}
        <div className="w-full max-w-lg [perspective:1000px]"> {/* Adjusted max width, added perspective */} 
          {filteredCards.length > 0 && currentCard ? (
             <Flashcard
                key={currentCard.id} // Key ensures component re-mounts on card change, helping audio reset
                audioSrc={audioSrc}
                imgSrc={currentCard.imgSrc}
                displayName={currentCard.displayName}
                isFlipped={isFlipped}
                isLearned={currentCard.learned}
                isStarred={currentCard.starred}
                isPlaying={isPlaying}
                audioRef={audioRef}
                onFlip={handleFlip}
                onTogglePlayPause={togglePlayPause}
                onAudioPlay={handleAudioPlay}
                onAudioPause={handleAudioPause}
                onAudioEnded={handleAudioEnded}
                onToggleLearned={() => handleToggleLearned(currentCard.id)}
                onToggleStarred={() => handleToggleStarred(currentCard.id)}
             />
          ) : (
             <div className="aspect-16/10 w-full bg-border/50 rounded-card flex items-center justify-center border border-border">
                <p className="text-text-muted">
                   {cards.length === 0 ? 'No cards loaded.' : `No cards match the "${filterMode}" filter.`}
                </p>
             </div>
          )}
        </div>

        {/* Navigation Buttons Container - Placed below card */} 
        <div className="flex justify-center items-center gap-4 mt-8 w-full max-w-md">
           <button
              onClick={handlePrevious}
              disabled={filteredCards.length <= 1}
              className={primaryButtonClasses} // Use defined classes
              aria-label="Previous card"
           >
              <ChevronLeft size={20} /> Previous
           </button>
           <button
              onClick={handleNext}
              disabled={filteredCards.length <= 1}
              className={primaryButtonClasses} // Use defined classes
              aria-label="Next card"
           >
              Next <ChevronRight size={20} />
           </button>
        </div>
     </div>
  );

  return (
    <div className="bg-bg font-sans text-text min-h-screen flex flex-col">
      <main className="max-w-grid mx-auto w-full grid grid-cols-12 gap-gutter px-gutter flex-grow pb-24">
        {/* Header */} 
        <header className="col-span-12 text-center my-12">
          <h1 className="text-title font-bold tracking-[-0.02em] flex items-center justify-center gap-3">
            <Bird className="text-primary" size={36} /> Bird Sound Flashcards
          </h1>
          <p className="text-subtitle font-medium text-text-muted mt-1">
            Learn bird calls by ear!
          </p>
        </header>

        {/* Loading and Error States */} 
        {isLoading && (
          <div className="col-span-12 text-center text-text-muted mt-8">
            <p>Loading audio files...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="col-span-12 mt-8 max-w-xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2 whitespace-pre-wrap">{error}</span>
          </div>
        )}

        {/* Main Content Area */} 
        {!isLoading && !error && cards.length >= 0 ? (
          <div className="col-span-12 flex flex-col items-center">

            {/* Conditional Rendering based on viewMode */}
            {viewMode === 'study' ? (
               renderStudyMode()
            ) : (
               /* View All Mode - Span more columns */
               <div className="col-span-12 lg:col-span-10 lg:col-start-2 w-full">
                  <AllCardsView cards={cards} onToggleLearned={handleToggleLearned} onToggleStarred={handleToggleStarred} />
               </div>
            )}

            {/* Bottom Global Controls: Shuffle and View Toggle */}
            <div className="flex justify-center items-center gap-4 mt-12 w-full max-w-md"> { /* Increased margin-top */}
              <button
                  onClick={handleShuffle}
                  disabled={cards.length <= 1}
                  className={accentButtonClasses} // Use defined classes
                  aria-label="Shuffle deck"
                  title="Shuffle deck (shuffles all cards)"
              >
                  <Shuffle size={18} /> Shuffle All
              </button>
              <button
                  onClick={handleToggleView}
                  className={accentButtonClasses} // Use defined classes
                  aria-label={viewMode === 'study' ? "View all cards" : "Switch to study mode"}
                  title={viewMode === 'study' ? "View all cards" : "Switch to study mode"}
              >
                   {viewMode === 'study' ? <List size={18} /> : <Bird size={18} />}
                   {viewMode === 'study' ? 'View All' : 'Study Mode'}
              </button>
            </div>
          </div>
        ) : (
           /* No Cards Message */
            !isLoading && !error && cards.length === 0 && (
                <div className="col-span-12 text-center text-text-muted mt-8">
                    <p>No audio files found in the manifest.</p>
                    <p className="text-sm mt-2">Ensure <code>public/audio/manifest.json</code> exists and contains a list of filenames.</p>
                </div>
            )
        )}
      </main>

      {/* Footer - can be used for fixed bottom bar later */}
      <footer className="col-span-12 text-center text-tiny text-text-muted mt-12">
          {/* Content removed, possibly for bottom bar */} 
      </footer>
    </div>
  );
}

export default App;
