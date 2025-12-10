"use client";

import { useEffect } from "react";

export function ClientPolyfills() {
  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined" && !(window as any).DOMMatrix) {
      // Check if it exists in globalThis first
      const existingDOMMatrix = (typeof globalThis !== 'undefined' && (globalThis as any).DOMMatrix);
      
      if (existingDOMMatrix) {
        (window as any).DOMMatrix = existingDOMMatrix;
      } else {
        // Create a minimal polyfill
        (window as any).DOMMatrix = class DOMMatrix {
          a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
          m11 = 1; m12 = 0; m13 = 0; m14 = 0;
          m21 = 0; m22 = 1; m23 = 0; m24 = 0;
          m31 = 0; m32 = 0; m33 = 1; m34 = 0;
          m41 = 0; m42 = 0; m43 = 0; m44 = 1;
          is2D = true;
          isIdentity = true;

          constructor(init?: string | number[]) {}
          translate(tx: number, ty: number, tz?: number) { return this; }
          scale(scaleX: number, scaleY?: number, scaleZ?: number) { return this; }
          rotate(rotX: number, rotY?: number, rotZ?: number) { return this; }
          rotateFromVector(x: number, y: number) { return this; }
          rotateAxisAngle(x: number, y: number, z: number, angle: number) { return this; }
          skewX(sx: number) { return this; }
          skewY(sy: number) { return this; }
          multiply(other: any) { return this; }
          flipX() { return this; }
          flipY() { return this; }
          inverse() { return this; }
          transformPoint(point: any) { return point; }
          toFloat32Array() { return new Float32Array(16); }
          toFloat64Array() { return new Float64Array(16); }
          toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
        };
      }
    }
  }, []);
  
  return null;
}
