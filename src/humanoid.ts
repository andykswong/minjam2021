import * as THREE from 'three';
import { die, jump, move, rotate, scytheAttack, zombieAttack } from './animations';
import { HALF_SIZE } from './const';
import { HumanoidMesh } from './models/humanoid';
import { ReaperMesh } from './models/reaper';
import { ZombieMesh } from './models/zombie';
import { Props } from './props';
import { Sound } from './sound';

export const HUMANOID_TYPE = {
  Hero: 0,
  Zombie: 1
};

export class Humanoid {
  public isMoving = false;
  public isAlive = true;

  public constructor(
    public type: number,
    public mesh: HumanoidMesh,
    public position: THREE.Vector2 = new THREE.Vector2(0, 0),
    public direction: THREE.Vector2 = new THREE.Vector2(0, -1)
  ) {
    rotate(this.mesh.mesh, new THREE.Vector3(direction.x, 0, -direction.y));
    this.mesh.mesh.position.x = position.x * 10;
    this.mesh.mesh.position.z = position.y * -10;
  }

  public rotate(direction: THREE.Vector2): void {
    this.direction.set(Math.sign(direction.x), Math.sign(direction.y));
    rotate(this.mesh.mesh, new THREE.Vector3(direction.x, 0, -direction.y));
  }

  public move(direction: THREE.Vector2, onComplete?: () => void): void {
    if (this.isMoving) {
      return;
    }
    this.isMoving = true;
    this.direction.set(Math.sign(direction.x), Math.sign(direction.y));
    this.position.add(direction);
    jump(this.mesh.mesh, new THREE.Vector3(10 * direction.x, 0, -10 * direction.y), () => {
      this.isMoving = false;
      onComplete?.();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public attack(direction: THREE.Vector2, onComplete?: () => void): void {
    // do nothing
  }

  public die(direction: THREE.Vector2, onComplete?: () => void): void {
    this.isAlive = false;
    die(this.mesh, new THREE.Vector3(direction.x, 0, direction.y), onComplete);
  }
  
  public addTo(parent: THREE.Object3D): void {
    parent.add(this.mesh.mesh);
  }
  
  public detach(): void {
    this.mesh.mesh.parent?.remove(this.mesh.mesh);
  }
}

export class Hero extends Humanoid {
  constructor() {
    super(HUMANOID_TYPE.Hero, new ReaperMesh(), new THREE.Vector2(0, 0), new THREE.Vector2(0, -1));
  }

  public move(direction: THREE.Vector2, onComplete?: () => void): void {
    if (this.isMoving) {
      return;
    }
        
    if (!direction.x && !direction.y) {
      onComplete?.();
      return;
    }

    this.isMoving = true;

    this.direction.set(Math.sign(direction.x), Math.sign(direction.y));
    this.position.add(direction);
    move(this.mesh.mesh, new THREE.Vector3(10 * direction.x, 0, -10 * direction.y), () => {
      this.isMoving = false;
      onComplete?.();
    });
  }

  public attack(direction: THREE.Vector2, onComplete?: () => void): void {
    if (this.isMoving) {
      return;
    }
    this.isMoving = true;

    rotate(this.mesh.mesh, new THREE.Vector3(direction.x, 0, -direction.y));
    this.direction.set(Math.sign(direction.x), Math.sign(direction.y));
    scytheAttack(this.mesh.rightArm, () => {
      this.isMoving = false;
      onComplete?.();
    });
    Sound.Slash.load();
    Sound.Slash.play();
  }
}

interface ObjectState {
  hero: Hero;
  props: Props[];
  mobs: Mob[];
}

export class Mob extends Humanoid {
  public name = 'mob';

  public takeTurn(state: ObjectState, onComplete?: (hitHero: boolean) => void): void {
    onComplete?.(false);
  }
}

export class Zombie extends Mob {
  constructor(position: THREE.Vector2, direction: THREE.Vector2 = new THREE.Vector2(0, -1)) {
    super(HUMANOID_TYPE.Zombie, new ZombieMesh(), position, direction);
    this.name = 'Zombie';
  }

  public attack(direction: THREE.Vector2, onComplete?: () => void): void {
    if (this.isMoving) {
      return;
    }
    this.isMoving = true;

    rotate(this.mesh.mesh, new THREE.Vector3(direction.x, 0, -direction.y));
    this.direction.set(Math.sign(direction.x), Math.sign(direction.y));
    zombieAttack(this.mesh, () => {
      this.isMoving = false;
      onComplete?.();
    });
    Sound.Zombie.load();
    Sound.Zombie.play();
  }

  public takeTurn(state: ObjectState, onComplete?: (hitHero: boolean) => void): void {
    const dx = state.hero.position.x - this.position.x;
    const dy = state.hero.position.y - this.position.y;

    if (Math.abs(dx) + Math.abs(dy) > 1 && 
      ((dy && Math.sign(dy) === this.direction.y) || (dx && Math.sign(dx) === this.direction.x))
    ) {
      if (!hasSomething(state.mobs, this.position.x + this.direction.x, this.position.y + this.direction.y) &&
        !hasSomething(state.props, this.position.x + this.direction.x, this.position.y + this.direction.y) &&
        (this.position.x + this.direction.x >= -HALF_SIZE && this.position.x + this.direction.x <= HALF_SIZE) &&
        (this.position.y + this.direction.y >= -HALF_SIZE && this.position.y + this.direction.y <= HALF_SIZE)
      ) {
        this.move(this.direction, () => onComplete?.(false));
        return;
      }
    }

    if (dy && Math.sign(dy) !== this.direction.y) {
      this.rotate(new THREE.Vector2(0, Math.sign(dy)));
      onComplete?.(false);
    } else if (dx && Math.sign(dx) !== this.direction.x) {
      this.rotate(new THREE.Vector2(Math.sign(dx), 0));
      onComplete?.(false);
    } else if (Math.abs(dx) + Math.abs(dy) === 1) {
      this.attack(this.direction, () => onComplete?.(true));
    } else {
      onComplete?.(false);
    }
  }
}

function hasSomething(mobs: { position: THREE.Vector2 }[], x: number, y: number): boolean {
  return getAtPos(mobs, x, y) !== null;
}

function getAtPos<T extends { position: THREE.Vector2 }>(mobs: T[], x: number, y: number): T | null {
  for (const mob of mobs) {
    if (mob.position.x === x && mob.position.y === y) {
      return mob;
    }
  }
  return null;
}
