import { Vector3, Triangle } from "three";
import { Organism } from "./organism";
import { Obstacle } from "./obstacle";
import { Eye } from "./eye";
import { MathFunctions } from "./math";
import { EnergyPack } from "./energyPack";

export class Physics {
    static whiskDetection(org: Organism, obstacles: Obstacle[], energyPacks: EnergyPack[]) {
        if (org.isDead) { 
            return;
        }
        org.eyes.forEach(eye => {
            let hitObstacle = false;
            let obstacleDistance = 0;
            let hitEnergyPack = false;
            let energyPackDistance = 10000;

            obstacles.forEach(obstacle => {
                if (eye.direction1.clone().applyAxisAngle(new Vector3(0, 0, 1), -org.rotation).add(eye.mesh.position).distanceTo(obstacle.mesh.position) <= obstacle.size) {
                    hitObstacle = true;
                    const newDistance = org.mesh.position.distanceTo(obstacle.mesh.position);
                    if (newDistance > obstacleDistance) {
                        obstacleDistance = newDistance;
                    }
                }
            });
            energyPacks.forEach(energyPack => {
                const visionTriangle = new Triangle(eye.direction2.clone().applyAxisAngle(new Vector3(0, 0, 1), -org.rotation).add(org.mesh.position),
                    org.mesh.position,
                    eye.direction1.clone().applyAxisAngle(new Vector3(0, 0, 1), -org.rotation).add(org.mesh.position));

                if (visionTriangle.containsPoint(energyPack.mesh.position)) {
                    hitEnergyPack = true;
                    const newDistance = org.mesh.position.distanceTo(energyPack.mesh.position);
                    if (newDistance < energyPackDistance) {
                        energyPackDistance = newDistance;
                    }
                }

                if (hitObstacle) {
                    eye.hitObstacle(obstacleDistance);
                } else {
                    eye.unhitObstacle();
                }
                if (hitEnergyPack) {
                    eye.hitEnergyPack(energyPackDistance);
                } else {
                    eye.unhitEnergyPack();
                }
            });
        });
    }

    // static organismDetection(org1: Organism, orgs: Organism[]):  number{
    //     orgs.forEach((org2: Organism) => {
    //         if  (org2.mesh.position.distanceTo(org1.mesh.position) <= org1.eyeSight) {
    //             org1.eyes.forEach((eye: Eye) => {

    //             })
    //         }
    //     })
    // }

    static collisionDetection(org: Organism, obstacles: Obstacle[]) {
        if (org.isDead) {
            return;
        }
        obstacles.forEach(obstacle => {
            if (org.mesh.position.distanceTo(obstacle.mesh.position) <= obstacle.size + 0.1) {
                org.energy -= 0.1;
            }
        });
    }

    static collisionDetection2(org1: Organism, energyPack: EnergyPack[]) {
        if (org1.isDead) {
            return;
        }
        energyPack.forEach(energy => {
            if (org1.mesh.position.distanceTo(energy.mesh.position) <= 0.3) {
                org1.addEnergy(energy.energy)
                energy.deactivate();
            }
        });
    }
}