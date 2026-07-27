import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

export const StyledQRCode = ({
  value = 'https://nanolink.app',
  size = 180,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  level = 'H',
  includeMargin = true,
  pattern = 'squares',
  cornerStyle = 'square',
  frame = 'none',
  id = 'styled-qr-svg'
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    let tempDiv = null;

    try {
      tempDiv = document.createElement('div');

      let dotsType = 'square';
      if (pattern === 'dots') dotsType = 'dots';
      if (pattern === 'rounded') dotsType = 'rounded';

      let cornersSquareType = 'square';
      let cornersDotType = 'square';
      if (cornerStyle === 'dot') {
        cornersSquareType = 'dot';
        cornersDotType = 'dot';
      } else if (cornerStyle === 'extra-rounded') {
        cornersSquareType = 'extra-rounded';
        cornersDotType = 'dot';
      }

      const options = {
        width: size || 180,
        height: size || 180,
        data: value || 'https://nanolink.app',
        margin: includeMargin ? 8 : 0,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: level || 'H'
        },
        dotsOptions: {
          color: fgColor || '#000000',
          type: dotsType
        },
        backgroundOptions: {
          color: bgColor || '#FFFFFF'
        },
        cornersSquareOptions: {
          color: fgColor || '#000000',
          type: cornersSquareType
        },
        cornersDotOptions: {
          color: fgColor || '#000000',
          type: cornersDotType
        },
        type: 'svg'
      };

      const qr = new QRCodeStyling(options);
      qr.append(tempDiv);

      const checkAndMove = () => {
        if (isCancelled || !tempDiv) return;
        try {
          const svgEl = tempDiv.querySelector('svg') || tempDiv.firstChild;
          if (svgEl && containerRef.current) {
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(svgEl);
          } else {
            requestAnimationFrame(checkAndMove);
          }
        } catch (err) {
          console.error('Error attaching QR SVG:', err);
        }
      };
      checkAndMove();
    } catch (error) {
      console.error('Error generating QRCodeStyling:', error);
    }

    return () => {
      isCancelled = true;
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [value, size, fgColor, bgColor, level, includeMargin, pattern, cornerStyle, frame]);

  const qrElement = (
    <div 
      key={`qr-canvas-${frame}`}
      id={id} 
      ref={containerRef} 
      className="inline-flex items-center justify-center bg-white overflow-hidden shrink-0" 
      style={{ width: size, height: size, minWidth: size, minHeight: size, maxWidth: size, maxHeight: size }} 
    />
  );

  if (frame === 'scan-me') {
    return (
      <div key="frame-scan-me" className="inline-flex flex-col items-center justify-center bg-white border-2 border-black p-3 relative shrink-0 w-fit h-fit mx-auto">
        {qrElement}
        <div key="banner-scan-me" className="bg-[#FF6206] text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-3 w-full text-center mt-3 shrink-0">
          SCAN ME
        </div>
      </div>
    );
  }

  if (frame === 'border') {
    return (
      <div key="frame-border" className="inline-flex items-center justify-center p-3 bg-white border-4 border-black shrink-0 w-fit h-fit mx-auto">
        {qrElement}
      </div>
    );
  }

  return (
    <div key="frame-none" className="inline-flex items-center justify-center shrink-0 w-fit h-fit mx-auto">
      {qrElement}
    </div>
  );
};

export default StyledQRCode;
