import { Vector3 } from "three";

export class MathFunctions {
  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  static det(v1: Vector3, v2: Vector3): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static triangleCollizion(
    v: Vector3,
    v0: Vector3,
    v1: Vector3,
    v2: Vector3
  ): boolean {
    let det1 = MathFunctions.det(v, v1);
    let det2 = MathFunctions.det(v, v2);
    let v0v1 = MathFunctions.det(v0, v1);
    let v0v2 = MathFunctions.det(v0, v2);
    let v1v2 = MathFunctions.det(v1, v2);

    const a = (det2 - v0v2) / v1v2;
    const b = -(det1 - v0v1) / v1v2;

    return a > 0 && b > 0 && a + b < 1;
  }
}
