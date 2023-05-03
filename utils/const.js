export const EVENTS = {
  gameStart: 'gameStart',
  balloonFirstHit: 'balloonFirstHit',
  hitMiss: 'hitMiss',
  balloonPop: 'balloonPop',
  
  gameEnd: 'gameEnd',
  
}

export const SETTINGS = {
  balloonScale: 0.4,
  minFloatDuration: 3,
  maxFloatDuration: 10,
  maxPeriodMillis: 3000,
  minPeriodMillis: 150,
  periodSpedUpCoefficient: 1.1,
  spreadRadius: 2,
  particleScale: 0.1,
  lowestPoint: -5,
  highestPoint: 5,
  totalBalloons: 30,
}
