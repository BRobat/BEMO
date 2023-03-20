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
    this.value = this.sigmoid(sum);
  }

  sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
}
