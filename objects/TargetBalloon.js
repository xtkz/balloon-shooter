import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {EVENTS, SETTINGS} from "../utils/const.js";
import GameObject from "./GameObject.js";
import {gsap} from "gsap";
import { CustomEase } from "gsap/CustomEase";
import {useMode, modeLch, modeRgb, serializeHex} from 'culori/fn';

gsap.registerPlugin(CustomEase)

const rgb = useMode(modeRgb);
const lch = useMode(modeLch);
let colorAngle

export default class TargetBalloon extends GameObject {
  constructor( model, mixer, vector3, targetGroup, name ) {
    super(targetGroup);
    
    this.isTarget = true;
    this.name = name;
    this.resetTouches();
    
    this.model = SkeletonUtils.clone(model.scene);
    
    // Over-engineered random color selection powered by culorijs.org & inspired by lch.oklch.com
    colorAngle = Math.round(((this.counter.born+1.5) * 3/13 * 240) % 240 + 300) % 360;
    this.personalColor = serializeHex(rgb(lch(`lch(55% 55 ${colorAngle})`)))
    
    this.add(
      this.model.children[0],
      this.model.children[1],
    )
    // Setting up material
    this.children[0].material = this.children[0].material.clone();
    this.children[0].material.transparent = true;
    this.children[0].material.opacity = 0;
    this.children[0].material.color.set(new THREE.Color(this.personalColor));
    this.children[0].material.emissive.set( 0x000000 );
    
    this.position.set(vector3.x, vector3.y, vector3.z);
    
    // Setting up rope animation
    this.mixer = mixer;
    this.action = this.mixer.clipAction(model.animations[0], this);
    this.action.play();
    
    this.scale.set(SETTINGS.balloonScale, SETTINGS.balloonScale, SETTINGS.balloonScale);
    
  }
  
  resetTouches() {
    this.touches = 0;
    this.allreadyTouched = false;
  }
  
  getHit() {
    this.touches++
    if (!this.allreadyTouched) {
      this.allreadyTouched = true;
    }
    switch (this.touches) {
      case 1:
        this.firstHit()
        break;
      case 2:
        this.secondHit()
        break;
    }
  }
  firstHit() {
    this.children[0].material.emissive.set( 0xaaaaaa );
    gsap.fromTo(this.children[0].material, {emissiveIntensity: 1},{emissiveIntensity: 0, duration: 1, ease: 'power4.in', onComplete: () => {
      this.resetTouches();
        this.children[0].material.emissive.set( 0x000000 );
      }});
    this.eventEmitter.e.emit(EVENTS.balloonFirstHit, {payload: this});
    
  }
  secondHit() {
    console.log(`§ secondHit ${112}`);
    console.log(this);
    this.destruct();
    this.eventEmitter.e.emit(EVENTS.balloonPop, {payload: this});
  }
  
  isFirstBalloon() {
    return this.name === 'firstBalloon'
  }
  
  appear() {
    this.counter.newBorn();
    super.appear();
    if (this.isFirstBalloon()) {
      gsap.fromTo(this.position,
        { x:0,y:-3,z:0 },
        {
          x: 0, y: 0, z: 0,
          duration: 3,
          delay: 0.4,
          ease: CustomEase.create("custom", "M0,0 C0.02,0.4 0.184,1.152 0.288,1.152 0.438,1.152 0.348,1 1,1 ")}
      )
      gsap.to(this.children[0].material, {opacity: 1, duration: 1, delay: 0.4});
    } else {
      this.mainGSAP = gsap.to(this.position, {y: SETTINGS.highestPoint, duration: this.floatDuration, onComplete: () => {
        this.destruct()
        }})
      gsap.to(this.children[0].material, {opacity: 1, duration: 0.3})
      
    }
  }
  
  destruct() {
    this.mainGSAP && this.mainGSAP.kill();
    this.action.stop();
    super.destruct();
    this.counter.newDeath();
  }
}