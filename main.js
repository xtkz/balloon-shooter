import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import bgVertex from './shaders/bg/vertex.glsl'
import bgFragment from './shaders/bg/fragment.glsl'
import {pointerEventToNDCVector2} from "./utils/utils.js";
import TouchCaster from "./utils/TouchCaster.js";
import TargetBalloon from "./objects/TargetBalloon.js";
import EventEmitter from "./utils/EventEmitter.js";
import {EVENTS, SETTINGS} from "./utils/const.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { gsap } from 'gsap';
import { CustomEase } from "gsap/CustomEase";
import ExplosionParticles from "./objects/ParticleExplosion.js";
import {zzfx} from 'zzfx'
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import Counter from "./utils/Counter.js";

gsap.registerPlugin(CustomEase)

let counter = new Counter();
let firstBalloonPopped = false;

// DOM acquisition
const canvas = document.querySelector('canvas.webgl')
const button = document.querySelector("#button-start")
const score = document.querySelector('div.score')
const endScreen = document.querySelector('div.endScreen')

// FPS counter
const stats = new Stats();
document.body.appendChild( stats.dom );

// Initial window Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Creating a scene
const scene = new THREE.Scene()
// scene.add(new THREE.AxesHelper(3))


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set (3, 8, 3)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

const hemisphereLight = new THREE.HemisphereLight( 0x000000, 0xffffff, 0.3 );

scene.add(
  directionalLight,
  // dirLiHelper,
  ambientLight,
  hemisphereLight,
)


/**
 * Target group
 */
const targetGroup = new THREE.Group();
scene.add(targetGroup);


/**
 * Loader
 */
const gltfLoader = new GLTFLoader()
let balloonModel
let ropeMixer
gltfLoader.load(
  './models/Balloon.glb',
  (gltf) =>
  {
    // console.log('gltfLoader success')
    ropeMixer = new THREE.AnimationMixer(gltf);
    makeFirstBalloon(gltf, ropeMixer)
    balloonModel = gltf
  },
  (progress) =>
  {
    console.log('gltfLoader progress')
    console.log(progress)
  },
  (error) =>
  {
    console.log('gltfLoader error')
    console.log(error)
  }
)

/**
 * Making Balloons
 */
let firstBalloon
const makeFirstBalloon = (model, mixer) => {
  firstBalloon = new TargetBalloon(model, mixer, new THREE.Vector3(0, -3, 0), targetGroup, 'firstBalloon')
}

const makeNextBalloon = (model, mixer) => {
  const currentRadius = Math.sqrt(1-(Math.random()-1)**2) * SETTINGS.spreadRadius
  const angle = 2 * Math.PI * (5/13) * counter.getBorn();
  const newX = Math.cos(angle) * currentRadius;
  const newZ = Math.sin(angle) * currentRadius;
  const nextBalloon = new TargetBalloon(
    model,
    mixer,
    new THREE.Vector3(
      newX,
      SETTINGS.lowestPoint,
      newZ),
    targetGroup,
    `balloon${counter.getBorn()}`)
  nextBalloon.appear()
}


/**
 * Particles
 */
const particles = new ExplosionParticles();
scene.add(particles.p);


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
});
bgMaterial.side = THREE.BackSide;

const bg = new THREE.Mesh(
  new THREE.SphereGeometry(7,16,16),
  bgMaterial
)
scene.add(bg);

/**
 * Camera
 * @type {PerspectiveCamera}
 */
const camera = new THREE.PerspectiveCamera(45,sizes.width/sizes.height,0.01,20)
camera.position.set(0,0,7.9);
// Orbit control settings (for dragging around)
const orbitControls = new OrbitControls( camera, canvas );
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.1;
orbitControls.enablePan = false;
orbitControls.enableZoom = false;
orbitControls.maxAzimuthAngle = Math.PI/2;
orbitControls.minAzimuthAngle = -Math.PI/2;
orbitControls.maxPolarAngle = Math.PI * 3/4;
orbitControls.minPolarAngle = Math.PI * 1/4;
orbitControls.update();
// orbitControls.enabled = false;

scene.add(camera);


/**
 * Renderer setup
 * @type {WebGLRenderer}
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
// renderer.setClearAlpha(0.0);
renderer.render(scene, camera);

/**
 * Frame redraw loop
 */
// const clock = new THREE.Clock();
let time = Date.now();

let period = SETTINGS.maxPeriodMillis;
let periodCollector = 0;

const newFrame = () => {
  stats.begin();
  
  //Time calculation
  const currentTime = Date.now()
  const deltaTime = currentTime - time
  time = currentTime
  
  orbitControls.update();
  
  if (firstBalloonPopped && counter.getBorn() < SETTINGS.totalBalloons) {
    periodCollector += deltaTime;
  }
  
  if (periodCollector > period) {
    makeNextBalloon(balloonModel, ropeMixer)
    periodCollector = 0;
    if (period > SETTINGS.minPeriodMillis) {
      period = period / SETTINGS.periodSpedUpCoefficient
    }
  }
  
  // Re-Render frame
  renderer.render(scene, camera)
  
  // Updating balloon rope mixer
  ropeMixer && ropeMixer.update(deltaTime/1000)
  
  stats.end();
  
  // Make it loop
  window.requestAnimationFrame(newFrame)
  
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

/**
 * Raycast on pointer event
 * @type {TouchCaster}
 */
const touchCaster = new TouchCaster();

window.addEventListener('pointerdown', (event) =>{
  const coords = pointerEventToNDCVector2(event, sizes)
  touchCaster.hitNearest(coords, camera, targetGroup.children)
  
})


window.onload = function() {
  button.style.visibility = "visible";
}
button.onclick = () => {eventEmitter.e.emit(EVENTS.gameStart, {value: 'start'})}

/**
 * Events
 * @type {EventEmitter}
 */
const eventEmitter = new EventEmitter()

eventEmitter.e.on(EVENTS.gameStart, () => {
  firstBalloon.appear();
  button.style.display = 'none';
  score.style.visibility = "visible";
  
})

eventEmitter.e.on(EVENTS.balloonFirstHit, () => {
  zzfx(...[1,.2,500,.03,.04,.3,0,2,0,0,567,.02,0,0,0,0,0,1.2,0,.5]); // Loaded Sound 42
})

eventEmitter.e.on(EVENTS.balloonPop, (pLoad) => {
  particles.p.position.set(pLoad.payload.position.x, pLoad.payload.position.y, pLoad.payload.position.z)
  particles.explode()
  zzfx(...[1,.2,440,0,.02,.5,4,1.15,-1,0,-100,.15,0,.7,0,.1]); // Loaded Sound 41
  if (pLoad.payload === firstBalloon) {
    makeNextBalloon(balloonModel, ropeMixer);
    firstBalloonPopped = true;
  }
  
  score.innerText = String(Number(score.textContent) + 1).padStart(2, "0")
})

// eventEmitter.e.on(EVENTS.hitMiss, () => {
//
// })

eventEmitter.e.on(EVENTS.gameEnd, () => {
  score.style.visibility = "hidden";
  console.log(score.innerText)
  endScreen.innerText = String(`${score.innerHTML} / ${counter.getBorn()}`)
  endScreen.style.visibility = "visible";
})