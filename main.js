import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import bgVertex from './shaders/bg/vertex.glsl'
import bgFragment from './shaders/bg/fragment.glsl'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const scene = new THREE.Scene()
// scene.add(new THREE.AxesHelper(3))

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
const dirLiHelper = new THREE.DirectionalLightHelper( directionalLight, .5 );
directionalLight.position.set (1, 3, 1)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(
  directionalLight,
  // dirLiHelper,
  ambientLight,
)


/**
 * TestMesh
 */
const mesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1,5),
  new THREE.MeshStandardMaterial({color: '#b73720', flatShading: true})
)
scene.add(mesh)

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
  new THREE.IcosahedronGeometry(0.5,3),
  bgMaterial
)
bg.scale.set(10,10,10)
scene.add(bg)


const canvas = document.querySelector('canvas.webgl')

const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.01,20)
camera.position.set(0,0,4)
const controls = new OrbitControls( camera, canvas );
controls.update();
scene.add(camera)


/**
 * Renderer setup
 * @type {WebGLRenderer}
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
// renderer.render(scene, camera)

/**
 * Frame redraw loop
 */
const newFrame = () => {
  
  controls.update();
  
  // Re-Render frame
  renderer.render(scene, camera)
  
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