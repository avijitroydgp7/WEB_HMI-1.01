import React from 'react';
import { TreeItem } from '../components/TreeItem'; // Import new component

export const ScreenTreeDock: React.FC = () => {
    return (
        <div className="dock-item-content">
            <ul className="tree-view">
                <TreeItem label="Screen Design" icon="folder" />
                <TreeItem label="Screens" icon="folder_open" defaultExpanded={true}>
                    <TreeItem label="Base Screens" icon="web" />
                    <TreeItem label="Window Screens" icon="window" />
                    <TreeItem label="Template" icon="description" />
                    <TreeItem label="Widgets" icon="widgets" />
                </TreeItem>
            </ul>
        </div>
    );
};