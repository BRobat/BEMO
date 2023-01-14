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
}

export class Organism extends Entity {
  public rotation: number;
  public acceleration: number;
  private speed: THREE.Vector3;
  public brain: Brain;

  public isDead: boolean = true;
  public timeAlive = 0;
  public energy = 0;
  private children: number = 0;
  private genome: Genome;

  public isReadytoMultiply = false;

  public attributes: OrganismAttributes = new OrganismAttributes();

  private material: THREE.MeshBasicMaterial;

  public eyes: Eye[] = [];

  constructor(brain: Brain, genome: Genome) {
    super();
    let geometry = new THREE.IcosahedronGeometry(0.1, 2);

    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(64, 64, 64),
    });
    this.initByGenome(genome);

    this.mesh = new THREE.Mesh(geometry, this.material);
    if (brain) {
      this.brain = brain;
      this.attributes.brainSize = brain.hidden.length;
    }

    this.eyes.push(
      new Eye(
        this.mesh.position,
        new Vector3(this.attributes.eyeSight / 4, this.attributes.eyeSight, 0),
        new Vector3(-this.attributes.eyeSight / 4, this.attributes.eyeSight, 0)
      )
    );
    this.eyes.push(
      new Eye(
        this.mesh.position,
        new Vector3(-this.attributes.eyeSight, this.attributes.eyeSight / 2, 0),
        new Vector3(-this.attributes.eyeSight / 4, this.attributes.eyeSight, 0)
      )
    );
    this.eyes.push(
      new Eye(
        this.mesh.position,
        new Vector3(this.attributes.eyeSight, this.attributes.eyeSight / 2, 0),
        new Vector3(this.attributes.eyeSight / 4, this.attributes.eyeSight, 0)
      )
    );
    // // this.eyes.push(new Eye(this.mesh.position, new Vector3(0, this.eyeSight * 0.0, 0), new Vector3(0, 0, 0)))
    // this.eyes.push(new Eye(this.mesh.position, new Vector3(-this.eyeSight, this.eyeSight / 2, 0), new Vector3(-this.eyeSight, 0, 0)))
    // this.eyes.push(new Eye(this.mesh.position, new Vector3(this.eyeSight, this.eyeSight / 2, 0), new Vector3(this.eyeSight, 0, 0)))
  }

  private initByGenome(genome: Genome): void {
    const r =
      Math.floor(genome.words[0] * 100) + Math.floor(genome.words[1] * 100);
    const g =
      Math.floor(genome.words[2] * 100) + Math.floor(genome.words[3] * 100);
    const b =
      Math.floor(genome.words[4] * 100) + Math.floor(genome.words[5] * 100);

    this.material.color.set(new THREE.Color(r, g, b));
    this.material.color.convertSRGBToLinear();

    this.speed = new THREE.Vector3(0.001, 0, 0);
    this.genome = genome;
    this.rotation = 0;
    this.acceleration = 0.0;

    this.attributes.baseEnergy = genome.words[0] * MaxAttributes.BASE_ENERGY;
    this.attributes.lifespan = genome.words[1] * MaxAttributes.LIFESPAN;
    this.attributes.speedMultiplier =
      genome.words[2] * MaxAttributes.SPEED_MULTIPLIER;
    this.attributes.rotationMultiplier =
      genome.words[3] * MaxAttributes.ROTATION_MULTIPLIER;
    this.attributes.eyeSight = genome.words[4] * MaxAttributes.EYE_SIGHT;
    this.attributes.multiplyAge = genome.words[5] * MaxAttributes.MULTIPLY_AGE;
    this.attributes.maxEnergy = genome.words[6] * MaxAttributes.MAX_ENERGY;

    this.energy = this.attributes.baseEnergy;
  }

  private updateEyes(): void {
    this.eyes.forEach((eye) => {
      eye.mesh.position.set(
        this.mesh.position.x,
        this.mesh.position.y,
        this.mesh.position.z
      );
      eye.mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), -this.rotation);
    });
  }

  private updatePosition(): void {
    if (this.isDead) {
      this.eyes.forEach((eye) => eye.unhit());
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

    this.energy -= this.attributes.brainSize * 0.001;
    this.brain.inputs = [
      this.eyes[0].hitEPack
        ? 1 - this.eyes[0].energyPackDistance / this.attributes.eyeSight / 5
        : 0,
      this.eyes[1].hitEPack
        ? 1 - this.eyes[1].energyPackDistance / this.attributes.eyeSight / 5
        : 0,
      this.eyes[2].hitEPack
        ? 1 - this.eyes[2].energyPackDistance / this.attributes.eyeSight / 5
        : 0,
      // this.eyes[0].hitEPack ? this.eyes[0].energyPackDistance : 0,
      // this.eyes[1].hitEPack ? this.eyes[1].energyPackDistance : 0,
      // this.eyes[2].hitEPack ? this.eyes[2].energyPackDistance : 0,
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
    this.updateEyes();
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
    this.energy -= this.acceleration * 15;
  }

  private updateMultiplyingRediness() {
    if (
      this.energy > this.attributes.baseEnergy * 3 &&
      this.timeAlive > this.attributes.multiplyAge &&
      Math.random() > 0.99
    ) {
      this.isReadytoMultiply = true;
    } else {
      this.isReadytoMultiply = false;
    }
  }

  public getOffspring(mutateFactor: number): Organism {
    this.children++;
    this.energy -= this.attributes.baseEnergy;
    const newBrain = this.brain.copy();
    const newGenes = this.genome.copy();
    newBrain.mutate(mutateFactor);
    newGenes.mutate(mutateFactor);
    const newOrganism = new Organism(newBrain, newGenes);
    newOrganism.mesh.position.set(
      this.mesh.position.x,
      this.mesh.position.y,
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
