import React, { useState, useCallback, createContext, useMemo, useRef, useEffect } from "react";
import { Layout, Model, TabNode, Actions, DockLocation, IJsonModel } from "flexlayout-react";
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

const defaultScreen: HmiBaseScreen = {
    id: "default_screen",
    screenNumber: 1,
    screenName: "Screen",
    description: "Default Screen",
    security: 0,
    individualDesign: false,
};


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


const defaultLayout: IJsonModel = {
    global: {},
    borders: [
        {
            type: "border",
            location: "left" as const,
            size: 250,
            children: [
                { type: "tab", name: "Project Tree", component: "Project Tree", id: "Project Tree" },
                { type: "tab", name: "Screen Tree", component: "Screen Tree", id: "Screen Tree" },
                { type: "tab", name: "System Tree", component: "System Tree", id: "System Tree" }
            ]
        },
        {
            type: "border",
            location: "right" as const,
            size: 250,
            children: [
                { type: "tab", name: "Property Tree", component: "Property Tree", id: "Property Tree" },
                { type: "tab", name: "Library", component: "Library", id: "Library" },
                { type: "tab", name: "Screen Image List", component: "Screen Image List", id: "Screen Image List" }
            ]
        },
        {
            type: "border",
            location: "bottom" as const,
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
        type: "row" as const,
        id: "root_row",
        children: [
            {
                type: "tabset" as const,
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

    const [baseScreens, setBaseScreens] = useState<HmiBaseScreen[]>([defaultScreen]);
    const [globalScreenDesign, setGlobalScreenDesign] = useState<ScreenDesign>(DEFAULT_SCREEN_DESIGN);
    const [modelVersion, setModelVersion] = useState(0);


    const baseScreensRef = useRef(baseScreens);
    const globalScreenDesignRef = useRef(globalScreenDesign);

    useEffect(() => {
        baseScreensRef.current = baseScreens;
    }, [baseScreens]);

    useEffect(() => {
        globalScreenDesignRef.current = globalScreenDesign;
    }, [globalScreenDesign]);

    const handleOpenScreen = (screenId: string, screenLabel: string) => {
        console.log(`Attempting to open screen: ${screenLabel} (${screenId})`);
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
            model.doAction(Actions.updateModelAttributes({
                layout: {
                    type: "row",
                    id: "root_row",
                    children: [
                        {
                            type: "tabset",
                            id: "main_tabset",
                            children: [newNode]
                        }
                    ]
                }
            }));
        }

        model.doAction(Actions.selectTab(screenId));
        setModelVersion(prev => prev + 1); 
    };


    const factory = useCallback((node: TabNode) => {
        console.log(`Factory called for component: ${node.getComponent()}`);
        const component = node.getComponent();
        const nodeId = node.getId();

        switch (component) {
            case "canvas": {
                const screen = baseScreensRef.current.find(s => s.id === nodeId);
                let canvasDesign = globalScreenDesignRef.current;
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
    }, [setCoords, setIsScreenDesignModalOpen, setIsBaseScreenModalOpen, handleOpenScreen]);



    const getDockConfig = useCallback((dockName: DockName): { id: string } => {
        const leftDocks: DockName[] = ["Project Tree", "Screen Tree", "System Tree"];
        const rightDocks: DockName[] = ["Property Tree", "Library", "Screen Image List"];
        const bottomDocks: DockName[] = ["Tag Search", "Data Browser", "IP Address", "Controller List", "Data View"];

        if (leftDocks.includes(dockName)) return { id: "border_left" };
        if (rightDocks.includes(dockName)) return { id: "border_right" };
        return { id: "border_bottom" };
    }, []);


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


    const onAction = useCallback((action: any) => {
        if (action.type === Actions.DELETE_TAB) {
            const deletedTabId = action.data.node;
            if (Object.keys(dockVisibility).includes(deletedTabId)) {
                setDockVisibility(prev => ({ ...prev, [deletedTabId]: false }));
            } else {

                setTimeout(() => {
                    const mainTabset = model.getNodeById("main_tabset");
                    if (!mainTabset) {
                        model.doAction(Actions.updateModelAttributes({
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
                        }));
                    }
                }, 0);
            }
        }
        setModelVersion(prev => prev + 1);
        return action;
    }, [dockVisibility, model]);



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


    const handleSaveBaseScreen = (newScreenData: Omit<HmiBaseScreen, 'id'>) => {
        const newScreen: HmiBaseScreen = {
            ...newScreenData,
            id: `screen_${Date.now()}`,
        };

        setBaseScreens(prev =>
            [...prev, newScreen].sort((a, b) => a.screenNumber - b.screenNumber)
        );
        setIsBaseScreenModalOpen(false);
        handleOpenScreen(newScreen.id, newScreen.screenName);
    };


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
                    onOpenBaseScreenModal={() => setIsBaseScreenModalOpen(true)}
                />
                <Toolbar />
                <div className="ide-body">
                    <DrawingToolbar />
                    <div className="ide-main-content">
                        <div key={modelVersion}>
                            <Layout
                                model={model}
                                factory={factory}
                                onAction={onAction}
                            />
                        </div>
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
