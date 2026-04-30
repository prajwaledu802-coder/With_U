import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ANIM_FILES = {
  idle: '/airaa/idle.fbx',
  listening: '/airaa/listening.fbx',
  nod: '/airaa/nod.fbx',
  speaking: '/airaa/speaking.fbx',
  calming: '/airaa/calming.fbx',
  breathing: '/airaa/breathing.fbx',
};

let _engine = null;
let _preloading = false;

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (_engine) {
      cancelAnimationFrame(_engine.raf);
      try { _engine.renderer.dispose(); } catch {}
      _engine = null;
    }
  });
}

function getOrCreateEngine() {
  if (_engine) return _engine;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  // Full-body framing: pulled back, looking at mid-body
  camera.position.set(0, 0.3, 6.4);
  camera.lookAt(0, 0.3, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  renderer.setClearColor(0x000000, 0);

  // Brighter, fuller lighting so the model never appears blackish.
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb6a8ff, 1.3));
  scene.add(new THREE.AmbientLight(0xfff8ff, 0.9));

  const mainLight = new THREE.DirectionalLight(0xfff5e8, 2.1);
  mainLight.position.set(3, 5, 4);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(1024, 1024);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xe0d0ff, 1.0);
  fillLight.position.set(-3, 3, -2);
  scene.add(fillLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 1.1);
  frontLight.position.set(0, 1.8, 5);
  scene.add(frontLight);

  const keyFace = new THREE.SpotLight(0xfff0e0, 1.4, 14, Math.PI / 5, 0.7, 1);
  keyFace.position.set(0.6, 2.6, 3.2);
  scene.add(keyFace);

  const rimLight = new THREE.PointLight(0xd8c0ff, 0.8, 14);
  rimLight.position.set(0, 1, 3);
  scene.add(rimLight);

  // ── Studio: cyclorama backdrop (soft gradient wall) + circular stage ──
  const cyclo = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 9),
    new THREE.MeshStandardMaterial({
      color: 0x2a1f44,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide,
    })
  );
  cyclo.position.set(0, 0.6, -3.2);
  cyclo.receiveShadow = true;
  scene.add(cyclo);

  // Glow ring on the backdrop, behind the model — gives a "spotlight" feel
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 64),
    new THREE.MeshBasicMaterial({
      color: 0x9a6bff,
      transparent: true,
      opacity: 0.18,
    })
  );
  halo.position.set(0, 0.4, -3.05);
  scene.add(halo);

  // Circular floor stage with soft shadow
  const stage = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a1430, roughness: 0.85, metalness: 0.05 })
  );
  stage.rotation.x = -Math.PI / 2;
  stage.position.y = -1.7;
  stage.receiveShadow = true;
  scene.add(stage);

  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.ShadowMaterial({ opacity: 0.35 })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = -1.69;
  shadowDisc.receiveShadow = true;
  scene.add(shadowDisc);

  _engine = {
    scene,
    camera,
    renderer,
    mixer: null,
    clock: new THREE.Clock(),
    currentAction: null,
    currentName: null,
    animations: {},
    raf: null,
    modelLoaded: false,
    modelLoading: false,
    animsLoaded: false,
    onLoadCallbacks: [],
    // Procedural animation state
    eyeMeshes: [],
    eyelidBones: [],
    morphMeshes: [],   // meshes that have blink/smile blendshapes
    rootBone: null,
    spineBone: null,
    jawBone: null,
    headBone: null,
    leftEyeBone: null,
    rightEyeBone: null,
    blinkTimer: 0,
    blinkInterval: 3 + Math.random() * 2,
    isBlinking: false,
    blinkPhase: 0,
    breathPhase: 0,
    swayPhase: Math.random() * Math.PI * 2,
    elapsedTime: 0,
    smileTarget: 0, // 0..1 used by emotion expression
  };

  return _engine;
}

function loadFBXModel(engine) {
  if (engine.modelLoaded) {
    engine.onLoadCallbacks.forEach((cb) => cb(true));
    engine.onLoadCallbacks = [];
    return;
  }
  if (engine.modelLoading) return;
  engine.modelLoading = true;

  const loader = new FBXLoader();

  function tryLoad(url, isFallback) {
    loader.load(
      url,
      (fbx) => {
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        // Fit by HEIGHT so the FULL BODY is always visible head-to-toe.
        const heightTarget = 3.4;
        const fitScale = heightTarget / (size.y || 1);
        fbx.scale.setScalar(fitScale);

        // Force perfectly upright: clear any rotation baked into the root.
        fbx.rotation.set(0, 0, 0);

        box.setFromObject(fbx);
        box.getCenter(center);
        // Center horizontally, then anchor feet near the bottom of the frame
        fbx.position.x -= center.x;
        fbx.position.z -= center.z;
        fbx.position.y -= box.min.y;
        fbx.position.y -= heightTarget / 2; // re-center vertically around y=0

        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m) => {
                m.side = THREE.DoubleSide;
                // Brighten any near-black albedo so model never reads as a silhouette
                if (m.color && typeof m.color.r === 'number') {
                  const lum = 0.2126 * m.color.r + 0.7152 * m.color.g + 0.0722 * m.color.b;
                  if (lum < 0.18) {
                    m.color.lerp(new THREE.Color(0xf0e0d0), 0.55);
                  }
                }
                // Clamp shininess / roughness so faces aren't fully matte-black
                if ('roughness' in m && m.roughness > 0.95) m.roughness = 0.65;
                if ('metalness' in m && m.metalness > 0.6) m.metalness = 0.15;
                if ('emissive' in m && m.emissive && m.emissive.getHex() === 0x000000) {
                  m.emissive = new THREE.Color(0x1a1216);
                  m.emissiveIntensity = 0.18;
                }
                m.needsUpdate = true;
              });
            }
            // Detect eye meshes by name
            const n = (child.name || '').toLowerCase();
            if (n.includes('eye') || n.includes('iris') || n.includes('pupil') || n.includes('lash') || n.includes('eyelid')) {
              engine.eyeMeshes.push(child);
            }
            // Detect blendshape (morph target) capable meshes — used for blink + smile
            if (child.morphTargetDictionary && child.morphTargetInfluences) {
              engine.morphMeshes.push(child);
            }
          }
          // Detect bones for breathing/sway/expression
          if (child.isBone) {
            const bn = (child.name || '').toLowerCase();
            if (!engine.spineBone && (bn.includes('spine') || bn.includes('chest') || bn.includes('torso'))) {
              engine.spineBone = child;
            }
            if (!engine.rootBone && (bn.includes('hips') || bn.includes('root') || bn.includes('pelvis'))) {
              engine.rootBone = child;
            }
            if (!engine.jawBone && (bn.includes('jaw') || bn.includes('mouth'))) {
              engine.jawBone = child;
            }
            if (!engine.headBone && bn.includes('head') && !bn.includes('mesh')) {
              engine.headBone = child;
            }
            if (bn.includes('eyelid') || bn.includes('lid')) {
              engine.eyelidBones.push(child);
            }
            if (!engine.leftEyeBone && (bn.includes('lefteye') || bn === 'eye_l' || bn.includes('eye_l') || bn.includes('l_eye'))) {
              engine.leftEyeBone = child;
            }
            if (!engine.rightEyeBone && (bn.includes('righteye') || bn === 'eye_r' || bn.includes('eye_r') || bn.includes('r_eye'))) {
              engine.rightEyeBone = child;
            }
          }
        });
        engine.mixer = new THREE.AnimationMixer(fbx);
        engine.fbxRoot = fbx;

        // ── Strip root/hips/spine rotation tracks from clips ──
        // This prevents the animation mixer from ever tilting the body.
        // Mixamo uses prefixed names like "mixamorigHips", "mixamorigSpine" etc.
        const UPRIGHT_PARTS = ['hips', 'root', 'pelvis', 'spine', 'spine1', 'spine2'];
        const sanitizeClip = (clip) => {
          if (!clip) return clip;
          clip.tracks = clip.tracks.filter((track) => {
            const parts = track.name.split('.');
            const boneName = parts[0].toLowerCase();
            const prop = parts[parts.length - 1];
            // Check if this bone name CONTAINS any upright-bone keyword
            const isUprightBone = UPRIGHT_PARTS.some(p => boneName.includes(p));
            if (isUprightBone && (prop === 'quaternion' || prop === 'rotation')) {
              return false; // remove this track — prevents tilt
            }
            return true;
          });
          return clip;
        };

        // Load idle.fbx FIRST and apply it BEFORE adding to the scene.
        // This guarantees the user never sees T-pose or the tilted base FBX pose.
        const showWithIdle = () => {
          if (engine.modelLoaded) return;
          if (engine.animations.idle) {
            const idle = engine.mixer.clipAction(engine.animations.idle);
            idle.reset().setEffectiveWeight(1).play();
            engine.mixer.update(0); // snap pose to first frame of idle
            engine.currentAction = idle;
            engine.currentName = 'idle';
          } else if (fbx.animations.length > 0) {
            // Fallback: at least play whatever the FBX shipped with
            const a = engine.mixer.clipAction(fbx.animations[0]);
            a.play();
            engine.mixer.update(0);
            engine.currentAction = a;
            engine.currentName = 'base';
          }
          engine.scene.add(fbx);
          engine.modelLoaded = true;
          engine.onLoadCallbacks.forEach((cb) => cb(true));
          engine.onLoadCallbacks = [];
        };

        // Try to load idle.fbx first (the upright Female Standing Pose).
        loader.load(
          '/airaa/idle.fbx',
          (idleFbx) => {
            if (idleFbx.animations.length > 0) engine.animations.idle = sanitizeClip(idleFbx.animations[0]);
            showWithIdle();
            // Then load the rest of the animations in background
            const remaining = Object.entries(ANIM_FILES).filter(([n]) => n !== 'idle');
            let count = 0;
            const finish = () => { engine.animsLoaded = true; };
            requestAnimationFrame(() => {
              remaining.forEach(([name, path]) => {
                loader.load(
                  path,
                  (aFbx) => {
                    if (aFbx.animations.length > 0) engine.animations[name] = sanitizeClip(aFbx.animations[0]);
                    count++;
                    if (count >= remaining.length) finish();
                  },
                  undefined,
                  () => { count++; if (count >= remaining.length) finish(); }
                );
              });
            });
          },
          undefined,
          () => {
            // idle.fbx failed — show with whatever pose, but at least don't show T-pose
            showWithIdle();
            engine.animsLoaded = true;
          }
        );
      },
      undefined,
      () => {
        if (!isFallback) tryLoad('/airaa/idle.fbx', true);
        else {
          engine.onLoadCallbacks.forEach((cb) => cb(false));
          engine.onLoadCallbacks = [];
        }
      }
    );
  }

  tryLoad('/airaa/base.fbx', false);
}

// Preload function — call early so model is ready when user opens companion
export function preloadAiraModel() {
  if (_preloading) return;
  _preloading = true;
  const engine = getOrCreateEngine();
  if (engine && !engine.modelLoaded && !engine.modelLoading) {
    loadFBXModel(engine);
  }
}

export default function AiraModel3D({ animation = 'idle', stress = 10, className = '', isSpeaking = false }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = getOrCreateEngine();
    if (!engine) {
      setError(true);
      setLoading(false);
      return;
    }

    const { renderer, scene, camera, clock } = engine;
    const canvas = renderer.domElement;

    const measure = () => {
      const w = container.clientWidth || container.offsetWidth || 600;
      const h = container.clientHeight || container.offsetHeight || 480;
      return { w: Math.max(w, 320), h: Math.max(h, 320) };
    };

    let { w, h } = measure();
    renderer.setSize(w, h, false);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    // Allow pointer events so the user can rotate / zoom the camera
    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    container.appendChild(canvas);

    // Studio-style OrbitControls: rotate left/right + small tilt + zoom.
    // Disabled pan so the model stays centered like a stage subject.
    if (!engine.controls) {
      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0, 0);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 3.4;
      controls.maxDistance = 9.5;
      // Constrain vertical tilt so the user can't flip upside-down
      controls.minPolarAngle = Math.PI * 0.32;
      controls.maxPolarAngle = Math.PI * 0.62;
      // Constrain horizontal so the backdrop is always visible behind her
      controls.minAzimuthAngle = -Math.PI / 2.2;
      controls.maxAzimuthAngle =  Math.PI / 2.2;
      controls.update();
      engine.controls = controls;
    } else {
      // Re-bind to this instance's canvas after HMR / re-mount
      try { engine.controls.dispose(); } catch {}
      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0, 0);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 3.4;
      controls.maxDistance = 9.5;
      controls.minPolarAngle = Math.PI * 0.32;
      controls.maxPolarAngle = Math.PI * 0.62;
      controls.minAzimuthAngle = -Math.PI / 2.2;
      controls.maxAzimuthAngle =  Math.PI / 2.2;
      controls.update();
      engine.controls = controls;
    }

    if (engine.modelLoaded) {
      setLoading(false);
    } else {
      engine.onLoadCallbacks.push((ok) => {
        if (ok) setLoading(false);
        else { setError(true); setLoading(false); }
      });
      loadFBXModel(engine);
    }

    let mounted = true;
    function tick() {
      if (!mounted) return;
      engine.raf = requestAnimationFrame(tick);
      const dt = clock.getDelta();
      if (engine.mixer) engine.mixer.update(dt);
      if (engine.controls) engine.controls.update();

      // ── Procedural Animations ──
      engine.elapsedTime += dt;

      // Eye blinking: random interval 3-5s, blink lasts ~150ms
      engine.blinkTimer += dt;
      if (!engine.isBlinking && engine.blinkTimer >= engine.blinkInterval) {
        engine.isBlinking = true;
        engine.blinkPhase = 0;
        engine.blinkTimer = 0;
        engine.blinkInterval = 2.5 + Math.random() * 3;
      }
      if (engine.isBlinking) {
        engine.blinkPhase += dt;
        const blinkDuration = 0.18;
        const halfBlink = blinkDuration / 2;
        let closure = 0; // 0 = open, 1 = closed
        if (engine.blinkPhase < halfBlink) {
          closure = engine.blinkPhase / halfBlink;
        } else if (engine.blinkPhase < blinkDuration) {
          closure = 1 - (engine.blinkPhase - halfBlink) / halfBlink;
        } else {
          closure = 0;
          engine.isBlinking = false;
        }
        const scaleY = Math.max(0.01, 1 - closure * 0.95);

        // 1) Eye meshes — squash on Y
        engine.eyeMeshes.forEach((mesh) => { mesh.scale.y = scaleY; });

        // 2) Blendshapes — common names: blink, eyesClosed, eyeBlinkLeft/Right
        engine.morphMeshes.forEach((mesh) => {
          const dict = mesh.morphTargetDictionary;
          const inf = mesh.morphTargetInfluences;
          ['blink', 'Blink', 'eyesClosed', 'eyeBlink', 'eyeBlinkLeft', 'eyeBlinkRight', 'EyeBlinkLeft', 'EyeBlinkRight'].forEach((key) => {
            if (dict && key in dict) inf[dict[key]] = closure;
          });
        });

        // 3) Eyelid bones — rotate down to close
        engine.eyelidBones.forEach((b) => {
          b.rotation.x = closure * 0.7;
        });
      }

      // Breathing: very subtle chest/spine oscillation (keeps the body alive without slumping)
      if (engine.spineBone) {
        engine.breathPhase += dt * 0.8;
        const breathScale = 1 + Math.sin(engine.breathPhase) * 0.008;
        engine.spineBone.scale.set(breathScale, breathScale, breathScale);
      }

      // POSTURE SAFETY NET: even after stripping rotation tracks from clips,
      // force root and spine to stay perfectly upright every frame.
      if (engine.fbxRoot) {
        engine.fbxRoot.rotation.x = 0;
        engine.fbxRoot.rotation.z = 0;
      }
      if (engine.rootBone) {
        engine.rootBone.rotation.x = 0;
        engine.rootBone.rotation.z = 0;
      }
      if (engine.spineBone) {
        engine.spineBone.rotation.x = 0;
        engine.spineBone.rotation.z = 0;
      }

      // Procedural Lip Sync
      if (engine.isSpeakingModel) {
        // Fast rhythm to simulate talking
        const mouthOpen = Math.max(0, Math.sin(engine.elapsedTime * 18)) * 0.12; 
        if (engine.jawBone) {
          engine.jawBone.rotation.x = mouthOpen;
        } else if (engine.headBone) {
          // Fallback: bob head slightly if no jaw found
          const headBob = Math.sin(engine.elapsedTime * 15) * 0.015;
          engine.headBone.rotation.x = headBob;
        }
      } else {
        if (engine.jawBone) engine.jawBone.rotation.x = THREE.MathUtils.lerp(engine.jawBone.rotation.x, 0, 0.2);
        if (engine.headBone) engine.headBone.rotation.x = THREE.MathUtils.lerp(engine.headBone.rotation.x, 0, 0.1);
      }

      // Facial expression via blendshapes (smile, frown) driven by stress
      if (engine.morphMeshes.length) {
        const smile = engine.smileTarget;
        engine.morphMeshes.forEach((mesh) => {
          const dict = mesh.morphTargetDictionary;
          const inf = mesh.morphTargetInfluences;
          if (!dict || !inf) return;
          ['mouthSmile', 'Smile', 'smile', 'mouthSmileLeft', 'mouthSmileRight'].forEach((key) => {
            if (key in dict) inf[dict[key]] = THREE.MathUtils.lerp(inf[dict[key]] || 0, smile, 0.05);
          });
          ['mouthFrown', 'Frown', 'frown', 'browDown', 'browDownLeft', 'browDownRight'].forEach((key) => {
            if (key in dict) inf[dict[key]] = THREE.MathUtils.lerp(inf[dict[key]] || 0, Math.max(0, -smile), 0.05);
          });
        });
      }

      renderer.render(scene, camera);
    }
    tick();

    const ro = new ResizeObserver(() => {
      if (!mounted) return;
      const m = measure();
      camera.aspect = m.w / m.h;
      camera.updateProjectionMatrix();
      renderer.setSize(m.w, m.h, false);
    });
    ro.observe(container);

    return () => {
      mounted = false;
      ro.disconnect();
      cancelAnimationFrame(engine.raf);
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, []);

  /* Animation switching */
  useEffect(() => {
    if (!_engine || !_engine.mixer || !_engine.animsLoaded) return;
    if (_engine.currentName === animation) return;
    const clip = _engine.animations[animation];
    if (!clip) return;

    const newAction = _engine.mixer.clipAction(clip);
    const current = _engine.currentAction;
    newAction.reset().setEffectiveWeight(1).play();
    if (current && current !== newAction) {
      current.crossFadeTo(newAction, 0.4, true);
      const stale = current;
      setTimeout(() => { try { stale.stop(); } catch {} }, 500);
    }
    _engine.currentAction = newAction;
    _engine.currentName = animation;
  }, [animation]);

  /* Sync isSpeaking state to engine for procedural lip-sync */
  useEffect(() => {
    if (_engine) {
      _engine.isSpeakingModel = isSpeaking;
    }
  }, [isSpeaking]);

  /* Lighting tint + facial expression target by stress */
  useEffect(() => {
    if (!_engine) return;
    const mainLight = _engine.scene.children.find(
      (c) => c.isDirectionalLight && c.position.x > 0
    );
    if (mainLight) {
      let color;
      if (stress <= 20) color = new THREE.Color(0xfff0d8);
      else if (stress <= 40) color = new THREE.Color(0xf5e8d0);
      else if (stress <= 70) color = new THREE.Color(0xf5d0c0);
      else color = new THREE.Color(0xf5c0c0);
      mainLight.color.lerp(color, 0.18);
    }
    // Smile when calm, neutral mid-range, slight frown when stressed
    if (stress <= 20) _engine.smileTarget = 0.55;
    else if (stress <= 50) _engine.smileTarget = 0.2;
    else if (stress <= 80) _engine.smileTarget = -0.15;
    else _engine.smileTarget = -0.35;
  }, [stress]);

  return (
    <div
      className={`aira-canvas-container ${className}`}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 420 }}
    >
      <div
        className={`aira-glow-ring ${isSpeaking ? 'aira-glow-speaking' : ''}`}
        style={{ pointerEvents: 'none' }}
      />
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden' }}
      />

      {loading && !error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              border: '2px solid rgba(167,139,250,0.25)',
              borderTopColor: 'rgba(167,139,250,0.95)',
              animation: 'spin 1s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: 'rgba(196,181,253,0.7)', letterSpacing: '0.1em' }}>
              With_U is here…
            </span>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}>
          <div className="aira-fallback-orb" />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
