import * as THREE from 'three'

export const pointerEventToNDCVector2 = (_event, _sizes) => {
  const pointerNormalized = new THREE.Vector2(-100,-100)
  pointerNormalized.x = _event.clientX / _sizes.width * 2 - 1
  pointerNormalized.y = 1 - (_event.clientY / _sizes.height * 2)
  return pointerNormalized
}