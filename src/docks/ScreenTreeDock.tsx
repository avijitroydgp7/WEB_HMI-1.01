import React from 'react';

export const ScreenTreeDock: React.FC = () => {
    return (
        <div className="dock-item-content">
            <ul className="tree-view">
                <li className="tree-item">
                    <span className="material-icons">folder</span>
                    <span>Screen Design</span>
                </li>
                <li className="tree-item">
                    <span className="material-icons">folder_open</span>
                    <span>Screens</span>
                    <ul className="tree-view">
                        <li className="tree-item"><span className="material-icons">web</span> Base Screens</li>
                        <li className="tree-item"><span className="material-icons">window</span> Window Screens</li>
                        <li className="tree-item"><span className="material-icons">description</span> Template</li>
                        <li className="tree-item"><span className="material-icons">tv</span> Screens</li>
                        <li className="tree-item"><span className="material-icons">widgets</span> Widgets</li>
                    </ul>
                </li>
            </ul>
        </div>
    );
};
