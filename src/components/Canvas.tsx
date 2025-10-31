import React, { DragEvent, MouseEvent as ReactMouseEvent, useContext, useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { HmiComponentRenderer } from './HmiComponentRenderer';
import { SharedStateContext } from './App';
import type { HmiComponentType, HmiButtonComponent, HmiLabelComponent, HmiIndicatorComponent, HmiComponent, ScreenDesign, ZoomControls } from '../types/hmi';
import { getGradientStyle } from '../modals/GradientModal';
import { getPatternStyle, PATTERNS } from '../modals/PatternModal';
import { hexToRgba } from '../utils/colorUtils';

interface CanvasProps {
    setCoords: (coords: { x: number, y: number }) => void;
    design: ScreenDesign; 
    screenId: string; 
}

const getCanvasStyle = (design: ScreenDesign): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (design.preset === 'dynamic') {
        style.width = '100%';
        style.height = '100%';
    } else {
        style.width = `${design.width}px`;
        style.height = `${design.height}px`;
        style.border = '1px solid var(--border-color)';
        style.margin = '20px'; 
    }

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
                style.backgroundSize = 'cover'; 
                style.backgroundPosition = 'center';
                style.backgroundRepeat = 'no-repeat';
                style.opacity = imageOpacity; 
            }
            break;
    }
    
    return style;
};


export const Canvas: React.FC<CanvasProps> = ({ setCoords, design, screenId }) => {
    const context = useContext(SharedStateContext);
    if (!context) return <div>Loading...</div>;

    const { 
        baseScreens, 
        updateBaseScreen, 
        selectedComponent, 
        setSelectedComponentId, 
        setScreenZoomControls 
    } = context;

    const [isPanning, setIsPanning] = useState(false);

    const screen = baseScreens.find(s => s.id === screenId);
    const components = screen?.components ?? []; 
    
    const canvasRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

    // This hook registers the zoom controls
    useEffect(() => {
        if (transformRef.current) {
            const { zoomIn, zoomOut, resetTransform } = transformRef.current;
            
            const zoomControls: ZoomControls = {
                zoomIn,
                zoomOut,
                resetTransform,
            };
            setScreenZoomControls(prev => ({ ...prev, [screenId]: zoomControls }));
        }
        
        return () => {
            setScreenZoomControls(prev => {
                const newState = { ...prev };
                delete newState[screenId];
                return newState;
            });
        };
    }, [screenId, setScreenZoomControls]);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        
        if (!screen) return; 

        const type = e.dataTransfer.getData('application/hmi-component-type') as HmiComponentType;
        if (!type) return;

        // --- MODIFICATION: Use parent element's bounds for correct coordinates ---
        const wrapperBounds = canvasRef.current?.parentElement?.getBoundingClientRect();
        const transformState = transformRef.current?.state;
        if (!wrapperBounds || !transformState) return;

        // Calculate "world" coordinates
        const x = (e.clientX - wrapperBounds.left - transformState.positionX) / transformState.scale;
        const y = (e.clientY - wrapperBounds.top - transformState.positionY) / transformState.scale;
        // --- END MODIFICATION ---

        const newComponent: HmiComponent = createHmiComponent(type, x, y);
        
        const updatedComponents = [...components, newComponent];
        
        updateBaseScreen(screenId, { ...screen, components: updatedComponents });
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
        setSelectedComponentId(id, screenId); 
    };

    const handleCanvasMouseDown = () => {
        setSelectedComponentId(null, null);
    };

    const handleMouseMove = (e: ReactMouseEvent) => {
        if (isPanning) return;

        // --- MODIFICATION: Use parent element's bounds for correct coordinates ---
        const wrapperBounds = e.currentTarget.parentElement?.getBoundingClientRect();
        if (!wrapperBounds) return; 
        
        const transformState = transformRef.current?.state;
        if (!transformState) {
            // Fallback if transform state is not ready
            const x = Math.round(e.clientX - wrapperBounds.left);
            const y = Math.round(e.clientY - wrapperBounds.top);
            setCoords({ x, y });
            return;
        }

        // Calculate "world" coordinates
        const x = Math.round((e.clientX - wrapperBounds.left - transformState.positionX) / transformState.scale);
        const y = Math.round((e.clientY - wrapperBounds.top - transformState.positionY) / transformState.scale);
        // --- END MODIFICATION ---
        setCoords({ x, y });
    };
    
    const isSelected = (componentId: string): boolean => {
        if (!selectedComponent) return false;
        return selectedComponent.screenId === screenId && 
               selectedComponent.component.id === componentId;
    };

    return (
        <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.1}
            maxScale={5}
            limitToBounds={false}
            centerOnInit={false}
            wheel={{ step: 0.1 }}
            pinch={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
            onWheel={({ e, state, setTransform }) => {
                if (e && (e.deltaX !== 0 || e.deltaY !== 0)) {
                    e.preventDefault();
                    setTransform(state.positionX + e.deltaX, state.positionY + e.deltaY, state.scale);
                }
            }}
            onPanning={() => setIsPanning(true)}
            onPanningStop={() => setIsPanning(false)}
        >
            <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
            >
                <div
                    ref={canvasRef}
                    className="canvas"
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
                            selected={isSelected(component.id)}
                        />
                    ))}
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
};