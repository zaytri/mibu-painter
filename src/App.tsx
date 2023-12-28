import Preview from './components/Preview'
import Scene from './components/Scene'
import useBrush from './contexts/brush/useBrush'

export default function App() {
  const { draw, painting, setPainting } = useBrush()

  function onPointerDown() {
    setPainting(true)
    draw()
  }

  function onPointerUp() {
    setPainting(false)
  }

  function onPointerMove() {
    if (painting) draw()
  }

  return (
    <div
      className='flex h-full w-full gap-px border border-white bg-white'
      onClick={draw}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <div className='checkerboard flex-1'>
        <Scene />
      </div>

      <div className='checkerboard flex-1'>
        <Preview />
      </div>
    </div>
  )
}
