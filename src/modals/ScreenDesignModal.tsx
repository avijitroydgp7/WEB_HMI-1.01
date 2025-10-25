import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hexToRgba } from '../utils/colorUtils';
import { GradientModal, getGradientStyle } from './GradientModal';
import { PatternModal, getPatternStyle, PATTERNS } from './PatternModal';

interface ScreenDesignModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FillStyle = 'colour' | 'gradient' | 'pattern' | 'image';
type GradationType = 'horizontal' | 'vertical' | 'upDiagonal' | 'downDiagonal';

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

export const ScreenDesignModal: React.FC<ScreenDesignModalProps> = ({ isOpen, onClose }) => {
    // --- Modal State ---
    const [isGradientModalOpen, setIsGradientModalOpen] = useState(false);
    const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);

    // --- Screen Size State ---
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [fillStyle, setFillStyle] = useState<FillStyle>('colour');

    // --- Fill Colour States ---
    const [fillColor, setFillColor] = useState('#F0F0F0');
    const [colorTransparency, setColorTransparency] = useState(0);

    // --- Gradient States ---
    const [gradientColor1, setGradientColor1] = useState('#F0F0F0');
    const [gradientColor2, setGradientColor2] = useState('#667788');
    const [gradientTransparency, setGradientTransparency] = useState(0);
    const [gradationType, setGradationType] = useState<GradationType>('horizontal');
    const [gradientVariation, setGradientVariation] = useState(0);

    // --- Pattern States ---
    const [patternForegroundColor, setPatternForegroundColor] = useState('#000000');
    const [patternBackgroundColor, setPatternBackgroundColor] = useState('#FFFFFF');
    const [patternTransparency, setPatternTransparency] = useState(0);
    const [selectedPatternIndex, setSelectedPatternIndex] = useState(0);

    // --- Image States ---
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageTransparency, setImageTransparency] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- DRAG STATE ---
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    // --- Reusable centering function ---
    const centerModal = useCallback(() => {
        if (modalRef.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = modalRef.current;
            
            const x = Math.max(0, (innerWidth - offsetWidth) / 2);
            const y = Math.max(0, (innerHeight - offsetHeight) / 2);
            
            setPosition({ x, y });
        }
    }, []);

    // --- EFFECT TO CENTER MODAL AND ADD KEYDOWN LISTENER ---
    useEffect(() => {
        if (isOpen) {
            centerModal();
            
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    // --- MODIFIED: Only close if no sub-modals are open ---
                    if (isGradientModalOpen || isPatternModalOpen) {
                        // A sub-modal is open, let its listener (in DraggableModal) handle 'Escape'
                        return;
                    }
                    // --- END MODIFICATION ---
                    onClose();
                }
            };
            
            window.addEventListener('resize', centerModal);
            document.addEventListener('keydown', handleKeyDown); // Add listener

            // Cleanup listener
            return () => {
                window.removeEventListener('resize', centerModal);
                document.removeEventListener('keydown', handleKeyDown); // Remove listener
            };
        }
    }, [isOpen, centerModal, onClose, isGradientModalOpen, isPatternModalOpen]); // --- ADDED dependencies ---

    // --- DRAG HANDLERS ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('.color-swatch-container, .fill-preview-input-container, input, select, button, label, .fill-preview-swatch')) {
            return;
        }
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

    // --- Handlers for "Fill Colour" ---
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFillColor(e.target.value);
    };
    const handleColorTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColorTransparency(Number(e.target.value));
    };

    // --- Handlers for "Gradient Colour" ---
    const handleGradientSave = (
        c1: string, c2: string, type: GradationType, variation: number
    ) => {
        setGradientColor1(c1);
        setGradientColor2(c2);
        setGradationType(type);
        setGradientVariation(variation);
    };
    const handleGradientTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGradientTransparency(Number(e.target.value));
    };

    // --- Handlers for "Fill Pattern" ---
    const handlePatternSave = (fg: string, bg: string, patternIndex: number) => {
        setPatternForegroundColor(fg);
        setPatternBackgroundColor(bg);
        setSelectedPatternIndex(patternIndex);
    };
    const handlePatternTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatternTransparency(Number(e.target.value));
    };

    // --- Handlers for "Fill Image" ---
    const handleImageTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageTransparency(Number(e.target.value));
    };
    const handleImageBrowseClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const renderFillContent = () => {
        switch (fillStyle) {
            case 'colour':
                const colorOpacity = 1 - (colorTransparency / 100);
                return (
                    <div className="fill-content-area-column wide-content">
                        <div className="fill-preview-input-container">
                            <div
                                className="fill-preview-swatch"
                                style={{ backgroundColor: hexToRgba(fillColor, colorOpacity) }}
                            >
                                <span>Click to change colour</span>
                            </div>
                            <input
                                type="color"
                                value={fillColor}
                                onChange={handleColorChange}
                                className="color-input-overlay"
                            />
                        </div>

                        <div className="opacity-slider-group">
                            <label htmlFor="transparencySlider">Transparency:</label>
                            <input
                                id="transparencySlider"
                                type="range" min="0" max="100" step="1"
                                value={colorTransparency}
                                onChange={handleColorTransparencyChange}
                            />
                            <span>{colorTransparency}%</span>
                        </div>
                    </div>
                );
            
            case 'gradient':
                const gradientOpacity = 1 - (gradientTransparency / 100);
                const gradPreview = getGradientStyle(
                    hexToRgba(gradientColor1, gradientOpacity),
                    hexToRgba(gradientColor2, gradientOpacity),
                    gradationType,
                    gradientVariation
                );

                return (
                    <div className="fill-content-area-column wide-content">
                        <div
                            className="fill-preview-swatch"
                            style={{ background: gradPreview }}
                            onClick={() => setIsGradientModalOpen(true)}
                        >
                            <span>Click to change gradient</span>
                        </div>
                        <div className="opacity-slider-group">
                            <label htmlFor="gradientTransparencySlider">Transparency:</label>
                            <input
                                id="gradientTransparencySlider"
                                type="range" min="0" max="100" step="1"
                                value={gradientTransparency}
                                onChange={handleGradientTransparencyChange}
                            />
                            <span>{gradientTransparency}%</span>
                        </div>
                    </div>
                );

            case 'pattern':
                const patternOpacity = 1 - (patternTransparency / 100);
                const patternId = PATTERNS[selectedPatternIndex];
                
                const patternStyle = getPatternStyle(
                    patternForegroundColor, 
                    patternBackgroundColor, 
                    patternId,
                    patternOpacity
                );

                return (
                    <div className="fill-content-area-column wide-content">
                        <div
                            className="fill-preview-swatch checkerboard"
                            onClick={() => setIsPatternModalOpen(true)}
                        >
                            <div 
                                className="fill-preview-swatch-overlay"
                                style={patternStyle}
                            ></div>
                            <span>Click to change pattern</span>
                        </div>
                        <div className="opacity-slider-group">
                            <label htmlFor="patternTransparencySlider">Transparency:</label>
                            <input
                                id="patternTransparencySlider"
                                type="range" min="0" max="100" step="1"
                                value={patternTransparency}
                                onChange={handlePatternTransparencyChange}
                            />
                            <span>{patternTransparency}%</span>
                        </div>
                    </div>
                );

            case 'image':
                 const imageOpacity = 1 - (imageTransparency / 100);
                return (
                    <div className="fill-content-area-column wide-content">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <div
                            className="fill-preview-swatch checkerboard"
                            onClick={handleImageBrowseClick}
                        >
                            {imageUrl ? (
                                <div
                                    className="fill-preview-swatch-overlay"
                                    style={{
                                        backgroundImage: `url(${imageUrl})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        opacity: imageOpacity,
                                    }}
                                ></div>
                            ) : (
                                <span>Click to browse for image</span>
                            )}
                        </div>
                         <div className="opacity-slider-group">
                            <label htmlFor="imageTransparencySlider">Transparency:</label>
                            <input
                                id="imageTransparencySlider"
                                type="range" min="0" max="100" step="1"
                                value={imageTransparency}
                                onChange={handleImageTransparencyChange}
                            />
                            <span>{imageTransparency}%</span>
                        </div>
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
        <>
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

            {/* --- Sub-modals are rendered here, outside the main modal structure --- */}
            <GradientModal
                isOpen={isGradientModalOpen}
                onClose={() => setIsGradientModalOpen(false)}
                onSave={handleGradientSave}
                initialColor1={gradientColor1}
                initialColor2={gradientColor2}
                initialGradationType={gradationType}
                initialVariation={gradientVariation}
            />
            
            <PatternModal
                isOpen={isPatternModalOpen}
                onClose={() => setIsPatternModalOpen(false)}
                onSave={handlePatternSave}
                initialForegroundColor={patternForegroundColor}
                initialBackgroundColor={patternBackgroundColor}
                initialPatternIndex={selectedPatternIndex}
            />
        </>
    );
};

