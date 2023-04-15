// Neuron could work on gpu
import { MathFunctions } from "../utils/math";

export class Neuron {
  weights: number[] = [];
  bias: number = 0;
  value: number = 0;

  constructor(weights: number[], bias: number) {
    this.weights = weights;
    this.bias = bias;
  }

  public calculate(input: number[]): void {
    let sum = 1;
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * this.weights[i];
    }
    sum += this.bias;
    this.value = MathFunctions.sigmoid(sum);
  }
}
