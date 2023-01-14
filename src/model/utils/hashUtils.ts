import { Data } from "./data";
import { Entity } from "../parts/entity";

export class HashUtils {
    static hashEntities(data: Data, t: number): void {
        if (!data.entities || data.entities.length === 0) {
            return;
        }

        data.hashList = new Map()

        data.entities.forEach((entity: Entity, i: number) => {
            const hashName = this.getEntityHash(entity, t);
            const hash = data.hashList.get(hashName);

            if (hash) {
                data.hashList.set(hashName, hash.concat(i))
            } else {
                data.hashList.set(hashName, [i])
            }
        })
    }

    static getEntityHash(entity: Entity, t: number): string {
        const xp = Math.floor(entity.mesh.position.x / t);
        const yp = Math.floor(entity.mesh.position.y / t);
        const zp = Math.floor(entity.mesh.position.z / t);

        return JSON.stringify({ x: xp, y: yp, z: zp })
    }

    static getNearHashes(hash: string): string[] {
        const nearHashes: string[] = []
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                for (let k = -1; k < 2; k++) {
                    let hashVector = JSON.parse(hash)
                    nearHashes.push(JSON.stringify({ x: hashVector.x + i, y: hashVector.y + j, z: hashVector.z + k }))
                }
            }
        }
        return nearHashes
    }
}