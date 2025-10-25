// src/utils/colorUtils.ts

/**
 * Converts a hex color string to an RGBA string.
 * @param hex Hex color string (e.g., "#RRGGBB" or "#RGB").
 * @param alpha Opacity value (0.0 to 1.0).
 * @returns RGBA color string (e.g., "rgba(255, 0, 0, 0.5)").
 */
export const hexToRgba = (hex: string, alpha: number) => {
    // Ensure hex is 6 digits
    let validHex = hex.startsWith('#') ? hex.slice(1) : hex;
    if (validHex.length === 3) {
        validHex = validHex[0] + validHex[0] + validHex[1] + validHex[1] + validHex[2] + validHex[2];
    }

    // Fallback for invalid hex
    if (validHex.length !== 6) {
        console.warn(`Invalid hex color: ${hex}. Falling back to red.`);
        return `rgba(255, 0, 0, ${alpha})`;
    }

    const r = parseInt(validHex.slice(0, 2), 16);
    const g = parseInt(validHex.slice(2, 4), 16);
    const b = parseInt(validHex.slice(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn(`Could not parse RGB values from hex: ${hex}. Falling back to red.`);
        return `rgba(255, 0, 0, ${alpha})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};