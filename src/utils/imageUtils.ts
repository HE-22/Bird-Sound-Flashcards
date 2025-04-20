import { IMAGE_DIR } from "../config";

// --- Helper Function ---
/**
 * Constructs the image source URL from an audio filename.
 * Assumes image filename matches audio filename base (e.g., "Common_Blackbird.mp3" -> "/bird_images/Common_Blackbird.jpg")
 * @param {string} filename - The audio filename.
 * @returns {string | null} The image source URL or null if no filename.
 */
export const getBirdImageSrc = (
    filename: string | undefined
): string | null => {
    if (!filename) return null;
    // Get base name by removing the extension
    const basename =
        filename.substring(0, filename.lastIndexOf(".")) || filename;
    // Assume JPG extension for images
    return `${IMAGE_DIR}${basename}.jpg`;
};
