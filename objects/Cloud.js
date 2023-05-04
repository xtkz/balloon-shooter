import * as THREE from 'three';
import GameObject from "./GameObject.js";
import {gsap} from "gsap";

let model, angle, newY, newZ

export default class Cloud extends GameObject{
  constructor(incomeModel, cloudsGroup) {
    super(cloudsGroup);
    model = incomeModel.clone();
    model.material = new THREE.MeshStandardMaterial({color: 0xdddddd});
    model.material.transparent = true;
    model.material.opacity = 0;
    model.scale.set(0.3,0.3,0.3)
    model.rotation.set(0, (this.personalRandom > 0.5)? Math.PI/2 : -Math.PI/2, 0);
    this.add(model)
    // this.children[0].material = new THREE.MeshStandardMaterial({color: 0xdddddd})
    // console.log(this)
  }
  
  appear() {
    angle = 2 * Math.PI * (4/17) * this.counter.deaths;
    newY = Math.cos(angle) * 2;
    newZ = Math.sin(angle) * 3;
    this.position.set(-6, newY, newZ)
    super.appear();
    gsap.to(this.children[0].material, {opacity: 1, duration: 0.4,});
    this.mainGSAP = gsap.to(this.position, {x: 6, duration: this.floatDuration * 2, ease: 'none', onComplete: () => {
      this.destruct()
    }})
  }
  
  destruct() {
    gsap.to(this.children[0].material, {opacity: 0, duration: 0.4, onComplete: () => {
      this.mainGSAP && this.mainGSAP.kill();
      super.destruct();
      }});
  }
}