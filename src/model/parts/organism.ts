import * as THREE from "three";
import { BufferGeometry, Vector3 } from "three";
import { Brain } from "../ml/brain";
import { Eye } from "./eye";
import { Genome } from "./genome";
import { MaxAttributes } from "../consts/maxAttributes";
import { Entity, EntityType } from "./entity";
import { Neuron } from "../ml/neuron";
import { firstNames, lastNames } from "../consts/names";
import { Appearance } from "../utils/appearance";

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
  public maxHP: number;
  public regeneration: number;
  public attack: number;
  public defense: number;
  public brainSpeed: number;
  public aggresiveness: number;
}

export class Organism extends Entity {
  public rotation: number;
  public acceleration: number;
  public speed: THREE.Vector3;
  public brain: Brain;

  public name: string = "";

  public isDead: boolean = true;
  public timeAlive = 0;
  private children: number = 0;
  public genome: Genome;

  public isReadytoMultiply = false;
  public isAggresive = false;
  public hp: number;

  public brainThreshold: number = 20;
  public brainTick = 0;

  public attributes: OrganismAttributes = new OrganismAttributes();

  private material: THREE.Material | THREE.Material[];
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
    this.uuid = this.mesh.uuid;
  }

  private initByGenome(genome: Genome): void {
    // TODO: colors and appearance should be moved to separate class - also change how material is created to show different genes
    this.genome = genome;
    this.setOrganismType(genome);
    this.mesh = Appearance.createAppearance(
      genome,
      this.type,
      this.mesh,
      this.geometry,
      this.material
    );
    this.mesh.scale.set(1, 1, 1);
    this.geometry = this.mesh?.geometry;
    this.material = this.mesh?.material;

    this.name =
      firstNames[Math.floor(genome.words[14] * firstNames.length)] +
      lastNames[Math.floor(genome.words[15] * lastNames.length)];

    // TODO: rules could be moved to separate class

    this.size = genome.words[6] * 0.3 + 0.1;
    this.mass = genome.words[6] * 100;
    if (this.type === EntityType.A) this.mass += 100;

    if (this.type === EntityType.A) {
      this.speed = new THREE.Vector3(
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5),
        0
      );
    } else {
      this.speed = new THREE.Vector3(0.001, 0, 0);
    }

    this.rotation = Math.random() * Math.PI * 2;
    this.acceleration = 0.0;

    this.attributes.maxHP = genome.words[9] * MaxAttributes.MAX_HEALTH;
    this.hp = this.attributes.maxHP;
    this.attributes.regeneration =
      genome.words[10] * MaxAttributes.REGENERATION;
    this.attributes.attack = genome.words[11] * MaxAttributes.ATTACK;
    this.attributes.defense = genome.words[12] * MaxAttributes.DEFENSE;

    this.attributes.brainSpeed = genome.words[13] * MaxAttributes.BRAIN_SPEED;

    this.attributes.energyGain = genome.words[7] * MaxAttributes.ENERGY_GAIN;

    this.attributes.baseEnergy = genome.words[0] * MaxAttributes.BASE_ENERGY;
    this.attributes.lifespan = genome.words[1] * MaxAttributes.LIFESPAN;
    this.attributes.maxEnergy = genome.words[6] * MaxAttributes.MAX_ENERGY;

    this.attributes.speedMultiplier =
      (genome.words[2] *
        MaxAttributes.SPEED_MULTIPLIER *
        Math.pow(1 - genome.words[7], 2)) /
      this.attributes.maxHP;

    this.attributes.moveDrain =
      genome.words[2] * MaxAttributes.SPEED_MULTIPLIER +
      genome.words[7] +
      this.attributes.maxEnergy +
      this.attributes.defense +
      this.attributes.maxHP;

    this.attributes.rotationMultiplier =
      genome.words[3] *
      MaxAttributes.ROTATION_MULTIPLIER *
      Math.pow(1 - genome.words[7], 2);

    this.attributes.eyeSight = genome.words[4] * MaxAttributes.EYE_SIGHT;

    this.attributes.multiplyAge = genome.words[5] * MaxAttributes.MULTIPLY_AGE;

    this.attributes.energyDrain =
      (this.attributes.brainSize +
        this.attributes.eyeSight +
        this.attributes.defense) *
      0.001;

    this.attributes.fieldOfView = Math.PI; // unused

    this.energy = this.attributes.baseEnergy;

    this.attributes.alertness = genome.words[8] * MaxAttributes.ALERTNESS;

    this.eyes = new Eye(Math.PI * 2, 9, this.attributes.alertness);
  }

  private setOrganismType(genome: Genome): void {
    const x = genome.words[7]; // x
    const y = genome.words[13]; // y
    const k = Math.pow(Math.E, x) - x - 1;
    const l = Math.pow(Math.E, x) - 0.2 * x - 1;
    const m = Math.pow(Math.E, x) - 1 + 2 * Math.pow(x, 2);
    if (y < k) {
      this.type = EntityType.A;
    } else if (y < l) {
      this.type = EntityType.B;
    } else if (y < m) {
      this.type = EntityType.C;
    } else {
      this.type = EntityType.D;
    }
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
    if (this.brainTick < this.attributes.brainSpeed) {
      this.brainTick += 1;
      return;
    }
    this.brainTick = 0;
    this.energy -= this.attributes.energyDrain;
    if (this.type !== EntityType.A) {
      this.brain.inputs = this.eyes.pixels.map((pixel) => pixel.value);
      const output = this.brain.calculate();
      this.brain.outputs.forEach((o: Neuron, i) => {
        o.value = output[i];
      });
      if (output[0] > 0.2) {
        this.rotateRight(output[0]);
      }
      if (output[1] > 0.2) {
        this.rotateLeft(output[1]);
      }
      if (output[2] > 0.3) {
        this.accelerate(output[2]);
      }
    }
  }
  public update(): void {
    if (this.energy <= 0) {
      this.kill(
        "died of starvation at age: " +
          this.timeAlive +
          " making: " +
          this.children +
          " offspring"
      );
    } else if (this.hp <= 0) {
      this.kill(
        "died of wounds at age: " +
          this.timeAlive +
          " making: " +
          this.children +
          " offspring"
      );
    } else if (this.timeAlive > this.attributes.lifespan) {
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

    this.regenerateHealth();
    this.updatePosition();
    this.updateSpeed();
    this.updateAcceleration();
    this.updateBrain();
    this.updateMultiplyingRediness();
    this.eyes.reset();
  }

  public rotateLeft(value: number) {
    this.rotation -= value * this.attributes.rotationMultiplier;
    this.acceleration = 0;
  }

  public rotateRight(value: number) {
    this.rotation += value * this.attributes.rotationMultiplier;
    this.acceleration = 0;
  }

  public accelerate(value: number) {
    this.acceleration += this.attributes.speedMultiplier * value + 0.01;
    this.energy -= this.attributes.moveDrain * 0.001 * Math.pow(value, 2);
  }

  private updateMultiplyingRediness() {
    let x = 0.99;
    this.type !== EntityType.A ? (x = 0.99) : (x = 0.998);
    if (
      this.energy > this.attributes.baseEnergy * 3 + this.attributes.maxHP &&
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
    const newBrain = this.brain.copy();
    const newGenes = this.genome.copy();
    newBrain.mutate(mutateFactor);
    newGenes.mutate(mutateFactor);
    const newOrganism = new Organism(newBrain, newGenes);
    let phi = Math.PI * 2 * Math.random();
    // this.type !== EntityType.A ? (x = 3) : (x = Math.random() * 25);

    //this is no random circle
    newOrganism.mesh.position.set(
      this.mesh.position.x + this.size * Math.cos(phi),
      this.mesh.position.y + this.size * Math.sin(phi),
      this.mesh.position.z
    );
    newOrganism.mesh.rotation.set(
      this.mesh.rotation.x,
      this.mesh.rotation.y,
      this.mesh.rotation.z
    );
    newOrganism.rotation = this.rotation;
    newOrganism.isDead = false;
    this.energy -= this.attributes.baseEnergy * 2 + newOrganism.hp;
    return newOrganism;
  }

  public attack(): number {
    this.energy -= this.attributes.attack / 500;
    return this.attributes.attack;
  }

  public takeDamage(damage: number): void {
    const dmg = damage - this.attributes.defense;

    if (dmg > 0) {
      this.hp -= dmg / 10;
    } else {
      this.hp -= 1;
    }
  }

  public regenerateHealth(): void {
    if (this.hp >= this.attributes.maxHP) {
      return;
    }
    this.energy -= this.attributes.regeneration;
    this.hp += this.attributes.regeneration / 10;
  }

  public kill(text: string) {
    if (this.isDead) {
      return;
    }
    console.log(text);
    this.isDead = true;
    this.mesh.position.set(10000, 10000, 0);
    this.mesh.scale.set(0, 0, 0);
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
    this.speed.set(org.speed.x, org.speed.y, org.speed.z);
    this.mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      org.mesh.rotation.z
    );
  }
}
