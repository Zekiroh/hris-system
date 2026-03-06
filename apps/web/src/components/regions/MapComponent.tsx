import type { FC } from 'react';
import { useState, useRef } from 'react';

interface MapComponentProps {
    onRegionSelect: (regionId: string) => void;
    selectedRegion: string | null;
}

const MapComponent: FC<MapComponentProps> = ({ onRegionSelect, selectedRegion }) => {
    const [scale, setScale] = useState(1);
    const [hovered, setHovered] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    // Simplified SVG Map representation of Philippines Regions
    // Using circles/paths as placeholders for actual map shapes
    const regions = [
        { id: 'NCR', cx: 200, cy: 150, r: 15, name: 'NCR' },
        { id: 'CAR', cx: 200, cy: 80, r: 20, name: 'CAR' },
        { id: 'R1', cx: 160, cy: 90, r: 18, name: 'Region 1' },
        { id: 'R2', cx: 240, cy: 80, r: 22, name: 'Region 2' },
        { id: 'R3', cx: 200, cy: 120, r: 18, name: 'Region 3' },
        { id: 'R4A', cx: 210, cy: 170, r: 18, name: 'Region 4A' },
        { id: 'R4B', cx: 170, cy: 220, r: 25, name: 'Region 4B' },
        { id: 'R5', cx: 260, cy: 230, r: 22, name: 'Region 5' },
        { id: 'R6', cx: 180, cy: 300, r: 20, name: 'Region 6' },
        { id: 'R7', cx: 240, cy: 320, r: 15, name: 'Region 7' },
        { id: 'R8', cx: 290, cy: 290, r: 20, name: 'Region 8' },
        { id: 'R9', cx: 150, cy: 400, r: 18, name: 'Region 9' },
        { id: 'R10', cx: 220, cy: 390, r: 18, name: 'Region 10' },
        { id: 'R11', cx: 260, cy: 420, r: 18, name: 'Region 11' },
        { id: 'R12', cx: 210, cy: 430, r: 20, name: 'Region 12' },
        { id: 'R13', cx: 260, cy: 360, r: 18, name: 'Region 13' },
        { id: 'BARMM', cx: 180, cy: 430, r: 22, name: 'BARMM' },
    ];

    // Mock deployments by region (for legend/tooltip)
    const deployments: Record<string, number> = regions.reduce((acc, r) => {
        acc[r.id] = Math.floor((r.r + r.cx + r.cy) % 50) + 5;
        return acc;
    }, {} as Record<string, number>);

    const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.25).toFixed(2)));
    const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.25).toFixed(2)));

    const showTooltip = (e: React.MouseEvent | React.TouchEvent, region: typeof regions[0]) => {
        const bounds = svgRef.current?.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        if (!bounds) return;
        setTooltip({ x: clientX - bounds.left, y: clientY - bounds.top, text: `${region.name}: ${deployments[region.id]} deployments` });
    };

    const hideTooltip = () => setTooltip(null);

    return (
        <div className="w-full h-full flex items-center justify-center bg-blue-50 rounded-xl overflow-hidden relative">
            <svg ref={svgRef} viewBox="0 0 400 500" className="h-full w-full max-h-[600px]">
                <g transform={`scale(${scale})`}>
                {/* Background / Sea */}
                <rect width="400" height="500" fill="#E0F2F1" />

                {/* Regions */}
                {regions.map((region) => (
                    <g
                        key={region.id}
                        onClick={() => onRegionSelect(region.id)}
                        onMouseEnter={(e) => { setHovered(region.id); showTooltip(e, region); }}
                        onMouseMove={(e) => showTooltip(e, region)}
                        onMouseLeave={() => { setHovered(null); hideTooltip(); }}
                        onTouchStart={(e) => { setHovered(region.id); showTooltip(e, region); }}
                        onTouchEnd={() => hideTooltip()}
                        className="cursor-pointer transition-all duration-300 hover:opacity-80"
                    >
                        <circle
                            cx={region.cx}
                            cy={region.cy}
                            r={region.r}
                            fill={selectedRegion === region.id ? '#008000' : hovered === region.id ? '#66BB6A' : '#81C784'}
                            stroke="#fff"
                            strokeWidth="2"
                            className="transition-all duration-300"
                            style={{
                                filter: selectedRegion === region.id ? 'drop-shadow(0px 6px 8px rgba(0,0,0,0.2))' : 'none',
                                transformOrigin: 'center',
                                transform: selectedRegion === region.id ? 'scale(1.12)' : 'scale(1)',
                            }}
                        />
                        <text
                            x={region.cx}
                            y={region.cy}
                            dy={4}
                            textAnchor="middle"
                            className="text-[10px] font-bold fill-white pointer-events-none"
                            style={{ fontSize: '10px' }}
                        >
                            {region.id}
                        </text>
                    </g>
                ))}
                </g>
            </svg>

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={zoomIn} className="bg-white p-2 rounded shadow text-sm">+</button>
                <button onClick={zoomOut} className="bg-white p-2 rounded shadow text-sm">−</button>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    style={{ left: tooltip.x + 8, top: tooltip.y + 8 }}
                    className="absolute pointer-events-none bg-white/95 p-2 rounded shadow text-xs text-gray-800"
                >
                    {tooltip.text}
                </div>
            )}

            <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-lg text-xs text-gray-500">
                Click or tap a region to view details
            </div>

            {/* Small legend */}
            <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg text-xs text-gray-700 shadow-sm">
                <div className="font-semibold">Deployments</div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                    {Object.entries(deployments).slice(0,6).map(([id, num]) => (
                        <div key={id} className="flex items-center gap-2">
                            <span className="h-3 w-3 bg-green-400 rounded-full inline-block"></span>
                            <span className="font-medium">{id}</span>
                            <span className="ml-1 text-gray-500">{num}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
