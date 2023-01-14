export class Genome {
  public readonly words: number[] = [];

  constructor(words: number[]) {
    this.words = words.map((word) => (word > 1 ? 1 : word < 0 ? 0 : word));
  }

  public getUnSimilarityTo(gen: Genome): number {
    let distance = 0;
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i]!) {
        distance += Math.abs(this.words[i] - gen.words[i]);
      } else {
        distance += Math.abs(gen.words[i]);
      }
    }
    return distance;
  }

  public mutate(evolutionMultiplier: number): void {
    this.words.forEach((word, index) => {
      this.words[index] += (Math.random() - 0.5) * evolutionMultiplier;
      if (this.words[index] >= 1) {
        this.words[index] = 1;
      }
      if (this.words[index] <= 0) {
        this.words[index] = 0;
      }
    });
  }

  public copy(): Genome {
    return new Genome(this.words);
  }
}
