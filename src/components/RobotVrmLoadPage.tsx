import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Box3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import type { VRM } from '@pixiv/three-vrm';

const MODEL_PATH = '/robot.vrm';

type LoadState = 'initializing' | 'loading' | 'loaded' | 'error';

export const RobotVrmLoadPage = () => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<LoadState>('initializing');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const mount = viewportRef.current;
    if (!mount) return;

    let rafId = 0;
    const scene = new Scene();
    scene.background = new Color('#181513');

    const camera = new PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 1.2, 4.2);

    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = 'srgb';
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.8, 0);

    const hemi = new HemisphereLight('#ffffff', '#3f3028', 0.95);
    scene.add(hemi);
    const key = new DirectionalLight('#ffffff', 1.4);
    key.position.set(5, 6, 4);
    scene.add(key);
    const fill = new DirectionalLight('#ffe3c8', 0.55);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    let loadedVrm: VRM | null = null;
    setState('loading');
    loader.load(
      MODEL_PATH,
      (gltf) => {
        const vrm = (gltf.userData as { vrm?: VRM }).vrm ?? null;
        if (vrm) {
          loadedVrm = vrm;
          VRMUtils.rotateVRM0(vrm);
        }
        const model = (vrm?.scene ?? gltf.scene) as Group;
        scene.add(model);

        // Auto-fit model into camera view to avoid off-screen loads.
        const bounds = new Box3().setFromObject(model);
        const size = bounds.getSize(new Vector3());
        const height = Math.max(size.y, 0.0001);
        const scale = 1.8 / height;
        model.scale.setScalar(scale);
        const scaledBounds = new Box3().setFromObject(model);
        const scaledCenter = scaledBounds.getCenter(new Vector3());
        model.position.x -= scaledCenter.x;
        model.position.z -= scaledCenter.z;
        model.position.y -= scaledBounds.min.y;

        controls.target.set(0, 0.9, 0);
        controls.update();
        setState('loaded');
      },
      (event) => {
        if (!event.total) return;
        setProgress((event.loaded / event.total) * 100);
      },
      (error) => {
        const message = error instanceof Error ? error.message : 'Unknown loader error';
        setErrorMessage(message);
        setState('error');
      },
    );

    let lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;
      loadedVrm?.update(deltaSec);
      controls.update();
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <Shell>
      <Panel>
        <h1>VRM Load Test</h1>
        <p>
          Status: <strong>{state}</strong>
        </p>
        {state === 'loading' ? <p>Progress: {progress.toFixed(1)}%</p> : null}
        {state === 'error' ? <ErrorText>{errorMessage || 'Failed to load model.'}</ErrorText> : null}
        <p>Model path: {MODEL_PATH}</p>
        <a href="/?robotStudio=1">Back to robotStudio</a>
      </Panel>
      <Viewport ref={viewportRef} />
    </Shell>
  );
};

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
  align-content: start;
  gap: 0.7rem;

  h1 {
    font-size: var(--font-size-lg);
  }

  p,
  a {
    font-size: var(--font-size-sm-plus);
    color: #e9dcc9;
  }
`;

const ErrorText = styled.p`
  color: #ff9c8b;
`;

const Viewport = styled.main`
  min-height: 100dvh;
`;
