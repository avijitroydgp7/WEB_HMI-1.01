import React, { useState, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import { hexToRgba } from '../utils/colorUtils';

type GradationType = 'horizontal' | 'vertical' | 'upDiagonal' | 'downDiagonal';

interface GradientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        color1: string,
        color2: string,
        type: GradationType,
        variation: number
    ) => void;
    
    initialColor1: string;
    initialColor2: string;
    initialGradationType: GradationType;
    initialVariation: number;
}

const GRADATION_TYPES = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
    { label: 'Up Diagonal', value: 'upDiagonal' },
    { label: 'Down Diagonal', value: 'downDiagonal' },
];

/**
 * Generates a CSS gradient string for previews.
 * Note: Transparency is NOT applied here; it's applied in the main modal.
 */
export const getGradientStyle = (c1: string, c2: string, type: string, varIdx: number) => {
    let angle = '90deg'; // Default for horizontal
    switch (type) {
        case 'vertical': angle = '180deg'; break;
        case 'upDiagonal': angle = '135deg'; break;
        case 'downDiagonal': angle = '45deg'; break;
    }

    switch (varIdx) {
        case 0: return `linear-gradient(${angle}, ${c1}, ${c2})`;
        case 1: return `linear-gradient(${angle}, ${c1} 0%, ${c2} 100%)`;
        case 2: return `linear-gradient(${angle}, ${c2}, ${c1})`; // Reversed
        case 3: return `linear-gradient(${angle}, ${c2} 0%, ${c1} 100%)`;
        default: return `linear-gradient(${angle}, ${c1}, ${c2})`;
    }
};

export const GradientModal: React.FC<GradientModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialColor1,
    initialColor2,
    initialGradationType,
    initialVariation,
}) => {
    const [color1, setColor1] = useState(initialColor1);
    const [color2, setColor2] = useState(initialColor2);
    const [gradationType, setGradationType] = useState<GradationType>(initialGradationType);
    const [variation, setVariation] = useState(initialVariation);

    // Reset state when modal is opened to initial props
    useEffect(() => {
        if (isOpen) {
            setColor1(initialColor1);
            setColor2(initialColor2);
            setGradationType(initialGradationType);
            setVariation(initialVariation);
        }
    }, [isOpen, initialColor1, initialColor2, initialGradationType, initialVariation]);

    const handleSave = () => {
        onSave(color1, color2, gradationType, variation);
        onClose();
    };

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Gradient"
            footer={
                <>
                    <button className="btn btn-primary" onClick={handleSave}>OK</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </>
            }
        >
            <div className="gradient-picker-content">
                {/* Color Selection */}
                <div className="form-section">
                    <span className="section-title">Color</span>
                    <div className="gradient-color-selection">
                        <div className="form-group-inline">
                            <label>Color1</label>
                            <div className="color-swatch-container small">
                                <div className="color-swatch">
                                    <div
                                        className="color-swatch-color"
                                        style={{ backgroundColor: hexToRgba(color1, 1) }}
                                    ></div>
                                    <span className="color-swatch-content">
                                        <span className="color-swatch-hex">{color1.toUpperCase()}</span>
                                    </span>
                                </div>
                                <input
                                    type="color"
                                    value={color1}
                                    onChange={(e) => setColor1(e.target.value)}
                                    className="color-input-overlay"
                                />
                            </div>
                        </div>
                        <div className="form-group-inline">
                            <label>Color2</label>
                            <div className="color-swatch-container small">
                                <div className="color-swatch">
                                    <div
                                        className="color-swatch-color"
                                        style={{ backgroundColor: hexToRgba(color2, 1) }}
                                    ></div>
                                    <span className="color-swatch-content">
                                        <span className="color-swatch-hex">{color2.toUpperCase()}</span>
                                    </span>
                                </div>
                                <input
                                    type="color"
                                    value={color2}
                                    onChange={(e) => setColor2(e.target.value)}
                                    className="color-input-overlay"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gradation Type and Variation */}
                <div className="gradient-layout-grid">
                    <div className="form-section">
                        <span className="section-title">Gradation Type</span>
                        <div className="radio-group vertical">
                            {GRADATION_TYPES.map((type) => (
                                <label key={type.value}>
                                    <input
                                        type="radio"
                                        name="gradationType"
                                        value={type.value}
                                        checked={gradationType === type.value}
                                        onChange={(e) => setGradationType(e.target.value as GradationType)}
                                    />
                                    {type.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <span className="section-title">Variation</span>
                        <div className="gradient-variation-grid">
                            {[0, 1, 2, 3].map((idx) => (
                                <div
                                    key={idx}
                                    className={`gradient-variation-swatch ${variation === idx ? 'selected' : ''}`}
                                    style={{ background: getGradientStyle(color1, color2, gradationType, idx) }}
                                    onClick={() => setVariation(idx)}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DraggableModal>
    );
};