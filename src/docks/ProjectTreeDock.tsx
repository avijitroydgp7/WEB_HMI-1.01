import React from 'react';

export const ProjectTreeDock: React.FC = () => {
    return (
        <div className="dock-item-content">
            <ul className="tree-view">
                <li className="tree-item"><span className="material-icons">folder_open</span> System</li>
                <li className="tree-item"><span className="material-icons">info</span> Project Information</li>
                <li className="tree-item"><span className="material-icons">label</span> Tag</li>
                <li className="tree-item"><span className="material-icons">comment</span> Comment</li>
                <li className="tree-item"><span className="material-icons">alarm</span> Alarm</li>
                <li className="tree-item"><span className="material-icons">description</span> Logging</li>
                <li className="tree-item"><span className="material-icons">receipt</span> Recipe</li>
                <li className="tree-item"><span className="material-icons">code</span> Script</li>
                <li className="tree-item"><span className="material-icons">sync</span> Device Data Transfer</li>
                <li className="tree-item"><span className="material-icons">flash_on</span> Trigger Action</li>
                <li className="tree-item"><span className="material-icons">schedule</span> Time Action</li>
                <li className="tree-item"><span className="material-icons">image</span> Image</li>
                <li className="tree-item"><span className="material-icons">movie</span> Animation</li>
            </ul>
        </div>
    );
};
