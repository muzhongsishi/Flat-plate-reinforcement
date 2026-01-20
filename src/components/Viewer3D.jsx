import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, Edges, Grid } from '@react-three/drei'
import * as THREE from 'three'

// 颜色常量
const COLOR_PLATE = '#e5e7eb' // 混凝土灰
const COLOR_STIFFENER = '#60a5fa' // 示意蓝

// 形状生成器
const createProfileShape = (type, config) => {
    const shape = new THREE.Shape()
    const { width = 10, height = 10, thickness = 2, flangeWidth = 10, flangeThick = 2, webThick = 2, width2 = 5 } = config

    // 这里的 (0,0) 通常设为底边中心或者底边左侧，为了方便居中，我们以"底边中心"为基准 (0,0)
    // 绘制是从 (0,0) 开始画线

    switch (type) {
        case 'rect':
            shape.moveTo(-width / 2, 0)
            shape.lineTo(width / 2, 0)
            shape.lineTo(width / 2, height)
            shape.lineTo(-width / 2, height)
            shape.lineTo(-width / 2, 0)
            break

        case 't': // 倒T型
            // 下翼缘
            shape.moveTo(-flangeWidth / 2, 0)
            shape.lineTo(flangeWidth / 2, 0)
            shape.lineTo(flangeWidth / 2, flangeThick)
            // 腹板
            shape.lineTo(webThick / 2, flangeThick)
            shape.lineTo(webThick / 2, height)
            shape.lineTo(-webThick / 2, height)
            shape.lineTo(-webThick / 2, flangeThick)
            // 回到翼缘
            shape.lineTo(-flangeWidth / 2, flangeThick)
            shape.lineTo(-flangeWidth / 2, 0)
            break

        case 'i': // 工字型
            // 下翼缘
            shape.moveTo(-flangeWidth / 2, 0)
            shape.lineTo(flangeWidth / 2, 0)
            shape.lineTo(flangeWidth / 2, flangeThick)
            // 腹板起
            shape.lineTo(webThick / 2, flangeThick)
            shape.lineTo(webThick / 2, height - flangeThick)
            // 上翼缘
            shape.lineTo(flangeWidth / 2, height - flangeThick)
            shape.lineTo(flangeWidth / 2, height)
            shape.lineTo(-flangeWidth / 2, height)
            shape.lineTo(-flangeWidth / 2, height - flangeThick)
            // 腹板落
            shape.lineTo(-webThick / 2, height - flangeThick)
            shape.lineTo(-webThick / 2, flangeThick)
            // 下翼缘收
            shape.lineTo(-flangeWidth / 2, flangeThick)
            shape.lineTo(-flangeWidth / 2, 0)
            break

        case 'l': // L型
            // L型通常是不对称的，设长边竖直，短边水平
            // width是底边长，height是竖边长，thickness是厚度
            shape.moveTo(-width / 2, 0)
            shape.lineTo(width / 2, 0)
            shape.lineTo(width / 2, thickness)
            shape.lineTo(-width / 2 + thickness, thickness)
            shape.lineTo(-width / 2 + thickness, height)
            shape.lineTo(-width / 2, height)
            shape.lineTo(-width / 2, 0)
            break;

        default:
            break
    }
    return shape
}

const Plate = ({ config, showEdges }) => {
    const { length, width, thickness, color } = config
    return (
        <group>
            <mesh position={[0, -thickness / 2, 0]}>
                <boxGeometry args={[length, thickness, width]} />
                <meshStandardMaterial color={color} roughness={0.8} />
                {showEdges && <Edges key={`${length}-${width}-${thickness}`} threshold={15} color="black" />}
            </mesh>
        </group>
    )
}

const Stiffener = ({ type, config, plateLength, showEdges }) => {
    const { offset, color, ...dims } = config
    const actualLength = Math.max(1, plateLength - offset * 2)

    const extrudeSettings = useMemo(() => ({
        depth: actualLength,
        bevelEnabled: false
    }), [actualLength])

    const shape = useMemo(() => createProfileShape(type, dims), [type, dims])

    return (
        <group>
            {/* 
                Rotate to align along X axis.
                Extrude creates geometry from Z=0 to Z=depth.
                Rotation [0, Math.PI/2, 0] rotates +Z to +X.
                So geometry now spans X=0 to X=actualLength.
                To center it on the plate (which is centered at X=0),
                we need to shift it by -actualLength / 2 along X.
             */}
            <mesh
                rotation={[0, Math.PI / 2, 0]}
                position={[-actualLength / 2, 0.01, 0]}
            >
                {/* Offset Y slightly (0.01) to ensure bottom edges are drawn on top of plate */}
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshStandardMaterial color={color} roughness={0.8} />
                {showEdges && <Edges key={`${type}-${JSON.stringify(dims)}-${actualLength}`} threshold={15} color="black" />}
            </mesh>
        </group>
    )
}

const Viewer3D = React.forwardRef(({ plateConfig, stiffenerType, stiffenerConfig, viewConfig, onCreated }, ref) => {
    const { transparent, showEdges, showGrid, bgColor } = viewConfig
    const controlsRef = React.useRef()

    React.useImperativeHandle(ref, () => ({
        resetView: () => {
            if (controlsRef.current) {
                controlsRef.current.reset()
                // 设置为默认斜向下视角
                controlsRef.current.object.position.set(50, 50, 50)
                controlsRef.current.object.zoom = 10
                controlsRef.current.object.lookAt(0, 0, 0)
                controlsRef.current.update()
            }
        }
    }))

    return (
        <div className="w-full h-full relative">
            <Canvas
                className="w-full h-full"
                gl={{ preserveDrawingBuffer: true, alpha: true }}
                onCreated={({ gl, scene, camera }) => {
                    // 暴露给父组件用于截图
                    if (onCreated) onCreated({ gl, scene, camera })
                }}
            >
                {/* 背景颜色控制 */}
                {!transparent && <color attach="background" args={[bgColor]} />}

                <OrthographicCamera makeDefault position={[50, 50, 50]} zoom={10} near={-1000} far={1000} />
                <OrbitControls ref={controlsRef} makeDefault />

                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 20, 10]} intensity={1.0} castShadow />
                <directionalLight position={[-10, 10, -10]} intensity={0.5} />

                {/* 场景内容 */}
                <group>
                    {/* 平板 - Plate center is 0,0,0 ?? No, BoxGeometry default is centered.
                        Box(length, thickness, width).
                        By default centered at (0,0,0). So top face is at y = thickness/2.
                        Currently Plate writes: position={[0, -thickness / 2, 0]}
                        Box centered at (0,0,0) in local space.
                        World Position: y = -thickness/2.
                        Top face world y = -thickness/2 + thickness/2 = 0.
                        Correct. Plate top surface is at Y=0.
                    */}
                    <Plate config={plateConfig} showEdges={showEdges} />

                    {/* 筋条 - 
                        Stiffener mesh uses ExtrudeGeometry.
                        Profile shape 2D (in XY plane). Extruded along Z.
                        We rotated it: rotation={[0, Math.PI / 2, 0]}. 
                        Now extruded along local X (World X).
                        Profile is now in YZ plane.
                        
                        We need to make sure the bottom of the profile is at Y=0.
                        In createProfileShape, we use coordinates based on (0,0).
                        Examples:
                        Rect: shape.moveTo(-width / 2, 0) -> y starts at 0.
                        
                        So alignment Y is correct (Y=0 is bottom).
                        
                        Alignment X (Lengthwise):
                        Extrude depth = actualLength.
                        Default extrude starts at Z=0 and goes to Z=depth.
                        After rotation [0, PI/2, 0]:
                        Starts at X=0, goes to X=depth.
                        
                        We want it CENTERED on the plate.
                        Plate centers at X=0.
                        Stiffener spans X from ? to ?.
                        Currently: position position={[0, 0, -actualLength / 2]} passed to group?
                        Wait, previous code had: <group position={[0, 0, -actualLength / 2]}> ... <mesh rotation...>
                        If rotated 90deg, depth is along X.
                        To center a length L along X, we need to shift X by -L/2.
                        
                        Let's fix the Stiffener component logic specifically.
                    */}
                    <group position={[0, 0, 0]}>
                        <Stiffener
                            type={stiffenerType}
                            config={stiffenerConfig}
                            plateLength={plateConfig.length}
                            showEdges={showEdges}
                        />
                    </group>

                    {showGrid && (
                        <Grid
                            position={[0, -plateConfig.thickness, 0]}
                            args={[plateConfig.length * 1.5, plateConfig.width * 1.5]}
                            cellSize={10}
                            sectionSize={50}
                            sectionColor={"#e5e7eb"}
                            cellColor={"#f3f4f6"}
                            fadeDistance={500}
                        />
                    )}
                </group>
            </Canvas>
        </div>
    )
})

export default Viewer3D
