import React, { useState, useEffect, useRef } from 'react';
import type { Model } from 'flexlayout-react';
import { FileMenu } from '../menus/FileMenu';
import { EditMenu } from '../menus/EditMenu';
import { ViewMenu } from '../menus/ViewMenu';
import { CommonMenu } from '../menus/CommonMenu';
import { ObjectMenu } from '../menus/ObjectMenu';
import { FigureMenu } from '../menus/FigureMenu';
import { ScreenMenu } from '../menus/ScreenMenu';
import { SearchReplaceMenu } from '../menus/SearchReplaceMenu';
// Fix: Removed unused DockVisibility type.
import type { DockName, DockVisibility } from '../types/hmi';

interface MenuBarProps {
    model: Model;
    onToggleDock: (dockName: DockName) => void;
    dockVisibility: DockVisibility;
    onOpenScreenDesign: () => void; // --- ADDED PROP ---
    onOpenBaseScreenModal: () => void;
}

// --- MODIFIED PROPS ---
export const MenuBar: React.FC<MenuBarProps> = ({ model, onToggleDock, dockVisibility, onOpenScreenDesign, onOpenBaseScreenModal }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        { name: 'File', component: <FileMenu /> },
        { name: 'Edit', component: <EditMenu /> },
        { name: 'Search/Replace', component: <SearchReplaceMenu /> },
        { name: 'View', component: <ViewMenu model={model} onToggleDock={onToggleDock} dockVisibility={dockVisibility} /> },
        // --- MODIFIED HERE ---
        { name: 'Screen', component: <ScreenMenu onOpenScreenDesign={onOpenScreenDesign} onOpenBaseScreenModal={onOpenBaseScreenModal} /> },
        // --- END MODIFICATION ---
        { name: 'Common', component: <CommonMenu /> },
        { name: 'Figure', component: <FigureMenu /> },
        { name: 'Object', component: <ObjectMenu /> },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menuName: string) => {
        setActiveMenu(activeMenu === menuName ? null : menuName);
    };
    
    return (
        <div className="menu-bar" ref={menuRef}>
            {menuItems.map(item => (
                <div key={item.name} className="menu-bar-item" onClick={() => handleMenuClick(item.name)}>
                    {item.name}
                    {activeMenu === item.name && item.component}
                </div>
            ))}
        </div>
    );
};