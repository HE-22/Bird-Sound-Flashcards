import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Bird, List, Shuffle, Filter } from 'lucide-react';
import './App.css'; // Keep default CSS import
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

  // --- Event Handlers ---
  const handleFlip = useCallback(() => {
    if (!currentCard) return; // Don't flip if no card is shown (e.g., empty filter)
    setIsFlipped(prev => !prev);
  }, [currentCard]);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentFilteredIndex(prevIndex => (prevIndex + 1) % filteredCards.length);
    setIsFlipped(false); // Show front side of the new card
  }, [filteredCards.length]);

  const handlePrevious = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentFilteredIndex(prevIndex => (prevIndex - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false); // Show front side of the new card
  }, [filteredCards.length]);

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


  // --- Render ---
  const renderStudyMode = () => (
     <>
        {/* Filter Controls */}
        <div className="mb-4 flex flex-wrap justify-center items-center gap-2 text-sm">
           <span className="text-gray-600 font-medium mr-2"><Filter size={16} className="inline -mt-1 mr-1"/>Filter:</span>
           {(['all', 'unlearned', 'learned', 'starred'] as FilterMode[]).map(mode => (
              <button
                 key={mode}
                 onClick={() => handleSetFilterMode(mode)}
                 disabled={filterMode === mode}
                 className={`px-3 py-1 rounded-full border transition-colors ${
                   filterMode === mode
                     ? 'bg-blue-500 text-white border-blue-500'
                     : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-500 disabled:bg-blue-100 disabled:text-white disabled:border-blue-200'
                 }`}
                 aria-pressed={filterMode === mode}
              >
                 {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
           ))}
        </div>

        {/* Card Counter - reflects filtered list */}
        <p className="text-gray-600 mb-4">
           Card {filteredCards.length > 0 ? currentFilteredIndex + 1 : 0} of {filteredCards.length}
           {filterMode !== 'all' && ` (${filterMode} - ${cards.length} total)`} {/* Show total only if filtered */}
        </p>

        {/* Flashcard Area */}
        {filteredCards.length > 0 && currentCard ? (
           <Flashcard
              audioSrc={audioSrc}
              imgSrc={currentCard.imgSrc}
              displayName={currentCard.displayName}
              isFlipped={isFlipped}
              isLearned={currentCard.learned}
              isStarred={currentCard.starred}
              onFlip={handleFlip}
              onToggleLearned={() => handleToggleLearned(currentCard.id)}
              onToggleStarred={() => handleToggleStarred(currentCard.id)}
           />
        ) : (
           <div className="w-full max-w-md h-80 flex items-center justify-center bg-gray-100 rounded-xl shadow-inner"> {/* Adjusted height */}
              <p className="text-gray-500">
                 {cards.length === 0 ? 'No cards loaded.' : `No cards match the "${filterMode}" filter.`}
              </p>
           </div>
        )}


        {/* Navigation Buttons - disabled based on filtered list */}
        <div className="flex justify-center items-center gap-6 mt-8 w-full max-w-md">
           <button
              onClick={handlePrevious}
              disabled={filteredCards.length <= 1}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg shadow-md hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous card"
           >
              <ChevronLeft size={20} /> Previous
           </button>
           <button
              onClick={handleNext}
              disabled={filteredCards.length <= 1}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg shadow-md hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next card"
           >
              Next <ChevronRight size={20} />
           </button>
        </div>
     </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-lime-50 to-yellow-50 flex flex-col items-center p-4 font-sans text-gray-800"> {/* Removed justify-center to allow content to flow */}
      <header className="text-center my-6 w-full"> {/* Added margin-y */}
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


      {/* Main Content Area */}
      {!isLoading && !error && cards.length >= 0 ? ( // Allow rendering even if cards.length is 0 to show controls/messages
        <div className="flex flex-col items-center w-full px-2">

          {/* Top Global Controls: Shuffle and View Toggle */}
          <div className="flex justify-center items-center gap-4 mb-6 w-full max-w-md">
             {/* Shuffle Button - Enabled even if filtered */}
             <button
                 onClick={handleShuffle}
                 disabled={cards.length <= 1} // Disable based on total cards
                 className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 aria-label="Shuffle deck"
                 title="Shuffle deck (shuffles all cards)"
             >
                 <Shuffle size={18} /> Shuffle All
             </button>
             {/* View Toggle Button */}
             <button
                 onClick={handleToggleView}
                 className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-colors"
                 aria-label={viewMode === 'study' ? "View all cards" : "Switch to study mode"}
                 title={viewMode === 'study' ? "View all cards" : "Switch to study mode"}
             >
                  {viewMode === 'study' ? <List size={18} /> : <Bird size={18} />}
                  {viewMode === 'study' ? 'View All' : 'Study Mode'}
             </button>
          </div>


          {/* Conditional Rendering based on viewMode */}
          {viewMode === 'study' ? (
             renderStudyMode()
          ) : (
             /* View All Mode */
             <AllCardsView cards={cards} onToggleLearned={handleToggleLearned} onToggleStarred={handleToggleStarred} />
          )}

        </div>
      ) : (
         /* Render only loading/error/no files message if applicable */
          !isLoading && !error && cards.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                  <p>No audio files found in the manifest.</p>
                  <p className="text-sm mt-2">Ensure <code>public/audio/manifest.json</code> exists and contains a list of filenames.</p>
              </div>
          )
      )}

      {/* Footer - Only show if cards exist */}
      {!isLoading && !error && cards.length > 0 && (
           <footer className="mt-12 text-center text-xs text-gray-500">
               {/* Removed click tip as it's more intuitive now */}
               {/* Removed filename hint */}
           </footer>
       )}

      {/* Style block remains the same */}
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
