import React, { useState } from 'react';

interface TreeItemProps {
    label: string;
    icon: string;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
}

export const TreeItem: React.FC<TreeItemProps> = ({ label, icon, children, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const hasChildren = React.Children.count(children) > 0;

    const handleToggle = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <li className="tree-item">
            <div className="tree-node" onClick={handleToggle} style={{ cursor: hasChildren ? 'pointer' : 'default' }}>
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