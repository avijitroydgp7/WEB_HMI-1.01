import React, { useState } from 'react';

interface TreeItemProps {
    label: string;
    icon: string;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
    onDoubleClick?: () => void;
    onContextMenu?: (event: React.MouseEvent) => void; // --- ADDED PROP ---
}

export const TreeItem: React.FC<TreeItemProps> = ({ label, icon, children, defaultExpanded = false, onDoubleClick, onContextMenu }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const hasChildren = React.Children.count(children) > 0;

    const handleToggle = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <li className="tree-item">
            {/* --- MODIFIED HERE --- */}
            <div 
                className="tree-node" 
                onClick={handleToggle} 
                onDoubleClick={onDoubleClick}
                onContextMenu={onContextMenu} // --- ADDED HANDLER ---
                style={{ cursor: hasChildren || onDoubleClick || onContextMenu ? 'pointer' : 'default' }}
            >
            {/* --- END MODIFICATION --- */}
                <span className="tree-toggle">
                    {hasChildren && (
                        <span className="material-icons">
                            {isExpanded ? 'indeterminate_check_box' : 'add_box'}
                        </span>
                    )}
                </span>
                <span className="material-icons tree-icon">{icon}</span>
                <span>{label}</span>
            </div>
            {hasChildren && isExpanded && (
                <ul className="tree-children">
                    {children}
                </ul>
            )}
        </li>
    );
};