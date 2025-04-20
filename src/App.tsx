import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, RotateCcw, ChevronLeft, ChevronRight, Bird, CheckSquare, Square, List, Shuffle, Star, Filter } from 'lucide-react';
import './App.css'; // Keep default CSS import

// --- Configuration ---
const AUDIO_DIR = '/audio/'; // Path relative to the public folder
const MANIFEST_URL = `${AUDIO_DIR}manifest.json`; // Path to the manifest file

// --- Types & Interfaces ---
interface Card {
  id: string; // Use filename as a unique ID for simplicity
  filename: string;
  learned: boolean;
  starred: boolean; // Add starred status
}

// Define filter modes
type FilterMode = 'all' | 'unlearned' | 'learned' | 'starred';

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
  isLearned: boolean;
  isStarred: boolean; // Add starred status
  onFlip: () => void;
  onToggleLearned: () => void;
  onToggleStarred: () => void; // Add handler for starring
}

/**
 * Flashcard Component
 */
const Flashcard: React.FC<FlashcardProps> = ({
    audioSrc,
    birdName,
    isFlipped,
    isLearned,
    isStarred, // Destructure new prop
    onFlip,
    onToggleLearned,
    onToggleStarred // Destructure new prop
}) => {
  const LearnedIcon = isLearned ? CheckSquare : Square;
  // Use fill for starred icon
  const StarIcon = isStarred ? () => <Star size={20} fill="currentColor" /> : Star;

  return (
    <div className="w-full max-w-md h-72 perspective relative group"> {/* Add group for potential hover effects if needed later */}

      {/* Status Buttons Container (outside the flipping card) */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
         {/* Star Button */}
         <button
             onClick={(e) => { e.stopPropagation(); onToggleStarred(); }}
             className={`p-1 rounded-full transition-colors ${
               isStarred
                 ? 'text-yellow-500 bg-yellow-100 hover:bg-yellow-200'
                 : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-yellow-500'
             }`}
             aria-label={isStarred ? "Unstar card" : "Star card"}
             title={isStarred ? "Unstar card" : "Star card"}
         >
             <StarIcon size={20} />
         </button>
         {/* Learned Button */}
        <button
            onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
            className={`p-1 rounded-full transition-colors ${
            isLearned
                ? 'text-green-600 bg-green-100 hover:bg-green-200'
                : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-green-600'
            }`}
            aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
            title={isLearned ? "Mark as not learned" : "Mark as learned"}
        >
            <LearnedIcon size={20} />
        </button>
      </div>

      {/* Flipping Container - Restore onClick for flip */}
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d rounded-xl shadow-lg cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={onFlip} // Restore click anywhere to flip
      >
        {/* Front Side (Audio) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 p-6 rounded-xl backface-hidden">
          <h3 className="text-lg font-semibold text-sky-800 mb-4">Listen</h3>
          <AudioPlayer src={audioSrc} />
          <button
            onClick={(e) => { e.stopPropagation(); onFlip(); }} // Keep flip on RotateCcw button
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

        {/* Back Side (Bird Name) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-green-200 p-6 rounded-xl backface-hidden rotate-y-180">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Bird Name</h3>
          <p className="text-2xl font-bold text-center text-emerald-900">{birdName}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onFlip(); }} // Keep flip on RotateCcw button
            className="absolute bottom-4 right-4 text-emerald-600 hover:text-emerald-800 transition-colors"
            aria-label="Show audio player"
            title="Show audio player"
          >
            <RotateCcw size={24} />
          </button>
          <div className="absolute top-4 right-4 text-emerald-500 opacity-50"> {/* Changed from left to right for variety */}
            <Bird size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * View All Cards Component Props
 */
interface AllCardsViewProps {
    cards: Card[];
    onToggleLearned: (id: string) => void;
    onToggleStarred: (id: string) => void; // Add handler for starring
}

/**
 * View All Cards Component
 */
const AllCardsView: React.FC<AllCardsViewProps> = ({ cards, onToggleLearned, onToggleStarred }) => {
    if (!cards || cards.length === 0) {
        return <p className="text-gray-500 mt-8">No cards to display.</p>;
    }

    return (
        <div className="w-full max-w-3xl mt-6 space-y-3"> {/* Reduced mt and space-y */}
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">All Cards ({cards.length})</h2>
            {cards.map((card) => {
                 const LearnedIcon = card.learned ? CheckSquare : Square;
                 // Use fill for starred icon
                 const StarIcon = card.starred ? () => <Star size={18} fill="currentColor" /> : Star;
                 const birdName = getBirdNameFromFilename(card.filename);
                 const audioSrc = `${AUDIO_DIR}${card.filename}`;
                 return (
                    <div key={card.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between gap-4 relative border border-gray-200"> {/* Center items vertically */}
                        <div className="flex-grow min-w-0"> {/* Allow shrinking */}
                            <p className="font-medium text-lg text-gray-800 mb-2 truncate">{birdName}</p> {/* Truncate long names */}
                            <AudioPlayer src={audioSrc} />
                        </div>
                         {/* Status Buttons Container */}
                         <div className="flex flex-col items-center gap-2 ml-2"> {/* Align buttons vertically */}
                              <button
                                onClick={() => onToggleStarred(card.id)}
                                className={`p-1 rounded-full transition-colors ${
                                card.starred
                                    ? 'text-yellow-500 bg-yellow-100 hover:bg-yellow-200'
                                    : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-yellow-500'
                                }`}
                                aria-label={card.starred ? "Unstar card" : "Star card"}
                                title={card.starred ? "Unstar card" : "Star card"}
                              >
                                <StarIcon size={18} />
                            </button>
                            <button
                                onClick={() => onToggleLearned(card.id)}
                                className={`p-1 rounded-full transition-colors ${
                                card.learned
                                    ? 'text-green-600 bg-green-100 hover:bg-green-200'
                                    : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-green-600'
                                }`}
                                aria-label={card.learned ? "Mark as not learned" : "Mark as learned"}
                                title={card.learned ? "Mark as not learned" : "Mark as learned"}
                            >
                                <LearnedIcon size={18} />
                            </button>
                         </div>
                    </div>
                 );
            })}
        </div>
    );
};

/**
 * Fisher-Yates (aka Knuth) Shuffle Algorithm.
 * @param {Array<T>} array - The array to shuffle.
 * @returns {Array<T>} A new shuffled array.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array]; // Create a copy
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
}

/**
 * Main Application Component
 */
function App() {
  // --- State ---
  const [cards, setCards] = useState<Card[]>([]); // Holds the master list of all cards
  const [currentFilteredIndex, setCurrentFilteredIndex] = useState<number>(0); // Index within the filtered list
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'study' | 'viewAll'>('study');
  const [filterMode, setFilterMode] = useState<FilterMode>('all'); // Add filter state, default 'all'

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAndSetCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(MANIFEST_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - Could not fetch ${MANIFEST_URL}`);
        }
        const filenames = await response.json();
        if (!Array.isArray(filenames) || filenames.some(item => typeof item !== 'string')) {
          throw new Error(`Invalid manifest format at ${MANIFEST_URL}. Expected an array of strings.`);
        }
        console.log(`Loaded ${filenames.length} audio file names from manifest.`);

        // Initialize cards with learned and starred status as false
        const initialCards: Card[] = filenames.map(filename => ({
          id: filename, // Use filename as unique ID
          filename: filename,
          learned: false,
          starred: false, // Initialize starred
        }));

        setCards(initialCards);
        setCurrentFilteredIndex(0); // Reset index
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
            errorMessage += `\nEnsure '/public${AUDIO_DIR}manifest.json' exists and contains a JSON array of filenames (e.g., ["bird1.mp3", "bird2.mp3"]).`;
        } else if (errorMessage.includes('Unexpected token') || errorMessage.includes('Invalid JSON')) {
             errorMessage += `\nCheck if '/public${AUDIO_DIR}manifest.json' contains valid JSON. It should look like: ["file1.mp3", "file2.mp3"]`;
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

  // Filtered list of cards based on the current filterMode
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

  // The actual card object currently being displayed (from the filtered list)
  const currentCard = useMemo(() => {
    if (!filteredCards || filteredCards.length === 0 || currentFilteredIndex >= filteredCards.length) {
      console.log("Current card calculation: No card available"); // Debugging
      return undefined;
    }
    const card = filteredCards[currentFilteredIndex];
    console.log(`Current card calculation: Index ${currentFilteredIndex}, Card ID: ${card?.id}`); // Debugging
    return card;
  }, [filteredCards, currentFilteredIndex]);

  // Other derived data based on the currentCard
  const audioSrc = useMemo(() => (currentCard ? `${AUDIO_DIR}${currentCard.filename}` : null), [currentCard]);
  const birdName = useMemo(() => getBirdNameFromFilename(currentCard?.filename), [currentCard]);
  const isLearned = useMemo(() => (currentCard?.learned ?? false), [currentCard]);
  const isStarred = useMemo(() => (currentCard?.starred ?? false), [currentCard]); // Add memo for starred

  // --- Event Handlers ---

  /** Flips the current card */
  const handleFlip = useCallback(() => {
    if (!currentCard) return; // Don't flip if no card is shown (e.g., empty filter)
    setIsFlipped(prev => !prev);
  }, [currentCard]);

  /** Navigates to the next card IN THE FILTERED LIST */
  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentFilteredIndex(prevIndex => (prevIndex + 1) % filteredCards.length);
    setIsFlipped(false); // Show front side of the new card
  }, [filteredCards.length]);

  /** Navigates to the previous card IN THE FILTERED LIST */
  const handlePrevious = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentFilteredIndex(prevIndex => (prevIndex - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false); // Show front side of the new card
  }, [filteredCards.length]);

  /** Toggles the learned status of a card by its ID (updates master list) */
  const handleToggleLearned = useCallback((idToToggle: string) => {
     setCards(prevCards =>
        prevCards.map(card =>
          card.id === idToToggle ? { ...card, learned: !card.learned } : card
        )
     );
     // Note: currentCard derived state will update automatically due to `cards` dependency
  }, []);

  /** Toggles the starred status of a card by its ID (updates master list) */
   const handleToggleStarred = useCallback((idToToggle: string) => {
      setCards(prevCards =>
         prevCards.map(card =>
           card.id === idToToggle ? { ...card, starred: !card.starred } : card
         )
      );
   }, []);

  /** Shuffles the MASTER list and resets the filtered index */
   const handleShuffle = useCallback(() => {
      if (cards.length <= 1) return;
      setCards(prevCards => shuffleArray(prevCards));
      setCurrentFilteredIndex(0); // Reset index in (potentially new order) filtered list
      setIsFlipped(false);
      console.log("Deck shuffled.");
   }, [cards.length]); // Depends on master list length for shuffle trigger

   /** Toggles between study view and view all */
    const handleToggleView = useCallback(() => {
        setViewMode(prevMode => (prevMode === 'study' ? 'viewAll' : 'study'));
        setIsFlipped(false);
        // Reset filter and index when switching back to study mode? Optional, but might be good UX.
        // setFilterMode('all');
        // setCurrentFilteredIndex(0);
    }, []);

    /** Sets the current filter mode and resets the index */
    const handleSetFilterMode = useCallback((newMode: FilterMode) => {
        if (newMode !== filterMode) {
            console.log(`Setting filter mode to: ${newMode}`); // Debugging
            setFilterMode(newMode);
            setCurrentFilteredIndex(0); // Reset index when filter changes
            setIsFlipped(false);
        }
    }, [filterMode]); // Depends on current filterMode


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
              birdName={birdName}
              isFlipped={isFlipped}
              isLearned={isLearned}
              isStarred={isStarred} // Pass starred status
              onFlip={handleFlip}
              onToggleLearned={() => handleToggleLearned(currentCard.id)}
              onToggleStarred={() => handleToggleStarred(currentCard.id)} // Pass star handler
           />
        ) : (
           <div className="w-full max-w-md h-72 flex items-center justify-center bg-gray-100 rounded-xl shadow-inner">
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
             <AllCardsView cards={cards} onToggleLearned={handleToggleLearned} onToggleStarred={handleToggleStarred} /> // Pass star handler
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
               <p>Filenames like "Common_Blackbird.mp3" work best.</p>
               {/* Add info about filtering? */}
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
