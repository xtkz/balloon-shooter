import * as THREE from "three";
import explosionVertexCommon from "../shaders/explosion/vertexCommon.glsl";
import explosionVertexBegin from "../shaders/explosion/vertexBegin.glsl";
import explosionFragment from "../shaders/explosion/fragmentDiffuse.glsl";
import {SETTINGS} from "../utils/const.js";
import { gsap } from 'gsap';
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase)

export default class ExplosionParticles {
  constructor() {
    // Geometry
    const particlesGeometry = new THREE.IcosahedronGeometry(1, 8)
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.04,
      sizeAttenuation: true,
    })
    particlesMaterial.color = new THREE.Color('#b73720')
    particlesMaterial.transparent = true;
    particlesMaterial.opacity = 0
    
    // Modifying Shader
    particlesMaterial.onBeforeCompile = (shader) =>
    {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        '#include <common>' + explosionVertexCommon
      )
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>' + explosionVertexBegin
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        explosionFragment
      )
    }
    
    // assemble and setup
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    // hide it far away
    particles.position.set(100,100,100)
    
    particles.scale.set(SETTINGS.particleScale, SETTINGS.particleScale, SETTINGS.particleScale)
    
    this.p = particles
    
    // Setup animation scale
    this.scaleAinm = gsap.fromTo(this.p.scale,
      {x: SETTINGS.particleScale, y: SETTINGS.particleScale, z: SETTINGS.particleScale,},
      { duration: 0.94, x:1,y:1,z:1, ease: 'expo.out'}
    )
    
    // Setup animation opacity
    this.opacityAnim = gsap.fromTo(this.p.material,
      {opacity: 1},
      {
        opacity: 0,
        duration: 0.9,
        ease: CustomEase.create("custom", "M0,1,C0,0.202,0.014,0,0.1,0,0.188,0,0.374,1,1,1"),
        onComplete: () => {
          this.p.position.set(100,100,100)
        }
      }
    )
    
    // Animation prepare to play
    this.scaleAinm.pause(0)
    this.opacityAnim.pause(0)
  }
  
  
  
  explode() {
    this.p.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    )
    this.scaleAinm.restart()
    this.opacityAnim.restart()
  }
  
}
