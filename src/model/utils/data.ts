import { Organism } from "../parts/organism";
import { Obstacle } from "../parts/obstacle";
import { Physics } from "./physics";
import { EnergyPack } from "../parts/energyPack";
import { Brain } from "../ml/brain";
import { Genome } from "../parts/genome";
import { Entity } from "../parts/entity";
import { HashUtils } from "./hashUtils";

export class Data {
    public entities: Entity[] = [];
    public organisms: Organism[] = [];
    public obstacles: Obstacle[] = [];
    public energyPacks: EnergyPack[] = [];
    public generation: number = 0;
    public brains: Brain[] = [];
    public bestScore: number = 0;

    public batchSize: number = 1000;

    public aliveOrganisms: number = 0;

    hashThreshold: number

    public hashList: Map<string, number[]> = new Map();

    constructor(private mapSize: number) {
        this.hashThreshold = 10;
        this.initBrains();
        this.initOrganisms(100);
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
        this.teleportOrganisms();
        this.hashEntities();
        this.collideEntities();
        this.organisms.forEach(org => {
            org.update();
        });
        this.getOffsprings();
        this.updateEnergyPacks();
        this.getDeadOrganisms();
    }

    public updateEnergyPacks() {
        this.energyPacks.forEach(energyPack => {
            if (energyPack.isActive && Math.random() < 0.05) {
                const n = this.energyPacks.find((energyPack) => !energyPack.isActive)
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
        this.organisms.forEach(org => {
            if (!org.isDead && org.isReadytoMultiply && this.aliveOrganisms < this.batchSize) {
                let n = this.organisms.find((org) => org.isDead)
                if (n == null) {
                    return;
                }
                org.isReadytoMultiply = false;
                const newOrganism = org.getOffspring(0.03);
                n.copyParameters(newOrganism);
            }
        })
    }

    private hashEntities() {
        HashUtils.hashEntities(this, this.hashThreshold);
    }

    private collideEntities(): void {
        Physics.collideEntities(this.entities, this.hashList, this.hashThreshold);
    }

    private initBrains() {
        for (let i = 0; i < this.batchSize; i++) {
            this.brains.push(new Brain(5, 15, 3));
        }
    }

    private initEnergyPacks() {
        this.energyPacks = [];
        for (let i = 0; i < this.batchSize; i++) {
            if (i < 500) {
                const newEnergyPack = new EnergyPack();
                newEnergyPack.mesh.position.set(Math.random() * this.mapSize - this.mapSize / 2, Math.random() * this.mapSize - this.mapSize / 2, 0);
                this.energyPacks.push(newEnergyPack);
                this.entities.push(newEnergyPack)
            } else {
                const newEnergyPack = new EnergyPack();
                newEnergyPack.mesh.position.set(300, 300, 0);
                this.energyPacks.push(newEnergyPack);
                this.entities.push(newEnergyPack)
            }
        }
    }

    private initOrganisms(noOfOrganisms: number) {
        this.brains.forEach(brain => {
            const newOrganism = new Organism(brain, new Genome([Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]));
            this.organisms.push(newOrganism);
            this.entities.push(newOrganism)
        });
        for (let i = 0; i < noOfOrganisms; i++) {
            this.organisms[i].isDead = false;
            this.organisms[i].energy = 500;
            this.organisms[i].attributes.lifespan = 1500;
            this.organisms[i].mesh.position.set(Math.random() * this.mapSize - this.mapSize / 2, Math.random() * this.mapSize - this.mapSize / 2, 0);

        }
        this.organisms.forEach(org => {
            if (org.isDead) {
                org.mesh.position.set(300, 300, 0);
            }
        })
    }

    private getDeadOrganisms() {
        this.aliveOrganisms = this.organisms.filter(org => !org.isDead).length
    }

    public randomSpawn() {
        if (
            this.aliveOrganisms <= this.batchSize / 10
        ) {
            const i = Math.floor(Math.random() * this.batchSize);
            if (this.organisms[i].isDead) {
                this.organisms[i].brain = new Brain(5, 15, 3);
                this.organisms[i].isDead = false;
                this.organisms[i].energy = 290;
                this.organisms[i].attributes.lifespan = 500;
                this.organisms[i].mesh.position.set(Math.random() * this.mapSize / 2 - this.mapSize / 4, Math.random() * this.mapSize / 2 - this.mapSize / 4, 0);
            }
        }
    }

    public resetEnergy() {
        this.organisms.forEach(org => {
            if (org.energy < 250) {
                org.energy = 290;
            }
        })
    }

    teleportOrganisms() {
        this.organisms.forEach(org => {
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
        })
        this.energyPacks.forEach(org => {
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
        })
    }



}