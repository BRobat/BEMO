export class Gene {

    public readonly words: number[] = [];

    constructor(words: number[]) {
        this.words = words.map(word => word > 1 ? 1 : word < 0 ? 0 : word);
    }

    public getDistanceTo(gen: Gene): number {
        let distance = 0;
        for (let i = 0; i < this.words.length; i++) {
            distance += Math.abs(this.words[i] - gen.words[i]);
        }
        return distance;
    }
}