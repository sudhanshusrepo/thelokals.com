import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

// Simple Service Icon Placeholder (Box)
const ServiceIcon1 = (props: any) => {
    const meshRef = useRef<any>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#0d9488" roughness={0.3} metalness={0.8} />
        </mesh>
    );
};

// Simple Service Icon Placeholder (Torus)
const ServiceIcon2 = (props: any) => {
    const meshRef = useRef<any>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <mesh ref={meshRef} {...props}>
            <torusGeometry args={[0.6, 0.2, 16, 32]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
        </mesh>
    );
};

// Simple Service Icon Placeholder (Octahedron)
const ServiceIcon3 = (props: any) => {
    const meshRef = useRef<any>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
        }
    });

    return (
        <mesh ref={meshRef} {...props}>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.8} />
        </mesh>
    );
};

export const Hero3D = () => {
    return (
        <div className="w-full h-[400px] sm:h-[500px] absolute top-0 left-0 -z-10 overflow-hidden bg-gradient-to-b from-teal-50/50 to-white dark:from-slate-900 dark:to-slate-950">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <Environment preset="city" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <ServiceIcon1 position={[-3, 1, -2]} />
                    <ServiceIcon2 position={[3, -1, -3]} />
                    <ServiceIcon3 position={[2, 2, -4]} />

                    {/* Main visual anchor if needed */}
                </Float>

                <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
            </Canvas>

            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-950 pointer-events-none" />
        </div>
    );
};
