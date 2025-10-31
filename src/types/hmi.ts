// src/types/hmi.ts

// --- NEW TYPES ---
export type FillStyle = 'colour' | 'gradient' | 'pattern' | 'image';
export type GradationType = 'horizontal' | 'vertical' | 'upDiagonal' | 'downDiagonal';
export type ScreenSizePreset = 'dynamic' | 'custom' | string; // string for "width,height"

export interface GradientSettings {
  color1: string;
  color2: string;
  transparency: number;
  gradationType: GradationType;
  variation: number;
}

export interface PatternSettings {
  foregroundColor: string;
  backgroundColor: string;
  transparency: number;
  patternIndex: number;
}

export interface ImageSettings {
  url: string | null;
  transparency: number;
}

export interface ScreenDesign {
  width: number;
  height: number;
  preset: ScreenSizePreset;
  fillStyle: FillStyle;
  
  // Fill settings
  colour: { color: string, transparency: number };
  gradient: GradientSettings;
  pattern: PatternSettings;
  image: ImageSettings;
}

// --- MODIFIED HmiBaseScreen ---
export interface HmiBaseScreen {
  id: string; // Unique ID (e.g., from Date.now())
  screenNumber: number;
  screenName: string;
  description: string;
  security: number;
  individualDesign: boolean;
  design?: ScreenDesign; // Optional individual design
  components: HmiComponent[]; // <-- MODIFICATION: Components are now part of the screen
}
// --- END MODIFICATION ---

export type HmiComponentType = 'button' | 'label' | 'indicator';

interface HmiComponentBase {
  id: string;
  type: HmiComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HmiButtonComponent extends HmiComponentBase {
  type: 'button';
  text: string;
}

export interface HmiLabelComponent extends HmiComponentBase {
  type: 'label';
  text: string;
  fontSize: number;
}

export interface HmiIndicatorComponent extends HmiComponentBase {
  type: 'indicator';
  color: string;
}

export type HmiComponent = HmiButtonComponent | HmiLabelComponent | HmiIndicatorComponent;

// --- Docking System Types ---
export type DockName =
  | 'Project Tree'
  | 'Screen Tree'
  | 'System Tree'
  | 'Property Tree'
  | 'Library'
  | 'Screen Image List'
  | 'Tag Search'
  | 'Data Browser'
  | 'IP Address'
  | 'Controller List'
  | 'Data View';

export type DockVisibility = Record<DockName, boolean>;

// --- Zoom Controls Types ---
export interface ZoomControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
}

export type ScreenZoomControls = Record<string, ZoomControls>;


// --- MODIFIED SharedState ---
export interface SharedState {
    // REMOVED: Global components state
    // components: HmiComponent[];
    // setComponents: React.Dispatch<React.SetStateAction<HmiComponent[]>>;
    
    // MODIFIED: Selected component now includes which screen it's on
    selectedComponent: { screenId: string; component: HmiComponent; } | null;
    setSelectedComponentId: (id: string | null, screenId: string | null) => void;
    
    baseScreens: HmiBaseScreen[];
    setBaseScreens: React.Dispatch<React.SetStateAction<HmiBaseScreen[]>>;
    
    // ADDED: Function to update a single screen
    updateBaseScreen: (screenId: string, updatedScreen: HmiBaseScreen) => void;
    
    // ADDED: Tracks the currently focused canvas tab
    activeScreenId: string | null;

    globalScreenDesign: ScreenDesign;
    setGlobalScreenDesign: React.Dispatch<React.SetStateAction<ScreenDesign>>;
    screenZoomControls: ScreenZoomControls;
    setScreenZoomControls: React.Dispatch<React.SetStateAction<ScreenZoomControls>>;
}
// --- END MODIFICATION ---