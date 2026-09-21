import { useMemo } from "react";

interface SizePreviewProps {
  width: number;
  depth: number;
  height: number;
  maxW?: number;
  maxD?: number;
  maxH?: number;
}

export function SizePreview({
  width,
  depth,
  height,
  maxW = 1200,
  maxD = 900,
  maxH = 1000,
}: SizePreviewProps) {
  const { wScale, dScale, hScale } = useMemo(() => {
    return {
      wScale: width / maxW,
      dScale: depth / maxD,
      hScale: height / maxH,
    };
  }, [width, depth, height, maxW, maxD, maxH]);

  const maxBoxW = 220;
  const maxBoxH = 180;
  const boxW = Math.max(30, maxBoxW * wScale);
  const boxH = Math.max(30, maxBoxH * hScale);
  const depthOffset = 40 * dScale;

  const svgW = 320;
  const svgH = 240;
  const cx = svgW / 2;
  const groundY = svgH - 30;

  return (
    <div className="flex flex-col items-center">
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
        <line x1="20" y1={groundY} x2={svgW - 20} y2={groundY} stroke="#E0D0BA" strokeWidth="1.5" />

        {/* Back face */}
        <polygon
          points={`${cx - boxW / 2 + depthOffset / 2},${groundY - boxH} ${cx + boxW / 2 + depthOffset / 2},${groundY - boxH} ${cx + boxW / 2 + depthOffset / 2},${groundY} ${cx - boxW / 2 + depthOffset / 2},${groundY}`}
          fill="#F5EFE6"
          stroke="#CDB99E"
          strokeWidth="1.5"
        />
        {/* Right face (depth) */}
        <polygon
          points={`${cx + boxW / 2},${groundY - boxH} ${cx + boxW / 2 + depthOffset / 2},${groundY - boxH} ${cx + boxW / 2 + depthOffset / 2},${groundY} ${cx + boxW / 2},${groundY}`}
          fill="#EDE3D3"
          stroke="#CDB99E"
          strokeWidth="1.5"
        />
        {/* Front face */}
        <rect
          x={cx - boxW / 2}
          y={groundY - boxH}
          width={boxW}
          height={boxH}
          fill="#FBF8F3"
          stroke="#B8A07E"
          strokeWidth="2"
        />
        {/* Door opening */}
        <rect
          x={cx - Math.min(boxW * 0.28, 45)}
          y={groundY - Math.min(boxH * 0.6, 100)}
          width={Math.min(boxW * 0.56, 90)}
          height={Math.min(boxH * 0.6, 100)}
          fill="#EDE3D3"
          stroke="#CDB99E"
          strokeWidth="1.5"
          rx="4"
        />
        {/* Top face (depth perspective) */}
        <polygon
          points={`${cx - boxW / 2},${groundY - boxH} ${cx + boxW / 2},${groundY - boxH} ${cx + boxW / 2 + depthOffset / 2},${groundY - boxH} ${cx - boxW / 2 + depthOffset / 2},${groundY - boxH}`}
          fill="#E0D0BA"
          stroke="#CDB99E"
          strokeWidth="1.5"
        />

        {/* Dimension labels */}
        <text x={cx} y={groundY + 18} textAnchor="middle" className="fill-charcoal text-[11px] font-medium">
          가로 {width}mm
        </text>
        <text x={cx + boxW / 2 + depthOffset / 2 + 8} y={groundY - boxH / 2} textAnchor="start" className="fill-charcoal-muted text-[10px]">
          높이 {height}mm
        </text>
        <text x={cx + boxW / 2 + depthOffset / 4} y={groundY - boxH - 8} textAnchor="middle" className="fill-charcoal-muted text-[10px]">
          세로 {depth}mm
        </text>
      </svg>
    </div>
  );
}
