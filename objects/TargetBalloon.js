import * as THREE from 'three'
import EventEmitter from "../utils/EventEmitter.js";
import {EVENTS} from "../utils/const.js";

export default class TargetBalloon extends THREE.Mesh {
  constructor(vector3, targetGroup) {
    super(
      new THREE.IcosahedronGeometry(0.3, 2),
      new THREE.MeshStandardMaterial({flatShading: true})
    )
    this.resetTouches();
    this.position.set(vector3.x, vector3.y, vector3.z);
    this.eventEmitter = new EventEmitter();
    this.resetColor()
    this.targetGroup = targetGroup;
    this.targetGroup.add(this)
    
    this.personalRandom = Math.sqrt(1-(Math.random()-1)**2)
    
  }
  
    // this.position.set(
    //   (Math.random() - 0.5) * 2 * spread,
    //   (Math.random() - 0.5) * 2 * spread,
    //   (Math.random() - 0.5) * 2 * spread
    // )
    // this.resetColor()
    // targetGroup.add(this)
  
  resetColor() {
    this.material.color.set('#b73720')
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
    this.eventEmitter.e.emit(EVENTS.balloonFirstHit, {payload: this})
    
  }
  secondHit() {
    this.destruct()
    this.eventEmitter.e.emit(EVENTS.balloonPop, {payload: this})
  }
  
  destruct() {
    this.targetGroup.remove(this)
    this.geometry.dispose()
    this.material.dispose()
  }
  
  update2(time) {
    if (this.position.y < 5) {
      this.position.y  = time * this.personalRandom - 5
    } else {
      this.destruct()
    }
  }
}