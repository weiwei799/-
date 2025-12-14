import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { TreeState } from '../types';

interface OrnamentsProps {
  treeState: TreeState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Store current positions to allow for per-instance lerping
  const currentPositions = useRef<Float32Array>(new Float32Array(CONFIG.ORNAMENT_COUNT * 3));
  const tempObject = new THREE.Object3D();
  const tempColor = new THREE.Color();

  const { chaosPositions, targetPositions, colors, scales, speeds } = useMemo(() => {
    const cPos = new Float32Array(CONFIG.ORNAMENT_COUNT * 3);
    const tPos = new Float32Array(CONFIG.ORNAMENT_COUNT * 3);
    const cols = new Float32Array(CONFIG.ORNAMENT_COUNT * 3);
    const scls = new Float32Array(CONFIG.ORNAMENT_COUNT);
    const spds = new Float32Array(CONFIG.ORNAMENT_COUNT); // Different weights

    const palette = [COLORS.GOLD, COLORS.RED, COLORS.SILVER, COLORS.WARM_LIGHT];

    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const i3 = i * 3;
      
      // Chaos
      const r = 25 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      cPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      cPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      cPos[i3 + 2] = r * Math.cos(phi);

      // Target (Surface of cone)
      const y = (Math.random() * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const normalizedY = (y + (CONFIG.TREE_HEIGHT / 2)) / CONFIG.TREE_HEIGHT;
      const coneRadius = CONFIG.TREE_RADIUS * (1.0 - normalizedY);
      const angle = Math.random() * 2 * Math.PI;
      
      tPos[i3] = coneRadius * Math.cos(angle);
      tPos[i3 + 1] = y + 2;
      tPos[i3 + 2] = coneRadius * Math.sin(angle);

      // Attributes
      const color = palette[Math.floor(Math.random() * palette.length)];
      tempColor.set(color);
      cols[i3] = tempColor.r;
      cols[i3 + 1] = tempColor.g;
      cols[i3 + 2] = tempColor.b;

      scls[i] = Math.random() * 0.3 + 0.1;
      spds[i] = Math.random() * 1.5 + 1.0; // Random speed multiplier
    }

    return { chaosPositions: cPos, targetPositions: tPos, colors: cols, scales: scls, speeds: spds };
  }, []);

  // Initialize current positions to chaos
  useLayoutEffect(() => {
     currentPositions.current.set(chaosPositions);
  }, [chaosPositions]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const isFormed = treeState === TreeState.FORMED;

    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const i3 = i * 3;
      const speed = speeds[i] * 2.0;
      
      const targetX = isFormed ? targetPositions[i3] : chaosPositions[i3];
      const targetY = isFormed ? targetPositions[i3 + 1] : chaosPositions[i3 + 1];
      const targetZ = isFormed ? targetPositions[i3 + 2] : chaosPositions[i3 + 2];

      // Lerp current towards target
      currentPositions.current[i3] = THREE.MathUtils.lerp(currentPositions.current[i3], targetX, delta * speed);
      currentPositions.current[i3+1] = THREE.MathUtils.lerp(currentPositions.current[i3+1], targetY, delta * speed);
      currentPositions.current[i3+2] = THREE.MathUtils.lerp(currentPositions.current[i3+2], targetZ, delta * speed);

      // Update Instance
      tempObject.position.set(
        currentPositions.current[i3],
        currentPositions.current[i3+1],
        currentPositions.current[i3+2]
      );
      tempObject.scale.setScalar(scales[i]);
      // Slight rotation for glitter
      tempObject.rotation.y += delta * 0.5 * speeds[i];
      tempObject.updateMatrix();
      
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(colors[i3], colors[i3+1], colors[i3+2]));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        roughness={0.1} 
        metalness={0.9} 
        envMapIntensity={2.0}
      />
    </instancedMesh>
  );
};

export default Ornaments;
