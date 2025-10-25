import React, { useState, useEffect, useRef } from 'react';

interface DraggableModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer: React.ReactNode;
}

/**
 * A generic draggable modal component.
 */
export const DraggableModal: React.FC<DraggableModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    // Center modal on open, with a slight random offset
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = modalRef.current;
            setPosition({
                x: (innerWidth - offsetWidth) / 2 + Math.random() * 40 - 20,
                y: (innerHeight - offsetHeight) / 2 + Math.random() * 40 - 20,
            });
        }
    }, [isOpen]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        
        // Prevent dragging when clicking on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('input, select, button, label, .color-swatch-container, .gradient-variation-swatch, .pattern-swatch')) {
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

    return (
        <div
            className="modal-overlay"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseDown={(e) => {
                // Close if user clicks on the dark overlay background
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="modal-content"
                ref={modalRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    zIndex: 2001, // Ensure it's on top of the main modal
                }}
                onMouseDown={(e) => e.stopPropagation()} // Stop overlay click
            >
                <div
                    className="modal-header"
                    onMouseDown={handleMouseDown}
                >
                    <span>{title}</span>
                    <span className="material-icons close-icon" onClick={onClose}>close</span>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    {footer}
                </div>
            </div>
        </div>
    );
};