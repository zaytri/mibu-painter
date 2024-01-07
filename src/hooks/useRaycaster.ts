import { useLayers } from '@/contexts/layers/useLayers'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Raycaster, Vector2, type Object3D, type Scene } from 'three'
import useBrush from '../contexts/brush/useBrush'

const raycaster = new Raycaster()
const pointer = new Vector2()

export default function useRaycaster() {
  const { scene, camera, size, gl } = useThree()
  const { width, height } = useLayers()
  const { setBrush, clearBrush } = useBrush()

  useEffect(() => {
    function raycast(event: PointerEvent) {
      pointer.x = ((event.clientX - size.left) / size.width) * 2 - 1
      pointer.y = -((event.clientY - size.top) / size.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)
      const uv = uvIntersect(scene)
      if (uv) {
        setBrush(Math.floor(uv.x * width), height - Math.ceil(uv.y * height))
      } else {
        clearBrush()
      }
    }

    gl.domElement.addEventListener('pointermove', raycast)

    return () => {
      gl.domElement.removeEventListener('pointermove', raycast)
    }
  })
}

function uvIntersect(scene: Scene): Vector2 | null {
  const objects: Object3D[] = []
  scene.traverse(object => {
    if (object.userData.type === 'cube') {
      objects.push(object)
    }
  })

  const intersects = raycaster.intersectObjects(objects, false)

  if (intersects.length) {
    let intersect = intersects[0]

    for (let i = 1; i < intersects.length; i++) {
      const nextIntersect = intersects[i]
      if (nextIntersect.distance > intersect.distance) break

      if (
        nextIntersect.uv &&
        nextIntersect.normal &&
        nextIntersect.face &&
        nextIntersect.normal.equals(nextIntersect.face.normal)
      ) {
        intersect = nextIntersect
        break
      }
    }

    if (intersect && intersect.uv) {
      return intersect.uv
    }
  }

  return null
}
