import * as THREE from 'three';
import { Vector3 } from 'three';
import { Brain } from './brain';
import { Eye } from './eye';
import { Gene } from './gene';

export class Organism {

    public mesh: THREE.Mesh;

    public rotation: number;
    public acceleration: number;
    private speed: THREE.Vector3;
    public brain: Brain;
    private brainSize: number;
    public speedMultiplier: number = 1;
    public rotationMultiplier: number = 1;

    public isDead: boolean = true;
    public timeAlive = 0;
    public lifespan: number = 0;
    public energy = 0;
    private children: number = 0;

    public isReadytoMultiply = false;


    public eyes: Eye[] = [];
    public readonly eyeSight: number = 5;

    constructor(brain: Brain, genes: Gene[], energy: number, lifespan: number, speedMultiplier: number) {
        let geometry = new THREE.IcosahedronGeometry(0.1, 2);
        let material = new THREE.MeshBasicMaterial({ color: 0x0088ff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.speed = new THREE.Vector3(0.01, 0, 0);
        this.rotation = 0;
        this.acceleration = 0.0;
        this.energy = energy;
        this.lifespan = lifespan;
        this.speedMultiplier = speedMultiplier;

        if (brain) {
            this.brain = brain;
            this.brainSize = brain.hidden.length;
        }


        this.eyes.push(new Eye(this.mesh.position, new Vector3(this.eyeSight / 4, this.eyeSight, 0), new Vector3(-this.eyeSight / 4, this.eyeSight, 0)))
        this.eyes.push(new Eye(this.mesh.position, new Vector3(-this.eyeSight, this.eyeSight / 2, 0), new Vector3(-this.eyeSight / 4, this.eyeSight, 0)))
        this.eyes.push(new Eye(this.mesh.position, new Vector3(this.eyeSight, this.eyeSight / 2, 0), new Vector3(this.eyeSight / 4, this.eyeSight, 0)))
        // // this.eyes.push(new Eye(this.mesh.position, new Vector3(0, this.eyeSight * 0.0, 0), new Vector3(0, 0, 0)))
        // this.eyes.push(new Eye(this.mesh.position, new Vector3(-this.eyeSight, this.eyeSight / 2, 0), new Vector3(-this.eyeSight, 0, 0)))
        // this.eyes.push(new Eye(this.mesh.position, new Vector3(this.eyeSight, this.eyeSight / 2, 0), new Vector3(this.eyeSight, 0, 0)))
    }


    private updateEyes(): void {
        this.eyes.forEach(eye => {
            eye.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
            eye.mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), -this.rotation);
        })
    }

    private updatePosition(): void {
        if (this.isDead) {
            this.eyes.forEach((eye) => eye.unhit())
            return;
        }
        this.timeAlive++;
        this.mesh.position.add(this.speed);
        this.mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), -this.rotation);
    }

    private updateSpeed(): void {
        const acc = new Vector3(Math.sin(this.rotation) * this.acceleration, Math.cos(this.rotation) * this.acceleration, 0);
        this.speed.add(acc);
        this.speed.multiply(new Vector3(0.9, 0.9, 0.9))
    }

    private updateAcceleration(): void {
        if (this.acceleration >= 0.01) {
            this.acceleration = 0;
        } else {
            this.acceleration *= 0.9;
        }
    }

    private updateBrain(): void {
        if (this.isDead) {
            return;
        }

        this.energy -= this.brainSize * 0.001;
        this.brain.inputs = [
            this.eyes[0].hitObs ? this.eyes[0].obstacleDistance : 0,
            this.eyes[0].hitEPack ? this.eyes[0].energyPackDistance : 0,
            this.eyes[1].hitObs ? this.eyes[1].obstacleDistance : 0,
            this.eyes[1].hitEPack ? this.eyes[1].energyPackDistance : 0,
            this.eyes[2].hitObs ? this.eyes[2].obstacleDistance : 0,
            this.eyes[2].hitEPack ? this.eyes[2].energyPackDistance : 0,
            // this.eyes[3].hitObs ? this.eyes[2].obstacleDistance : 0,
            // this.eyes[3].hitEPack ? this.eyes[2].energyPackDistance : 0,
            // this.eyes[4].hitObs ? this.eyes[2].obstacleDistance : 0,
            // this.eyes[4].hitEPack ? this.eyes[2].energyPackDistance : 0,
            this.acceleration,
            this.energy / 1000]
        const output = this.brain.calculate()
        if (output[0] > 0.5) {
            this.rotateRight(output[0]);
        }
        if (output[1] > 0.5) {
            this.rotateLeft(output[1]);
        }
        if (output[2] > 0.5) {
            this.accelerate((output[2] - 0.5) * 2);
        }

    }
    public update(): void {
        if (this.timeAlive > this.lifespan || this.energy <= 0) {
            if (this.energy <= 0) {
                this.kill('died of starvation at age: ' + this.timeAlive + ' making: ' + this.children + ' offspring' + ' with energy:' + this.energy)
            }
            else {
                this.kill('died of old age: ' + this.timeAlive + ' making: ' + this.children + ' offspring' + ' with energy:' + this.energy)
            }

        }


        this.updatePosition();
        this.updateSpeed();
        this.updateAcceleration();
        this.updateEyes();
        this.updateBrain();
        this.updateMultiplyingRediness();
    }

    public rotateLeft(value: number) {
        this.rotation -= 0.05 * value * this.rotationMultiplier;
        this.acceleration = 0;
    }

    public rotateRight(value: number) {
        this.rotation += 0.05 * value * this.rotationMultiplier;
        this.acceleration = 0;
    }

    public accelerate(value: number) {
        this.acceleration += 0.0001 * this.speedMultiplier * value;
        this.energy -= this.acceleration * 15;
    }

    private updateMultiplyingRediness() {
        if (this.energy > 300 && this.timeAlive > 300 && Math.random() > 0.99) {
            this.isReadytoMultiply = true;
        } else {
            this.isReadytoMultiply = false;
        }
    }

    public getOffspring(): Organism {
        this.children++;
        const newBrain = this.brain.copy()
        newBrain.randomize(0.01);
        const newOrganism = new Organism(newBrain, null, 0, 0, this.speedMultiplier + (Math.random() * 0.5 + 0.5) * 0.1);
        newOrganism.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
        newOrganism.mesh.rotation.set(this.mesh.rotation.x, this.mesh.rotation.y, this.mesh.rotation.z);
        newOrganism.rotation = this.rotation;
        newOrganism.isDead = false;
        return newOrganism;
    }

    public kill(text: string) {
        if (this.isDead) {
            return;
        }
        console.log(text);
        this.isDead = true;
        this.mesh.position.set(100, 100, 0);
    }

    public addEnergy(energy: number) {

        this.energy += energy;
        if (this.energy > 1000) {
            this.energy = 1000;
        }

    }
}
