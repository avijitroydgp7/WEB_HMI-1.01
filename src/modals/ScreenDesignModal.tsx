import React, { useState, useEffect, useRef } from 'react';

interface ScreenDesignModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FillStyle = 'colour' | 'gradient' | 'pattern' | 'image';

const PREDEFINED_SIZES = [
    { label: 'Custom', value: 'custom' },
    { label: 'VGA (640x480)', value: '640,480' },
    { label: 'SVGA (800x600)', value: '800,600' },
    { label: 'XGA (1024x768)', value: '1024,768' },
    { label: 'WXGA (1280x800)', value: '1280,800' },
    { label: 'HD (1366x768)', value: '1366,768' },
    { label: 'HD+ (1600x900)', value: '1600,900' },
    { label: 'FHD (1920x1080)', value: '1920,1080' },
    { label: 'QHD (2560x1440)', value: '2560,1440' },
    { label: '4K UHD (3840x2160)', value: '3840,2160' },
    { label: 'DCI 4K (4096x2160)', value: '4096,2160' },
];

// --- HELPER: Convert Hex to RGBA ---
const hexToRgba = (hex: string, alpha: number) => {
    // Ensure hex is 6 digits
    let validHex = hex.slice(1);
    if (validHex.length === 3) {
        validHex = validHex[0] + validHex[0] + validHex[1] + validHex[1] + validHex[2] + validHex[2];
    }
    
    // Fallback for invalid hex
    if (validHex.length !== 6) {
        return `rgba(255, 0, 0, ${alpha})`;
    }
    
    const r = parseInt(validHex.slice(0, 2), 16);
    const g = parseInt(validHex.slice(2, 4), 16);
    const b = parseInt(validHex.slice(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
         return `rgba(255, 0, 0, ${alpha})`;
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


export const ScreenDesignModal: React.FC<ScreenDesignModalProps> = ({ isOpen, onClose }) => {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [fillStyle, setFillStyle] = useState<FillStyle>('colour');
    const [fillColor, setFillColor] = useState('#F0F0F0');
    // --- This state now holds transparency percentage (0-100) ---
    const [transparency, setTransparency] = useState(0); // Default to 0% transparent (fully opaque)

    // --- DRAG STATE ---
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    // --- colorInputRef ---
    const colorInputRef = useRef<HTMLInputElement>(null);

    // --- EFFECT TO CENTER MODAL ON OPEN ---
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = modalRef.current;
            setPosition({
                x: (innerWidth - offsetWidth) / 2,
                y: (innerHeight - offsetHeight) / 2,
            });
        }
    }, [isOpen]);

    // --- DRAG HANDLERS ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isOpen) return null;

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        if (value === 'custom') return;
        const [newWidth, newHeight] = value.split(',').map(Number);
        setWidth(newWidth);
        setHeight(newHeight);
    };

    // --- HANDLERS for color picker ---
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFillColor(e.target.value);
    };

    const triggerColorPicker = () => {
        colorInputRef.current?.click();
    };

    // --- This now controls transparency directly ---
    const handleTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTransparency(Number(e.target.value));
    };

    const renderFillContent = () => {
        // --- DERIVED OPACITY: Calculate opacity from transparency ---
        const fillOpacity = 1 - (transparency / 100);

        switch (fillStyle) {
            case 'colour':
                return (
                    <div className="fill-content-area-column">
                        {/* --- MODIFIED: Button is now a wrapper --- */}
                        <button 
                            className="color-swatch" 
                            onClick={triggerColorPicker}
                        >
                            {/* --- ADDED: Inner div for the color --- */}
                            <div 
                                className="color-swatch-color"
                                style={{ backgroundColor: hexToRgba(fillColor, fillOpacity) }}
                            ></div>
                            {/* --- Content (text) is now a separate span to overlay --- */}
                            <span className="color-swatch-content">
                                <span className="color-swatch-hex">{fillColor.toUpperCase()}</span>
                                <span>Click to change</span>
                            </span>
                        </button>
                        <input
                            type="color"
                            ref={colorInputRef}
                            value={fillColor}
                            onChange={handleColorChange}
                            className="hidden-color-input"
                        />
                        {/* --- MODIFIED: Slider now controls transparency state --- */}
                        <div className="opacity-slider-group">
                            <label htmlFor="transparencySlider">Transparency:</label>
                            <input
                                id="transparencySlider"
                                type="range"
                                min="0"
                                max="100" // Range is 0-100
                                step="1"
                                value={transparency} // Value is the transparency state
                                onChange={handleTransparencyChange}
                            />
                            {/* Label directly shows transparency state */}
                            <span>{transparency}%</span>
                        </div>
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

    const getCurrentSizeValue = () => {
        const matchingSize = PREDEFINED_SIZES.find(
            s => s.value === `${width},${height}`
        );
        return matchingSize ? matchingSize.value : 'custom';
    };

    return (
        <div 
            className="modal-overlay"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div 
                className="modal-content" 
                ref={modalRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`
                }}
                onClick={(e) => e.stopPropagation()} 
            >
                <div 
                    className="modal-header" 
                    onMouseDown={handleMouseDown}
                >
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
                            <div className="form-group">
                                <label htmlFor="screenPreset">Preset:</label>
                                <select 
                                    id="screenPreset" 
                                    value={getCurrentSizeValue()} 
                                    onChange={handleSizeChange}
                                >
                                    {PREDEFINED_SIZES.map(size => (
                                        <option key={size.value} value={size.value}>
                                            {size.label}
                                        </option>
                                    ))}
                                </select>
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