import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Image Component with Error Handling Props
 */
interface BirdImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

/**
 * Image Component with Error Handling
 */
const BirdImage: React.FC<BirdImageProps> = ({ src, alt, className }) => {
    const [error, setError] = useState(false);
    console.log(`[BirdImage] Received src: ${src}, Alt: ${alt}, Error state: ${error}`); // Log props and state

    useEffect(() => {
        setError(false); // Reset error state when src changes
    }, [src]);

    if (error || !src) {
        return (
            <div className={`flex flex-col items-center justify-center text-gray-400 ${className} bg-gray-100 rounded`}>
                <ImageOff size={32} />
                <span className="text-xs mt-1">Image not found</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            loading="lazy" // Lazy load images
        />
    );
};

export default BirdImage; 