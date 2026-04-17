import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Canvas, useFrame, useGraph, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type {
  Group,
  Material,
  MeshStandardMaterial,
  OrthographicCamera as OrthographicCameraType,
  SkinnedMesh,
  Texture,
} from 'three';
import { LinearFilter, LinearMipmapLinearFilter } from 'three';
import type { GLTF } from 'three-stdlib';
import { SkeletonUtils } from 'three-stdlib';

const MODEL_PATH = '/robot.glb';
const MODEL_SCALE = 0.4;

type GLTFResult = GLTF & {
  nodes: {
    Object_7: SkinnedMesh;
    _rootJoint: Group;
  };
  materials: {
    hero_texture: MeshStandardMaterial;
  };
};

const isTexture = (value: unknown): value is Texture =>
  typeof value === 'object' && value !== null && 'isTexture' in value;

const tuneMaterial = (material: Material, anisotropy: number) => {
  const mat = material as Material & {
    alphaTest?: number;
    needsUpdate?: boolean;
    map?: unknown;
    normalMap?: unknown;
    roughnessMap?: unknown;
    metalnessMap?: unknown;
    aoMap?: unknown;
  };
  mat.alphaTest = Math.max(mat.alphaTest ?? 0, 0.12);
  [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap].forEach((map) => {
    if (!isTexture(map)) return;
    map.minFilter = LinearMipmapLinearFilter;
    map.magFilter = LinearFilter;
    map.anisotropy = anisotropy;
  });
  mat.needsUpdate = true;
};

const PixelCamera = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    const ortho = camera as OrthographicCameraType;
    ortho.left = -size.width * 0.5;
    ortho.right = size.width * 0.5;
    ortho.top = size.height * 0.5;
    ortho.bottom = -size.height * 0.5;
    ortho.near = -1000;
    ortho.far = 1000;
    ortho.zoom = 1;
    ortho.position.set(0, 0, 320);
    ortho.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
};

const RobotInCard = ({ onLoaded }: { onLoaded: () => void }) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const { size, gl } = useThree();
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clonedScene) as GLTFResult;

  const modelMetrics = useMemo(() => {
    const geometry = nodes.Object_7.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    if (!bbox) {
      return { centerX: 0, centerY: 0, centerZ: 0, height: 1 };
    }
    const centerX = (bbox.min.x + bbox.max.x) * 0.5;
    const centerY = (bbox.min.y + bbox.max.y) * 0.5;
    const centerZ = (bbox.min.z + bbox.max.z) * 0.5;
    const height = Math.max((bbox.max.y - bbox.min.y) * MODEL_SCALE, 1e-4);
    return { centerX, centerY, centerZ, height };
  }, [nodes.Object_7.geometry]);

  useEffect(() => {
    onLoaded();
  }, [onLoaded]);

  useEffect(() => {
    nodes.Object_7.frustumCulled = false;
  }, [nodes.Object_7]);

  useEffect(() => {
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    const meshMaterial = nodes.Object_7.material;
    const mats = Array.isArray(meshMaterial) ? meshMaterial : [meshMaterial ?? materials.hero_texture];
    mats.filter(Boolean).forEach((mat) => tuneMaterial(mat as Material, anisotropy));
  }, [gl, materials.hero_texture, nodes.Object_7.material]);

  useFrame(({ clock }) => {
    const node = groupRef.current;
    if (!node) return;

    const bob = Math.sin(clock.elapsedTime * 2.2) * 7;
    const sway = Math.sin(clock.elapsedTime * 1.05) * 0.14;
    const targetHeight = Math.max(Math.min(size.height * 0.95, 390), 230);
    const scale = Math.min(Math.max((targetHeight / modelMetrics.height) * 1.08, 0.001), 45);

    node.position.set(0, -size.height * 0.1 + bob, 30);
    node.rotation.set(-Math.PI, -Math.PI + sway, -Math.PI);
    node.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <group scale={MODEL_SCALE}>
        <group position={[-modelMetrics.centerX, -modelMetrics.centerY, -modelMetrics.centerZ]}>
          <primitive object={nodes._rootJoint} />
          <primitive object={nodes.Object_7} />
        </group>
      </group>
    </group>
  );
};

export const HeroRobotCard = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <CardFrame aria-hidden="true">
      {!loaded && (
        <LoadingPlaceholder>
          <LoadingLabel>Loading robot...</LoadingLabel>
        </LoadingPlaceholder>
      )}
      <Canvas
        orthographic
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 220ms ease' }}
      >
        <PixelCamera />
        <ambientLight intensity={1.4} />
        <hemisphereLight intensity={1.35} groundColor="#1e2520" color="#e5fff0" />
        <directionalLight intensity={1.6} position={[120, 170, 210]} />
        <directionalLight intensity={0.95} position={[-120, -70, 130]} />
        <Suspense fallback={null}>
          <RobotInCard onLoaded={() => setLoaded(true)} />
        </Suspense>
      </Canvas>
    </CardFrame>
  );
};

useGLTF.preload(MODEL_PATH);

const placeholderPulse = keyframes`
  0% { opacity: 0.55; transform: translateY(0); }
  50% { opacity: 0.9; transform: translateY(-2px); }
  100% { opacity: 0.55; transform: translateY(0); }
`;

const CardFrame = styled.div`
  position: relative;
  width: min(100%, 24rem);
  aspect-ratio: 4 / 5;
  border-radius: 1.4rem;
  overflow: hidden;
  border: 1px solid rgba(181, 137, 0, 0.2);
  background: linear-gradient(160deg, rgba(255, 248, 228, 0.94), rgba(245, 233, 203, 0.92));
  box-shadow: 0 14px 30px rgba(136, 108, 62, 0.14);
`;

const LoadingPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 68% 26%, rgba(38, 139, 210, 0.1), transparent 42%),
    radial-gradient(circle at 24% 62%, rgba(222, 184, 135, 0.2), transparent 48%),
    linear-gradient(160deg, rgba(255, 248, 228, 0.96), rgba(245, 233, 203, 0.94));
`;

const LoadingLabel = styled.span`
  padding: 0.45rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(181, 137, 0, 0.26);
  background: rgba(255, 250, 240, 0.86);
  color: #586e75;
  font-size: var(--font-size-sm);
  animation: ${placeholderPulse} 1.8s ease-in-out infinite;
`;
