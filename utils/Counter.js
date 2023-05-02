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
    console.log(`§ this.bornCounter ${this.bornCounter}`)
  }
  
  newDeath() {
    this.deathCounter++
    console.log(`§ this.deathCounter ${this.deathCounter}`)
    if (this.bornCounter === SETTINGS.totalBalloons && this.deathCounter === SETTINGS.totalBalloons) {
      this.eventEmitter.e.emit(EVENTS.gameEnd)
    }
  }
  
  getBorn() {
    return this.bornCounter
  }
  getDeath() {
    return this.deathCounter
  }
}