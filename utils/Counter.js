import {EVENTS, SETTINGS} from "./const.js";
import EventEmitter from "./EventEmitter.js";

let instance = null
export default class Counter {
  constructor() {
    // Singleton
    if(instance) {return instance}
    instance = this
    
    this.bornCounter = 0;
    this.deathCounter = 0;
    
    this.eventEmitter = new EventEmitter();
    
  }
  
  newBorn() {
    this.bornCounter++
  }
  
  newDeath() {
    this.deathCounter++
    if (this.bornCounter === SETTINGS.totalBalloons && this.deathCounter === SETTINGS.totalBalloons) {
      this.eventEmitter.e.emit(EVENTS.gameEnd)
    }
  }
  
  get born() {
    return this.bornCounter
  }
  get deaths() {
    return this.deathCounter
  }
}