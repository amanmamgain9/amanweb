import { Suspense, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame, useGraph, useThree } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import type {
  Bone,
  Group,
  Material,
  MeshStandardMaterial,
  OrthographicCamera as OrthographicCameraType,
  SkinnedMesh,
  Texture,
} from 'three';
import type { GLTF } from 'three-stdlib';
import { SkeletonUtils } from 'three-stdlib';
import { Box3, LinearFilter, LinearMipmapLinearFilter, Quaternion, Vector3 } from 'three';

type AndroidPosition = {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  rx?: number;
  ry?: number;
} | null;

type AndroidModelOverlayProps = {
  android: AndroidPosition;
  onFootprintChange?: (footprint: Exclude<AndroidPosition, null>) => void;
  onLoaded?: () => void;
};

const MODEL_PATH = '/robot.glb';
const MODEL_SCALE = 0.4;
const MODEL_SIZE_MULTIPLIER = 1;
const MODEL_BASE_X_ROTATION = 0 * (Math.PI / 180);
const MODEL_X_ROTATION = -180 * (Math.PI / 180);
const MODEL_Y_ROTATION = -180 * (Math.PI / 180);
const MODEL_Z_ROTATION = -180 * (Math.PI / 180);
const MODEL_Y_OFFSET = 0.09;

type GLTFResult = GLTF & {
  nodes: {
    Object_7: SkinnedMesh;
    _rootJoint: Bone;
  };
  materials: {
    hero_texture: MeshStandardMaterial;
  };
};

const isTexture = (value: unknown): value is Texture =>
  typeof value === 'object' && value !== null && 'isTexture' in value;

const lerp = (from: number, to: number, factor: number) => from + (to - from) * factor;

type ArmBones = {
  leftShoulder: Bone | null;
  rightShoulder: Bone | null;
  leftUpperArm: Bone | null;
  rightUpperArm: Bone | null;
  leftForearm: Bone | null;
  rightForearm: Bone | null;
  leftHand: Bone | null;
  rightHand: Bone | null;
};

const ARM_BONE_NAMES = {
  leftShoulder: 'hero_controler L obojczyk_017',
  rightShoulder: 'hero_controler R obojczyk_021',
  leftUpperArm: 'hero_controler L UpperArm_018',
  rightUpperArm: 'hero_controler R UpperArm_022',
  leftForearm: 'hero_controler L Forearm_019',
  rightForearm: 'hero_controler R Forearm_023',
  leftHand: 'hero_controler L Hand_020',
  rightHand: 'hero_controler R Hand_024',
} as const;

const resolveArmBones = (skeleton: SkinnedMesh['skeleton']): ArmBones => {
  const bones = skeleton.bones;
  const findExact = (name: string) => bones.find((b) => b.name === name) ?? null;
  const findPartSide = (part: string, side: 'l' | 'r') => {
    const sideToken = side === 'l' ? ' l ' : ' r ';
    return bones.find((b) => {
      const n = b.name.toLowerCase();
      return n.includes(sideToken) && n.includes(part);
    }) ?? null;
  };

  let leftShoulder = findExact(ARM_BONE_NAMES.leftShoulder) ?? findPartSide('obojczyk', 'l') ?? findPartSide('shoulder', 'l');
  let rightShoulder = findExact(ARM_BONE_NAMES.rightShoulder) ?? findPartSide('obojczyk', 'r') ?? findPartSide('shoulder', 'r');
  let leftUpperArm = findExact(ARM_BONE_NAMES.leftUpperArm) ?? findPartSide('upperarm', 'l') ?? findPartSide('arm', 'l');
  let rightUpperArm = findExact(ARM_BONE_NAMES.rightUpperArm) ?? findPartSide('upperarm', 'r') ?? findPartSide('arm', 'r');
  let leftForearm = findExact(ARM_BONE_NAMES.leftForearm) ?? findPartSide('forearm', 'l');
  let rightForearm = findExact(ARM_BONE_NAMES.rightForearm) ?? findPartSide('forearm', 'r');
  let leftHand = findExact(ARM_BONE_NAMES.leftHand) ?? findPartSide('hand', 'l');
  let rightHand = findExact(ARM_BONE_NAMES.rightHand) ?? findPartSide('hand', 'r');

  if (
    !leftShoulder && !rightShoulder &&
    !leftUpperArm && !rightUpperArm &&
    !leftForearm && !rightForearm &&
    !leftHand && !rightHand &&
    bones.length >= 26
  ) {
    leftShoulder = bones[18] ?? null;
    leftUpperArm = bones[19] ?? null;
    leftForearm = bones[20] ?? null;
    leftHand = bones[21] ?? null;
    rightShoulder = bones[22] ?? null;
    rightUpperArm = bones[23] ?? null;
    rightForearm = bones[24] ?? null;
    rightHand = bones[25] ?? null;
  }

  return { leftShoulder, rightShoulder, leftUpperArm, rightUpperArm, leftForearm, rightForearm, leftHand, rightHand };
};

const _idQ = new Quaternion();
const _wR = new Quaternion();
const _pW = new Quaternion();
const _pI = new Quaternion();
const _lO = new Quaternion();
const _vA = new Vector3();
const _vB = new Vector3();
const _vD = new Vector3();
const _leftDir = new Vector3(1, 0, 0);
const _upDir = new Vector3(0, 1, 0);
const _zAx = new Vector3(0, 0, 1);

const worldRotToBone = (bone: Bone, rot: Quaternion) => {
  const parent = bone.parent;
  if (!parent) return;
  parent.getWorldQuaternion(_pW);
  _pI.copy(_pW).conjugate();
  _lO.copy(_pI).multiply(rot).multiply(_pW);
  bone.quaternion.premultiply(_lO);
};

const tposeWorldSpace = (
  skinnedMesh: SkinnedMesh,
  armBones: ArmBones,
) => {
  const skeleton = skinnedMesh.skeleton;
  skeleton.pose();
  skinnedMesh.updateWorldMatrix(true, true);
  skeleton.bones.forEach((b) => b.updateWorldMatrix(true, false));

  const rotateToTarget = (upperArm: Bone, forearm: Bone, target: Vector3) => {
    upperArm.getWorldPosition(_vA);
    forearm.getWorldPosition(_vB);
    _vD.subVectors(_vB, _vA).normalize();
    _wR.setFromUnitVectors(_vD, target);
    const parent = upperArm.parent;
    if (!parent) return;
    parent.getWorldQuaternion(_pW);
    _pI.copy(_pW).conjugate();
    _lO.copy(_pI).multiply(_wR).multiply(_pW);
    upperArm.quaternion.premultiply(_lO);
    upperArm.updateWorldMatrix(false, true);
  };

  if (armBones.leftUpperArm && armBones.leftForearm)
    rotateToTarget(armBones.leftUpperArm, armBones.leftForearm, _leftDir);

  if (armBones.leftForearm) armBones.leftForearm.quaternion.slerp(_idQ, 1);
};

const hiWaveAnimation = (
  skinnedMesh: SkinnedMesh,
  armBones: ArmBones,
  time: number,
) => {
  tposeWorldSpace(skinnedMesh, armBones);

  const { leftForearm, leftHand } = armBones;
  if (!leftForearm) return;

  leftForearm.updateWorldMatrix(true, true);

  _wR.setFromUnitVectors(_leftDir, _upDir);
  worldRotToBone(leftForearm, _wR);
  leftForearm.updateWorldMatrix(false, true);

  const wave = Math.sin(time * 4.5) * 0.35;
  _wR.setFromAxisAngle(_zAx, wave);
  worldRotToBone(leftForearm, _wR);
  leftForearm.updateWorldMatrix(false, true);

  if (leftHand) {
    const flick = Math.sin(time * 4.5 + 1.2) * 0.2;
    _wR.setFromAxisAngle(_zAx, flick);
    worldRotToBone(leftHand, _wR);
  }
};

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
    ortho.position.set(0, 0, 300);
    ortho.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
};

const Robot = ({
  android,
  modelPath,
  onFootprintChange,
  onLoaded,
}: {
  android: Exclude<AndroidPosition, null>;
  modelPath: string;
  onFootprintChange?: (footprint: Exclude<AndroidPosition, null>) => void;
  onLoaded?: () => void;
}) => {
  const groupRef = useRef<Group>(null);
  const hasNotifiedLoadedRef = useRef(false);
  const footprintRef = useRef<Exclude<AndroidPosition, null> | null>(null);
  const worldBoundsRef = useRef(new Box3());
  const armBonesRef = useRef<ArmBones | null>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { size, gl } = useThree();
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clonedScene) as GLTFResult;

  const modelMetrics = useMemo(() => {
    const geometry = nodes.Object_7.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    if (!bbox) {
      return { centerX: 0, centerY: 0, centerZ: 0, width: 1, height: 1, depth: 1 };
    }
    const centerX = (bbox.min.x + bbox.max.x) * 0.5;
    const centerY = (bbox.min.y + bbox.max.y) * 0.5;
    const centerZ = (bbox.min.z + bbox.max.z) * 0.5;
    const width = Math.max((bbox.max.x - bbox.min.x) * MODEL_SCALE, 1e-4);
    const height = Math.max((bbox.max.y - bbox.min.y) * MODEL_SCALE, 1e-4);
    const depth = Math.max((bbox.max.z - bbox.min.z) * MODEL_SCALE, 1e-4);
    return { centerX, centerY, centerZ, width, height, depth };
  }, [nodes.Object_7.geometry]);

  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    Object.values(actions).forEach((action) => {
      action?.reset();
      action?.stop();
    });
  }, [actions]);

  useEffect(() => {
    if (hasNotifiedLoadedRef.current) return;
    hasNotifiedLoadedRef.current = true;
    onLoaded?.();
  }, [onLoaded]);

  useEffect(() => {
    armBonesRef.current = resolveArmBones(nodes.Object_7.skeleton);
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

    const baseX = android.x - size.width * 0.5;
    const baseY = size.height * 0.5 - android.y;
    const bob = Math.sin(clock.elapsedTime * 2.4) * (2.2 + android.intensity * 2.2);
    const sway = 0;
    const targetHeight = Math.max(android.radius * 4.2, 84) * MODEL_SIZE_MULTIPLIER;
    const scale = Math.min(Math.max(targetHeight / modelMetrics.height, 0.001), 40);
    const yaw = MODEL_Y_ROTATION + sway;

    node.position.set(baseX, baseY + bob + MODEL_Y_OFFSET, 40);
    node.rotation.set(MODEL_X_ROTATION, yaw, MODEL_Z_ROTATION);
    node.scale.setScalar(scale);

    const mesh = nodes.Object_7;
    const bones = armBonesRef.current;
    if (bones) {
      hiWaveAnimation(mesh, bones, clock.elapsedTime);
    }

    mesh.updateWorldMatrix(true, false);
    const geoBBox = mesh.geometry.boundingBox;
    if (!geoBBox) return;
    const worldBounds = worldBoundsRef.current.copy(geoBBox).applyMatrix4(mesh.matrixWorld);
    const minX = worldBounds.min.x + size.width * 0.5;
    const maxX = worldBounds.max.x + size.width * 0.5;
    const minY = size.height * 0.5 - worldBounds.max.y;
    const maxY = size.height * 0.5 - worldBounds.min.y;

    const rawHalfW = (maxX - minX) * 0.5;
    const rawFootprint = {
      x: (minX + maxX) * 0.5 + rawHalfW * 0.28,
      y: (minY + maxY) * 0.5,
      rx: Math.max(rawHalfW * 0.78, 16),
      ry: Math.max((maxY - minY) * 0.5 * 0.78, 20),
      radius: Math.max(rawHalfW * 0.72, (maxY - minY) * 0.5 * 0.62, 16),
      intensity: android.intensity,
    };

    const previous = footprintRef.current;
    const smoothed = previous
      ? {
          x: lerp(previous.x, rawFootprint.x, 0.22),
          y: lerp(previous.y, rawFootprint.y, 0.22),
          rx: lerp(previous.rx ?? previous.radius, rawFootprint.rx, 0.22),
          ry: lerp(previous.ry ?? previous.radius, rawFootprint.ry, 0.22),
          radius: lerp(previous.radius, rawFootprint.radius, 0.22),
          intensity: rawFootprint.intensity,
        }
      : rawFootprint;
    footprintRef.current = smoothed;
    onFootprintChange?.(smoothed);
  });

  return (
    <group ref={groupRef}>
      <group rotation={[MODEL_BASE_X_ROTATION, 0, 0]}>
        <group scale={MODEL_SCALE}>
          <group position={[-modelMetrics.centerX, -modelMetrics.centerY, -modelMetrics.centerZ]}>
            <primitive object={nodes._rootJoint} />
            <primitive object={nodes.Object_7} />
          </group>
        </group>
      </group>
    </group>
  );
};

export const AndroidModelOverlay = ({ android, onFootprintChange, onLoaded }: AndroidModelOverlayProps) => {
  if (!android) return null;

  return (
    <Overlay aria-hidden="true">
      <Canvas
        orthographic
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'none' }}
      >
        <PixelCamera />
        <ambientLight intensity={1.35} />
        <hemisphereLight intensity={1.2} groundColor="#19231d" color="#dfffea" />
        <directionalLight intensity={1.5} position={[120, 180, 220]} />
        <directionalLight intensity={0.9} position={[-140, -80, 140]} />
        <Suspense fallback={null}>
          <Robot
            android={android}
            modelPath={MODEL_PATH}
            onFootprintChange={onFootprintChange}
            onLoaded={onLoaded}
          />
        </Suspense>
      </Canvas>
    </Overlay>
  );
};

useGLTF.preload(MODEL_PATH);

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 11;
  pointer-events: none;
  filter: drop-shadow(0 10px 18px rgba(53, 255, 168, 0.28));
`;
