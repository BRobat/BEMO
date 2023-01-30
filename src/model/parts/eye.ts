export class Pixel {
  positiveSignal: number = 0;
  negativeSignal: number = 0;
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

  hit(distance: number, genomeDistance: number, angle: number) {
    const pixel = this.determinePixel(angle);
    if (genomeDistance > 1) {
      pixel.negativeSignal += distance / this.alertness;
      if (pixel.negativeSignal > 1) {
        pixel.negativeSignal = 1;
      }
    } else {
      pixel.positiveSignal += distance / this.alertness;
      if (pixel.positiveSignal > 1) {
        pixel.positiveSignal = 1;
      }
    }
  }

  determinePixel(angle: number): Pixel {
    const pixelAngle = this.fov / this.pixels.length;
    const pixelIndex = Math.floor(angle / pixelAngle);
    return this.pixels[pixelIndex];
  }

  public unhit() {}

  public reset() {
    this.pixels.forEach((pixel) => {
      pixel.positiveSignal = 0;
      pixel.negativeSignal = 0;
    });
  }
}
