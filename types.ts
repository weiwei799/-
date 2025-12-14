export interface HandGestureResponse {
  gesture: 'OPEN' | 'CLOSED' | 'NONE';
  handPosition: {
    x: number; // -1 (left) to 1 (right)
    y: number; // -1 (bottom) to 1 (top)
  };
}

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface TreeContextType {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
  targetCameraPos: { x: number; y: number };
  setTargetCameraPos: (pos: { x: number; y: number }) => void;
}

export interface DualPosAttribute {
  chaos: Float32Array;
  target: Float32Array;
}
