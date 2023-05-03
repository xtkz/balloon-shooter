import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import EventEmitter from "../utils/EventEmitter.js";
import {EVENTS, SETTINGS} from "../utils/const.js";
import GameObject from "./GameObject.js";
import {gsap} from "gsap";
import { CustomEase } from "gsap/CustomEase";
import Counter from "../utils/Counter.js";
import {useMode, modeLch, modeRgb, serializeHex} from 'culori/fn';


gsap.registerPlugin(CustomEase)
const rgb = useMode(modeRgb);
const lch = useMode(modeLch);
let colorAngle

export default class TargetBalloon extends GameObject {
  constructor( model, mixer, vector3, targetGroup, name ) {
    super();
    this.isTarget = true;
    this.name = name;
    this.resetTouches();
    this.resetColor();
    this.model = SkeletonUtils.clone(model.scene)
    this.eventEmitter = new EventEmitter();
    
    this.counter = new Counter()
    
    this.personalRandom = Math.sqrt(1-(Math.random()-1)**2)
    this.floatDuration = THREE.MathUtils.lerp(SETTINGS.minFloatDuration, SETTINGS.maxFloatDuration, this.personalRandom)
    colorAngle = Math.round(((this.counter.getBorn()+1.5) * 3/13 * 240) % 240 + 300) % 360;
    console.log(`§ colorAngle ${colorAngle}`)
    this.personalColor = serializeHex(rgb(lch(`lch(61% 49 ${colorAngle})`)))
    
    this.add(
      this.model.children[0],
      this.model.children[1],
    )
    this.children[0].material = this.children[0].material.clone()
    this.children[0].material.transparent = true;
    this.children[0].material.opacity = 0;
    this.children[0].material.color.set(new THREE.Color(this.personalColor))
    this.children[0].material.emissive.set( 0x000000 )
    
    this.position.set(vector3.x, vector3.y, vector3.z);
    this.mixer = mixer;
    this.action = this.mixer.clipAction(model.animations[0], this )
    this.action.play()
    this.scale.set(SETTINGS.balloonScale, SETTINGS.balloonScale, SETTINGS.balloonScale)
    this.targetGroup = targetGroup;
    
    this.mainGSAP = null
  }
  
    // this.position.set(
    //   (Math.random() - 0.5) * 2 * spread,
    //   (Math.random() - 0.5) * 2 * spread,
    //   (Math.random() - 0.5) * 2 * spread
    // )
    // this.resetColor()
    // targetGroup.add(this)
  
  resetColor() {
    // this.material.color.set('#b73720')
  }
  
  resetTouches() {
    this.touches = 0;
    this.allreadyTouched = false;
  }
  
  unTouch() {
    this.resetTouches()
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
    this.children[0].material.emissive.set( 0xaaaaaa )
    gsap.fromTo(this.children[0].material, {emissiveIntensity: 1},{emissiveIntensity: 0, duration: 1, ease: 'power4.in', onComplete: () => {
      this.resetTouches();
        this.children[0].material.emissive.set( 0x000000 );
      }})
    this.eventEmitter.e.emit(EVENTS.balloonFirstHit, {payload: this})
    
  }
  secondHit() {
    this.destruct()
    this.eventEmitter.e.emit(EVENTS.balloonPop, {payload: this})
  }
  
  isFirstBalloon() {
    return this.name === 'firstBalloon'
  }
  
  appear() {
    this.counter.newBorn()
    this.targetGroup.add(this);
    if (this.isFirstBalloon()) {
      gsap.fromTo(this.position,
        { x:0,y:-3,z:0 },
        { x: 0, y: 0, z: 0,
          duration: 3,
          delay: 0.4,
          ease: CustomEase.create("custom", "M0,0 C0.02,0.4 0.184,1.152 0.288,1.152 0.438,1.152 0.348,1 1,1 ")}
      )
      gsap.to(this.children[0].material, {opacity: 1, duration: 1, delay: 0.4})
    } else {
      this.mainGSAP = gsap.to(this.position, {y: SETTINGS.highestPoint, duration: this.floatDuration, onComplete: () => {
        this.destruct()
        }})
      gsap.to(this.children[0].material, {opacity: 1, duration: 0.3})
      
    }
  }
  
  destruct() {
    this.mainGSAP && this.mainGSAP.kill()
    this.action.stop()
    this.targetGroup.remove(this)
    this.counter.newDeath()
    // this.targetGroup.parent.remove(this.ropeObj)
  }
  
  update2(deltaTime, time) {
    // this.mixer.update(deltaTime/1000)
    
  }
}