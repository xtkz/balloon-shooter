import * as THREE from 'three'
import EventEmitter from "./EventEmitter.js";
import {EVENTS} from "./const.js";
export default class TouchCaster {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.eventEmitter = new EventEmitter()
  }
  hitNearest(coordinates, camera, objArray) {
    this.raycaster.setFromCamera(coordinates, camera)
    
    const intersects = this.raycaster.intersectObjects(objArray)
    if (intersects.length > 0) {
      intersects[0].object.getHit()
    } else {
      console.log(`Nothing to hit`)
      this.eventEmitter.e.emit(EVENTS.hitMiss, {payload: null})
    }
  }
}