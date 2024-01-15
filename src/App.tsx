import { useDrag } from '@use-gesture/react'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import Preview from './components/Preview'
import Scene from './components/Scene'
import useBrush from './contexts/brush/useBrush'

export default function App() {
  const { draw, painting, setPainting } = useBrush()
  const [flex, setFlex] = useState(0.5)
  const [direction, setDirectionState] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  )

  const setDirection = useCallback(() => {
    setDirectionState(
      window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical',
    )
  }, [])

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

  // use delta for pointer lock movement and compare to mouse x/y
  const bind = useDrag(({ xy: [x, y] }) => {
    const ratio =
      direction === 'horizontal'
        ? x / window.innerWidth
        : y / window.innerHeight
    setFlex(ratio)
  })

  useEffect(() => {
    setDirection()
    addEventListener('resize', setDirection)
    return () => {
      removeEventListener('resize', setDirection)
    }
  }, [])

  return (
    <div className='flex h-full w-full'>
      <div
        className={clsx(
          'checkerboard relative flex flex-1 border-4 border-neutral-500 bg-white/5 p-2',
          direction === 'horizontal' && 'flex-row',
          direction === 'vertical' && 'flex-col',
        )}
        onClick={draw}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
      >
        <div
          className='resizable relative min-h-48 min-w-48 cursor-crosshair'
          style={{ '--customFlex': flex } as React.CSSProperties}
        >
          <Scene />
        </div>
        <div
          className={clsx(
            'flex touch-none items-stretch justify-center p-2 active:cursor-grabbing',
            direction === 'horizontal' && 'h-full cursor-col-resize flex-row',
            direction === 'vertical' && 'w-full cursor-row-resize flex-col',
          )}
          {...bind()}
        >
          <div
            className={clsx(
              '-mx-4 -my-4 bg-neutral-500',
              direction === 'horizontal' && 'w-1',
              direction === 'vertical' && 'h-1',
            )}
          ></div>
        </div>
        <div
          className={clsx(
            'resizable relative flex min-h-48 min-w-48',
            direction === 'horizontal' && 'flex-col',
            direction === 'vertical' && 'flex-row',
          )}
          style={{ '--customFlex': 1 - flex } as React.CSSProperties}
        >
          <div className='min-h-48 min-w-48 flex-1 cursor-crosshair'>
            <Preview />
          </div>
          <div className='hidden min-h-48 min-w-48 flex-1 bg-rose-300'></div>
        </div>
        <div className='absolute bottom-10 left-1/2 flex -translate-x-1/2'>
          <div className='mr-8 overflow-hidden rounded-lg border-[3px] border-black'>
            <div className='hotcell'></div>
          </div>
          <div className='flex border-[3px] border-black'>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
            <div className='hotcell'>
              <div className='hotcell-select'></div>
            </div>
          </div>
        </div>
      </div>
      <div className='w-72 border-4 border-l-0 border-neutral-500 bg-neutral-900'></div>
    </div>
  )
}
