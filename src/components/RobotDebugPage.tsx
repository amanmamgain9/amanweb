import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Grid, useAnimations, useGLTF } from '@react-three/drei';
import { Quaternion, Vector3 } from 'three';
import type { Bone, Group, SkinnedMesh } from 'three';
import { SkeletonUtils } from 'three-stdlib';

const MODEL_PATH = '/robot.glb';
const DEG = Math.PI / 180;
const POSE_ONLY_MODE = true;
const CALIBRATION_ENABLED = false;

type Pose = {
  baseXDeg: number;
  xDeg: number;
  yDeg: number;
  zDeg: number;
  scale: number;
  yPos: number;
};

type Axis = 'x' | 'y' | 'z';

type TPoseAxes = {
  leftShoulderAxis: Axis;
  leftShoulderSign: 1 | -1;
  leftShoulderDeg: number;
  leftUpperArmAxis: Axis;
  leftUpperArmSign: 1 | -1;
  leftUpperArmDeg: number;
  rightShoulderAxis: Axis;
  rightShoulderSign: 1 | -1;
  rightShoulderDeg: number;
  rightUpperArmAxis: Axis;
  rightUpperArmSign: 1 | -1;
  rightUpperArmDeg: number;
};

type CalibrationResult = {
  axisMap: {
    leftShoulder: { axis: Axis; sign: 1 | -1 };
    leftUpperArm: { axis: Axis; sign: 1 | -1 };
    rightShoulder: { axis: Axis; sign: 1 | -1 };
    rightUpperArm: { axis: Axis; sign: 1 | -1 };
  };
  limitsDeg: {
    leftShoulder: { min: number; max: number };
    leftUpperArm: { min: number; max: number };
    rightShoulder: { min: number; max: number };
    rightUpperArm: { min: number; max: number };
  };
  targetsDeg: {
    leftShoulder: number;
    leftUpperArm: number;
    rightShoulder: number;
    rightUpperArm: number;
  };
  objective: string;
  score: {
    left: number;
    right: number;
    total: number;
  };
};

const DEFAULT_POSE: Pose = {
  baseXDeg: 0,
  xDeg: -180,
  yDeg: -180,
  zDeg: -180,
  scale: 0.4,
  yPos: 0.09,
};

const DEFAULT_TPOSE_AXES: TPoseAxes = {
  leftShoulderAxis: 'z',
  leftShoulderSign: 1,
  leftShoulderDeg: 45,
  leftUpperArmAxis: 'z',
  leftUpperArmSign: 1,
  leftUpperArmDeg: 45,
  rightShoulderAxis: 'z',
  rightShoulderSign: 1,
  rightShoulderDeg: 45,
  rightUpperArmAxis: 'z',
  rightUpperArmSign: 1,
  rightUpperArmDeg: 45,
};

type ArmSide = 'left' | 'right';

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
  const findExact = (name: string) => skeleton.bones.find((bone) => bone.name === name) ?? null;
  const findPartSide = (part: string, side: 'l' | 'r') => {
    const sideToken = side === 'l' ? ' l ' : ' r ';
    return (
      bones.find((bone) => {
        const n = bone.name.toLowerCase();
        return n.includes(sideToken) && n.includes(part);
      }) ?? null
    );
  };

  let leftShoulder = findExact(ARM_BONE_NAMES.leftShoulder) ?? findPartSide('obojczyk', 'l') ?? findPartSide('shoulder', 'l');
  let rightShoulder = findExact(ARM_BONE_NAMES.rightShoulder) ?? findPartSide('obojczyk', 'r') ?? findPartSide('shoulder', 'r');
  let leftUpperArm = findExact(ARM_BONE_NAMES.leftUpperArm) ?? findPartSide('upperarm', 'l') ?? findPartSide('arm', 'l');
  let rightUpperArm = findExact(ARM_BONE_NAMES.rightUpperArm) ?? findPartSide('upperarm', 'r') ?? findPartSide('arm', 'r');
  let leftForearm = findExact(ARM_BONE_NAMES.leftForearm) ?? findPartSide('forearm', 'l');
  let rightForearm = findExact(ARM_BONE_NAMES.rightForearm) ?? findPartSide('forearm', 'r');
  let leftHand = findExact(ARM_BONE_NAMES.leftHand) ?? findPartSide('hand', 'l');
  let rightHand = findExact(ARM_BONE_NAMES.rightHand) ?? findPartSide('hand', 'r');

  // Deterministic fallback to known joint order from extracted robot.glb skin list.
  // Indices: 18..25 => L clavicle, L upperarm, L forearm, L hand, R clavicle, R upperarm, R forearm, R hand
  if (
    !leftShoulder &&
    !rightShoulder &&
    !leftUpperArm &&
    !rightUpperArm &&
    !leftForearm &&
    !rightForearm &&
    !leftHand &&
    !rightHand &&
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

const AXES: Axis[] = ['x', 'y', 'z'];
const SIGNS: Array<1 | -1> = [1, -1];
const DEG_CANDIDATES = Array.from({ length: 19 }, (_, i) => i * 5); // 0..90
const SHOULDER_DEG_CANDIDATES = Array.from({ length: 13 }, (_, i) => i * 5); // 0..60

const tmpA = new Vector3();
const tmpB = new Vector3();
const tmpC = new Vector3();
const tmpD = new Vector3();

const setSideCandidate = (
  armBones: ArmBones,
  side: ArmSide,
  shoulderAxis: Axis,
  shoulderSign: 1 | -1,
  shoulderDeg: number,
  upperAxis: Axis,
  upperSign: 1 | -1,
  upperDeg: number,
) => {
  const shoulder = side === 'left' ? armBones.leftShoulder : armBones.rightShoulder;
  const upper = side === 'left' ? armBones.leftUpperArm : armBones.rightUpperArm;
  if (shoulder) {
    shoulder.rotation.set(0, 0, 0);
    shoulder.rotation[shoulderAxis] = shoulderSign * shoulderDeg * DEG;
  }
  if (upper) {
    upper.rotation.set(0, 0, 0);
    upper.rotation[upperAxis] = upperSign * upperDeg * DEG;
  }
};

const scoreArmPose = (
  armBones: ArmBones,
  side: ArmSide,
  desiredDir: Vector3,
) => {
  const upper = side === 'left' ? armBones.leftUpperArm : armBones.rightUpperArm;
  const forearm = side === 'left' ? armBones.leftForearm : armBones.rightForearm;
  if (!upper || !forearm) return Number.POSITIVE_INFINITY;
  upper.getWorldPosition(tmpA);
  forearm.getWorldPosition(tmpB);
  const upperVec = tmpC.subVectors(tmpB, tmpA);
  const upperLen = Math.max(upperVec.length(), 1e-6);
  const upperDir = tmpD.copy(upperVec).multiplyScalar(1 / upperLen);

  const upperHorizontalError = Math.abs(upperVec.y) / upperLen;
  const alignmentError = 1 - Math.max(-1, Math.min(1, upperDir.dot(desiredDir)));
  const dropError = tmpB.y < tmpA.y - upperLen * 0.3 ? 1 : 0;

  // A->T calibration objective: upper-arm only.
  return upperHorizontalError * 4 + alignmentError * 2.4 + dropError * 2;
};

const solveTPoseAxesForSkeleton = (
  skinnedMesh: SkinnedMesh,
  current: TPoseAxes,
  mode: ArmSide,
): TPoseAxes | null => {
  const skeleton = skinnedMesh.skeleton;
  const armBones = resolveArmBones(skeleton);
  if (!armBones.leftUpperArm || !armBones.rightUpperArm) return null;

  // Start from reset A-pose baseline.
  skeleton.pose();
  skinnedMesh.updateWorldMatrix(true, true);
  armBones.leftUpperArm.getWorldPosition(tmpA);
  armBones.rightUpperArm.getWorldPosition(tmpB);
  const leftDesired = new Vector3().subVectors(tmpA, tmpB).normalize();
  const rightDesired = new Vector3().subVectors(tmpB, tmpA).normalize();

  const solveSide = (side: ArmSide, desired: Vector3) => {
    let best = {
      shoulderAxis: side === 'left' ? current.leftShoulderAxis : current.rightShoulderAxis,
      shoulderSign: side === 'left' ? current.leftShoulderSign : current.rightShoulderSign,
      shoulderDeg: 0,
      upperAxis: side === 'left' ? current.leftUpperArmAxis : current.rightUpperArmAxis,
      upperSign: side === 'left' ? current.leftUpperArmSign : current.rightUpperArmSign,
      upperDeg: side === 'left' ? current.leftUpperArmDeg : current.rightUpperArmDeg,
      score: Number.POSITIVE_INFINITY,
    };

    for (let i = 0; i < AXES.length; i += 1) {
      const shoulderAxis = AXES[i]!;
      for (let j = 0; j < SIGNS.length; j += 1) {
        const shoulderSign = SIGNS[j]!;
        for (let sd = 0; sd < SHOULDER_DEG_CANDIDATES.length; sd += 1) {
          const shoulderDeg = SHOULDER_DEG_CANDIDATES[sd]!;
          for (let k = 0; k < AXES.length; k += 1) {
            const upperAxis = AXES[k]!;
            for (let l = 0; l < SIGNS.length; l += 1) {
              const upperSign = SIGNS[l]!;
              for (let d2 = 0; d2 < DEG_CANDIDATES.length; d2 += 1) {
                const upperDeg = DEG_CANDIDATES[d2]!;
                skeleton.pose();
                setSideCandidate(armBones, side, shoulderAxis, shoulderSign, shoulderDeg, upperAxis, upperSign, upperDeg);
                skinnedMesh.updateWorldMatrix(true, true);
                const baseScore = scoreArmPose(armBones, side, desired);
                const amplitude = shoulderDeg + upperDeg;
                const lowAmplitudePenalty = amplitude < 35 ? (35 - amplitude) * 0.08 : 0;
                const score = baseScore + lowAmplitudePenalty;
                if (score < best.score) {
                  best = { shoulderAxis, shoulderSign, shoulderDeg, upperAxis, upperSign, upperDeg, score };
                }
              }
            }
          }
        }
      }
    }
    return best;
  };

  const sideBest = solveSide(mode, mode === 'left' ? leftDesired : rightDesired);
  if (mode === 'left') {
    return {
      ...current,
      leftShoulderAxis: sideBest.shoulderAxis,
      leftShoulderSign: sideBest.shoulderSign,
      leftShoulderDeg: sideBest.shoulderDeg,
      leftUpperArmAxis: sideBest.upperAxis,
      leftUpperArmSign: sideBest.upperSign,
      leftUpperArmDeg: sideBest.upperDeg,
    };
  }
  return {
    ...current,
    rightShoulderAxis: sideBest.shoulderAxis,
    rightShoulderSign: sideBest.shoulderSign,
    rightShoulderDeg: sideBest.shoulderDeg,
    rightUpperArmAxis: sideBest.upperAxis,
    rightUpperArmSign: sideBest.upperSign,
    rightUpperArmDeg: sideBest.upperDeg,
  };
};

const calibrateTPoseForSkeleton = (skinnedMesh: SkinnedMesh, seed: TPoseAxes): { axes: TPoseAxes; result: CalibrationResult } | null => {
  const leftSolved = solveTPoseAxesForSkeleton(skinnedMesh, seed, 'left');
  if (!leftSolved) return null;
  const fullSolvedA = solveTPoseAxesForSkeleton(skinnedMesh, leftSolved, 'right');
  if (!fullSolvedA) return null;

  const skeleton = skinnedMesh.skeleton;
  const armBones = resolveArmBones(skeleton);
  if (!armBones.leftUpperArm || !armBones.rightUpperArm) return null;

  skeleton.pose();
  skinnedMesh.updateWorldMatrix(true, true);
  armBones.leftUpperArm.getWorldPosition(tmpA);
  armBones.rightUpperArm.getWorldPosition(tmpB);
  const leftDesired = new Vector3().subVectors(tmpA, tmpB).normalize();
  const rightDesired = new Vector3().subVectors(tmpB, tmpA).normalize();

  const evaluate = (axes: TPoseAxes) => {
    skeleton.pose();
    applyCleanTPose(armBones, axes, 1);
    skinnedMesh.updateWorldMatrix(true, true);
    const leftScore = scoreArmPose(armBones, 'left', leftDesired);
    const rightScore = scoreArmPose(armBones, 'right', rightDesired);
    const total = leftScore + rightScore;
    const gap = Math.abs(leftScore - rightScore);
    return { leftScore, rightScore, total, gap, objective: total + gap * 0.6 };
  };

  const evalA = evaluate(fullSolvedA);

  // Candidate B: mirror left as seed for right, then solve right.
  const mirroredSeed: TPoseAxes = {
    ...leftSolved,
    rightShoulderAxis: leftSolved.leftShoulderAxis,
    rightShoulderSign: (leftSolved.leftShoulderSign * -1) as 1 | -1,
    rightShoulderDeg: leftSolved.leftShoulderDeg,
    rightUpperArmAxis: leftSolved.leftUpperArmAxis,
    rightUpperArmSign: (leftSolved.leftUpperArmSign * -1) as 1 | -1,
    rightUpperArmDeg: leftSolved.leftUpperArmDeg,
  };
  const fullSolvedB = solveTPoseAxesForSkeleton(skinnedMesh, mirroredSeed, 'right');
  const evalB = fullSolvedB ? evaluate(fullSolvedB) : null;

  // Candidate C: strict mirrored right from left (no right-side free solve).
  const fullSolvedC: TPoseAxes = {
    ...leftSolved,
    rightShoulderAxis: leftSolved.leftShoulderAxis,
    rightShoulderSign: (leftSolved.leftShoulderSign * -1) as 1 | -1,
    rightShoulderDeg: leftSolved.leftShoulderDeg,
    rightUpperArmAxis: leftSolved.leftUpperArmAxis,
    rightUpperArmSign: (leftSolved.leftUpperArmSign * -1) as 1 | -1,
    rightUpperArmDeg: leftSolved.leftUpperArmDeg,
  };
  const evalC = evaluate(fullSolvedC);

  // Choose best objective first, then enforce symmetry gate.
  let finalAxes = fullSolvedA;
  let finalEval = evalA;
  if (evalB && evalB.objective < finalEval.objective) {
    finalAxes = fullSolvedB!;
    finalEval = evalB;
  }
  if (evalC.objective < finalEval.objective) {
    finalAxes = fullSolvedC;
    finalEval = evalC;
  }

  // Hard gate: reject lopsided solutions.
  const MAX_SIDE_GAP = 1.0;
  if (finalEval.gap > MAX_SIDE_GAP) {
    finalAxes = fullSolvedC;
    finalEval = evalC;
  }

  return {
    axes: finalAxes,
    result: {
      axisMap: {
        leftShoulder: { axis: finalAxes.leftShoulderAxis, sign: finalAxes.leftShoulderSign },
        leftUpperArm: { axis: finalAxes.leftUpperArmAxis, sign: finalAxes.leftUpperArmSign },
        rightShoulder: { axis: finalAxes.rightShoulderAxis, sign: finalAxes.rightShoulderSign },
        rightUpperArm: { axis: finalAxes.rightUpperArmAxis, sign: finalAxes.rightUpperArmSign },
      },
      limitsDeg: {
        leftShoulder: { min: 0, max: 90 },
        leftUpperArm: { min: 0, max: 90 },
        rightShoulder: { min: 0, max: 90 },
        rightUpperArm: { min: 0, max: 90 },
      },
      targetsDeg: {
        leftShoulder: finalAxes.leftShoulderDeg,
        leftUpperArm: finalAxes.leftUpperArmDeg,
        rightShoulder: finalAxes.rightShoulderDeg,
        rightUpperArm: finalAxes.rightUpperArmDeg,
      },
      objective: 'Minimize upper-arm non-horizontal + outward alignment + anti-drop + L/R gap (with strict symmetry gate).',
      score: {
        left: Number(finalEval.leftScore.toFixed(4)),
        right: Number(finalEval.rightScore.toFixed(4)),
        total: Number(finalEval.total.toFixed(4)),
      },
    },
  };
};

const applyCleanTPose = (
  armBones: ArmBones,
  axes: TPoseAxes,
  amount: number,
) => {
  const clamped = Math.min(Math.max(amount, 0), 1);
  const leftShoulderRad = axes.leftShoulderDeg * DEG * clamped * axes.leftShoulderSign;
  const rightShoulderRad = axes.rightShoulderDeg * DEG * clamped * axes.rightShoulderSign;
  const leftUpperArmRad = axes.leftUpperArmDeg * DEG * clamped * axes.leftUpperArmSign;
  const rightUpperArmRad = axes.rightUpperArmDeg * DEG * clamped * axes.rightUpperArmSign;
  if (armBones.leftShoulder) {
    armBones.leftShoulder.rotation.set(0, 0, 0);
    armBones.leftShoulder.rotation[axes.leftShoulderAxis] = leftShoulderRad;
  }
  if (armBones.rightShoulder) {
    armBones.rightShoulder.rotation.set(0, 0, 0);
    armBones.rightShoulder.rotation[axes.rightShoulderAxis] = rightShoulderRad;
  }
  if (armBones.leftUpperArm) {
    armBones.leftUpperArm.rotation.set(0, 0, 0);
    armBones.leftUpperArm.rotation[axes.leftUpperArmAxis] = leftUpperArmRad;
  }
  if (armBones.rightUpperArm) {
    armBones.rightUpperArm.rotation.set(0, 0, 0);
    armBones.rightUpperArm.rotation[axes.rightUpperArmAxis] = rightUpperArmRad;
  }
  // Leave forearm/hand in reset pose so hands keep natural opposing orientation.
};

const _identityQuat = new Quaternion();
const _worldRot = new Quaternion();
const _parentWQ = new Quaternion();
const _parentInv = new Quaternion();
const _localOff = new Quaternion();
const _curDir = new Vector3();
const _posA = new Vector3();
const _posB = new Vector3();
const _leftTarget = new Vector3(1, 0, 0);
const _rightTarget = new Vector3(-1, 0, 0);
const _upTarget = new Vector3(0, 1, 0);
const _zAxis = new Vector3(0, 0, 1);

const applyTPoseWorldSpace = (
  skinnedMesh: SkinnedMesh,
  armBones: ArmBones,
  amount: number,
) => {
  const skeleton = skinnedMesh.skeleton;
  skeleton.pose();
  if (amount <= 0) return;

  skinnedMesh.updateWorldMatrix(true, true);
  skeleton.bones.forEach((b) => b.updateWorldMatrix(true, false));

  const rotateToTarget = (upperArm: Bone, forearm: Bone, target: Vector3) => {
    upperArm.getWorldPosition(_posA);
    forearm.getWorldPosition(_posB);
    _curDir.subVectors(_posB, _posA).normalize();

    _worldRot.setFromUnitVectors(_curDir, target);
    if (amount < 1) _worldRot.slerp(_identityQuat, 1 - amount);

    const parent = upperArm.parent;
    if (!parent) return;
    parent.getWorldQuaternion(_parentWQ);
    _parentInv.copy(_parentWQ).conjugate();
    _localOff.copy(_parentInv).multiply(_worldRot).multiply(_parentWQ);

    upperArm.quaternion.premultiply(_localOff);
    upperArm.updateWorldMatrix(false, true);
  };

  if (armBones.leftUpperArm && armBones.leftForearm) {
    rotateToTarget(armBones.leftUpperArm, armBones.leftForearm, _leftTarget);
  }
  if (armBones.rightUpperArm && armBones.rightForearm) {
    rotateToTarget(armBones.rightUpperArm, armBones.rightForearm, _rightTarget);
  }

  if (armBones.leftForearm) {
    armBones.leftForearm.quaternion.slerp(_identityQuat, amount);
  }
  if (armBones.rightForearm) {
    armBones.rightForearm.quaternion.slerp(_identityQuat, amount);
  }
};

const applyWorldRotToBone = (bone: Bone, rotation: Quaternion) => {
  const parent = bone.parent;
  if (!parent) return;
  parent.getWorldQuaternion(_parentWQ);
  _parentInv.copy(_parentWQ).conjugate();
  _localOff.copy(_parentInv).multiply(rotation).multiply(_parentWQ);
  bone.quaternion.premultiply(_localOff);
};

const applyHiWave = (
  skinnedMesh: SkinnedMesh,
  armBones: ArmBones,
  time: number,
) => {
  applyTPoseWorldSpace(skinnedMesh, armBones, 1);

  const { leftForearm, leftHand } = armBones;
  if (!leftForearm) return;

  leftForearm.updateWorldMatrix(true, true);

  // Bend left forearm up ~90°: direction goes from +X → +Y
  _worldRot.setFromUnitVectors(_leftTarget, _upTarget);
  applyWorldRotToBone(leftForearm, _worldRot);
  leftForearm.updateWorldMatrix(false, true);

  // Wave: oscillate forearm around world Z (pendulum left-right)
  const wave = Math.sin(time * 4.5) * 0.35;
  _worldRot.setFromAxisAngle(_zAxis, wave);
  applyWorldRotToBone(leftForearm, _worldRot);
  leftForearm.updateWorldMatrix(false, true);

  // Wrist flick: small out-of-phase rotation for expressiveness
  if (leftHand) {
    const flick = Math.sin(time * 4.5 + 1.2) * 0.2;
    _worldRot.setFromAxisAngle(_zAxis, flick);
    applyWorldRotToBone(leftHand, _worldRot);
  }
};

type BoneDumpEntry = {
  name: string;
  parent: string | null;
  localRotDeg: { x: number; y: number; z: number };
  localQuat: { x: number; y: number; z: number; w: number };
  worldPos: { x: number; y: number; z: number };
};

type BoneDump = {
  allBones: BoneDumpEntry[];
  armChain: Record<string, BoneDumpEntry>;
  vectors: Record<string, { dx: number; dy: number; dz: number; len: number }>;
};

const RobotPreview = ({
  pose,
  playAnimation,
  forceTPose,
  useRigRestPose,
  tPoseAmount,
  tPoseAxes,
  hiWave,
  onBoneMap,
  solveNonce,
  solveSide,
  calibrateNonce,
  onCalibration,
  onSolvedAxes,
  dumpNonce,
  onBoneDump,
}: {
  pose: Pose;
  playAnimation: boolean;
  forceTPose: boolean;
  useRigRestPose: boolean;
  tPoseAmount: number;
  tPoseAxes: TPoseAxes;
  hiWave: boolean;
  onBoneMap: (value: string) => void;
  solveNonce: number;
  solveSide: ArmSide;
  calibrateNonce: number;
  onCalibration: (value: CalibrationResult | null) => void;
  onSolvedAxes: (value: TPoseAxes) => void;
  dumpNonce: number;
  onBoneDump: (data: BoneDump) => void;
}) => {
  const gltf = useGLTF(MODEL_PATH);
  const modelScene = useMemo(() => {
    return gltf.scene;
  }, [gltf]);
  const clone = useMemo(() => SkeletonUtils.clone(modelScene), [modelScene]);
  const groupRef = useRef<Group>(null);
  const skinnedMeshRef = useRef<SkinnedMesh | null>(null);
  const armBonesRef = useRef<ArmBones | null>(null);
  const waveTimeRef = useRef(0);
  const { actions } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    const preferred = clone.getObjectByName('Object_7');
    if (preferred && 'isSkinnedMesh' in preferred && (preferred as SkinnedMesh).isSkinnedMesh) {
      skinnedMeshRef.current = preferred as SkinnedMesh;
      return;
    }
    const matches: SkinnedMesh[] = [];
    clone.traverse((node) => {
      if ('isSkinnedMesh' in node && (node as SkinnedMesh).isSkinnedMesh) {
        matches.push(node as SkinnedMesh);
      }
    });
    skinnedMeshRef.current = matches.sort((a, b) => b.skeleton.bones.length - a.skeleton.bones.length)[0] ?? null;
  }, [clone]);

  useEffect(() => {
    if (calibrateNonce === 0) return;
    const skinnedMesh = skinnedMeshRef.current;
    if (!skinnedMesh) return;
    const calibrated = calibrateTPoseForSkeleton(skinnedMesh, tPoseAxes);
    if (!calibrated) {
      onCalibration(null);
      return;
    }
    onSolvedAxes(calibrated.axes);
    onCalibration(calibrated.result);
  }, [calibrateNonce, onCalibration, onSolvedAxes, tPoseAxes]);

  useEffect(() => {
    if (solveNonce === 0) return;
    const skinnedMesh = skinnedMeshRef.current;
    if (!skinnedMesh) return;
    const solved = solveTPoseAxesForSkeleton(skinnedMesh, tPoseAxes, solveSide);
    if (!solved) return;
    onSolvedAxes(solved);
  }, [onSolvedAxes, solveNonce, solveSide, tPoseAxes]);

  useEffect(() => {
    const skinnedMesh = skinnedMeshRef.current;
    if (!skinnedMesh) return;
    const resolved = resolveArmBones(skinnedMesh.skeleton);
    armBonesRef.current = resolved;
    const boneCount = skinnedMesh.skeleton.bones.length;
    const status = (Object.keys(ARM_BONE_NAMES) as Array<keyof typeof ARM_BONE_NAMES>)
      .map((key) => `${key}:${resolved[key] ? resolved[key]!.name : 'missing'}`)
      .join(' | ');
    onBoneMap(`bones:${boneCount} | ${status}`);
  }, [clone]);

  useEffect(() => {
    if (dumpNonce === 0) return;
    const skinnedMesh = skinnedMeshRef.current;
    if (!skinnedMesh) return;
    const skeleton = skinnedMesh.skeleton;
    skeleton.pose();
    skinnedMesh.updateWorldMatrix(true, true);
    skeleton.bones.forEach((b) => b.updateWorldMatrix(true, false));

    const RAD = 180 / Math.PI;
    const round = (n: number) => Math.round(n * 10000) / 10000;
    const wp = new Vector3();

    const makeBoneEntry = (bone: Bone): BoneDumpEntry => {
      bone.getWorldPosition(wp);
      return {
        name: bone.name,
        parent: bone.parent?.name ?? null,
        localRotDeg: {
          x: round(bone.rotation.x * RAD),
          y: round(bone.rotation.y * RAD),
          z: round(bone.rotation.z * RAD),
        },
        localQuat: {
          x: round(bone.quaternion.x),
          y: round(bone.quaternion.y),
          z: round(bone.quaternion.z),
          w: round(bone.quaternion.w),
        },
        worldPos: { x: round(wp.x), y: round(wp.y), z: round(wp.z) },
      };
    };

    const allBones = skeleton.bones.map(makeBoneEntry);

    const armBones = resolveArmBones(skeleton);
    const armKeys: Array<keyof ArmBones> = [
      'leftShoulder', 'leftUpperArm', 'leftForearm', 'leftHand',
      'rightShoulder', 'rightUpperArm', 'rightForearm', 'rightHand',
    ];
    const armChain: Record<string, BoneDumpEntry> = {};
    for (const key of armKeys) {
      const bone = armBones[key];
      if (bone) armChain[key] = makeBoneEntry(bone);
    }

    const vecBetween = (a: BoneDumpEntry | undefined, b: BoneDumpEntry | undefined) => {
      if (!a || !b) return null;
      const dx = round(b.worldPos.x - a.worldPos.x);
      const dy = round(b.worldPos.y - a.worldPos.y);
      const dz = round(b.worldPos.z - a.worldPos.z);
      const len = round(Math.sqrt(dx * dx + dy * dy + dz * dz));
      return { dx, dy, dz, len };
    };
    const vectors: Record<string, { dx: number; dy: number; dz: number; len: number }> = {};
    const addVec = (label: string, a: keyof ArmBones, b: keyof ArmBones) => {
      const v = vecBetween(armChain[a], armChain[b]);
      if (v) vectors[label] = v;
    };
    addVec('L shoulder→upperArm', 'leftShoulder', 'leftUpperArm');
    addVec('L upperArm→forearm', 'leftUpperArm', 'leftForearm');
    addVec('L forearm→hand', 'leftForearm', 'leftHand');
    addVec('R shoulder→upperArm', 'rightShoulder', 'rightUpperArm');
    addVec('R upperArm→forearm', 'rightUpperArm', 'rightForearm');
    addVec('R forearm→hand', 'rightForearm', 'rightHand');

    onBoneDump({ allBones, armChain, vectors });
  }, [dumpNonce, onBoneDump]);

  useEffect(() => {
    const all = Object.values(actions).filter(Boolean);
    if (playAnimation) {
      all.forEach((action) => {
        action?.reset();
        action?.fadeIn(0.2);
        action?.play();
      });
    } else {
      all.forEach((action) => {
        action?.reset();
        action?.stop();
      });
      if (hiWave && skinnedMeshRef.current) {
        waveTimeRef.current = 0;
      } else if (useRigRestPose && skinnedMeshRef.current) {
        skinnedMeshRef.current.skeleton.pose();
      } else if (forceTPose && skinnedMeshRef.current) {
        applyTPoseWorldSpace(
          skinnedMeshRef.current,
          armBonesRef.current ?? resolveArmBones(skinnedMeshRef.current.skeleton),
          tPoseAmount,
        );
      }
    }
    return () => {
      all.forEach((action) => {
        action?.reset();
        action?.stop();
      });
    };
  }, [actions, forceTPose, hiWave, playAnimation, tPoseAmount, useRigRestPose]);

  useFrame((_, delta) => {
    if (playAnimation) return;
    const skinnedMesh = skinnedMeshRef.current;
    if (!skinnedMesh) return;
    const bones = armBonesRef.current ?? resolveArmBones(skinnedMesh.skeleton);

    if (hiWave) {
      waveTimeRef.current += delta;
      applyHiWave(skinnedMesh, bones, waveTimeRef.current);
      return;
    }

    if (useRigRestPose) {
      skinnedMesh.skeleton.pose();
      return;
    }
    if (forceTPose) {
      applyTPoseWorldSpace(skinnedMesh, bones, tPoseAmount);
    }
  });

  return (
    <group position={[0, pose.yPos, 0]}>
      <group rotation={[pose.baseXDeg * DEG, 0, 0]}>
        <group
          ref={groupRef}
          rotation={[pose.xDeg * DEG, pose.yDeg * DEG, pose.zDeg * DEG]}
          scale={pose.scale}
        >
          <primitive object={clone} />
        </group>
      </group>
    </group>
  );
};

export const RobotDebugPage = () => {
  const [pose, setPose] = useState<Pose>(DEFAULT_POSE);
  const [playAnimation, setPlayAnimation] = useState(false);
  const [forceTPose, setForceTPose] = useState(false);
  const [useRigRestPose, setUseRigRestPose] = useState(true);
  const [tPoseAmount, setTPoseAmount] = useState(1);
  const [tPoseAxes, setTPoseAxes] = useState<TPoseAxes>(DEFAULT_TPOSE_AXES);
  const [calibration, setCalibration] = useState<CalibrationResult | null>(null);
  const [calibrateNonce, setCalibrateNonce] = useState(0);
  const [applyCalibration, setApplyCalibration] = useState(false);
  const [boneMapStatus, setBoneMapStatus] = useState('resolving...');
  const [solveNonce, setSolveNonce] = useState(0);
  const [solveSide, setSolveSide] = useState<ArmSide>('left');
  const [resetNonce, setResetNonce] = useState(0);
  const [hiWave, setHiWave] = useState(false);
  const [dumpNonce, setDumpNonce] = useState(0);
  const [boneDump, setBoneDump] = useState<BoneDump | null>(null);

  const set = (key: keyof Pose) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setPose((current) => ({ ...current, [key]: value }));
  };

  const setTPoseAxis = (key: keyof TPoseAxes) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TPoseAxes[typeof key];
    setTPoseAxes((current) => ({ ...current, [key]: value }));
  };

  const setTPoseDeg = (key: keyof TPoseAxes) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setTPoseAxes((current) => ({ ...current, [key]: value }));
  };

  const toggleTPoseSign = (key: keyof TPoseAxes) => () => {
    setTPoseAxes((current) => ({
      ...current,
      [key]: ((current[key] as 1 | -1) === 1 ? -1 : 1) as TPoseAxes[typeof key],
    }));
  };

  const copySettings = async () => {
    const payload = {
      MODEL_SCALE: pose.scale,
      MODEL_FACING_YAW_OFFSET: Number((pose.yDeg * DEG).toFixed(4)),
      rotationXDeg: pose.xDeg,
      rotationYDeg: pose.yDeg,
      rotationZDeg: pose.zDeg,
      baseXDeg: pose.baseXDeg,
      yPos: pose.yPos,
      tPoseAmount,
      tPoseAxes,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  const resetAll = () => {
    setPlayAnimation(false);
    setForceTPose(false);
    setUseRigRestPose(true);
    setTPoseAmount(1);
    setTPoseAxes(DEFAULT_TPOSE_AXES);
    setCalibration(null);
    setApplyCalibration(false);
    setPose(DEFAULT_POSE);
    setResetNonce((value) => value + 1);
  };

  const runSolve = () => {
    setUseRigRestPose(false);
    setForceTPose(true);
    setTPoseAmount(1);
    setSolveNonce((value) => value + 1);
  };

  if (POSE_ONLY_MODE) {
    return (
      <Shell>
        <Panel>
          <Title>Robot 3D Debug</Title>
          <Hint>Pose-only mode: frame the model in scene space.</Hint>

          <Row>
            <label htmlFor="baseX">Base X</label>
            <input id="baseX" type="range" min={-180} max={180} step={1} value={pose.baseXDeg} onChange={set('baseXDeg')} />
            <code>{pose.baseXDeg}deg</code>
          </Row>
          <Row>
            <label htmlFor="rotX">Rot X</label>
            <input id="rotX" type="range" min={-180} max={180} step={1} value={pose.xDeg} onChange={set('xDeg')} />
            <code>{pose.xDeg}deg</code>
          </Row>
          <Row>
            <label htmlFor="rotY">Rot Y</label>
            <input id="rotY" type="range" min={-180} max={180} step={1} value={pose.yDeg} onChange={set('yDeg')} />
            <code>{pose.yDeg}deg</code>
          </Row>
          <Row>
            <label htmlFor="rotZ">Rot Z</label>
            <input id="rotZ" type="range" min={-180} max={180} step={1} value={pose.zDeg} onChange={set('zDeg')} />
            <code>{pose.zDeg}deg</code>
          </Row>
          <Row>
            <label htmlFor="scale">Scale</label>
            <input id="scale" type="range" min={0.05} max={1.5} step={0.01} value={pose.scale} onChange={set('scale')} />
            <code>{pose.scale.toFixed(2)}</code>
          </Row>
          <Row>
            <label htmlFor="yPos">Y Pos</label>
            <input id="yPos" type="range" min={-2} max={2} step={0.01} value={pose.yPos} onChange={set('yPos')} />
            <code>{pose.yPos.toFixed(2)}</code>
          </Row>

          <Toggle>
            <input
              id="animSimple"
              type="checkbox"
              checked={playAnimation}
              onChange={(event) => setPlayAnimation(event.target.checked)}
            />
            <label htmlFor="animSimple">Play GLB animation</label>
          </Toggle>
          <Toggle>
            <input
              id="tposeToggle"
              type="checkbox"
              checked={forceTPose}
              onChange={(event) => {
                const checked = event.target.checked;
                setForceTPose(checked);
                setUseRigRestPose(!checked);
                if (checked) setTPoseAmount(1);
              }}
            />
            <label htmlFor="tposeToggle">Force T-pose (world-space)</label>
          </Toggle>
          {forceTPose && (
            <Row>
              <label htmlFor="tAmount">A→T</label>
              <input
                id="tAmount"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={tPoseAmount}
                onChange={(event) => setTPoseAmount(Number(event.target.value))}
              />
              <code>{tPoseAmount.toFixed(2)}</code>
            </Row>
          )}
          <Toggle>
            <input
              id="hiWaveToggle"
              type="checkbox"
              checked={hiWave}
              onChange={(event) => {
                const checked = event.target.checked;
                setHiWave(checked);
                if (checked) {
                  setForceTPose(false);
                  setUseRigRestPose(false);
                  setPlayAnimation(false);
                }
              }}
            />
            <label htmlFor="hiWaveToggle">Animate Hi wave</label>
          </Toggle>

          <Hint>{boneMapStatus}</Hint>

          <Actions>
            <button type="button" onClick={() => setDumpNonce((v) => v + 1)}>
              Dump bone data
            </button>
            <button type="button" onClick={resetAll}>
              Reset all
            </button>
            <button type="button" onClick={copySettings}>
              Copy settings
            </button>
            <a href="/">Back to homepage</a>
          </Actions>

          {boneDump && (
            <>
              <Hint>Arm chain (bind-pose):</Hint>
              <textarea
                readOnly
                value={JSON.stringify({ armChain: boneDump.armChain, vectors: boneDump.vectors }, null, 2)}
                style={{
                  width: '100%',
                  minHeight: '300px',
                  background: '#1a1513',
                  color: '#f7eddc',
                  border: '1px solid rgba(247,237,220,0.24)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              />
              <Hint>All bones ({boneDump.allBones.length}):</Hint>
              <textarea
                readOnly
                value={JSON.stringify(boneDump.allBones, null, 2)}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  background: '#1a1513',
                  color: '#f7eddc',
                  border: '1px solid rgba(247,237,220,0.24)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              />
            </>
          )}
        </Panel>

        <Viewport>
          <Canvas key={resetNonce} camera={{ position: [0, 0.8, 4], fov: 42 }}>
            <color attach="background" args={['#181513']} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[4, 5, 4]} intensity={1.15} />
            <directionalLight position={[-4, 2, -2]} intensity={0.55} />
            <Environment preset="city" />
            <Grid args={[14, 14]} cellSize={0.5} cellThickness={0.5} sectionSize={2} sectionThickness={1} />
            <axesHelper args={[1.2]} />
            <Suspense fallback={<FallbackRobot />}>
              <RobotPreview
                key={resetNonce}
                pose={pose}
                playAnimation={playAnimation}
                forceTPose={forceTPose}
                useRigRestPose={useRigRestPose}
                tPoseAmount={tPoseAmount}
                tPoseAxes={tPoseAxes}
                hiWave={hiWave}
                onBoneMap={setBoneMapStatus}
                solveNonce={0}
                solveSide="left"
                calibrateNonce={0}
                onCalibration={() => {}}
                onSolvedAxes={() => {}}
                dumpNonce={dumpNonce}
                onBoneDump={setBoneDump}
              />
            </Suspense>
          </Canvas>
        </Viewport>
      </Shell>
    );
  }

  return (
    <Shell>
      <Panel>
        <Title>Robot 3D Debug</Title>
        <Hint>
          Rotate/zoom in viewport, tune sliders, then send me these values and I will apply them
          to the timeline robot.
        </Hint>

        <Row>
          <label htmlFor="baseX">Base X</label>
          <input id="baseX" type="range" min={-180} max={180} step={1} value={pose.baseXDeg} onChange={set('baseXDeg')} />
          <code>{pose.baseXDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="rotX">Rot X</label>
          <input id="rotX" type="range" min={-180} max={180} step={1} value={pose.xDeg} onChange={set('xDeg')} />
          <code>{pose.xDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="rotY">Rot Y</label>
          <input id="rotY" type="range" min={-180} max={180} step={1} value={pose.yDeg} onChange={set('yDeg')} />
          <code>{pose.yDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="rotZ">Rot Z</label>
          <input id="rotZ" type="range" min={-180} max={180} step={1} value={pose.zDeg} onChange={set('zDeg')} />
          <code>{pose.zDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="scale">Scale</label>
          <input id="scale" type="range" min={0.05} max={1.5} step={0.01} value={pose.scale} onChange={set('scale')} />
          <code>{pose.scale.toFixed(2)}</code>
        </Row>
        <Row>
          <label htmlFor="yPos">Y Pos</label>
          <input id="yPos" type="range" min={-2} max={2} step={0.01} value={pose.yPos} onChange={set('yPos')} />
          <code>{pose.yPos.toFixed(2)}</code>
        </Row>

        <Toggle>
          <input
            id="anim"
            type="checkbox"
            checked={playAnimation}
            onChange={(event) => setPlayAnimation(event.target.checked)}
          />
          <label htmlFor="anim">Play GLB animation</label>
        </Toggle>
        <Toggle>
          <input
            id="restPose"
            type="checkbox"
            checked={useRigRestPose}
            onChange={(event) => {
              const checked = event.target.checked;
              setUseRigRestPose(checked);
              if (checked) setForceTPose(false);
            }}
          />
          <label htmlFor="restPose">Reset mode (rig rest pose)</label>
        </Toggle>
        <Toggle>
          <input
            id="tpose"
            type="checkbox"
            checked={forceTPose}
            onChange={(event) => {
              const checked = event.target.checked;
              setForceTPose(checked);
              if (checked) setUseRigRestPose(false);
            }}
          />
          <label htmlFor="tpose">Force clean T-pose</label>
        </Toggle>
        <Row>
          <label htmlFor="tAmount">A→T</label>
          <input
            id="tAmount"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={tPoseAmount}
            onChange={(event) => setTPoseAmount(Number(event.target.value))}
          />
          <code>{tPoseAmount.toFixed(2)}</code>
        </Row>
        <Hint>T-pose axis mapping (clean +/-90 only):</Hint>
        <Hint>{boneMapStatus}</Hint>
        <Row>
          <label htmlFor="lsAxis">LS axis</label>
          <select id="lsAxis" value={tPoseAxes.leftShoulderAxis} onChange={setTPoseAxis('leftShoulderAxis')}>
            <option value="x">x</option>
            <option value="y">y</option>
            <option value="z">z</option>
          </select>
          <button type="button" onClick={toggleTPoseSign('leftShoulderSign')}>
            {tPoseAxes.leftShoulderSign > 0 ? '+90' : '-90'}
          </button>
        </Row>
        <Row>
          <label htmlFor="lsDeg">LS deg</label>
          <input
            id="lsDeg"
            type="range"
            min={0}
            max={120}
            step={1}
            value={tPoseAxes.leftShoulderDeg}
            onChange={setTPoseDeg('leftShoulderDeg')}
          />
          <code>{tPoseAxes.leftShoulderDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="luAxis">LU axis</label>
          <select id="luAxis" value={tPoseAxes.leftUpperArmAxis} onChange={setTPoseAxis('leftUpperArmAxis')}>
            <option value="x">x</option>
            <option value="y">y</option>
            <option value="z">z</option>
          </select>
          <button type="button" onClick={toggleTPoseSign('leftUpperArmSign')}>
            {tPoseAxes.leftUpperArmSign > 0 ? '+90' : '-90'}
          </button>
        </Row>
        <Row>
          <label htmlFor="luDeg">LU deg</label>
          <input
            id="luDeg"
            type="range"
            min={0}
            max={120}
            step={1}
            value={tPoseAxes.leftUpperArmDeg}
            onChange={setTPoseDeg('leftUpperArmDeg')}
          />
          <code>{tPoseAxes.leftUpperArmDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="rsAxis">RS axis</label>
          <select id="rsAxis" value={tPoseAxes.rightShoulderAxis} onChange={setTPoseAxis('rightShoulderAxis')}>
            <option value="x">x</option>
            <option value="y">y</option>
            <option value="z">z</option>
          </select>
          <button type="button" onClick={toggleTPoseSign('rightShoulderSign')}>
            {tPoseAxes.rightShoulderSign > 0 ? '+90' : '-90'}
          </button>
        </Row>
        <Row>
          <label htmlFor="rsDeg">RS deg</label>
          <input
            id="rsDeg"
            type="range"
            min={0}
            max={120}
            step={1}
            value={tPoseAxes.rightShoulderDeg}
            onChange={setTPoseDeg('rightShoulderDeg')}
          />
          <code>{tPoseAxes.rightShoulderDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="ruAxis">RU axis</label>
          <select id="ruAxis" value={tPoseAxes.rightUpperArmAxis} onChange={setTPoseAxis('rightUpperArmAxis')}>
            <option value="x">x</option>
            <option value="y">y</option>
            <option value="z">z</option>
          </select>
          <button type="button" onClick={toggleTPoseSign('rightUpperArmSign')}>
            {tPoseAxes.rightUpperArmSign > 0 ? '+90' : '-90'}
          </button>
        </Row>
        <Row>
          <label htmlFor="ruDeg">RU deg</label>
          <input
            id="ruDeg"
            type="range"
            min={0}
            max={120}
            step={1}
            value={tPoseAxes.rightUpperArmDeg}
            onChange={setTPoseDeg('rightUpperArmDeg')}
          />
          <code>{tPoseAxes.rightUpperArmDeg}deg</code>
        </Row>
        <Row>
          <label htmlFor="solveSide">Solve</label>
          <select
            id="solveSide"
            value={solveSide}
            onChange={(event) => setSolveSide(event.target.value as ArmSide)}
          >
            <option value="left">left</option>
            <option value="right">right</option>
          </select>
          <code>{solveSide}</code>
        </Row>
        <Actions>
          <button type="button" onClick={runSolve}>
            Solve selected side
          </button>
          <button type="button" onClick={resetAll}>
            Reset all
          </button>
          <button type="button" onClick={copySettings}>
            Copy settings
          </button>
          <a href="/">Back to homepage</a>
        </Actions>
      </Panel>

      <Viewport>
        <Canvas key={resetNonce} camera={{ position: [0, 0.8, 4], fov: 42 }}>
          <color attach="background" args={['#181513']} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 5, 4]} intensity={1.15} />
          <directionalLight position={[-4, 2, -2]} intensity={0.55} />
          <Environment preset="city" />
          <Grid args={[14, 14]} cellSize={0.5} cellThickness={0.5} sectionSize={2} sectionThickness={1} />
          <axesHelper args={[1.2]} />
          <Suspense fallback={<FallbackRobot />}>
            <RobotPreview
              key={resetNonce}
              pose={pose}
              playAnimation={playAnimation}
              forceTPose={forceTPose}
              useRigRestPose={useRigRestPose}
              tPoseAmount={tPoseAmount}
              tPoseAxes={tPoseAxes}
              hiWave={false}
              onBoneMap={setBoneMapStatus}
              solveNonce={solveNonce}
              solveSide={solveSide}
              calibrateNonce={0}
              onCalibration={setCalibration}
              onSolvedAxes={setTPoseAxes}
              dumpNonce={0}
              onBoneDump={() => {}}
            />
          </Suspense>
        </Canvas>
      </Viewport>
    </Shell>
  );
};

useGLTF.preload(MODEL_PATH);

const FallbackRobot = () => (
  <mesh position={[0, 0.6, 0]}>
    <boxGeometry args={[0.45, 1.2, 0.35]} />
    <meshStandardMaterial color="#87c6ff" />
  </mesh>
);

const Shell = styled.div`
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  background: #100d0b;
  color: #f7eddc;
`;

const Panel = styled.aside`
  padding: 1rem;
  border-right: 1px solid rgba(247, 237, 220, 0.16);
  display: grid;
  gap: 0.8rem;
  align-content: start;
  max-height: 100dvh;
  overflow: auto;
`;

const Title = styled.h1`
  font-size: 1.2rem;
`;

const Hint = styled.p`
  color: #c9baa4;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const Row = styled.div`
  display: grid;
  gap: 0.35rem;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  font-size: 0.85rem;

  input {
    width: 100%;
  }

  code {
    font-size: 0.8rem;
    color: #ffcc9b;
  }
`;

const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  button,
  a {
    border: 1px solid rgba(247, 237, 220, 0.24);
    background: rgba(247, 237, 220, 0.06);
    color: #f7eddc;
    border-radius: 0.55rem;
    padding: 0.4rem 0.55rem;
    text-decoration: none;
    font-size: 0.85rem;
    cursor: pointer;
  }
`;

const Viewport = styled.main`
  min-height: 100dvh;
`;
