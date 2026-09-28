"use client";
import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Edges } from "@react-three/drei";

const FRAMES: { pos: [number, number, number]; rot: [number, number, number]; color: string; size: [number, number] }[] = [
  { pos: [0, 0.1, 0], rot: [0.05, -0.25, 0], color: "#3654ff", size: [2.6, 1.6] },
  { pos: [-2.1, 0.9, -1.2], rot: [0, 0.35, 0.05], color: "#f2542d", size: [1.7, 1.05] },
  { pos: [2.2, -0.8, -0.8], rot: [0, -0.4, -0.05], color: "#8b5cf6", size: [1.8, 1.1] },
  { pos: [1.6, 1.3, -2], rot: [0, -0.2, 0.08], color: "#0ea5b7", size: [1.3, 0.8] },
  { pos: [-1.7, -1.2, -1.8], rot: [0, 0.3, -0.06], color: "#d4af37", size: [1.4, 0.85] },
];

function Frame({ pos, rot, color, size }: (typeof FRAMES)[number]) {
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.9} position={pos} rotation={rot}>
      <RoundedBox args={[size[0], size[1], 0.08]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.35} />
        <Edges color="#f2f0ea" threshold={15} />
      </RoundedBox>
      <mesh position={[0, 0, 0.06]}>
        <ringGeometry args={[0.16, 0.2, 40]} />
        <meshBasicMaterial color="#f2f0ea" />
      </mesh>
    </Float>
  );
}

function Particles({ count = 140 }: { count?: number }) {
  const ref = React.useRef<THREE.Points>(null);
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#f2f0ea" transparent opacity={0.6} />
    </points>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = React.useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.25, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.12, 0.05);
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} aria-hidden>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight position={[-4, -2, 2]} intensity={12} color="#f2542d" />
      <Rig>
        {FRAMES.map((f, i) => <Frame key={i} {...f} />)}
        <Particles />
      </Rig>
    </Canvas>
  );
}
