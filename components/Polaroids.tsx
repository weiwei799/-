import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CONFIG } from '../constants';
import { TreeState } from '../types';

interface PolaroidsProps {
  treeState: TreeState;
}

const Polaroid: React.FC<{ position: THREE.Vector3, textureUrl: string, rotation: THREE.Euler, scale: number }> = ({ position, textureUrl, rotation, scale }) => {
  const texture = useTexture(textureUrl);
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
        {/* Paper Background */}
        <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1, 1.2]} />
            <meshStandardMaterial color="#fffbeb" roughness={0.8} />
        </mesh>
        {/* Photo Image */}
        <mesh position={[0, 0.1, 0]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial map={texture} />
        </mesh>
    </group>
  );
}

const Polaroids: React.FC<PolaroidsProps> = ({ treeState }) => {
    // Generate static data once
    const items = useMemo(() => {
        const arr = [];
        for(let i=0; i<CONFIG.POLAROID_COUNT; i++) {
             // Position on tree surface
             const y = (Math.random() * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2); 
             const normalizedY = (y + (CONFIG.TREE_HEIGHT / 2)) / CONFIG.TREE_HEIGHT;
             const r = (CONFIG.TREE_RADIUS * (1.0 - normalizedY)) + 0.5; // Slightly outside
             const theta = Math.random() * Math.PI * 2;
             
             const targetPos = new THREE.Vector3(
                 r * Math.cos(theta),
                 y + 2,
                 r * Math.sin(theta)
             );

             // Look at center but tilted
             const rot = new THREE.Euler(0, -theta + Math.PI/2, Math.random() * 0.5 - 0.25);
             
             // Chaos position
             const chaosPos = new THREE.Vector3(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 10
             );

             arr.push({ 
                 id: i, 
                 targetPos, 
                 chaosPos,
                 rotation: rot, 
                 url: `https://picsum.photos/200/200?random=${i}` 
             });
        }
        return arr;
    }, []);

    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if(!groupRef.current) return;
        const isFormed = treeState === 'FORMED';
        
        items.forEach((item, i) => {
            const child = groupRef.current?.children[i];
            if(child) {
                const dest = isFormed ? item.targetPos : item.chaosPos;
                child.position.lerp(dest, delta * 1.5);
                
                // Add gentle floating
                child.position.y += Math.sin(state.clock.elapsedTime + i) * 0.002;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {items.map((item) => (
                <Polaroid 
                    key={item.id} 
                    position={item.chaosPos} // Start at chaos
                    rotation={item.rotation}
                    scale={1.5}
                    textureUrl={item.url} 
                />
            ))}
        </group>
    );
};

export default Polaroids;