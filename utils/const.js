export const EVENTS = {
  gameStart: 'gameStart',
  balloonFirstHit: 'balloonFirstHit',
  balloonPop: 'balloonPop',
  
  gameEnd: 'gameEnd',
  
}

export const SETTINGS = {
  balloonScale: 0.4,
  minFloatDuration: 5,
  maxFloatDuration: 15,
  maxPeriodMillis: 3000,
  minPeriodMillis: 150,
  periodSpedUpCoefficient: 1.1,
  spreadRadius: 2,
  particleScale: 0.1,
  lowestPoint: -5,
  highestPoint: 5,
  totalBalloons: 30,
}
