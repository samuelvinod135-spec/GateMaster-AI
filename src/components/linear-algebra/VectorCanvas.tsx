import React, { useRef, useEffect } from 'react';
import { Matrix2x2 } from '../../types';

interface VectorCanvasProps {
  matrix: Matrix2x2;
  isCollapsed: boolean;
}

export const VectorCanvas: React.FC<VectorCanvasProps> = ({ matrix, isCollapsed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Coordinate system: center at (width / 2, height / 2)
    const originX = width / 2;
    const originY = height / 2;

    // Scale: 38 pixels per mathematical unit
    const unitScale = Math.min(width, height) / 12;

    const toCanvasX = (x: number) => originX + x * unitScale;
    const toCanvasY = (y: number) => originY - y * unitScale; // Invert y for standard math Cartesian

    // 1. Draw subtle untransformed reference grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridRange = 7;

    for (let i = -gridRange; i <= gridRange; i++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), toCanvasY(-gridRange));
      ctx.lineTo(toCanvasX(i), toCanvasY(gridRange));
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toCanvasX(-gridRange), toCanvasY(i));
      ctx.lineTo(toCanvasX(gridRange), toCanvasY(i));
      ctx.stroke();
    }

    // 2. Draw Transformed Grid Lines
    ctx.lineWidth = 1;
    for (let i = -gridRange; i <= gridRange; i++) {
      // Lines of constant original x = i, varying y from -gridRange to gridRange
      const startX1 = matrix.a * i + matrix.b * -gridRange;
      const startY1 = matrix.c * i + matrix.d * -gridRange;
      const endX1 = matrix.a * i + matrix.b * gridRange;
      const endY1 = matrix.c * i + matrix.d * gridRange;

      ctx.strokeStyle = i === 0 ? 'rgba(6, 182, 212, 0.35)' : 'rgba(148, 163, 184, 0.12)';
      ctx.beginPath();
      ctx.moveTo(toCanvasX(startX1), toCanvasY(startY1));
      ctx.lineTo(toCanvasX(endX1), toCanvasY(endY1));
      ctx.stroke();

      // Lines of constant original y = i, varying x from -gridRange to gridRange
      const startX2 = matrix.a * -gridRange + matrix.b * i;
      const startY2 = matrix.c * -gridRange + matrix.d * i;
      const endX2 = matrix.a * gridRange + matrix.b * i;
      const endY2 = matrix.c * gridRange + matrix.d * i;

      ctx.strokeStyle = i === 0 ? 'rgba(236, 72, 153, 0.35)' : 'rgba(148, 163, 184, 0.12)';
      ctx.beginPath();
      ctx.moveTo(toCanvasX(startX2), toCanvasY(startY2));
      ctx.lineTo(toCanvasX(endX2), toCanvasY(endY2));
      ctx.stroke();
    }

    // 3. Shaded Determinant Area (Parallelogram)
    // Points: (0,0), i-hat(a, c), (a+b, c+d), j-hat(b, d)
    if (!isCollapsed) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0), toCanvasY(0));
      ctx.lineTo(toCanvasX(matrix.a), toCanvasY(matrix.c));
      ctx.lineTo(toCanvasX(matrix.a + matrix.b), toCanvasY(matrix.c + matrix.d));
      ctx.lineTo(toCanvasX(matrix.b), toCanvasY(matrix.d));
      ctx.closePath();

      // Gradient fill for determinant area
      const grad = ctx.createLinearGradient(
        toCanvasX(0), toCanvasY(0),
        toCanvasX(matrix.a + matrix.b), toCanvasY(matrix.c + matrix.d)
      );
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      grad.addColorStop(1, 'rgba(236, 72, 153, 0.25)');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // Helper: Draw Arrow
    const drawArrow = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      label: string,
      sublabel: string
    ) => {
      const headlen = 12;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      const length = Math.sqrt(dx * dx + dy * dy);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      // Draw shaft
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Draw Arrow Head (if length is noticeable)
      if (length > 5) {
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - headlen * Math.cos(angle - Math.PI / 7),
          toY - headlen * Math.sin(angle - Math.PI / 7)
        );
        ctx.lineTo(
          toX - headlen * Math.cos(angle + Math.PI / 7),
          toY - headlen * Math.sin(angle + Math.PI / 7)
        );
        ctx.closePath();
        ctx.fill();
      }

      // Draw label
      ctx.shadowBlur = 0;
      ctx.font = '600 13px "JetBrains Mono", monospace';
      const textOffset = 14;
      ctx.fillText(
        `${label} (${sublabel})`,
        toX + textOffset * Math.cos(angle - Math.PI / 4),
        toY + textOffset * Math.sin(angle - Math.PI / 4)
      );

      ctx.restore();
    };

    // 4. Draw i-hat (Transformed: (a, c))
    drawArrow(
      toCanvasX(0),
      toCanvasY(0),
      toCanvasX(matrix.a),
      toCanvasY(matrix.c),
      '#06b6d4',
      'î',
      `${matrix.a.toFixed(1)}, ${matrix.c.toFixed(1)}`
    );

    // 5. Draw j-hat (Transformed: (b, d))
    drawArrow(
      toCanvasX(0),
      toCanvasY(0),
      toCanvasX(matrix.b),
      toCanvasY(matrix.d),
      '#ec4899',
      'ĵ',
      `${matrix.b.toFixed(1)}, ${matrix.d.toFixed(1)}`
    );

    // 6. Center Origin Dot
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(originX, originY, 4, 0, Math.PI * 2);
    ctx.fill();

    // 7. Space Collapse Visual Indicator & 1D Subspace Line
    if (isCollapsed) {
      ctx.save();

      // Find the dominant vector direction for the 1D subspace
      const dirX = Math.abs(matrix.a) > 0.1 || Math.abs(matrix.c) > 0.1 ? matrix.a : matrix.b;
      const dirY = Math.abs(matrix.a) > 0.1 || Math.abs(matrix.c) > 0.1 ? matrix.c : matrix.d;
      const mag = Math.sqrt(dirX * dirX + dirY * dirY);

      if (mag > 0.05) {
        const normX = dirX / mag;
        const normY = dirY / mag;
        const lineDist = 20;

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(toCanvasX(-normX * lineDist), toCanvasY(-normY * lineDist));
        ctx.lineTo(toCanvasX(normX * lineDist), toCanvasY(normY * lineDist));
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
      ctx.shadowBlur = 8;
      ctx.fillText('⚡ 2D SPACE COLLAPSED INTO 1D LINE (det = 0) ⚡', originX, 42);
      ctx.restore();
    }

    ctx.restore();
  }, [matrix, isCollapsed]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} className="interactive-canvas" />
      <div className="canvas-badge-overlay">
        <div className="basis-legend-item">
          <span className="legend-dot cyan"></span>
          <span>î = [{matrix.a.toFixed(1)}, {matrix.c.toFixed(1)}]</span>
        </div>
        <div className="basis-legend-item">
          <span className="legend-dot magenta"></span>
          <span>ĵ = [{matrix.b.toFixed(1)}, {matrix.d.toFixed(1)}]</span>
        </div>
      </div>
    </div>
  );
};
