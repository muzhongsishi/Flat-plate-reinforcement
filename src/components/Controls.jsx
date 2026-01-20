import React from 'react'
import { FileDown, Grid, Eye, EyeOff, RotateCcw } from 'lucide-react'

const InputRow = ({ label, children }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            {children}
        </div>
    </div>
)

const Slider = ({ value, min, max, step = 1, onChange, unit = '' }) => (
    <div className="flex-1 flex items-center gap-2">
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs text-gray-500 w-12 text-right font-mono">{value}{unit}</span>
    </div>
)

const ColorPicker = ({ value, onChange }) => (
    <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-16 p-0 border border-gray-300 rounded cursor-pointer"
    />
)

const ShapeButton = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium rounded-md border flex-1 transition-colors
      ${active
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
    >
        {label}
    </button>
)

const Controls = ({
    plateConfig, setPlateConfig,
    stiffenerType, setStiffenerType,
    stiffenerConfig, setStiffenerConfig,
    viewConfig, setViewConfig,
    onExport,
    onResetView
}) => {

    const updateStiffener = (key, val) => setStiffenerConfig(prev => ({ ...prev, [key]: val }))
    const updatePlate = (key, val) => setPlateConfig(prev => ({ ...prev, [key]: val }))
    const updateView = (key, val) => setViewConfig(prev => ({ ...prev, [key]: val }))

    const renderStiffenerInputs = () => {
        switch (stiffenerType) {
            case 'rect':
                return (
                    <>
                        <InputRow label="宽度 (Width)">
                            <Slider value={stiffenerConfig.width} min={1} max={50} onChange={v => updateStiffener('width', v)} />
                        </InputRow>
                        <InputRow label="高度 (Height)">
                            <Slider value={stiffenerConfig.height} min={1} max={50} onChange={v => updateStiffener('height', v)} />
                        </InputRow>
                    </>
                )
            case 't':
                return (
                    <>
                        <InputRow label="腹板高度 (Web Height)">
                            <Slider value={stiffenerConfig.height} min={5} max={100} onChange={v => updateStiffener('height', v)} />
                        </InputRow>
                        <InputRow label="翼缘宽度 (Flange Width)">
                            <Slider value={stiffenerConfig.flangeWidth} min={5} max={100} onChange={v => updateStiffener('flangeWidth', v)} />
                        </InputRow>
                        <InputRow label="翼缘/腹板厚度 (Thickness)">
                            <Slider value={stiffenerConfig.flangeThick} min={1} max={20} onChange={v => {
                                updateStiffener('flangeThick', v)
                                updateStiffener('webThick', v)
                            }} />
                        </InputRow>
                    </>
                )
            case 'i':
                return (
                    <>
                        <InputRow label="总高度 (Height)">
                            <Slider value={stiffenerConfig.height} min={10} max={100} onChange={v => updateStiffener('height', v)} />
                        </InputRow>
                        <InputRow label="翼缘宽度 (Flange Width)">
                            <Slider value={stiffenerConfig.flangeWidth} min={5} max={100} onChange={v => updateStiffener('flangeWidth', v)} />
                        </InputRow>
                        <InputRow label="翼缘/腹板厚度 (Thickness)">
                            <Slider value={stiffenerConfig.flangeThick} min={1} max={20} onChange={v => {
                                updateStiffener('flangeThick', v)
                                updateStiffener('webThick', v)
                            }} />
                        </InputRow>
                    </>
                )
            case 'l':
                return (
                    <>
                        <InputRow label="高度/长边 (Long Leg)">
                            <Slider value={stiffenerConfig.height} min={5} max={100} onChange={v => updateStiffener('height', v)} />
                        </InputRow>
                        <InputRow label="宽度/短边 (Short Leg)">
                            <Slider value={stiffenerConfig.width} min={5} max={100} onChange={v => updateStiffener('width', v)} />
                        </InputRow>
                        <InputRow label="厚度 (Thickness)">
                            <Slider value={stiffenerConfig.thickness} min={1} max={20} onChange={v => updateStiffener('thickness', v)} />
                        </InputRow>
                    </>
                )
            default: return null
        }
    }

    return (
        <div className="h-full bg-gray-50 border-l border-gray-200 overflow-y-auto p-4 w-80 flex flex-col gap-6 shadow-xl z-10">

            {/* 导出区域 */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    渲染设置
                </h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">背景透明</span>
                        <button
                            onClick={() => updateView('transparent', !viewConfig.transparent)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${viewConfig.transparent ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewConfig.transparent ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">显示轮廓线</span>
                        <button
                            onClick={() => updateView('showEdges', !viewConfig.showEdges)}
                            className={`p-1 rounded ${viewConfig.showEdges ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            {viewConfig.showEdges ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">显示网格</span>
                        <button
                            onClick={() => updateView('showGrid', !viewConfig.showGrid)}
                            className={`p-1 rounded ${viewConfig.showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <Grid size={18} />
                        </button>
                    </div>

                    <button
                        onClick={onResetView}
                        className="w-full mt-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                        <RotateCcw size={16} />
                        重置视角 (Reset View)
                    </button>

                    {!viewConfig.transparent && (
                        <InputRow label="背景颜色">
                            <ColorPicker value={viewConfig.bgColor} onChange={v => updateView('bgColor', v)} />
                        </InputRow>
                    )}

                    <button
                        onClick={onExport}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <FileDown size={18} />
                        导出图片 (PNG)
                    </button>
                </div>
            </div>

            {/* 平板参数 */}
            <section>
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">平板参数 (Plate)</h3>
                <InputRow label="长度 (Length)">
                    <Slider value={plateConfig.length} min={50} max={200} onChange={v => updatePlate('length', v)} />
                </InputRow>
                <InputRow label="宽度 (Width)">
                    <Slider value={plateConfig.width} min={20} max={150} onChange={v => updatePlate('width', v)} />
                </InputRow>
                <InputRow label="厚度 (Thickness)">
                    <Slider value={plateConfig.thickness} min={1} max={20} onChange={v => updatePlate('thickness', v)} />
                </InputRow>
                <InputRow label="颜色 (Color)">
                    <ColorPicker value={plateConfig.color} onChange={v => updatePlate('color', v)} />
                </InputRow>
            </section>

            {/* 筋条参数 */}
            <section>
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">筋条参数 (Stiffener)</h3>

                <div className="flex gap-2 mb-4">
                    <ShapeButton active={stiffenerType === 'rect'} label="矩形" onClick={() => setStiffenerType('rect')} />
                    <ShapeButton active={stiffenerType === 't'} label="倒T" onClick={() => setStiffenerType('t')} />
                    <ShapeButton active={stiffenerType === 'i'} label="工字" onClick={() => setStiffenerType('i')} />
                    <ShapeButton active={stiffenerType === 'l'} label="L型" onClick={() => setStiffenerType('l')} />
                </div>

                {renderStiffenerInputs()}



                <InputRow label="筋条颜色">
                    <ColorPicker value={stiffenerConfig.color} onChange={v => updateStiffener('color', v)} />
                </InputRow>
            </section>

        </div>
    )
}

export default Controls
