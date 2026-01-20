import React, { useState, useRef } from 'react'
import Viewer3D from './components/Viewer3D'
import Controls from './components/Controls'

function App() {
  // --- State Definitions ---
  const [plateConfig, setPlateConfig] = useState({
    length: 120,
    width: 60,
    thickness: 5,
    color: '#e5e7eb'
  })

  const [stiffenerType, setStiffenerType] = useState('rect')

  const [stiffenerConfig, setStiffenerConfig] = useState({
    // 通用尺寸
    width: 10,  // 矩形宽, L型短边
    height: 15, // 矩形高, L型长边, T/I 腹板高

    // T/I型特有
    flangeWidth: 15,
    flangeThick: 2,
    webThick: 2,

    // L型特有
    thickness: 2,

    offset: 10,   // 两端距离
    color: '#60a5fa'
  })

  const [viewConfig, setViewConfig] = useState({
    transparent: true,
    showEdges: true,
    showGrid: true, // 默认开启网格
    bgColor: '#ffffff'
  })

  // --- Export Logic ---
  const canvasRef = useRef(null)

  const handleExport = () => {
    if (!canvasRef.current) return

    const { gl, scene, camera } = canvasRef.current

    // 强制重绘一帧以确保最新状态
    gl.render(scene, camera)

    const link = document.createElement('a')
    link.setAttribute('download', `plate-stiffener-${stiffenerType}-${Date.now()}.png`)

    // toDataURL requires preserveDrawingBuffer: true in gl config
    link.setAttribute('href', gl.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
    link.click()
  }

  // --- View Control Logic ---
  const viewerRef = useRef(null) // 用于访问 Viewer3D 的内部方法 (resetView)

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.resetView()
    }
  }

  return (
    <div className="flex w-screen h-screen bg-gray-100 overflow-hidden font-sans text-gray-900">

      {/* 左侧 3D 视图 */}
      <div className="flex-1 relative bg-white/50 pattern-grid-lg">
        {/* 背景装饰（可选） */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjY2MiLz48L3N2Zz4=')] opacity-5 pointer-events-none" />

        <Viewer3D
          ref={viewerRef}
          plateConfig={plateConfig}
          stiffenerType={stiffenerType}
          stiffenerConfig={stiffenerConfig}
          viewConfig={viewConfig}
          onCreated={(ctx) => { canvasRef.current = ctx }}
        />

        {/* 顶部标题/Logo区域 */}
        <div className="absolute top-4 left-6 pointer-events-none select-none">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            平板加筋可视化 <span className="text-blue-500 text-lg font-normal">v1.0</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Flat Plate Stiffener Generator</p>
        </div>
      </div>

      {/* 右侧 控制面板 */}
      <Controls
        plateConfig={plateConfig} setPlateConfig={setPlateConfig}
        stiffenerType={stiffenerType} setStiffenerType={setStiffenerType}
        stiffenerConfig={stiffenerConfig} setStiffenerConfig={setStiffenerConfig}
        viewConfig={viewConfig} setViewConfig={setViewConfig}
        onExport={handleExport}
        onResetView={handleResetView}
      />

    </div>
  )
}

export default App
