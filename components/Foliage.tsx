import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, FOLIAGE_VERTEX_SHADER, FOLIAGE_FRAGMENT_SHADER } from '../constants';
import { TreeState } from '../types';

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const progressRef = useRef(0); // 0 = Chaos, 1 = Formed

  // Generate Geometry Data
  const { positionsChaos, positionsTarget, sizes } = useMemo(() => {
    const pChaos = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const pTarget = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const s = new Float32Array(CONFIG.FOLIAGE_COUNT);

    for (let i = 0; i < CONFIG.FOLIAGE_COUNT; i++) {
      const i3 = i * 3;

      // 1. Chaos Position: Random Sphere
      const r = 20 * Math.cbrt(Math.random()); // Even distribution in sphere
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pChaos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pChaos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pChaos[i3 + 2] = r * Math.cos(phi);

      // 2. Target Position: Cone
      // Height y goes from -7 to +7 (approx)
      const y = (Math.random() * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2); // -7 to 7
      const normalizedY = (y + (CONFIG.TREE_HEIGHT / 2)) / CONFIG.TREE_HEIGHT; // 0 to 1
      const coneRadiusAtY = CONFIG.TREE_RADIUS * (1.0 - normalizedY);
      
      // Add some noise to radius for fluffiness
      const rCone = Math.sqrt(Math.random()) * coneRadiusAtY;
      const angle = Math.random() * 2 * Math.PI;

      pTarget[i3] = rCone * Math.cos(angle);
      pTarget[i3 + 1] = y + 2; // Lift tree up a bit
      pTarget[i3 + 2] = rCone * Math.sin(angle);

      // 3. Size
      s[i] = Math.random() * 0.5 + 0.5;
    }

    return { positionsChaos: pChaos, positionsTarget: pTarget, sizes: s };
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    // Smooth transition logic
    const targetProgress = treeState === TreeState.FORMED ? 1.0 : 0.0;
    // Slower transition for "Majestic" feel
    const speed = 2.0; 
    
    if (Math.abs(progressRef.current - targetProgress) > 0.001) {
       const diff = targetProgress - progressRef.current;
       progressRef.current += Math.sign(diff) * Math.min(Math.abs(diff), delta * speed);
    }
    
    materialRef.current.uniforms.uProgress.value = progressRef.current;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-aChaosPos"
          args={[positionsChaos, 3]}
          count={positionsChaos.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          args={[positionsTarget, 3]}
          count={positionsTarget.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-position" // Dummy position required by Three, shader uses others
          args={[positionsTarget, 3]} 
          count={positionsTarget.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
          count={sizes.length}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={FOLIAGE_VERTEX_SHADER}
        fragmentShader={FOLIAGE_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
        }}
      />
    </points>
  );
};

export default Foliage;
