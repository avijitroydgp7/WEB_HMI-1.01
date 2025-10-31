
import React, { useState, useContext } from 'react';
import type { DockName, DockVisibility, ZoomControls } from '../types/hmi';
import type { Model } from 'flexlayout-react';
import { SharedStateContext } from '../components/App';

interface ViewMenuProps {
    model: Model;
    onToggleDock: (dockName: DockName) => void;
    dockVisibility: DockVisibility;
}

const CheckableItem: React.FC<{
    name: string;
    checked: boolean;
    onClick: () => void;
    icon?: string;
}> = ({ name, checked, onClick, icon }) => (
    <div className="menu-item" onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon && <span className="material-icons" style={{ marginRight: '10px' }}>{icon}</span>}
            <span>{name}</span>
        </div>
        <span className="material-icons check-icon">
            {checked ? 'check_box' : 'check_box_outline_blank'}
        </span>
    </div>
);

export const ViewMenu: React.FC<ViewMenuProps> = ({ model, onToggleDock, dockVisibility }) => {
    const context = useContext(SharedStateContext);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const [stateOnOff, setStateOnOff] = useState(false);
    const [objectSnap, setObjectSnap] = useState(false);
    const [toolbarVisibility, setToolbarVisibility] = useState({
        "Window Display": true,
        "View": true,
        "Screen": true,
        "Edit": true,
        "Alignment": true,
        "Figure": true,
        "Object": true,
        "Debug": true,
    });

    // Get active screen ID from model
    const activeTab = model.getActiveTabset()?.getSelectedNode();
    const activeScreenId = activeTab?.getId() || null;
    const zoomControls = activeScreenId && context?.screenZoomControls[activeScreenId];

    const handleDockToggle = (dockName: DockName) => {
        onToggleDock(dockName);
    };

    const handleToolbarToggle = (name: string) => {
        setToolbarVisibility(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const dockingItems: DockName[] = [
        "Project Tree", "Screen Tree", "System Tree", "Tag Search", "Data Browser",
        "Property Tree", "IP Address", "Library", "Controller List", "Data View", "Screen Image List"
    ];



    const menuItems = [
        { name: "Preview", icon: "visibility" },
        {
            name: "Zoom", icon: "zoom_in", subMenu: 'zoom', items: [
                { name: "Zoom In", icon: "zoom_in", action: () => zoomControls?.zoomIn() },
                { name: "Zoom Out", icon: "zoom_out", action: () => zoomControls?.zoomOut() },
                { name: "Reset Transform", icon: "center_focus_strong", action: () => zoomControls?.resetTransform() },
            ]
        },
        {
            name: "State No.", icon: "format_list_numbered", subMenu: 'state', items: [
                { name: "State On/Off", icon: "power_settings_new", checkbox: true, checked: stateOnOff, action: () => setStateOnOff(!stateOnOff) },
                { name: "Next State", icon: "skip_next" },
                { name: "Previous State", icon: "skip_previous" },
            ]
        },
        {
            name: "Tool Bar", icon: "build", subMenu: 'toolbar', items: Object.keys(toolbarVisibility).map(name => ({
                name,
                icon: name === "Window Display" ? "web" :
                      name === "View" ? "visibility" :
                      name === "Screen" ? "tv" :
                      name === "Edit" ? "edit" :
                      name === "Alignment" ? "format_align_center" :
                      name === "Figure" ? "category" :
                      name === "Object" ? "widgets" :
                      name === "Debug" ? "bug_report" : "build",
                checkbox: true,
                checked: toolbarVisibility[name as keyof typeof toolbarVisibility],
                action: () => handleToolbarToggle(name)
            }))
        },
        {
            name: "Docking Window", icon: "picture_in_picture", subMenu: 'docking', items: dockingItems.map(name => ({
                name,
                icon: name === "Project Tree" ? "account_tree" :
                      name === "Screen Tree" ? "tv" :
                      name === "System Tree" ? "device_hub" :
                      name === "Tag Search" ? "search" :
                      name === "Data Browser" ? "table_chart" :
                      name === "Property Tree" ? "settings" :
                      name === "IP Address" ? "router" :
                      name === "Library" ? "library_books" :
                      name === "Controller List" ? "list" :
                      name === "Data View" ? "view_list" :
                      name === "Screen Image List" ? "image" : "picture_in_picture",
                checkbox: true,
                checked: dockVisibility[name as DockName] || false,
                action: () => handleDockToggle(name as DockName)
            }))
        },
        {
            name: "Display Item", icon: "visibility", subMenu: 'display', items: [
                { name: "Tag", icon: "local_offer" },
                { name: "Object ID", icon: "fingerprint" },
                { name: "Transform Line", icon: "timeline" },
                { name: "Click Area", icon: "mouse" },
            ]
        },
        { name: "Object Snap", icon: "center_focus_strong", checkbox: true, checked: objectSnap, action: () => setObjectSnap(!objectSnap) },
    ];

    const renderMenuItem = (item: any, index: number) => {
        if (item.separator) return <div key={index} className="menu-separator"></div>;

        const hasSubMenu = item.subMenu && item.items;

        if (item.checkbox) {
            return (
                <CheckableItem
                    key={item.name}
                    name={item.name}
                    checked={item.checked}
                    onClick={item.action}
                    icon={item.icon}
                />
            )
        }

        return (
            <div key={index}
                className={`menu-item ${hasSubMenu ? 'menu-item-submenu' : ''}`}
                onMouseEnter={() => hasSubMenu && setActiveSubMenu(item.subMenu!)}
            >
                {item.icon && <span className="material-icons" style={{ marginRight: '10px' }}>{item.icon}</span>}
                <span>{item.name}</span>
                {hasSubMenu && activeSubMenu === item.subMenu && (
                    <div className="menu-dropdown submenu-dropdown">
                        {item.items.map(renderMenuItem)}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="menu-dropdown" onMouseLeave={() => setActiveSubMenu(null)} onClick={(e) => e.stopPropagation()}>
            {menuItems.map(renderMenuItem)}
        </div>
    );
};
