import * as THREE from "three";
import EventEmitter from "../utils/EventEmitter.js";
import Counter from "../utils/Counter.js";
import {SETTINGS} from "../utils/const.js";

export default class GameObject extends THREE.Object3D {
  constructor(group) {
    super();
    
    this.isTarget = false;
    
    this.group = group;
    
    this.eventEmitter = new EventEmitter();
    
    this.counter = new Counter()
    
    this.personalRandom = (Math.random() + Math.sqrt(1-Math.pow(Math.random()-1,2))) / 2
    this.floatDuration = THREE.MathUtils.lerp(SETTINGS.minFloatDuration, SETTINGS.maxFloatDuration, this.personalRandom)
    
    this.mainGSAP = null
  }
  
  appear() {
    this.group.add(this);
  }
  
  destruct() {
    this.group.remove(this);
    
  }
}