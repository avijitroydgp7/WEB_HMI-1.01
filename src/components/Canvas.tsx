import React, { DragEvent, MouseEvent as ReactMouseEvent, useContext } from 'react';
import { HmiComponentRenderer } from './HmiComponentRenderer';
import { SharedStateContext } from './App';
// --- MODIFIED IMPORTS ---
import type { HmiComponentType, HmiButtonComponent, HmiLabelComponent, HmiIndicatorComponent, HmiComponent, ScreenDesign } from '../types/hmi';
import { getGradientStyle } from '../modals/GradientModal';
import { getPatternStyle, PATTERNS } from '../modals/PatternModal';
import { hexToRgba } from '../utils/colorUtils';
// --- END MODIFICATION ---

interface CanvasProps {
    setCoords: (coords: { x: number, y: number }) => void;
    design: ScreenDesign; // --- ADDED PROP ---
}

// --- ADDED HELPER FUNCTION ---
const getCanvasStyle = (design: ScreenDesign): React.CSSProperties => {
    const style: React.CSSProperties = {};

    // 1. Set Size
    if (design.preset === 'dynamic') {
        style.width = '100%';
        style.height = '100%';
    } else {
        style.width = `${design.width}px`;
        style.height = `${design.height}px`;
        // Add a visible border if not dynamic
        style.border = '1px solid var(--border-color)';
        style.margin = '20px'; // Add margin so it's not in the corner
    }

    // 2. Set Background
    switch (design.fillStyle) {
        case 'colour':
            const { color, transparency } = design.colour;
            style.backgroundColor = hexToRgba(color, 1 - (transparency / 100));
            break;
        
        case 'gradient':
            const { color1, color2, transparency: gradTrans, gradationType, variation } = design.gradient;
            const opacity = 1 - (gradTrans / 100);
            style.background = getGradientStyle(
                hexToRgba(color1, opacity),
                hexToRgba(color2, opacity),
                gradationType,
                variation
            );
            break;

        case 'pattern':
            const { foregroundColor, backgroundColor, transparency: patTrans, patternIndex } = design.pattern;
            const patternOpacity = 1 - (patTrans / 100);
            const patternId = PATTERNS[patternIndex];
            // getPatternStyle returns a style object, so we merge it
            Object.assign(style, getPatternStyle(
                foregroundColor, 
                backgroundColor, 
                patternId,
                patternOpacity
            ));
            break;

        case 'image':
            const { url, transparency: imgTrans } = design.image;
            const imageOpacity = 1 - (imgTrans / 100);
            if (url) {
                style.backgroundImage = `url(${url})`;
                style.backgroundSize = 'cover'; // Or 'contain', '100% 100%', etc.
                style.backgroundPosition = 'center';
                style.backgroundRepeat = 'no-repeat';
                // We'd need an overlay to apply opacity, but for simplicity:
                // This will make the whole canvas transparent, which is not ideal
                // A better solution would be a ::before pseudo-element
                style.opacity = imageOpacity; 
            }
            break;
    }
    
    // Add grid background image
    const grid = 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)';
    
    // Combine grid with existing background
    if (style.background || style.backgroundColor) {
         if (style.background) {
            style.background = `${grid}, ${style.background}`;
         } else {
             style.background = grid;
             // backgroundColor is already set
         }
    } else {
        style.background = grid;
    }
    style.backgroundSize = '20px 20px';

    return style;
};
// --- END HELPER FUNCTION ---


export const Canvas: React.FC<CanvasProps> = ({ setCoords, design }) => {
    const context = useContext(SharedStateContext);
    if (!context) return <div>Loading...</div>;

    const { components, selectedComponent, setComponents, setSelectedComponentId } = context;
    const selectedComponentId = selectedComponent?.id ?? null;

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/hmi-component-type') as HmiComponentType;
        if (!type) return;

        const canvasBounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - canvasBounds.left;
        const y = e.clientY - canvasBounds.top;

        const newComponent: HmiComponent = createHmiComponent(type, x, y);
        setComponents(prev => [...prev, newComponent]);
    };

    const createHmiComponent = (type: HmiComponentType, x: number, y: number): HmiComponent => {
        const base = {
            id: `comp_${Date.now()}`,
            x: Math.round(x),
            y: Math.round(y),
            width: 100,
            height: 50,
        };
        switch (type) {
            case 'button':
                return { ...base, type: 'button', text: 'Button', height: 40 } as HmiButtonComponent;
            case 'label':
                return { ...base, type: 'label', text: 'Label', fontSize: 16, height: 30 } as HmiLabelComponent;
            case 'indicator':
                return { ...base, type: 'indicator', color: 'gray', width: 50, height: 50 } as HmiIndicatorComponent;
            default:
                throw new Error('Unknown component type');
        }
    };
    
    const handleSelectComponent = (e: ReactMouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedComponentId(id);
    };

    const handleCanvasMouseDown = () => {
        setSelectedComponentId(null);
    };

    const handleMouseMove = (e: ReactMouseEvent) => {
        const canvasBounds = e.currentTarget.getBoundingClientRect();
        const x = Math.round(e.clientX - canvasBounds.left);
        const y = Math.round(e.clientY - canvasBounds.top);
        setCoords({ x, y });
    };

    return (
        <div 
            className="canvas" 
            // --- MODIFIED: Apply dynamic style ---
            style={getCanvasStyle(design)}
            onDragOver={handleDragOver} 
            onDrop={handleDrop} 
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
        >
            {components.map(component => (
                <HmiComponentRenderer
                    key={component.id}
                    component={component}
                    onSelect={handleSelectComponent}
                    selected={component.id === selectedComponentId}
                />
            ))}
        </div>
    );
};