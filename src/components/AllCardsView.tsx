import React, { useState, useRef, useCallback, useMemo } from 'react';
import { CheckSquare, Square, Star, ExternalLink, Play, Pause, Search } from 'lucide-react';
import Fuse, { IFuseOptions } from 'fuse.js';
import { Card } from '../types';
import { AUDIO_DIR } from '../config';
import BirdImage from './BirdImage';

/**
 * View All Cards Component Props
 */
interface AllCardsViewProps {
    cards: Card[];
    onToggleLearned: (id: string) => void;
    onToggleStarred: (id: string) => void;
}

// Fuse.js options for fuzzy searching display names
const fuseOptions: IFuseOptions<Card> = {
  keys: ['displayName'],
  threshold: 0.3, // Adjust threshold for fuzziness (0=exact, 1=match anything)
  includeScore: false,
  // Other options can be tuned as needed
};

/**
 * View All Cards Component
 */
const AllCardsView: React.FC<AllCardsViewProps> = ({ cards, onToggleLearned, onToggleStarred }) => {
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
    const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    // Memoize the Fuse instance
    const fuse = useMemo(() => new Fuse(cards, fuseOptions), [cards]);

    // Memoize the search results
    const displayCards = useMemo(() => {
        if (!searchQuery) {
            return cards; // If no query, show all cards
        }
        // Perform fuzzy search and return the item itself from results
        return fuse.search(searchQuery).map(result => result.item);
    }, [searchQuery, cards, fuse]);

    const playAudio = useCallback((id: string) => {
        if (currentlyPlayingId && currentlyPlayingId !== id && audioRefs.current[currentlyPlayingId]) {
            audioRefs.current[currentlyPlayingId]?.pause();
            console.log(`Paused previous audio: ${currentlyPlayingId}`);
        }
        const audioElement = audioRefs.current[id];
        if (audioElement) {
            audioElement.play().then(() => {
                setCurrentlyPlayingId(id);
                console.log(`Playing audio: ${id}`);
            }).catch(error => {
                console.error(`Error playing audio ${id}:`, error);
                setCurrentlyPlayingId(null);
            });
        } else {
            setCurrentlyPlayingId(null);
        }
    }, [currentlyPlayingId]);

    const pauseAudio = useCallback((id: string) => {
        const audioElement = audioRefs.current[id];
        if (audioElement) {
            audioElement.pause();
            console.log(`Paused audio: ${id}`);
        }
    }, []);

    const handlePlayPause = useCallback((id: string) => {
        if (currentlyPlayingId === id) {
            pauseAudio(id);
        } else {
            playAudio(id);
        }
    }, [currentlyPlayingId, playAudio, pauseAudio]);

    const handleAudioEndedOrPaused = useCallback((id: string) => {
        if (currentlyPlayingId === id) {
             console.log(`Audio ended/paused naturally: ${id}, clearing state.`);
            setCurrentlyPlayingId(null);
        }
    }, [currentlyPlayingId]);

    if (!cards || cards.length === 0) {
        return <p className="text-gray-500 mt-8">No cards to display.</p>;
    }

    return (
        <div className="w-full max-w-4xl mt-6 space-y-3 mx-auto">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
                All Cards ({searchQuery ? `${displayCards.length} found` : cards.length})
            </h2>

            <div className="mb-4 relative px-1">
                 <input
                     type="text"
                     placeholder="Search birds by name..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                     aria-label="Search birds"
                 />
                 <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                     <Search size={18} />
                 </div>
            </div>

            {displayCards.length > 0 ? (
                displayCards.map((card) => {
                    const LearnedIcon = card.learned ? CheckSquare : Square;
                    const StarIcon = card.starred ? () => <Star size={18} fill="currentColor" /> : Star;
                    const audioSrc = `${AUDIO_DIR}${card.audioFilename}`;
                    const wikipediaSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(card.displayName)}`;
                    const isPlaying = currentlyPlayingId === card.id;

                    return (
                        <div key={card.id} className="bg-white p-3 rounded-lg shadow flex items-center justify-between gap-3 relative border border-gray-200">
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                <BirdImage src={card.imgSrc} alt={card.displayName} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-grow min-w-0 mr-auto flex items-center gap-3">
                                <div className="flex-grow min-w-0">
                                    <p className="font-medium text-base text-gray-800 mb-0.5 truncate">{card.displayName}</p>
                                    <a
                                        href={wikipediaSearchUrl}
                                        target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 hover:underline mb-1 transition-colors"
                                    >
                                        Wikipedia <ExternalLink size={10} />
                                    </a>
                                </div>

                                <audio
                                    ref={(el) => { audioRefs.current[card.id] = el; }}
                                    src={audioSrc}
                                    onPause={() => handleAudioEndedOrPaused(card.id)}
                                    onEnded={() => handleAudioEndedOrPaused(card.id)}
                                    onError={(e) => console.error(`Audio Error ${card.id}:`, e)}
                                    preload="metadata"
                                />

                                <button
                                    onClick={() => handlePlayPause(card.id)}
                                    className={`w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-700 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${!audioSrc ? 'bg-gray-300' : ''}`}
                                    disabled={!audioSrc}
                                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                                    title={isPlaying ? "Pause audio" : "Play audio"}
                                >
                                    {isPlaying ? (
                                        <Pause size={20} strokeWidth={2} fill="currentColor" />
                                    ) : (
                                        <Play size={20} strokeWidth={2} fill="currentColor" className="ml-0.5"/>
                                    )}
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-2 ml-2 flex-shrink-0">
                                <button
                                    onClick={() => onToggleStarred(card.id)}
                                    className={`p-1 rounded-full transition-colors ${
                                    card.starred ? 'text-yellow-500 bg-yellow-100 hover:bg-yellow-200' : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-yellow-500'
                                    }`}
                                    aria-label={card.starred ? "Unstar card" : "Star card"}
                                    title={card.starred ? "Unstar card" : "Star card"}
                                >
                                   <StarIcon size={18} />
                                </button>
                                <button
                                    onClick={() => onToggleLearned(card.id)}
                                    className={`p-1 rounded-full transition-colors ${
                                    card.learned ? 'text-green-600 bg-green-100 hover:bg-green-200' : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-green-600'
                                    }`}
                                    aria-label={card.learned ? "Mark as not learned" : "Mark as learned"}
                                    title={card.learned ? "Mark as not learned" : "Mark as learned"}
                                >
                                    <LearnedIcon size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                 <p className="text-gray-500 text-center mt-8">
                    No birds found matching "{searchQuery}".
                 </p>
            )}
        </div>
    );
};

export default AllCardsView;