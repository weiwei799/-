import * as THREE from 'three';

export const COLORS = {
  EMERALD: new THREE.Color('#004225'),
  GOLD: new THREE.Color('#D4AF37'),
  SILVER: new THREE.Color('#C0C0C0'),
  RED: new THREE.Color('#8B0000'),
  WARM_LIGHT: new THREE.Color('#FFD700'),
};

export const CONFIG = {
  FOLIAGE_COUNT: 15000,
  ORNAMENT_COUNT: 300,
  POLAROID_COUNT: 20,
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5,
};

// Vertex Shader for Particles (Lerps between Chaos and Formed)
export const FOLIAGE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress; // 0.0 (Chaos) -> 1.0 (Formed)
  
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aSize;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Cubic easing for smoother transition
    float t = uProgress;
    float ease = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;

    vec3 pos = mix(aChaosPos, aTargetPos, ease);
    
    // Add some wind/sparkle movement
    pos.x += sin(uTime * 2.0 + pos.y) * 0.1 * (1.0 - ease);
    pos.y += cos(uTime * 1.5 + pos.x) * 0.1 * (1.0 - ease);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Color logic: Shift from chaotic white/gold to emerald green
    vec3 chaosColor = vec3(1.0, 0.8, 0.4); // Goldish
    vec3 formedColor = vec3(0.0, 0.5, 0.1); // Emerald
    
    // Mix based on height for gradient effect in formed state
    float heightFactor = (pos.y + 5.0) / 15.0; 
    vec3 gradientGreen = mix(vec3(0.0, 0.2, 0.05), vec3(0.0, 0.8, 0.3), heightFactor);

    vColor = mix(chaosColor, gradientGreen, ease);
    vAlpha = 0.8 + 0.2 * sin(uTime * 5.0 + pos.x);
  }
`;

export const FOLIAGE_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft glow edge
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;
