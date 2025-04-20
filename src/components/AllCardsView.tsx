import React from 'react';
import { CheckSquare, Square, Star, ExternalLink } from 'lucide-react';
import { Card } from '../types';
import { AUDIO_DIR } from '../config';
import AudioPlayer from './AudioPlayer';
import BirdImage from './BirdImage';

/**
 * View All Cards Component Props
 */
interface AllCardsViewProps {
    cards: Card[];
    onToggleLearned: (id: string) => void;
    onToggleStarred: (id: string) => void;
}

/**
 * View All Cards Component
 */
const AllCardsView: React.FC<AllCardsViewProps> = ({ cards, onToggleLearned, onToggleStarred }) => {
    if (!cards || cards.length === 0) {
        return <p className="text-gray-500 mt-8">No cards to display.</p>;
    }

    return (
        <div className="w-full max-w-3xl mt-6 space-y-3">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">All Cards ({cards.length})</h2>
            {cards.map((card) => {
                 const LearnedIcon = card.learned ? CheckSquare : Square;
                 const StarIcon = card.starred ? () => <Star size={18} fill="currentColor" /> : Star;
                 const audioSrc = `${AUDIO_DIR}${card.audioFilename}`;
                 const wikipediaSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(card.displayName)}`;

                 return (
                    <div key={card.id} className="bg-white p-3 rounded-lg shadow flex items-center justify-between gap-3 relative border border-gray-200"> {/* Reduced padding/gap */}
                        {/* Thumbnail Image */}
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center"> 
                           <BirdImage src={card.imgSrc} alt={card.displayName} className="w-full h-full object-cover" />
                        </div>
                        {/* Name, Link and Audio */}
                        <div className="flex-grow min-w-0 mr-auto"> {/* Pushes buttons to the right */}
                            <p className="font-medium text-base text-gray-800 mb-0.5 truncate">{card.displayName}</p> {/* Use card.displayName directly */}
                             {/* Wikipedia Link */}
                             <a
                                href={wikipediaSearchUrl}
                                target="_blank" // Open in new tab
                                rel="noopener noreferrer" // Security best practice
                                className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 hover:underline mb-1 transition-colors"
                             >
                                Wikipedia <ExternalLink size={10} />
                             </a>
                            <AudioPlayer src={audioSrc} />
                        </div>
                         {/* Status Buttons Container */}
                         <div className="flex flex-col items-center gap-2 ml-2 flex-shrink-0"> {/* Ensure buttons don't wrap */} 
                              {/* Star Button */}
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
                            {/* Learned Button */}
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
            })}
        </div>
    );
};

export default AllCardsView; 