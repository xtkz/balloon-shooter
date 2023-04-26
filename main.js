import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import bgVertex from './shaders/bg/vertex.glsl'
import bgFragment from './shaders/bg/fragment.glsl'
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {pointerEventToNDCVector2} from "./utils/utils.js";
import TouchCaster from "./utils/TouchCaster.js";
import TargetBalloon from "./objects/TargetBalloon.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";
import EventEmitter from "./utils/EventEmitter.js";
import {EVENTS} from "./utils/const.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(3))

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
// const dirLiHelper = new THREE.DirectionalLightHelper( directionalLight, .5 );
directionalLight.position.set (1, 3, 1)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(
  directionalLight,
  // dirLiHelper,
  ambientLight,
)

/**
 * Target group
 */
const targetGroup = new THREE.Group();
scene.add(targetGroup);

/**
 * Test instance balloon
 */
const spreadRadius = 1;
for (let i = 0; i < 6; i++) {
  const newX = (Math.random() * 2 - 1) * spreadRadius;
  const newZ = (Math.random() * 2 - 1) * spreadRadius;
  new TargetBalloon(new THREE.Vector3(newX, -5,newZ), targetGroup)
}
// const balloon1 = new TargetBalloon(new THREE.Vector3(1, -5,1), targetGroup)
// const balloon2 = new TargetBalloon(new THREE.Vector3(-1, -5,1), targetGroup)
// const balloon3 = new TargetBalloon(new THREE.Vector3(1, -5,-1), targetGroup)
// const balloon4 = new TargetBalloon(new THREE.Vector3(-1, -5,-1), targetGroup)

/**
 * 3D Background
 */
const bgMaterial = new THREE.ShaderMaterial({
  vertexShader: bgVertex,
  fragmentShader: bgFragment,
  uniforms: {
    uTopColor: {value: new THREE.Color('#2683ec')},
    uBottomColor: {value: new THREE.Color('#ffffff')},
  }
}
);
bgMaterial.side = THREE.BackSide;

const bg = new THREE.Mesh(
  new THREE.IcosahedronGeometry(7,3),
  bgMaterial
)
// bg.scale.set(10,10,10)
scene.add(bg)


const canvas = document.querySelector('canvas.webgl')

const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.01,20)
camera.position.set(0,0,4)
const orbitControls = new OrbitControls( camera, canvas );
orbitControls.enablePan = false;
orbitControls.enableZoom = false;
orbitControls.update();
scene.add(camera)


/**
 * Renderer setup
 * @type {WebGLRenderer}
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
// renderer.render(scene, camera)

/**
 * postProcessing
 */
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 3));

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const outlinePass = new OutlinePass( new THREE.Vector2(sizes.width, sizes.height), scene, camera );
effectComposer.addPass(outlinePass);

// Outline settings
outlinePass.edgeThickness = 15;
outlinePass.edgeGlow = 5;
outlinePass.edgeStrength = 2;
outlinePass.visibleEdgeColor.set('#ffffff');
outlinePass.hiddenEdgeColor.set('#190a05');

outlinePass.selectedObjects = [bg]


/**
 * Frame redraw loop
 */
const newFrame = () => {
  
  orbitControls.update();
  
  // Re-Render frame
  effectComposer.render(scene, camera)
  
  // Make it loop
  window.requestAnimationFrame(newFrame)
  
  for (const child of targetGroup.children) {
    child.update2()
  }
}
newFrame()

/**
 * Window resizes
 */
window.addEventListener('resize', () => {
  
  // Sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  
  // Camera
  camera.aspect = sizes.width/sizes.height;
  camera.updateProjectionMatrix();
  
  // Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.getPixelRatio(Math.min(window.devicePixelRatio, 3));
})

const touchCaster = new TouchCaster()

window.addEventListener('pointerdown', (event) =>{
  const coords = pointerEventToNDCVector2(event, sizes)
  touchCaster.hitNearest(coords, camera, targetGroup.children)
})

const unTouchIfBalloon = (outline) => {
  const previous = outline.selectedObjects[0]
  if (previous instanceof TargetBalloon) {
    previous.unTouch()
  }
}

const eventEmitter = new EventEmitter()
eventEmitter.e.on(EVENTS.balloonFirstHit, (pLoad) => {
  unTouchIfBalloon(outlinePass)
  outlinePass.selectedObjects = [pLoad.payload]
})
eventEmitter.e.on(EVENTS.hitMiss, () => {
  unTouchIfBalloon(outlinePass)
  outlinePass.selectedObjects = []
})