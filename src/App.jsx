import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 2.15;
const TURKEY = { name: 'TÜRKİYE', lat: 39.0, lon: 35.0 };

const SOURCES = [
  { name: 'USA', lat: 38.9, lon: -77.0 },
  { name: 'BRAZIL', lat: -15.8, lon: -47.9 },
  { name: 'UK', lat: 51.5, lon: -0.1 },
  { name: 'GERMANY', lat: 52.5, lon: 13.4 },
  { name: 'FRANCE', lat: 48.9, lon: 2.35 },
  { name: 'NETHERLANDS', lat: 52.37, lon: 4.9 },
  { name: 'UAE', lat: 24.45, lon: 54.38 },
  { name: 'INDIA', lat: 28.61, lon: 77.21 },
  { name: 'SINGAPORE', lat: 1.35, lon: 103.82 },
  { name: 'JAPAN', lat: 35.68, lon: 139.69 },
  { name: 'AUSTRALIA', lat: -35.28, lon: 149.13 },
  { name: 'SOUTH AFRICA', lat: -25.75, lon: 28.19 },
];

function latLonToVec3(lat, lon, radius = RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function buildArc(from, to) {
  const start = latLonToVec3(from.lat, from.lon, RADIUS + 0.035);
  const end = latLonToVec3(to.lat, to.lon, RADIUS + 0.045);
  const distance = start.distanceTo(end);
  const altitude = THREE.MathUtils.clamp(distance * 0.34, 0.32, 1.35);
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS + altitude);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return { curve, points: curve.getPoints(54) };
}

function Earth() {
  const texture = useTexture('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[RADIUS, 96, 96]} />
        <meshPhongMaterial map={texture} shininess={8} specular={new THREE.Color('#31527a')} />
      </mesh>
      <mesh>
        <sphereGeometry args={[RADIUS * 1.018, 96, 96]} />
        <meshBasicMaterial color="#2c8cff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[RADIUS * 1.07, 96, 96]} />
        <meshBasicMaterial color="#1b72ff" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function CountryNode({ country, isTurkey = false }) {
  const pos = useMemo(() => latLonToVec3(country.lat, country.lon, RADIUS + 0.07), [country]);
  const pulse = useRef();

  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 3.2 + country.lon) * 0.22;
    pulse.current.scale.setScalar(s);
  });

  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[isTurkey ? 0.075 : 0.045, 18, 18]} />
        <meshBasicMaterial color={isTurkey ? '#ff2f3f' : '#59c7ff'} toneMapped={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[isTurkey ? 0.14 : 0.085, 18, 18]} />
        <meshBasicMaterial color={isTurkey ? '#ff2335' : '#2da8ff'} transparent opacity={0.18} toneMapped={false} />
      </mesh>
      {isTurkey && (
        <Html center distanceFactor={7.5} style={{ pointerEvents: 'none' }}>
          <div className="turkey-label">
            <span className="flag-dot">★</span>
            <strong>TÜRKİYE</strong>
            <small>GLOBAL DATA HUB</small>
          </div>
        </Html>
      )}
    </group>
  );
}

function DataArc({ source, index }) {
  const packet = useRef();
  const { curve, points } = useMemo(() => buildArc(source, TURKEY), [source]);

  useFrame(({ clock }) => {
    if (!packet.current) return;
    const t = (clock.elapsedTime * (0.085 + (index % 4) * 0.013) + index * 0.071) % 1;
    packet.current.position.copy(curve.getPoint(t));
  });

  return (
    <group>
      <Line points={points} color="#31aaff" lineWidth={1.25} transparent opacity={0.46} />
      <Line points={points} color="#7dd8ff" lineWidth={0.32} transparent opacity={0.88} />
      <mesh ref={packet}>
        <sphereGeometry args={[0.037, 14, 14]} />
        <meshBasicMaterial color="#d9f7ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function GlobeScene() {
  const world = useRef();

  useFrame((_, delta) => {
    if (world.current) world.current.rotation.y += delta * 0.018;
  });

  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[5, 3, 5]} intensity={2.7} color="#dceaff" />
      <pointLight position={[-5, 1, -4]} intensity={8} color="#145dff" distance={14} />
      <Stars radius={80} depth={45} count={4200} factor={3.4} saturation={0.25} fade speed={0.28} />

      <group ref={world} rotation={[0.02, -0.42, -0.035]}>
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        {SOURCES.map((country) => <CountryNode key={country.name} country={country} />)}
        <CountryNode country={TURKEY} isTurkey />
        {SOURCES.map((source, index) => <DataArc key={source.name} source={source} index={index} />)}
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={4.7}
        maxDistance={9}
        autoRotate
        autoRotateSpeed={0.12}
        dampingFactor={0.045}
        enableDamping
      />
    </>
  );
}

function App() {
  return (
    <main className="experience">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <header className="hud top-hud">
        <div className="brand">
          <span className="brand-mark">SGDB</span>
          <span className="brand-sub">CYBER SECURITY DEPARTMENT</span>
        </div>
        <div className="live"><i /> LIVE GLOBAL TRAFFIC</div>
      </header>

      <section className="hero-copy">
        <div className="eyebrow">GLOBAL CYBER NETWORK</div>
        <h1>DATA HAS<br /><span>NO BORDERS.</span></h1>
        <p>Dünyanın farklı noktalarından gelen veri akışı tek bir güvenli merkezde birleşiyor.</p>
        <div className="stats">
          <div><strong>{SOURCES.length}</strong><span>ACTIVE REGIONS</span></div>
          <div><strong>TR</strong><span>SECURE HUB</span></div>
          <div><strong>24/7</strong><span>DATA FLOW</span></div>
        </div>
      </section>

      <div className="canvas-wrap">
        <Canvas camera={{ position: [0, 0.18, 6.6], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true }}>
          <color attach="background" args={['#02050b']} />
          <fog attach="fog" args={['#02050b', 8, 22]} />
          <GlobeScene />
        </Canvas>
      </div>

      <aside className="source-panel hud">
        <div className="panel-title"><span>INBOUND NODES</span><b>{SOURCES.length}</b></div>
        <div className="source-list">
          {SOURCES.slice(0, 7).map((item, i) => (
            <div className="source-row" key={item.name}>
              <span className="status-dot" />
              <span>{item.name}</span>
              <em>{String(96 + ((i * 7) % 4))}%</em>
            </div>
          ))}
        </div>
      </aside>

      <footer className="bottom-copy">SECURE CONNECTION • CONTINUOUS FLOW • TÜRKİYE</footer>
      <div className="scanline" />
    </main>
  );
}

export default App;
