import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Polaroids from './Polaroids';
import { TreeState } from '../types';

interface SceneProps {
  treeState: TreeState;
  targetCameraPos: { x: number; y: number };
}

const CameraRig: React.FC<{ targetPos: { x: number; y: number } }> = ({ targetPos }) => {
  const vec = new THREE.Vector3();
  
  useFrame((state) => {
    // Smoothly interpolate camera position based on hand tracking
    // Base position: [0, 4, 20]
    // Hand X (-1 to 1) -> moves camera X (-10 to 10)
    // Hand Y (-1 to 1) -> moves camera Y (0 to 10)
    
    const targetX = targetPos.x * 10;
    const targetY = 4 + (targetPos.y * 5);
    
    state.camera.position.lerp(vec.set(targetX, targetY, 20), 0.05);
    state.camera.lookAt(0, 4, 0);
  });
  
  return null;
}

const Scene: React.FC<SceneProps> = ({ treeState, targetCameraPos }) => {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
      <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
      <CameraRig targetPos={targetCameraPos} />

      <Environment preset="lobby" background={false} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} color="#ffddaa" castShadow />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ff00" distance={20} />
      
      {/* The Tree Components */}
      <group position={[0, -5, 0]}>
        <Foliage treeState={treeState} />
        <Ornaments treeState={treeState} />
        <Polaroids treeState={treeState} />
      </group>

      {/* Floor reflection for luxury feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#001100" 
          roughness={0.05} 
          metalness={0.8} 
        />
      </mesh>

      {/* Post Processing for Cinematic Bloom */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;
