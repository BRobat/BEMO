import { Organism } from "../parts/organism";
import { Obstacle } from "../parts/obstacle";
import { Physics } from "./physics";
import { EnergyPack } from "../parts/energyPack";
import { Brain } from "../ml/brain";
import { Genome } from "../parts/genome";
import { Entity, EntityType } from "../parts/entity";
import { HashUtils } from "./hashUtils";
import { Vector3 } from "three";

export class Data {
  public entities: Entity[] = [];
  public organisms: Organism[] = [];
  public obstacles: Obstacle[] = [];
  public energyPacks: EnergyPack[] = [];
  public generation: number = 0;
  public brains: Brain[] = [];
  public bestScore: number = 0;

  public batchSize: number = 4000;
  public obstacleBatch: number = 500;

  public aliveOrganisms: number = 0;
  public sunEnergy: number = 0.2;

  hashThreshold: number;

  public hashList: Map<string, number[]> = new Map();

  constructor(private mapSize: number) {
    this.hashThreshold = 10;
    this.initBrains();
    this.initObstacles();
    this.initOrganisms(1000);
    this.initEnergyPacks();
  }

  public addOrganisms(org: Organism): void {
    this.organisms.push(org);
  }

  public removeOrganisms() {
    this.organisms = [];
  }

  public addObstacle(obstacle: Obstacle): void {
    this.obstacles.push(obstacle);
  }

  public updateOrganisms() {
    this.feedPlants();
    this.teleportOrganisms();
    this.hashEntities();
    this.collideEntities();
    this.organisms.forEach((org) => {
      const deadStatus = org.isDead;
      const pos = org.mesh.position.clone();
      const energy = org.energy;
      org.update();
      if (!deadStatus && org.isDead) {
        this.addEnergyPack(pos, energy + org.attributes.maxHP);
      }
    });
    this.getOffsprings();
    // this.updateEnergyPacks();
    this.getDeadOrganisms();
  }

  public addEnergyPack(position: THREE.Vector3, energy: number): void {
    const n = this.energyPacks.find((energyPack) => !energyPack.isActive);
    if (n == null) {
      return;
    }
    n.mesh.position.set(position.x, position.y, 0);
    n.energy = energy - 5;
    n.activate();
  }

  public feedPlants() {
    this.hashList.forEach((value, key) => {
      const entities = value.map((index) => this.entities[index]);
      const plants = entities.filter(
        (entity) => entity instanceof Organism && entity.type == EntityType.A
      ) as Organism[];
      if (plants.length > 0) {
        const energy = this.sunEnergy / plants.length;
        plants.forEach((plant) => {
          plant.energy += energy * plant.attributes.energyGain;
        });
      }
    });
  }

  public updateEnergyPacks() {
    this.energyPacks.forEach((energyPack) => {
      if (energyPack.isActive && Math.random() < 0.05) {
        const n = this.energyPacks.find((energyPack) => !energyPack.isActive);
        if (n == null) {
          return;
        }
        let x = (Math.random() - 0.5) * 30 + energyPack.mesh.position.x;
        let y = (Math.random() - 0.5) * 30 + energyPack.mesh.position.y;
        if (x > this.mapSize) {
          x -= this.mapSize;
        }
        if (x < -this.mapSize) {
          x += this.mapSize;
        }
        if (y > this.mapSize) {
          y -= this.mapSize;
        }
        if (y < -this.mapSize) {
          y += this.mapSize;
        }
        n.mesh.position.set(x, y, 0);
        n.activate();
      }
    });
  }

  private getOffsprings() {
    const planktonNumber = this.getPlanktonNumber();
    const canSpawnPlankton = planktonNumber < 2000;
    this.organisms.forEach((org) => {
      if (
        !org.isDead &&
        org.isReadytoMultiply &&
        ((org.type === EntityType.A &&
          this.aliveOrganisms < this.batchSize &&
          canSpawnPlankton) ||
          (org.type !== EntityType.A && this.aliveOrganisms < this.batchSize))
      ) {
        let n = this.organisms.find((org) => org.isDead);
        if (n == null) {
          return;
        }
        org.isReadytoMultiply = false;
        let newOrganism: Organism = null;
        if (Math.random() > 0.99) {
          newOrganism = org.getOffspring(0.3);
        } else {
          newOrganism = org.getOffspring(0.05);
        }
        n.copyParameters(newOrganism);
      }
    });
  }

  private getPlanktonNumber(): number {
    return this.organisms.filter(
      (org) => org.type === EntityType.A && !org.isDead
    ).length;
  }

  private hashEntities() {
    HashUtils.hashEntities(this, this.hashThreshold);
  }

  private collideEntities(): void {
    Physics.collideEntities(this.entities, this.hashList, this.hashThreshold);
  }

  private initBrains() {
    for (let i = 0; i < this.batchSize; i++) {
      this.brains.push(new Brain(9, 6, 3));
    }
  }

  private initObstacles() {
    this.obstacles = [];
    let lastPosition = new Vector3(0, 0, 0);
    let lastSize = 0;
    let lastAngle = 0;
    for (let i = 0; i < this.obstacleBatch; i++) {
      const newObstacle = new Obstacle(Math.random() + 1);
      if (Math.random() < 0.99) {
        newObstacle.mesh.position.set(
          lastPosition.x + lastSize * Math.cos(lastAngle),
          lastPosition.y + lastSize * Math.sin(lastAngle),
          0
        );
      } else {
        newObstacle.mesh.position.set(
          Math.random() * this.mapSize - this.mapSize / 2,
          Math.random() * this.mapSize - this.mapSize / 2,
          0
        );
      }

      lastAngle += ((Math.random() - 0.5) * Math.PI) / 3;
      lastPosition = newObstacle.mesh.position.clone();
      lastSize = newObstacle.size;
      this.obstacles.push(newObstacle);
      this.entities.push(newObstacle);
    }
    this.teleportObstacles();
    this.teleportObstacles();
    this.teleportObstacles();
  }

  private initEnergyPacks() {
    this.energyPacks = [];
    for (let i = 0; i < this.batchSize; i++) {
      if (i < 200) {
        const newEnergyPack = new EnergyPack();
        newEnergyPack.mesh.position.set(
          Math.random() * this.mapSize - this.mapSize / 2,
          Math.random() * this.mapSize - this.mapSize / 2,
          0
        );
        this.energyPacks.push(newEnergyPack);
        this.entities.push(newEnergyPack);
      } else {
        const newEnergyPack = new EnergyPack();
        newEnergyPack.deactivate();
        newEnergyPack.mesh.position.set(3000, 3000, 0);
        this.energyPacks.push(newEnergyPack);
        this.entities.push(newEnergyPack);
      }
    }
  }

  private initOrganisms(noOfOrganisms: number) {
    this.brains.forEach((brain) => {
      const newOrganism = new Organism(
        brain,
        new Genome([
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random() * 4,
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
          // 0.05,
          // 0.5,
          // 0.2,
          // 0.1,
          // 0.1,
          // 0.1,
          // 0.1,
          // 0.5,
          // 0.1,
          // 0.05,
          // 0.1,
          // 0.1,
          // 0.1,
          // 0.1,
          // 0.1,
          // 0.1,
          // 0.1
        ])
      );
      this.organisms.push(newOrganism);
      this.entities.push(newOrganism);
    });
    for (let i = 0; i < noOfOrganisms; i++) {
      this.organisms[i].isDead = false;
      this.organisms[i].mesh.position.set(
        Math.random() * this.mapSize - this.mapSize / 2,
        Math.random() * this.mapSize - this.mapSize / 2,
        0
      );
    }
    this.organisms.forEach((org) => {
      if (org.isDead) {
        org.mesh.position.set(300, 300, 0);
        org.energy = 0;
      }
    });
  }

  private getDeadOrganisms() {
    this.aliveOrganisms = this.organisms.filter((org) => !org.isDead).length;
  }

  public randomSpawn() {
    if (this.aliveOrganisms <= this.batchSize / 10) {
      const i = Math.floor(Math.random() * this.batchSize);
      if (this.organisms[i].isDead) {
        this.organisms[i].brain = new Brain(9, 6, 3);
        this.organisms[i].isDead = false;
        this.organisms[i].energy = 290;
        this.organisms[i].mesh.position.set(
          (Math.random() * this.mapSize) / 2 - this.mapSize / 4,
          (Math.random() * this.mapSize) / 2 - this.mapSize / 4,
          0
        );
      }
    }
  }

  teleportOrganisms() {
    this.organisms.forEach((org) => {
      if (org.mesh.position.x > this.mapSize / 2) {
        org.mesh.position.x -= this.mapSize;
      }
      if (org.mesh.position.x < -this.mapSize / 2) {
        org.mesh.position.x += this.mapSize;
      }
      if (org.mesh.position.y > this.mapSize / 2) {
        org.mesh.position.y -= this.mapSize;
      }
      if (org.mesh.position.y < -this.mapSize / 2) {
        org.mesh.position.y += this.mapSize;
      }
    });
    this.energyPacks.forEach((org) => {
      if (org.mesh.position.x > this.mapSize / 2) {
        org.mesh.position.x = -this.mapSize / 2;
      }
      if (org.mesh.position.x < -this.mapSize / 2) {
        org.mesh.position.x = this.mapSize / 2;
      }
      if (org.mesh.position.y > this.mapSize / 2) {
        org.mesh.position.y = -this.mapSize / 2;
      }
      if (org.mesh.position.y < -this.mapSize / 2) {
        org.mesh.position.y = this.mapSize / 2;
      }
    });
  }

  teleportObstacles() {
    this.obstacles.forEach((org) => {
      if (org.mesh.position.x > this.mapSize / 2) {
        org.mesh.position.x -= this.mapSize;
      }
      if (org.mesh.position.x < -this.mapSize / 2) {
        org.mesh.position.x += this.mapSize;
      }
      if (org.mesh.position.y > this.mapSize / 2) {
        org.mesh.position.y -= this.mapSize;
      }
      if (org.mesh.position.y < -this.mapSize / 2) {
        org.mesh.position.y += this.mapSize;
      }
    });
  }
}
