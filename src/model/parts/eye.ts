import { EntityType } from "./entity";

export class Pixel {
  positiveSignal: number = 0;
  negativeSignal: number = 0;
  neutralSignal: number = 0;
}

export class Eye {
  public pixels: Pixel[] = [];
  public fov: number = 0;

  constructor(fov: number, resolution: number, private alertness: number) {
    this.fov = fov;
    for (let i = 0; i < resolution; i++) {
      this.pixels.push(new Pixel());
    }
  }

  hit(distance: number, ownType: string, hitType: string, angle: number) {
    const pixel = this.determinePixel(angle);
    // TODO: check pixelSignal function

    let isNegativeNeutralPositive = 0;

    switch (ownType) {
      case EntityType.A:
        // nothing happens here
        break;
      case EntityType.B:
        if (hitType === EntityType.A) {
          isNegativeNeutralPositive = 2;
        } else if (hitType === EntityType.B) {
          isNegativeNeutralPositive = 1;
        } else if (hitType === EntityType.C) {
          isNegativeNeutralPositive = 0;
        } else if (hitType === EntityType.D) {
          isNegativeNeutralPositive = 0;
        } else if (hitType === EntityType.EA) {
          isNegativeNeutralPositive = 2;
        }
        break;
      case EntityType.C:
        if (hitType === EntityType.A) {
          isNegativeNeutralPositive = 2;
        } else if (hitType === EntityType.B) {
          isNegativeNeutralPositive = 2;
        } else if (hitType === EntityType.C) {
          isNegativeNeutralPositive = 1;
        } else if (hitType === EntityType.D) {
          isNegativeNeutralPositive = 0;
        } else if (hitType === EntityType.EA) {
          isNegativeNeutralPositive = 2;
        }
        break;
      case EntityType.D:
        if (hitType === EntityType.A) {
          isNegativeNeutralPositive = 1;
        } else if (hitType === EntityType.B) {
          isNegativeNeutralPositive = 2;
        } else if (hitType === EntityType.C) {
          isNegativeNeutralPositive = 2;
        } else if (hitType === EntityType.D) {
          isNegativeNeutralPositive = 0;
        } else if (hitType === EntityType.EA) {
          isNegativeNeutralPositive = 2;
        }
        break;
    }

    if (isNegativeNeutralPositive === 0) {
      pixel.negativeSignal += (1 / distance) * this.alertness;
      if (pixel.negativeSignal > 1) {
        pixel.negativeSignal = 1;
      }
    } else if (isNegativeNeutralPositive === 1) {
      pixel.neutralSignal += (1 / distance) * this.alertness;
      if (pixel.neutralSignal > 1) {
        pixel.neutralSignal = 1;
      }
    } else {
      pixel.positiveSignal += (1 / distance) * this.alertness;
      if (pixel.positiveSignal > 1) {
        pixel.positiveSignal = 1;
      }
    }
  }

  determinePixel(angle: number): Pixel {
    // TODO: rotate so if fov is smaller than 360, it is centered.
    const pixelAngle = this.fov / this.pixels.length;
    const pixelIndex = Math.floor(angle / pixelAngle);
    return this.pixels[pixelIndex];
  }

  public unhit() {}

  public reset() {
    this.pixels.forEach((pixel) => {
      pixel.positiveSignal = 0;
      pixel.negativeSignal = 0;
      pixel.neutralSignal = 0;
    });
  }
}
