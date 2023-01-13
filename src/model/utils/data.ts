import { Organism } from "../parts/organism";
import { Obstacle } from "../parts/obstacle";
import { Physics } from "./physics";
import { EnergyPack } from "../parts/energyPack";
import { Brain } from "../ml/brain";
import { Genome } from "../parts/genome";

export class Data {
    public organisms: Organism[] = [];
    public obstacles: Obstacle[] = [];
    public energyPacks: EnergyPack[] = [];
    public generation: number = 0;
    public brains: Brain[] = [];
    public bestScore: number = 0;

    public batchSize: number = 500;

    public aliveOrganisms: number = 0;

    constructor(private mapSize: number) {
        this.initBrains();
        this.initOrganisms(30);
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
        this.organisms.forEach(org => {
            Physics.whiskDetection(org, this.obstacles, this.energyPacks);
            Physics.collisionDetection(org, this.obstacles);
            Physics.collisionDetection2(org, this.energyPacks);
            org.update();
        });
        this.teleportOrganisms();
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
                    x += -this.mapSize;
                }
                if (y > this.mapSize) {
                    y -= this.mapSize;
                }
                if (y < -this.mapSize) {
                    y += -this.mapSize;
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



    private initBrains() {
        for (let i = 0; i < this.batchSize; i++) {
            this.brains.push(new Brain(8, 24, 3));
        }
    }

    private initEnergyPacks() {
        this.energyPacks = [];
        for (let i = 0; i < this.batchSize; i++) {
            if (i < 500) {
                const newEnergyPack = new EnergyPack();
                newEnergyPack.mesh.position.set(Math.random() * this.mapSize - this.mapSize / 2, Math.random() * this.mapSize - this.mapSize / 2, 0);
                this.energyPacks.push(newEnergyPack);
            } else {
                const newEnergyPack = new EnergyPack();
                newEnergyPack.mesh.position.set(200, 200, 0);
                this.energyPacks.push(newEnergyPack);
            }
        }
    }

    private initOrganisms(noOfOrganisms: number) {
        this.brains.forEach(brain => {
            this.organisms.push(new Organism(brain, new Genome([Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random()])));
        });
        for (let i = 0; i < noOfOrganisms; i++) {
            this.organisms[i].isDead = false;
            this.organisms[i].energy = 500;
            this.organisms[i].attributes.lifespan = 1500;
            this.organisms[i].mesh.position.set(Math.random() * this.mapSize - this.mapSize / 2, Math.random() * this.mapSize - this.mapSize / 2, 0);

        }
        this.organisms.forEach(org => {
            if (org.isDead) {
                org.mesh.position.set(200, 200, 0);
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
                this.organisms[i].brain = new Brain(8, 24, 3);
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