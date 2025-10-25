import React, { useState } from 'react';

interface ScreenDesignModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FillStyle = 'colour' | 'gradient' | 'pattern' | 'image';

export const ScreenDesignModal: React.FC<ScreenDesignModalProps> = ({ isOpen, onClose }) => {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [fillStyle, setFillStyle] = useState<FillStyle>('colour');

    if (!isOpen) return null;

    const renderFillContent = () => {
        switch (fillStyle) {
            case 'colour':
                return (
                    <div className="fill-content-area">
                        <button className="color-swatch">
                            <span>#F0F0F0</span>
                            <span>Click to change</span>
                        </button>
                    </div>
                );
            case 'gradient':
                return (
                    <div className="fill-content-area">
                        <button className="btn-secondary">Click to select gradient</button>
                    </div>
                );
            case 'pattern':
                return (
                    <div className="fill-content-area">
                        <button className="btn-secondary">Click to select pattern</button>
                    </div>
                );
            case 'image':
                return (
                    <div className="fill-content-area image-fill">
                        <span>No image selected</span>
                        <button className="btn-secondary">Browse...</button>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFillStyle(e.target.value as FillStyle);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span>Screen Design Template</span>
                    <span className="material-icons close-icon" onClick={onClose}>close</span>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <span className="section-title">Screen Size</span>
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label htmlFor="screenWidth">Width:</label>
                                <input id="screenWidth" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="screenHeight">Height:</label>
                                <input id="screenHeight" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <span className="section-title">Fill Style</span>
                        <div className="radio-group">
                            <label><input type="radio" name="fillStyle" value="colour" checked={fillStyle === 'colour'} onChange={handleRadioChange} /> Fill Colour</label>
                            <label><input type="radio" name="fillStyle" value="gradient" checked={fillStyle === 'gradient'} onChange={handleRadioChange} /> Gradient Colour</label>
                            <label><input type="radio" name="fillStyle" value="pattern" checked={fillStyle === 'pattern'} onChange={handleRadioChange} /> Fill Pattern</label>
                            <label><input type="radio" name="fillStyle" value="image" checked={fillStyle === 'image'} onChange={handleRadioChange} /> Fill Image</label>
                        </div>
                        {renderFillContent()}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>OK</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};
