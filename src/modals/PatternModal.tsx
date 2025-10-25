import React, { useState, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import { hexToRgba } from '../utils/colorUtils';

interface PatternModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        foregroundColor: string,
        backgroundColor: string,
        patternIndex: number
    ) => void;
    
    initialForegroundColor: string;
    initialBackgroundColor: string;
    initialPatternIndex: number;
}

// --- MODIFIED: Added 'export' ---
export const PATTERNS = [
    'pattern-none', 'pattern-dots-small', 'pattern-dots-medium', 'pattern-grid-small',
    'pattern-grid-large', 'pattern-lines-h', 'pattern-lines-v', 'pattern-lines-diag-up',
    'pattern-lines-diag-down', 'pattern-checker', 'pattern-mesh', 'pattern-circles',
    'pattern-stripes-thick', 'pattern-zig-zag', 'pattern-cross-hatch', 'pattern-waves',
];
// --- END MODIFICATION ---

/**
 * Generates a CSS style object for the pattern preview.
 * Note: Transparency is NOT applied here; it's applied in the main modal.
 */
export const getPatternStyle = (fg: string, bg: string, patternId: string, opacity: number = 1) => {
    const _fg = hexToRgba(fg, opacity);
    const _bg = hexToRgba(bg, opacity);

    // This is highly simplified. A real pattern generator would use SVG data URIs.
    switch (patternId) {
        case 'pattern-none': return { backgroundColor: _fg };
        case 'pattern-dots-small': return {
            backgroundImage: `radial-gradient(${_fg} 15%, transparent 16%)`,
            backgroundColor: _bg,
            backgroundSize: '10px 10px',
        };
        case 'pattern-dots-medium': return {
            backgroundImage: `radial-gradient(${_fg} 25%, transparent 26%)`,
            backgroundColor: _bg,
            backgroundSize: '15px 15px',
        };
        case 'pattern-grid-small': return {
            backgroundImage: `linear-gradient(to right, ${_fg} 1px, transparent 1px), linear-gradient(to bottom, ${_fg} 1px, transparent 1px)`,
            backgroundColor: _bg,
            backgroundSize: '10px 10px',
        };
        case 'pattern-grid-large': return {
            backgroundImage: `linear-gradient(to right, ${_fg} 1px, transparent 1px), linear-gradient(to bottom, ${_fg} 1px, transparent 1px)`,
            backgroundColor: _bg,
            backgroundSize: '20px 20px',
        };
        case 'pattern-lines-h': return {
            backgroundImage: `linear-gradient(to bottom, ${_fg} 1px, transparent 1px)`,
            backgroundColor: _bg,
            backgroundSize: '10px 5px',
        };
        case 'pattern-lines-v': return {
            backgroundImage: `linear-gradient(to right, ${_fg} 1px, transparent 1px)`,
            backgroundColor: _bg,
            backgroundSize: '5px 10px',
        };
        case 'pattern-lines-diag-up': return {
            backgroundImage: `repeating-linear-gradient(45deg, ${_fg} 0 1px, transparent 1px 5px)`,
            backgroundColor: _bg,
        };
        case 'pattern-lines-diag-down': return {
            backgroundImage: `repeating-linear-gradient(-45deg, ${_fg} 0 1px, transparent 1px 5px)`,
            backgroundColor: _bg,
        };
         case 'pattern-cross-hatch': return {
            backgroundImage: `repeating-linear-gradient(45deg, ${_fg} 0 1px, transparent 1px 5px), repeating-linear-gradient(-45deg, ${_fg} 0 1px, transparent 1px 5px)`,
            backgroundColor: _bg,
        };
        // --- MODIFIED: Default case now uses background color ---
        default:
            return { backgroundColor: _bg, border: `1px dashed ${_fg}` }; // Placeholder
    }
};


export const PatternModal: React.FC<PatternModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialForegroundColor,
    initialBackgroundColor,
    initialPatternIndex,
}) => {
    const [foregroundColor, setForegroundColor] = useState(initialForegroundColor);
    const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor);
    const [selectedPatternIndex, setSelectedPatternIndex] = useState(initialPatternIndex);

    // Reset state when modal is opened
    useEffect(() => {
        if (isOpen) {
            setForegroundColor(initialForegroundColor);
            setBackgroundColor(initialBackgroundColor);
            setSelectedPatternIndex(initialPatternIndex);
        }
    }, [isOpen, initialForegroundColor, initialBackgroundColor, initialPatternIndex]);

    const handleSave = () => {
        onSave(foregroundColor, backgroundColor, selectedPatternIndex);
        onClose();
    };

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Pattern"
            footer={
                <>
                    <button className="btn btn-primary" onClick={handleSave}>OK</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </>
            }
        >
            <div className="pattern-picker-content">
                <div className="form-section">
                    <span className="section-title">Color</span>
                    <div className="pattern-color-selection">
                        <div className="form-group-inline">
                            <label>Foreground Color</label>
                            <div className="color-swatch-container small">
                                <div className="color-swatch">
                                    <div
                                        className="color-swatch-color"
                                        style={{ backgroundColor: hexToRgba(foregroundColor, 1) }}
                                    ></div>
                                    <span className="color-swatch-content">
                                        <span className="color-swatch-hex">{foregroundColor.toUpperCase()}</span>
                                    </span>
                                </div>
                                <input
                                    type="color"
                                    value={foregroundColor}
                                    onChange={(e) => setForegroundColor(e.target.value)}
                                    className="color-input-overlay"
                                />
                            </div>
                        </div>
                        <div className="form-group-inline">
                            <label>Background Color</label>
                            <div className="color-swatch-container small">
                                <div className="color-swatch">
                                    <div
                                        className="color-swatch-color"
                                        style={{ backgroundColor: hexToRgba(backgroundColor, 1) }}
                                    ></div>
                                    <span className="color-swatch-content">
                                        <span className="color-swatch-hex">{backgroundColor.toUpperCase()}</span>
                                    </span>
                                </div>
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="color-input-overlay"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <span className="section-title">Pattern</span>
                    <div className="pattern-grid">
                        {PATTERNS.map((patternId, index) => (
                            <div
                                key={index}
                                className={`pattern-swatch ${selectedPatternIndex === index ? 'selected' : ''}`}
                                onClick={() => setSelectedPatternIndex(index)}
                            >
                                {/* Apply style to an inner div */}
                                <div style={getPatternStyle(foregroundColor, backgroundColor, patternId, 1)}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DraggableModal>
    );
};