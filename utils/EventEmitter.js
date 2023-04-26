import mitt from 'mitt'

let instance = null
export default class EventEmitter
{
  constructor() {
    // Singleton
    if(instance) {return instance}
    instance = this
    
    this.e = mitt()
  }
  
}