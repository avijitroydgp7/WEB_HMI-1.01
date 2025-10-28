import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hexToRgba } from '../utils/colorUtils';
import { GradientModal, getGradientStyle } from './GradientModal';
import { PatternModal, getPatternStyle, PATTERNS } from './PatternModal';
// --- ADDED IMPORTS ---
import type { ScreenDesign, FillStyle, GradationType, ScreenSizePreset } from '../types/hmi';
import { DEFAULT_SCREEN_DESIGN } from '../components/App';

interface ScreenDesignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (design: ScreenDesign) => void; // --- ADDED: Save handler
    initialDesign: ScreenDesign;             // --- ADDED: Initial state prop
}

const PREDEFINED_SIZES = [
    { label: 'Dynamic (Browser Size)', value: 'dynamic' },
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

export const ScreenDesignModal: React.FC<ScreenDesignModalProps> = ({ isOpen, onClose, onSave, initialDesign }) => {
    // --- Modal State ---
    const [isGradientModalOpen, setIsGradientModalOpen] = useState(false);
    const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);

    // --- REFACTORED STATE: Use a single 'design' object for the draft ---
    const [design, setDesign] = useState<ScreenDesign>(initialDesign || DEFAULT_SCREEN_DESIGN);
    
    // --- Effect to reset draft state when modal is opened ---
    useEffect(() => {
        if (isOpen) {
            setDesign(initialDesign || DEFAULT_SCREEN_DESIGN);
        }
    }, [isOpen, initialDesign]);
    // --- END REFACTOR ---

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- DRAG STATE ---
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    const centerModal = useCallback(() => {
        if (modalRef.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = modalRef.current;
            const x = Math.max(0, (innerWidth - offsetWidth) / 2);
            const y = Math.max(0, (innerHeight - offsetHeight) / 2);
            setPosition({ x, y });
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            centerModal();
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    if (isGradientModalOpen || isPatternModalOpen) return;
                    onClose();
                }
            };
            window.addEventListener('resize', centerModal);
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('resize', centerModal);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, centerModal, onClose, isGradientModalOpen, isPatternModalOpen]);

    // --- DRAG HANDLERS ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('.color-swatch-container, .fill-preview-input-container, input, select, button, label, .fill-preview-swatch')) {
            return;
        }
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // --- UPDATED: Size Change Handlers ---
    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as ScreenSizePreset;
        if (value === 'custom' || value === 'dynamic') {
            setDesign(d => ({ ...d, preset: value }));
        } else {
            const [newWidth, newHeight] = value.split(',').map(Number);
            setDesign(d => ({ ...d, preset: value, width: newWidth, height: newHeight }));
        }
    };
    
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, width: Number(e.target.value), preset: 'custom' }));
    };
    
    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, height: Number(e.target.value), preset: 'custom' }));
    };
    // --- END UPDATES ---


    // --- UPDATED: Fill Colour Handlers ---
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, colour: { ...d.colour, color: e.target.value } }));
    };
    const handleColorTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, colour: { ...d.colour, transparency: Number(e.target.value) } }));
    };
    // --- END UPDATES ---

    // --- UPDATED: Gradient Handlers ---
    const handleGradientSave = (c1: string, c2: string, type: GradationType, variation: number) => {
        setDesign(d => ({ ...d, gradient: { ...d.gradient, color1: c1, color2: c2, gradationType: type, variation: variation } }));
    };
    const handleGradientTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, gradient: { ...d.gradient, transparency: Number(e.target.value) } }));
    };
    // --- END UPDATES ---

    // --- UPDATED: Pattern Handlers ---
    const handlePatternSave = (fg: string, bg: string, patternIndex: number) => {
        setDesign(d => ({ ...d, pattern: { ...d.pattern, foregroundColor: fg, backgroundColor: bg, patternIndex: patternIndex } }));
    };
    const handlePatternTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, pattern: { ...d.pattern, transparency: Number(e.target.value) } }));
    };
    // --- END UPDATES ---

    // --- UPDATED: Image Handlers ---
    const handleImageTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, image: { ...d.image, transparency: Number(e.target.value) } }));
    };
    const handleImageBrowseClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDesign(d => ({ ...d, image: { ...d.image, url: reader.result as string } }));
            };
            reader.readAsDataURL(file);
        }
    };
    // --- END UPDATES ---

    const renderFillContent = () => {
        switch (design.fillStyle) {
            case 'colour':
                const { color, transparency } = design.colour;
                const colorOpacity = 1 - (transparency / 100);
                return (
                    <div className="fill-content-area-column wide-content">
                        <div className="fill-preview-input-container">
                            <div
                                className="fill-preview-swatch"
                                style={{ backgroundColor: hexToRgba(color, colorOpacity) }}
                            >
                                <span>Click to change colour</span>
                            </div>
                            <input
                                type="color"
                                value={color}
                                onChange={handleColorChange}
                                className="color-input-overlay"
                            />
                        </div>
                        <div className="opacity-slider-group">
                            <label htmlFor="transparencySlider">Transparency:</label>
                            <input
                                id="transparencySlider"
                                type="range" min="0" max="100" step="1"
                                value={transparency}
                                onChange={handleColorTransparencyChange}
                            />
                            <span>{transparency}%</span>
                        </div>
                    </div>
                );
            
            case 'gradient':
                const { color1, color2, transparency: gradTrans, gradationType, variation } = design.gradient;
                const gradientOpacity = 1 - (gradTrans / 100);
                const gradPreview = getGradientStyle(
                    hexToRgba(color1, gradientOpacity),
                    hexToRgba(color2, gradientOpacity),
                    gradationType,
                    variation
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
                                value={gradTrans}
                                onChange={handleGradientTransparencyChange}
                            />
                            <span>{gradTrans}%</span>
                        </div>
                    </div>
                );

            case 'pattern':
                const { foregroundColor, backgroundColor, transparency: patTrans, patternIndex } = design.pattern;
                const patternOpacity = 1 - (patTrans / 100);
                const patternId = PATTERNS[patternIndex];
                const patternStyle = getPatternStyle(foregroundColor, backgroundColor, patternId, patternOpacity);
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
                                value={patTrans}
                                onChange={handlePatternTransparencyChange}
                            />
                            <span>{patTrans}%</span>
                        </div>
                    </div>
                );

            case 'image':
                 const { url, transparency: imgTrans } = design.image;
                 const imageOpacity = 1 - (imgTrans / 100);
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
                            {url ? (
                                <div
                                    className="fill-preview-swatch-overlay"
                                    style={{
                                        backgroundImage: `url(${url})`,
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
                                value={imgTrans}
                                onChange={handleImageTransparencyChange}
                            />
                            <span>{imgTrans}%</span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDesign(d => ({ ...d, fillStyle: e.target.value as FillStyle }));
    };

    if (!isOpen) return null;

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
                                    <input 
                                        id="screenWidth" 
                                        type="number" 
                                        value={design.width} 
                                        onChange={handleWidthChange} 
                                        disabled={design.preset === 'dynamic'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="screenHeight">Height:</label>
                                    <input 
                                        id="screenHeight" 
                                        type="number" 
                                        value={design.height} 
                                        onChange={handleHeightChange} 
                                        disabled={design.preset === 'dynamic'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="screenPreset">Preset:</label>
                                    <select
                                        id="screenPreset"
                                        value={design.preset}
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
                                <label><input type="radio" name="fillStyle" value="colour" checked={design.fillStyle === 'colour'} onChange={handleRadioChange} /> Fill Colour</label>
                                <label><input type="radio" name="fillStyle" value="gradient" checked={design.fillStyle === 'gradient'} onChange={handleRadioChange} /> Gradient Colour</label>
                                <label><input type="radio" name="fillStyle" value="pattern" checked={design.fillStyle === 'pattern'} onChange={handleRadioChange} /> Fill Pattern</label>
                                <label><input type="radio" name="fillStyle" value="image" checked={design.fillStyle === 'image'} onChange={handleRadioChange} /> Fill Image</label>
                            </div>
                            {renderFillContent()}
                        </div>
                    </div>
                    <div className="modal-footer">
                        {/* --- MODIFIED: "OK" button now calls onSave --- */}
                        <button className="btn btn-primary" onClick={() => onSave(design)}>OK</button>
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>

            {/* --- Sub-modals --- */}
            <GradientModal
                isOpen={isGradientModalOpen}
                onClose={() => setIsGradientModalOpen(false)}
                onSave={handleGradientSave}
                initialColor1={design.gradient.color1}
                initialColor2={design.gradient.color2}
                initialGradationType={design.gradient.gradationType}
                initialVariation={design.gradient.variation}
            />
            
            <PatternModal
                isOpen={isPatternModalOpen}
                onClose={() => setIsPatternModalOpen(false)}
                onSave={handlePatternSave}
                initialForegroundColor={design.pattern.foregroundColor}
                initialBackgroundColor={design.pattern.backgroundColor}
                initialPatternIndex={design.pattern.patternIndex}
            />
        </>
    );
};