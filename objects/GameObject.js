import * as THREE from "three";

export default class GameObject extends THREE.Object3D {
  constructor() {
    super();
    
    this.isTarget = false
  }
}