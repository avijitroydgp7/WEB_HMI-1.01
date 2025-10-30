import React, { useState, useEffect, useRef, useContext } from 'react';
import { TreeItem } from '../components/TreeItem';
import { SharedStateContext } from '../components/App'; 

interface ScreenTreeDockProps {
    onOpenScreenDesign: () => void;
    onOpenBaseScreenModal: () => void; 
    onOpenScreen: (id: string, name: string) => void; // --- ADDED PROP ---
}

type ContextMenuType = 'Base Screens' | 'Window Screens' | 'Template' | 'Widgets';

export const ScreenTreeDock: React.FC<ScreenTreeDockProps> = ({ 
    onOpenScreenDesign,
    onOpenBaseScreenModal,
    onOpenScreen // --- ADDED PROP ---
}) => {
    
    const context = useContext(SharedStateContext);
    
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: ContextMenuType } | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null); 

    const handleContextMenu = (event: React.MouseEvent, type: ContextMenuType) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({ x: event.clientX, y: event.clientY, type });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                handleCloseContextMenu();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); 

    const renderContextMenu = () => {
        if (!contextMenu) return null;

        let addText = "Add New";
        let addAction = handleCloseContextMenu; 

        switch (contextMenu.type) {
            case 'Base Screens': 
                addText = "Add New Base Screen"; 
                addAction = () => {
                    onOpenBaseScreenModal();
                    handleCloseContextMenu();
                };
                break;
            case 'Window Screens': 
                addText = "Add New Window Screen"; 
                break;
            case 'Template': 
                addText = "Add New Template"; 
                break;
            case 'Widgets': 
                addText = "Add New Widget"; 
                break;
        }

        return (
            <div 
                ref={contextMenuRef} 
                className="context-menu" 
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="menu-item" onClick={addAction}>
                    <span className="material-icons">post_add</span>
                    <span>{addText}</span>
                </div>
                <div className="menu-item" onClick={handleCloseContextMenu}>
                    <span className="material-icons">content_paste</span>
                    <span>Paste</span>
                </div>
            </div>
        );
    };

    if (!context) {
        return <div className="dock-item-content">Loading...</div>;
    }
    
    const { baseScreens } = context; 

    return (
        <div className="dock-item-content" ref={dockRef}>
            <ul className="tree-view">
                <TreeItem 
                    label="Screen Design" 
                    icon="folder" 
                    onDoubleClick={onOpenScreenDesign}
                />
                <TreeItem label="Screens" icon="folder_open" defaultExpanded={true}>
                    <TreeItem 
                        label="Base Screens" 
                        icon="web" 
                        onContextMenu={(e) => handleContextMenu(e, 'Base Screens')}
                        defaultExpanded={true} 
                    >
                        {/* --- MODIFIED TO ADD FORMATTING AND onDoubleClick --- */}
                        {baseScreens.map(screen => {
                            // Create the formatted label
                            const screenLabel = `[B]-[${screen.screenNumber}]-${screen.screenName}`;
                            return (
                                <TreeItem
                                    key={screen.id}
                                    label={screenLabel} // Use the formatted label
                                    icon="article"
                                    // Pass the unique ID and the formatted label to the handler
                                    onDoubleClick={() => onOpenScreen(screen.id, screenLabel)}
                                />
                            );
                        })}
                        {/* --- END MODIFICATION --- */}
                    </TreeItem>
                    <TreeItem 
                        label="Window Screens" 
                        icon="window" 
                        onContextMenu={(e) => handleContextMenu(e, 'Window Screens')}
                    />
                    <TreeItem 
                        label="Template" 
                        icon="description" 
                        onContextMenu={(e) => handleContextMenu(e, 'Template')}
                    />
                    <TreeItem 
                        label="Widgets" 
                        icon="widgets" 
                        onContextMenu={(e) => handleContextMenu(e, 'Widgets')}
                    />
                </TreeItem>
            </ul>
            {renderContextMenu()}
        </div>
    );
};