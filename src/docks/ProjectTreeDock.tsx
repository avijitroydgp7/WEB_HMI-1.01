import React from 'react';
import { TreeItem } from '../components/TreeItem'; // Import new component

export const ProjectTreeDock: React.FC = () => {
    return (
        <div className="dock-item-content">
            <ul className="tree-view">
                {/* Based on the screenshot, "System" is a parent */}
                <TreeItem label="System" icon="folder_open" defaultExpanded={true}>
                     <TreeItem label="Project Information" icon="info" />
                     {/* Add other system items here if needed */}
                </TreeItem>
                
                {/* The rest are expandable categories */}
                <TreeItem label="Tag" icon="label">
                     <TreeItem label="Tag List 1" icon="article" />
                </TreeItem>
                <TreeItem label="Comment" icon="comment">
                     <TreeItem label="Comment Group 1" icon="article" />
                </TreeItem>
                <TreeItem label="Alarm" icon="alarm">
                    <TreeItem label="User Alarm" icon="person" />
                    <TreeItem label="System Alarm" icon="memory" />
                </TreeItem>
                <TreeItem label="Logging" icon="description">
                     <TreeItem label="Logging Group A" icon="article" />
                </TreeItem>
                <TreeItem label="Recipe" icon="receipt">
                     <TreeItem label="Recipe 1" icon="article" />
                </TreeItem>
                <TreeItem label="Script" icon="code">
                     <TreeItem label="MainScript.js" icon="article" />
                </TreeItem>
                <TreeItem label="Device Data Transfer" icon="sync">
                     <TreeItem label="Transfer 1" icon="article" />
                </TreeItem>
                <TreeItem label="Trigger Action" icon="flash_on">
                    <TreeItem label="Action 1" icon="article" />
                </TreeItem>
                <TreeItem label="Time Action" icon="schedule">
                     <TreeItem label="Action 2" icon="article" />
                </TreeItem>
                <TreeItem label="Image" icon="image">
                     <TreeItem label="image1.png" icon="article" />
                </TreeItem>
                <TreeItem label="Animation" icon="movie">
                     <TreeItem label="anim1.mp4" icon="article" />
                </TreeItem>
            </ul>
        </div>
    );
};