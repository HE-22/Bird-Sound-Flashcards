// --- Types & Interfaces ---
export interface BirdData {
    displayName: string;
    image: string | null; // Filename or null
}

export interface Card {
    id: string; // Audio filename
    audioFilename: string;
    displayName: string;
    imgSrc: string | null; // Full image path or null
    learned: boolean;
    starred: boolean;
}

// Define filter modes
export type FilterMode = "all" | "unlearned" | "learned" | "starred";
