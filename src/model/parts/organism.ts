import * as THREE from "three";
import { Vector3 } from "three";
import { Brain } from "../ml/brain";
import { Eye } from "./eye";
import { Genome } from "./genome";
import { MaxAttributes } from "../consts/maxAttributes";
import { Entity } from "./entity";

export class OrganismAttributes {
  public speedMultiplier: number;
  public rotationMultiplier: number;
  public multiplyAge: number;
  public maxEnergy: number;
  public baseEnergy: number;
  public eyeSight: number;
  public brainSize: number;
  public lifespan: number;
  public moveDrain: number;
  public energyDrain: number;
  public energyGain: number;
  public fieldOfView: number;
  public alertness: number;
}

export class Organism extends Entity {
  public rotation: number;
  public acceleration: number;
  private speed: THREE.Vector3;
  public brain: Brain;

  public isDead: boolean = true;
  public timeAlive = 0;
  private children: number = 0;
  public genome: Genome;
  public hasMouth: boolean = true;

  public isReadytoMultiply = false;
  public isAggresive = false;

  public attributes: OrganismAttributes = new OrganismAttributes();

  private material: THREE.MeshBasicMaterial;
  private geometry: THREE.BufferGeometry;

  public eyes: Eye = null;

  constructor(brain: Brain, genome: Genome) {
    super();

    if (brain) {
      this.brain = brain;
      this.attributes.brainSize = brain.hidden.length;
    }
    this.initByGenome(genome);

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // // this.eyes.push(new Eye(this.mesh.position, new Vector3(0, this.eyeSight * 0.0, 0), new Vector3(0, 0, 0)))
    // this.eyes.push(new Eye(this.mesh.position, new Vector3(-this.eyeSight, this.eyeSight / 2, 0), new Vector3(-this.eyeSight, 0, 0)))
    // this.eyes.push(new Eye(this.mesh.position, new Vector3(this.eyeSight, this.eyeSight / 2, 0), new Vector3(this.eyeSight, 0, 0)))
  }

  private initByGenome(genome: Genome): void {
    let r =
      Math.floor(genome.words[6] * 100) +
      Math.floor(genome.words[1] * 100) -
      Math.floor(genome.words[7] * 200) +
      50;
    if (r < 0) {
      r = 0;
    } else if (r > 255) {
      r = 255;
    }

    const g = Math.floor(genome.words[7] * 250);
    const b = Math.floor(genome.words[4] * 200) + 50;

    if (genome.words[7] > 0.5) {
      this.hasMouth = false;
      this.geometry = new THREE.IcosahedronGeometry(0.2, 2);
    } else {
      this.hasMouth = true;
      this.geometry = new THREE.CapsuleGeometry(0.1, 0.2, 4, 8);
    }

    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(`rgb(${r}, ${g}, ${b})`),
    });

    if (this.mesh?.material) {
      this.mesh.material = this.material;
      this.mesh.geometry = this.geometry;
    }

    this.speed = new THREE.Vector3(0.001, 0, 0);
    this.genome = genome;
    this.rotation = 0;
    this.acceleration = 0.0;

    this.attributes.energyGain = genome.words[7] * MaxAttributes.ENERGY_GAIN;

    this.attributes.baseEnergy = genome.words[0] * MaxAttributes.BASE_ENERGY;
    this.attributes.lifespan = genome.words[1] * MaxAttributes.LIFESPAN;
    this.attributes.speedMultiplier =
      genome.words[2] *
      MaxAttributes.SPEED_MULTIPLIER *
      Math.pow(1 - genome.words[7], 2);
    this.attributes.moveDrain =
      genome.words[2] * MaxAttributes.SPEED_MULTIPLIER + genome.words[7];
    this.attributes.rotationMultiplier =
      genome.words[3] *
      MaxAttributes.ROTATION_MULTIPLIER *
      Math.pow(1 - genome.words[7], 2);
    this.attributes.eyeSight =
      genome.words[4] *
      MaxAttributes.EYE_SIGHT *
      Math.pow(1 - genome.words[7], 2);
    this.attributes.multiplyAge = genome.words[5] * MaxAttributes.MULTIPLY_AGE;
    this.attributes.maxEnergy = genome.words[6] * MaxAttributes.MAX_ENERGY;

    this.attributes.energyDrain =
      (this.attributes.brainSize + this.attributes.eyeSight) * 0.0005;

    this.attributes.fieldOfView = Math.PI;

    this.energy = this.attributes.baseEnergy;

    this.attributes.alertness = genome.words[8] * MaxAttributes.ALERTNESS;

    this.eyes = new Eye(Math.PI * 2, 4, this.attributes.alertness);
  }

  private updatePosition(): void {
    if (this.isDead) {
      this.eyes.reset();
      return;
    }
    this.timeAlive++;
    this.mesh.position.add(this.speed);
    this.mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), -this.rotation);
  }

  private updateSpeed(): void {
    const acc = new Vector3(
      Math.sin(this.rotation) * this.acceleration,
      Math.cos(this.rotation) * this.acceleration,
      0
    );
    this.speed.add(acc);
    this.speed.multiply(new Vector3(0.9, 0.9, 0.9));
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
    this.energy -= this.attributes.energyDrain;
    if (this.hasMouth) {
      this.brain.inputs = [
        this.eyes.pixels[0].negativeSignal
          ? this.eyes.pixels[0].negativeSignal
          : 0,
        this.eyes.pixels[0].positiveSignal
          ? this.eyes.pixels[0].positiveSignal
          : 0,
        this.eyes.pixels[1].negativeSignal
          ? this.eyes.pixels[1].negativeSignal
          : 0,
        this.eyes.pixels[1].positiveSignal
          ? this.eyes.pixels[1].positiveSignal
          : 0,
        this.eyes.pixels[2].negativeSignal
          ? this.eyes.pixels[2].negativeSignal
          : 0,
        this.eyes.pixels[2].positiveSignal
          ? this.eyes.pixels[2].positiveSignal
          : 0,
        this.eyes.pixels[3].negativeSignal
          ? this.eyes.pixels[3].negativeSignal
          : 0,
        this.eyes.pixels[3].positiveSignal
          ? this.eyes.pixels[3].positiveSignal
          : 0,
        this.acceleration,
        this.energy / this.attributes.maxEnergy / 2,
      ];
      const output = this.brain.calculate();
      if (output[0] > 0.5) {
        this.rotateRight(output[0]);
      }
      if (output[1] > 0.5) {
        this.rotateLeft(output[1]);
      }
      if (output[2] > 0.5) {
        this.accelerate((output[2] - 0.5) * 2);
      }
      if (output[3] > 0.9) {
        this.isAggresive = true;
      } else {
        this.isAggresive = false;
      }
    }
  }
  public update(): void {
    if (this.timeAlive > this.attributes.lifespan || this.energy <= 0) {
      if (this.energy <= 0) {
        this.kill(
          "died of starvation at age: " +
            this.timeAlive +
            " making: " +
            this.children +
            " offspring" +
            " with energy:" +
            this.energy
        );
      } else {
        this.kill(
          "died of old age: " +
            this.timeAlive +
            " making: " +
            this.children +
            " offspring" +
            " with energy:" +
            this.energy
        );
      }
    }

    this.updatePosition();
    this.updateSpeed();
    this.updateAcceleration();
    this.updateBrain();
    this.updateMultiplyingRediness();
  }

  public rotateLeft(value: number) {
    this.rotation -= 0.05 * value * this.attributes.rotationMultiplier;
    this.acceleration = 0;
  }

  public rotateRight(value: number) {
    this.rotation += 0.05 * value * this.attributes.rotationMultiplier;
    this.acceleration = 0;
  }

  public accelerate(value: number) {
    this.acceleration += 0.0001 * this.attributes.speedMultiplier * value;
    this.energy -= this.attributes.moveDrain * 0.001 * value;
  }

  private updateMultiplyingRediness() {
    let x = 0.99;
    this.hasMouth ? (x = 0.99) : (x = 0.998);
    if (
      this.energy > this.attributes.baseEnergy * 3 &&
      this.timeAlive > this.attributes.multiplyAge &&
      Math.random() > x
    ) {
      this.isReadytoMultiply = true;
    } else {
      this.isReadytoMultiply = false;
    }
  }

  public getOffspring(mutateFactor: number): Organism {
    this.children++;
    this.energy -= this.attributes.baseEnergy * 2;
    const newBrain = this.brain.copy();
    const newGenes = this.genome.copy();
    newBrain.mutate(mutateFactor);
    newGenes.mutate(mutateFactor);
    const newOrganism = new Organism(newBrain, newGenes);
    let x = 1;
    this.hasMouth ? (x = 1) : (x = 5);
    newOrganism.mesh.position.set(
      this.mesh.position.x + Math.random() * x - x / 2,
      this.mesh.position.y + Math.random() * x - x / 2,
      this.mesh.position.z
    );
    newOrganism.mesh.rotation.set(
      this.mesh.rotation.x,
      this.mesh.rotation.y,
      this.mesh.rotation.z
    );
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
    this.mesh.position.set(1000, 1000, 0);
  }

  public addEnergy(energy: number) {
    this.energy += energy;
    if (this.energy > this.attributes.maxEnergy) {
      this.energy = this.attributes.maxEnergy;
    }
  }

  public copyParameters(org: Organism): void {
    this.rotation = org.rotation;
    this.brain = org.brain;
    this.genome = org.genome;
    this.initByGenome(org.genome);
    this.timeAlive = 0;
    this.isDead = false;
    this.children = 0;
    this.isReadytoMultiply = false;
    this.mesh.position.set(
      org.mesh.position.x,
      org.mesh.position.y,
      org.mesh.position.z
    );
    this.mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      org.mesh.rotation.z
    );
  }
}
