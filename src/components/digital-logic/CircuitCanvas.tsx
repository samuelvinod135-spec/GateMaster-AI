import React, { useRef, useEffect } from 'react';
import { LogicInputs, HalfAdderOutputs } from '../../types';

interface CircuitCanvasProps {
  inputs: LogicInputs;
  outputs: HalfAdderOutputs;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({ inputs, outputs }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseOffset = 0;

    const render = () => {
      pulseOffset = (pulseOffset + 0.08) % (Math.PI * 2);

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // Draw faint circuit grid backdrop
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Schematic Layout Geometry
      const inputX = width * 0.12;
      const inputAY = height * 0.32;
      const inputBY = height * 0.68;

      const junction1X = width * 0.28;
      const junction2X = width * 0.34;

      const xorGateX = width * 0.52;
      const xorGateY = height * 0.35;

      const andGateX = width * 0.52;
      const andGateY = height * 0.65;

      const outputX = width * 0.86;
      const sumY = xorGateY;
      const carryY = andGateY;

      // Helper: Draw Wire segment with neon glow
      const drawWire = (path: [number, number][], isHigh: boolean, color = '#10b981') => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }

        if (isHigh) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = color;
          ctx.shadowBlur = 12 + Math.sin(pulseOffset) * 4;
        } else {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.restore();
      };

      // 1. Draw Wires from Input A
      // Path A -> XOR Input 1
      drawWire([
        [inputX, inputAY],
        [junction1X, inputAY],
        [xorGateX - 45, xorGateY - 14]
      ], inputs.a, '#06b6d4');

      // Path A Branch -> AND Input 1
      drawWire([
        [junction1X, inputAY],
        [junction1X, andGateY - 14],
        [andGateX - 45, andGateY - 14]
      ], inputs.a, '#06b6d4');

      // 2. Draw Wires from Input B
      // Path B -> AND Input 2
      drawWire([
        [inputX, inputBY],
        [junction2X, inputBY],
        [andGateX - 45, andGateY + 14]
      ], inputs.b, '#3b82f6');

      // Path B Branch -> XOR Input 2
      drawWire([
        [junction2X, inputBY],
        [junction2X, xorGateY + 14],
        [xorGateX - 45, xorGateY + 14]
      ], inputs.b, '#3b82f6');

      // 3. Output Wires
      // XOR Output -> Sum LED
      drawWire([
        [xorGateX + 45, xorGateY],
        [outputX, sumY]
      ], outputs.sum, '#10b981');

      // AND Output -> Carry LED
      drawWire([
        [andGateX + 45, andGateY],
        [outputX, carryY]
      ], outputs.carry, '#f59e0b');

      // 4. Draw XOR Gate
      const drawXORGate = (cx: number, cy: number, isActive: boolean) => {
        ctx.save();
        ctx.translate(cx, cy);

        // Body fill & stroke
        ctx.fillStyle = isActive ? 'rgba(6, 182, 212, 0.15)' : '#0f172a';
        ctx.strokeStyle = isActive ? '#06b6d4' : '#475569';
        ctx.lineWidth = 2.5;
        if (isActive) {
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 14;
        }

        // Draw curved back
        ctx.beginPath();
        ctx.arc(-45, 0, 48, -Math.PI / 3, Math.PI / 3, false);
        ctx.stroke();

        // Draw outer XOR body
        ctx.beginPath();
        ctx.arc(-36, 0, 48, -Math.PI / 3, Math.PI / 3, false);
        ctx.quadraticCurveTo(5, -35, 45, 0);
        ctx.quadraticCurveTo(5, 35, -36 + 48 * Math.cos(Math.PI / 3), 48 * Math.sin(Math.PI / 3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = isActive ? '#38bdf8' : '#94a3b8';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText('XOR', 0, 4);

        ctx.restore();
      };

      // 5. Draw AND Gate
      const drawANDGate = (cx: number, cy: number, isActive: boolean) => {
        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = isActive ? 'rgba(245, 158, 11, 0.15)' : '#0f172a';
        ctx.strokeStyle = isActive ? '#f59e0b' : '#475569';
        ctx.lineWidth = 2.5;
        if (isActive) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 14;
        }

        // Draw AND body (flat back, rounded front)
        ctx.beginPath();
        ctx.moveTo(-35, -32);
        ctx.lineTo(5, -32);
        ctx.arc(5, 0, 32, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(-35, 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = isActive ? '#fbbf24' : '#94a3b8';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText('AND', -5, 4);

        ctx.restore();
      };

      drawXORGate(xorGateX, xorGateY, outputs.sum);
      drawANDGate(andGateX, andGateY, outputs.carry);

      // 6. Draw Input Terminals
      const drawTerminal = (x: number, y: number, label: string, isHigh: boolean) => {
        ctx.save();
        ctx.fillStyle = isHigh ? '#10b981' : '#1e293b';
        ctx.strokeStyle = isHigh ? '#34d399' : '#475569';
        ctx.lineWidth = 2;
        if (isHigh) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
        }

        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHigh ? '#070a12' : '#94a3b8';
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(isHigh ? '1' : '0', x, y + 4.5);

        // Input Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 13px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Input ${label}`, x - 22, y + 4.5);

        ctx.restore();
      };

      drawTerminal(inputX, inputAY, 'A', inputs.a);
      drawTerminal(inputX, inputBY, 'B', inputs.b);

      // Junction dots
      const drawJunction = (x: number, y: number, isHigh: boolean) => {
        ctx.save();
        ctx.fillStyle = isHigh ? '#10b981' : '#475569';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawJunction(junction1X, inputAY, inputs.a);
      drawJunction(junction2X, inputBY, inputs.b);

      // 7. Draw Output LEDs
      const drawOutputLED = (
        x: number,
        y: number,
        label: string,
        formula: string,
        isHigh: boolean,
        color: string
      ) => {
        ctx.save();
        // LED Outer Glow
        if (isHigh) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.fillStyle = color;
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.shadowBlur = 0;
        }

        ctx.strokeStyle = isHigh ? color : '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHigh ? '#070a12' : '#64748b';
        ctx.font = '700 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(isHigh ? '1' : '0', x, y + 5);

        // Text readout
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 13px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 26, y - 2);

        ctx.fillStyle = isHigh ? color : '#64748b';
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.fillText(formula, x + 26, y + 14);

        ctx.restore();
      };

      drawOutputLED(outputX, sumY, 'Sum (S)', 'A ⊕ B', outputs.sum, '#10b981');
      drawOutputLED(outputX, carryY, 'Carry (C)', 'A · B', outputs.carry, '#f59e0b');

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [inputs, outputs]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} className="interactive-canvas" />
      <div className="canvas-badge-overlay">
        <div className="basis-legend-item">
          <span className="legend-dot cyan"></span>
          <span>Sum = A ⊕ B</span>
        </div>
        <div className="basis-legend-item">
          <span className="legend-dot" style={{ background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}></span>
          <span>Carry = A · B</span>
        </div>
      </div>
    </div>
  );
};
