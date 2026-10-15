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

      // Matte Black Background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Draw faint circuit grid backdrop
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ========================================================
      // Precise Schematic Geometry & Layout
      // ========================================================
      const centerY = height / 2;
      const verticalGap = Math.max(115, Math.min(155, height * 0.28));

      // Separate gates with generous vertical breathing room
      const xorGateY = centerY - verticalGap;
      const andGateY = centerY + verticalGap;

      // Pin Y positions (16px above and below gate centerlines)
      const pinOffset = 16;
      const xorPin1Y = xorGateY - pinOffset;
      const xorPin2Y = xorGateY + pinOffset;
      const andPin1Y = andGateY - pinOffset;
      const andPin2Y = andGateY + pinOffset;

      // Inputs A and B are aligned with XOR input pins
      const inputAY = xorPin1Y;
      const inputBY = xorPin2Y;

      // Horizontal Layout Alignment
      const schematicWidth = Math.min(700, width * 0.88);
      const startX = Math.max(30, (width - schematicWidth) / 2);

      const inputX = startX + 40;
      const branchAX = startX + 175;  // Vertical drop bus for Input A
      const branchBX = startX + 225;  // Vertical drop bus for Input B

      // Gate center X
      const gateCenterX = startX + 370;

      // Exact pin connection X coordinates derived analytically:
      // XOR Exclusive Arc: quadratic curve from (-34, -28) with control point (-14, 0) to (-34, 28)
      // At y = +-16, x = -34 + 10 * (1 - (16/28)^2) = -34 + 6.7347 = -27.27
      const xorInPinX = gateCenterX - 27.27;
      // XOR sharp output tip is at x = +35 relative to gate center
      const xorOutPinX = gateCenterX + 35;

      // AND flat back is at x = -25 relative to gate center
      const andInPinX = gateCenterX - 25;
      // AND rounded output tip is at x = +31 relative to gate center
      const andOutPinX = gateCenterX + 31;

      const outputX = startX + schematicWidth - 30;
      const sumY = xorGateY;
      const carryY = andGateY;

      // Helper: Draw Orthogonal Wire
      const drawWire = (path: [number, number][], isHigh: boolean, color = '#38bdf8') => {
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

      // Helper: Draw Junction Dot
      const drawJunction = (x: number, y: number, isHigh: boolean, color = '#38bdf8') => {
        ctx.save();
        ctx.fillStyle = isHigh ? color : '#475569';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // ========================================================
      // 1. Orthogonal Wire Routing for Input A
      // ========================================================
      // Main Line A: Input A -> stops exactly at XOR Exclusive Arc
      drawWire([
        [inputX, inputAY],
        [xorInPinX, inputAY]
      ], inputs.a, '#38bdf8');

      // Branch A: Drops down vertically at branchAX to AND Pin 1
      drawWire([
        [branchAX, inputAY],
        [branchAX, andPin1Y],
        [andInPinX, andPin1Y]
      ], inputs.a, '#38bdf8');

      // Junction Dot for Branch A
      drawJunction(branchAX, inputAY, inputs.a, '#38bdf8');

      // ========================================================
      // 2. Orthogonal Wire Routing for Input B
      // ========================================================
      // Main Line B: Input B -> stops exactly at XOR Exclusive Arc
      // Jumper arc over vertical wire A at branchAX
      const bridgeRadius = 6;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(inputX, inputBY);
      ctx.lineTo(branchAX - bridgeRadius, inputBY);
      // Clean schematic bridge arc
      ctx.arc(branchAX, inputBY, bridgeRadius, Math.PI, 0, false);
      ctx.lineTo(xorInPinX, inputBY);

      if (inputs.b) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12 + Math.sin(pulseOffset) * 4;
      } else {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.restore();

      // Branch B: Drops down vertically at branchBX to AND Pin 2
      drawWire([
        [branchBX, inputBY],
        [branchBX, andPin2Y],
        [andInPinX, andPin2Y]
      ], inputs.b, '#38bdf8');

      // Junction Dot for Branch B
      drawJunction(branchBX, inputBY, inputs.b, '#38bdf8');

      // ========================================================
      // 3. Output Wires (Starting exactly at gate output tips)
      // ========================================================
      // XOR Output Tip -> Sum LED
      drawWire([
        [xorOutPinX, sumY],
        [outputX, sumY]
      ], outputs.sum, '#38bdf8');

      // AND Output Tip -> Carry LED
      drawWire([
        [andOutPinX, carryY],
        [outputX, carryY]
      ], outputs.carry, '#facc15');

      // ========================================================
      // 4. Authentic IEEE Standard XOR Gate
      // ========================================================
      const drawXORGate = (cx: number, cy: number, isActive: boolean) => {
        ctx.save();
        ctx.translate(cx, cy);

        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const strokeColor = isActive ? '#38bdf8' : '#475569';
        const fillColor = isActive ? 'rgba(56, 189, 248, 0.12)' : '#0f172a';

        if (isActive) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
        } else {
          ctx.shadowBlur = 0;
        }

        // --- 1. The Exclusive Arc (Detached Standalone Curve at Left) ---
        // Sits 9px to the left of the main body's curved back.
        // At y = +-16, x = -27.27 (where inputs A and B terminate).
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(-34, -28);
        ctx.quadraticCurveTo(-14, 0, -34, 28);
        ctx.stroke();

        // --- 2. The Main OR Body (9px Uniform Parallel Gap) ---
        // Curved back edge perfectly parallels the exclusive arc (x_body = x_arc + 9):
        // Apex is at x = -15.
        // Top and bottom edges sweep cleanly into the sharp right tip at (35, 0).
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        // Top-left horn
        ctx.moveTo(-25, -28);
        // Back concave edge curving inward to apex at x = -15
        ctx.quadraticCurveTo(-5, 0, -25, 28);
        // Bottom sweeping edge to sharp right tip at (35, 0)
        ctx.bezierCurveTo(0, 28, 22, 16, 35, 0);
        // Top sweeping edge from tip back to top-left horn
        ctx.bezierCurveTo(22, -16, 0, -28, -25, -28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // --- 3. Crisp Typographic Label ---
        ctx.fillStyle = isActive ? '#38bdf8' : '#94a3b8';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText('XOR', 6, 4);

        ctx.restore();
      };

      // ========================================================
      // 5. Authentic IEEE Standard AND Gate
      // ========================================================
      const drawANDGate = (cx: number, cy: number, isActive: boolean) => {
        ctx.save();
        ctx.translate(cx, cy);

        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const strokeColor = isActive ? '#facc15' : '#475569';
        const fillColor = isActive ? 'rgba(250, 204, 21, 0.12)' : '#0f172a';

        if (isActive) {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 14;
        } else {
          ctx.shadowBlur = 0;
        }

        // AND Gate Body: Flat back at x = -25, rounded semicircle front from x = 5 to radius 26 (tip at 31)
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(-25, -26);
        ctx.lineTo(5, -26);
        ctx.arc(5, 0, 26, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(-25, 26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = isActive ? '#fde047' : '#94a3b8';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText('AND', -6, 4);

        ctx.restore();
      };

      drawXORGate(gateCenterX, xorGateY, outputs.sum);
      drawANDGate(gateCenterX, andGateY, outputs.carry);

      // ========================================================
      // 6. Draw Input Terminals A & B
      // ========================================================
      const drawTerminal = (x: number, y: number, label: string, isHigh: boolean) => {
        ctx.save();
        ctx.fillStyle = isHigh ? '#38bdf8' : '#1e293b';
        ctx.strokeStyle = isHigh ? '#7dd3fc' : '#475569';
        ctx.lineWidth = 2;
        if (isHigh) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
        }

        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHigh ? '#050811' : '#94a3b8';
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(isHigh ? '1' : '0', x, y + 4.5);

        // Input Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 13px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Input ${label}`, x - 22, y + 4.5);

        ctx.restore();
      };

      drawTerminal(inputX, inputAY, 'A', inputs.a);
      drawTerminal(inputX, inputBY, 'B', inputs.b);

      // ========================================================
      // 7. Draw Output LEDs for Sum & Carry
      // ========================================================
      const drawOutputLED = (
        x: number,
        y: number,
        label: string,
        formula: string,
        isHigh: boolean,
        color: string
      ) => {
        ctx.save();
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

        ctx.fillStyle = isHigh ? '#050811' : '#64748b';
        ctx.font = '700 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(isHigh ? '1' : '0', x, y + 5);

        // Text readout
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 13px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 26, y - 2);

        ctx.fillStyle = isHigh ? color : '#64748b';
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.fillText(formula, x + 26, y + 14);

        ctx.restore();
      };

      drawOutputLED(outputX, sumY, 'Sum (S)', 'A ⊕ B', outputs.sum, '#38bdf8');
      drawOutputLED(outputX, carryY, 'Carry (C)', 'A · B', outputs.carry, '#facc15');

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
          <span className="legend-dot sky"></span>
          <span>Sum = A ⊕ B</span>
        </div>
        <div className="basis-legend-item">
          <span className="legend-dot yellow"></span>
          <span>Carry = A · B</span>
        </div>
      </div>
    </div>
  );
};
