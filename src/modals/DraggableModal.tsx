import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DraggableModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer: React.ReactNode;
    className?: string; // --- ADDED PROP ---
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
    className, // --- ADDED PROP ---
}) => {
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
            
            // --- ADDED: Escape key listener ---
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
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
    }, [isOpen, centerModal, onClose]); // --- ADDED: onClose dependency ---

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        
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
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                // --- MODIFIED HERE: Use dynamic class, default to 'modal-content-small' ---
                className={`modal-content ${className || 'modal-content-small'}`}
                ref={modalRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    zIndex: 2001,
                }}
                onMouseDown={(e) => e.stopPropagation()} 
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