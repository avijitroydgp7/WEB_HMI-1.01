// --- No change to imports ---
import React, { useState, useCallback, createContext, useMemo, useRef, useEffect } from "react";
import { Layout, Model, TabNode, Actions, DockLocation } from "flexlayout-react";
import type { HmiComponent, DockName, HmiBaseScreen, ScreenDesign } from "../types/hmi";

import { MenuBar } from "./MenuBar";
import { Toolbar } from "./Toolbar";
import { DrawingToolbar } from "./DrawingToolbar";
import { StatusBar } from "./StatusBar";
import { Canvas } from "./Canvas";

import { ProjectTreeDock } from "../docks/ProjectTreeDock";
import { ScreenTreeDock } from "../docks/ScreenTreeDock";
import { SystemTreeDock } from "../docks/SystemTreeDock";
import { PropertyTreeDock } from "../docks/PropertyTreeDock";
import { LibraryDock } from "../docks/LibraryDock";
import { ScreenImageListDock } from "../docks/ScreenImageListDock";
import { TagSearchDock } from "../docks/TagSearchDock";
import { DataBrowserDock } from "../docks/DataBrowserDock";
import { IPAddressDock } from "../docks/IPAddressDock";
import { ControllerListDock } from "../docks/ControllerListDock";
import { DataViewDock } from "../docks/DataViewDock";
import { ScreenDesignModal } from "../modals/ScreenDesignModal";
import { BaseScreenModal } from "../modals/BaseScreenModal"; 

// --- No change to DEFAULT_SCREEN_DESIGN ---
export const DEFAULT_SCREEN_DESIGN: ScreenDesign = {
  width: 1920,
  height: 1080,
  preset: 'dynamic',
  fillStyle: 'colour',
  colour: { color: '#3a3a3a', transparency: 0 },
  gradient: {
    color1: '#F0F0F0',
    color2: '#667788',
    transparency: 0,
    gradationType: 'horizontal',
    variation: 0,
  },
  pattern: {
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    transparency: 0,
    patternIndex: 0,
  },
  image: {
    url: null,
    transparency: 0,
  }
};

// --- No change to SharedState or Context ---
interface SharedState {
    components: HmiComponent[];
    setComponents: React.Dispatch<React.SetStateAction<HmiComponent[]>>;
    selectedComponent: HmiComponent | null;
    setSelectedComponentId: (id: string | null) => void;
    baseScreens: HmiBaseScreen[];
    setBaseScreens: React.Dispatch<React.SetStateAction<HmiBaseScreen[]>>;
    globalScreenDesign: ScreenDesign; 
    setGlobalScreenDesign: React.Dispatch<React.SetStateAction<ScreenDesign>>; 
}
export const SharedStateContext = createContext<SharedState | null>(null);

// --- No change to defaultLayout ---
const defaultLayout = {
    global: {},
    borders: [
        {
            type: "border",
            location: "left",
            size: 250,
            children: [
                { type: "tab", name: "Project Tree", component: "Project Tree", id: "Project Tree" },
                { type: "tab", name: "Screen Tree", component: "Screen Tree", id: "Screen Tree" },
                { type: "tab", name: "System Tree", component: "System Tree", id: "System Tree" }
            ]
        },
        {
            type: "border",
            location: "right",
            size: 250,
            children: [
                { type: "tab", name: "Property Tree", component: "Property Tree", id: "Property Tree" },
                { type: "tab", name: "Library", component: "Library", id: "Library" },
                { type: "tab", name: "Screen Image List", component: "Screen Image List", id: "Screen Image List" }
            ]
        },
        {
            type: "border",
            location: "bottom",
            size: 200,
            children: [
                { type: "tab", name: "Tag Search", component: "Tag Search", id: "Tag Search" },
                { type: "tab", name: "Data Browser", component: "Data Browser", id: "Data Browser" },
                { type: "tab", name: "IP Address", component: "IP Address", id: "IP Address" },
                { type: "tab", name: "Controller List", component: "Controller List", id: "Controller List" },
                { type: "tab", name: "Data View", component: "Data View", id: "Data View" }
            ]
        }
    ],
    layout: {
        type: "row",
        id: "root_row", 
        children: [
            {
                type: "tabset",
                id: "main_tabset", 
                children: [] 
            }
        ]
    }
};

export const App: React.FC = () => {
    const [components, setComponents] = useState<HmiComponent[]>([]);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [model] = useState(() => Model.fromJson(defaultLayout));
    
    const [isScreenDesignModalOpen, setIsScreenDesignModalOpen] = useState(false);
    const [isBaseScreenModalOpen, setIsBaseScreenModalOpen] = useState(false); 

    const [baseScreens, setBaseScreens] = useState<HmiBaseScreen[]>([]); 
    const [globalScreenDesign, setGlobalScreenDesign] = useState<ScreenDesign>(DEFAULT_SCREEN_DESIGN);

    // --- REMOVED THE REF. We will use a different strategy. ---

    // --- No change to handleOpenScreen ---
    const handleOpenScreen = useCallback((screenId: string, screenLabel: string) => {
        const node = model.getNodeById(screenId);
        if (node) {
            model.doAction(Actions.selectTab(screenId));
            return;
        }

        const newNode = {
            type: "tab",
            id: screenId,        
            name: screenLabel,   
            component: "canvas", 
        };

        const mainTabset = model.getNodeById("main_tabset");
        
        if (mainTabset) {
            model.doAction(Actions.addNode(
                newNode,
                "main_tabset",
                DockLocation.CENTER,
                -1 
            ));
        } else {
            model.doAction(Actions.addNode(
                {
                    type: "tabset",
                    id: "main_tabset", 
                    children: [newNode] 
                },
                "root_row", 
                DockLocation.CENTER,
                0
            ));
        }
    }, [model]);


    // --- MODIFICATION: The factory is now a simple function. ---
    // It will be re-created on *every* render, guaranteeing it
    // closes over the LATEST state of `baseScreens` and `globalScreenDesign`.
    const factory = (node: TabNode) => {
        const component = node.getComponent();
        const nodeId = node.getId(); 

        switch (component) {
            case "canvas": {
                // This `baseScreens` is guaranteed to be the latest
                const screen = baseScreens.find(s => s.id === nodeId);
                
                // This `globalScreenDesign` is also the latest
                let canvasDesign = globalScreenDesign; 
                
                if (screen && screen.individualDesign && screen.design) {
                    canvasDesign = screen.design;
                }
                
                return <Canvas setCoords={setCoords} design={canvasDesign} />;
            }
            case "Project Tree": return <ProjectTreeDock />;
            case "Screen Tree": 
                return (
                    <ScreenTreeDock 
                        onOpenScreenDesign={() => setIsScreenDesignModalOpen(true)} 
                        onOpenBaseScreenModal={() => setIsBaseScreenModalOpen(true)}
                        onOpenScreen={handleOpenScreen} 
                    />
                );
            case "System Tree": return <SystemTreeDock />;
            case "Property Tree": return <PropertyTreeDock />;
            case "Library": return <LibraryDock />;
            case "Screen Image List": return <ScreenImageListDock />;
            case "Tag Search": return <TagSearchDock />;
            case "Data Browser": return <DataBrowserDock />;
            case "IP Address": return <IPAddressDock />;
            case "Controller List": return <ControllerListDock />;
            case "Data View": return <DataViewDock />;
            default: return <div>Unknown component: {component}</div>;
        }
    };
    // --- END MODIFICATION ---

    // --- No change to getDockConfig ---
    const getDockConfig = useCallback((dockName: DockName): { id: string } => {
        const leftDocks: DockName[] = ["Project Tree", "Screen Tree", "System Tree"];
        const rightDocks: DockName[] = ["Property Tree", "Library", "Screen Image List"];
        const bottomDocks: DockName[] = ["Tag Search", "Data Browser", "IP Address", "Controller List", "Data View"];

        if (leftDocks.includes(dockName)) return { id: "border_left" };
        if (rightDocks.includes(dockName)) return { id: "border_right" };
        return { id: "border_bottom" };
    }, []);

    // --- No change to dockVisibility or onToggleDock ---
    const [dockVisibility, setDockVisibility] = useState<Record<DockName, boolean>>({
        "Project Tree": true,
        "Screen Tree": true,
        "System Tree": true,
        "Property Tree": true,
        "Library": true,
        "Screen Image List": true,
        "Tag Search": true,
        "Data Browser": true,
        "IP Address": true,
        "Controller List": true,
        "Data View": true,
    });

    const onToggleDock = useCallback((dockName: DockName) => {
        const isVisible = !dockVisibility[dockName];
        setDockVisibility(prev => ({ ...prev, [dockName]: isVisible }));

        if (isVisible) {
            const { id: borderId } = getDockConfig(dockName);
            model.doAction(Actions.addNode(
                { type: "tab", name: dockName, component: dockName, id: dockName },
                borderId,
                DockLocation.CENTER,
                0
            ));
        } else {
            model.doAction(Actions.deleteTab(dockName));
        }
    }, [dockVisibility, model, getDockConfig]);

    // --- No change to onAction ---
    const onAction = (action: any) => {
        if (action.type === Actions.DELETE_TAB) {
            const deletedTabId = action.data.node;
            if (Object.keys(dockVisibility).includes(deletedTabId)) {
                setDockVisibility(prev => ({ ...prev, [deletedTabId]: false }));
            }
        }
        return action;
    };


    // --- No change to sharedStateValue ---
    const sharedStateValue = useMemo(() => ({
        components,
        setComponents,
        selectedComponent: components.find(c => c.id === selectedComponentId) ?? null,
        setSelectedComponentId,
        baseScreens,
        setBaseScreens,
        globalScreenDesign, 
        setGlobalScreenDesign, 
    }), [components, selectedComponentId, baseScreens, globalScreenDesign]); 

    // --- No change to handleSaveBaseScreen ---
    const handleSaveBaseScreen = (newScreenData: Omit<HmiBaseScreen, 'id'>) => {
        const newScreen: HmiBaseScreen = {
            ...newScreenData,
            id: `screen_${Date.now()}`, 
        };
        
        setBaseScreens(prev => 
            [...prev, newScreen].sort((a, b) => a.screenNumber - b.screenNumber)
        );
        setIsBaseScreenModalOpen(false); 
    };

    // --- No change to handleSaveScreenDesign ---
    const handleSaveScreenDesign = (newDesign: ScreenDesign) => {
        setGlobalScreenDesign(newDesign);
        setIsScreenDesignModalOpen(false); 
    };

    return (
        <SharedStateContext.Provider value={sharedStateValue}>
            <div className="ide-container">
                <MenuBar 
                    model={model} 
                    onToggleDock={onToggleDock} 
                    dockVisibility={dockVisibility} 
                    onOpenScreenDesign={() => setIsScreenDesignModalOpen(true)} 
                />
                <Toolbar />
                <div className="ide-body">
                    <DrawingToolbar />
                    <div className="ide-main-content">
                        {/* --- MODIFICATION: Re-create factory on every render ---
                          This is the simplest way to bust the "stale closure"
                          cache and ensure the factory always has the latest state.
                        */}
                        <Layout 
                            model={model} 
                            factory={factory} 
                            onAction={onAction} 
                        />
                    </div>
                </div>
                <StatusBar coords={coords} />
                
                <ScreenDesignModal 
                    isOpen={isScreenDesignModalOpen}
                    onClose={() => setIsScreenDesignModalOpen(false)}
                    onSave={handleSaveScreenDesign}
                    initialDesign={globalScreenDesign}
                />
                
                <BaseScreenModal
                    isOpen={isBaseScreenModalOpen}
                    onClose={() => setIsBaseScreenModalOpen(false)}
                    onSave={handleSaveBaseScreen}
                    existingScreenNumbers={baseScreens.map(s => s.screenNumber)}
                />
            </div>
        </SharedStateContext.Provider>
    );
};