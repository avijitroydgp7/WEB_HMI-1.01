import React, { useState } from 'react';

// --- ADDED PROPS INTERFACE ---
interface ScreenMenuProps {
    onOpenScreenDesign: () => void;
}

const SubMenu: React.FC<{ items: { icon: string, name: string }[] }> = ({ items }) => (
    <div className="menu-dropdown submenu-dropdown">
        {items.map((item, index) => (
            <div key={index} className="menu-item">
                <span className="material-icons">{item.icon}</span>
                <span>{item.name}</span>
            </div>
        ))}
    </div>
);

// --- MODIFIED COMPONENT SIGNATURE ---
export const ScreenMenu: React.FC<ScreenMenuProps> = ({ onOpenScreenDesign }) => {
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

    const menuItems: any[] = [ // Changed to any[] to allow for 'action' and 'separator'
        {
            icon: 'post_add', name: 'New Screen', subMenu: 'newScreen',
            items: [
                { icon: 'space_dashboard', name: 'Base Screen' },
                { icon: 'open_in_new', name: 'Window Screen' },
                { icon: 'view_quilt', name: 'Template Screen' },
                { icon: 'widgets', name: 'Widgets' },
            ]
        },
        { icon: 'folder_open', name: 'Open Screen', action: () => {} /* Placeholder */ },
        { icon: 'close', name: 'Close Screen', action: () => {} /* Placeholder */ },
        { icon: 'clear_all', name: 'Close All Screens', action: () => {} /* Placeholder */ },
        { separator: true },
        // --- ADDED ACTION ---
        { icon: 'design_services', name: 'Screen Design', action: onOpenScreenDesign },
        { icon: 'tune', name: 'Screen Property', action: () => {} /* Placeholder */ },
    ];

    // --- ADDED RENDER FUNCTION (Similar to ViewMenu.tsx) ---
    const renderMenuItem = (item: any, index: number) => {
        if (item.separator) {
            return <div key={index} className="menu-separator"></div>;
        }
        
        const hasSubMenu = item.subMenu && item.items;

        return (
            <div
                key={index}
                className={`menu-item ${hasSubMenu ? 'menu-item-submenu' : ''}`}
                // --- ADDED ONCLICK HANDLER (with stopPropagation) ---
                onClick={item.action ? (e) => { e.stopPropagation(); item.action(); } : undefined}
                onMouseEnter={() => hasSubMenu && setActiveSubMenu(item.subMenu!)}
            >
                <span className="material-icons">{item.icon}</span>
                <span>{item.name}</span>
                {/* --- Reused existing SubMenu component --- */}
                {hasSubMenu && activeSubMenu === item.subMenu && <SubMenu items={item.items!} />}
            </div>
        );
    }

    return (
        <div className="menu-dropdown" onMouseLeave={() => setActiveSubMenu(null)} onClick={(e) => e.stopPropagation()}>
            {/* --- MODIFIED TO USE RENDER FUNCTION --- */}
            {menuItems.map(renderMenuItem)}
        </div>
    );
};