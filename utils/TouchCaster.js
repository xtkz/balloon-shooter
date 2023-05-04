import * as THREE from 'three'
export default class TouchCaster {
  constructor() {
    this.raycaster = new THREE.Raycaster();
  }
  hitNearest(coordinates, camera, objArray) {
    this.raycaster.setFromCamera(coordinates, camera)
    
    const intersects = this.raycaster.intersectObjects(objArray)
    if (intersects.length > 0) {
      if (intersects[0].object.parent.isTarget) {
        intersects[0].object.parent.getHit()
      }
    }
  }
}