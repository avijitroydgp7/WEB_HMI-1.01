import React from 'react';
import { TreeItem } from '../components/TreeItem'; // Import new component

// --- ADDED PROPS INTERFACE ---
interface ScreenTreeDockProps {
    onOpenScreenDesign: () => void;
}

export const ScreenTreeDock: React.FC<ScreenTreeDockProps> = ({ onOpenScreenDesign }) => {
    return (
        <div className="dock-item-content">
            <ul className="tree-view">
                {/* --- MODIFIED HERE --- */}
                <TreeItem 
                    label="Screen Design" 
                    icon="folder" 
                    onDoubleClick={onOpenScreenDesign} // --- ADDED HANDLER ---
                />
                {/* --- END MODIFICATION --- */}
                <TreeItem label="Screens" icon="folder_open" defaultExpanded={true}>
                    <TreeItem label="Base Screens" icon="web" />
                    <TreeItem label="Window Screens" icon="window" />
                    <TreeItem label="Template" icon="description" />
                    <TreeItem label="Screens" icon="tv" />
                    <TreeItem label="Widgets" icon="widgets" />
                </TreeItem>
            </ul>
        </div>
    );
};