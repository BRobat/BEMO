import { Neuron } from "./neuron";

export class Brain {
    public inputs: number[] = [];
    public hidden: Neuron[] = [];
    public outputs: Neuron[] = [];

    constructor(inputsNo: number, hiddenNo: number, outputsNo: number) {
        for (let i = 0; i < inputsNo; i++) {
            this.inputs.push(Math.random())
        }
        for (let i = 0; i < hiddenNo; i++) {
            const n: number[] = [];
            for (let j = 0; j < inputsNo; j++) {
                n.push(Math.random());
            }
            this.hidden.push(new Neuron(n, Math.random()));
        }
        for (let i = 0; i < outputsNo; i++) {
            const n: number[] = [];
            for (let j = 0; j < hiddenNo; j++) {
                n.push(Math.random());
            }
            this.outputs.push(new Neuron(n, Math.random()));
        }
    }

    public calculate(): number[] {
        let hiddenValues: number[] = [];
        this.hidden.forEach(neuron => {
            neuron.calculate(this.inputs);
            hiddenValues.push(neuron.value);
        });
        let outputValues: number[] = [];
        this.outputs.forEach(neuron => {
            neuron.calculate(hiddenValues);
            outputValues.push(neuron.value);
        });
        return outputValues;
    }

    public randomize(evolutionMultiplier: number): void {
        this.hidden.forEach(neuron => {
            neuron.weights.forEach((weight, index) => {
                neuron.weights[index] += ((Math.random() - 0.5) * evolutionMultiplier);
                if (neuron.weights[index] >= 1) {
                    neuron.weights[index] = 1;
                }
                if (neuron.weights[index] <= 0) {
                    neuron.weights[index] = 0;
                }

            });
            neuron.bias += ((Math.random() - 0.5) * evolutionMultiplier);
            if (neuron.bias >= 1) {
                neuron.bias = 1;
            }
            if (neuron.bias <= 0) {
                neuron.bias = 0;
            }
        });
        this.outputs.forEach(neuron => {
            neuron.weights.forEach((weight, index) => {
                neuron.weights[index] += ((Math.random() - 0.5) * evolutionMultiplier);
                if (neuron.weights[index] >= 1) {
                    neuron.weights[index] = 1;
                }
                if (neuron.weights[index] <= 0) {
                    neuron.weights[index] = 0;
                }
            });
            neuron.bias += ((Math.random() - 0.5) * evolutionMultiplier);
            if (neuron.bias >= 1) {
                neuron.bias = 1;
            }
            if (neuron.bias <= 0) {
                neuron.bias = 0;
            }
        });
    }

    public copy(): Brain {
        const newBrain =  new Brain(this.inputs.length, this.hidden.length, this.outputs.length);

        let newInputs: number[] = [];
        this.inputs.forEach((number: number) => {
            newInputs.push(number)
        })
        let newHidden: Neuron[] = [];
        this.hidden.forEach(neuron => {
            let newWeights: number[] = [];
            neuron.weights.forEach(weight => {
                newWeights.push(weight);
            });
            newHidden.push(new Neuron(newWeights, neuron.bias));
        });
        let newOutputs: Neuron[] = [];
        this.outputs.forEach(neuron => {
            let newWeights: number[] = [];
            neuron.weights.forEach(weight => {
                newWeights.push(weight);
            });
            newOutputs.push(new Neuron(newWeights, neuron.bias));
        });
        newBrain.inputs = newInputs;
        newBrain.hidden = newHidden
        newBrain.outputs = newOutputs;

        return newBrain;
    }
}