import * as THREE from 'three';
import { COLOR, HALF_SIZE } from './const';
import { Hero, Humanoid, Mob, Zombie } from './humanoid';
import { createBrownFloorTile, createDeepBrownFloorTile } from './models/floor';
import { PROPS, Props } from './props';

const DIRS = [new THREE.Vector2(-1, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(0, -1)];

export class Game {
  public container!: HTMLElement;
  public camera: THREE.OrthographicCamera = new THREE.OrthographicCamera(1, 1, 1, 1);
  public renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  public scene: THREE.Scene = new THREE.Scene();
  public shadowLight!: THREE.DirectionalLight;

  public hero!: Humanoid;
  public action = 0;
  public score = 0;
  public heroTurn = true;
  public mobsTurn = false;
  public lastKilledBy = 'mob';
  public clock = new THREE.Clock();

  public mobs: Mob[] = [];

  public props: Props[] = [];
  public floors: THREE.Object3D[] = [];

  public get heroAlive(): boolean {
    return this.hero?.isAlive;
  }

  public init(container: HTMLElement): void {
    this.container = container;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene.fog = new THREE.Fog(COLOR.darkpurple, 0, 90);

    this.camera.matrixAutoUpdate = true;
    this.camera.position.set(0.5, 1, 1);
    this.camera.lookAt(0, 0, 0);

    this.renderer.setSize(width, height, true);
    this.renderer.shadowMap.enabled = true;

    container.appendChild(this.renderer.domElement);
    this.resize();

    this.initScene();
  }

  public initScene(): void {
    this.scene.clear();
    this.shadowLight = this.createLights();
    this.floors = this.createFloor();

    this.action = 1;
    this.score = 0;
    this.heroTurn = true;

    const mesh = new Props(0, new THREE.Vector2(0, -1));
    mesh.addTo(this.scene);

    this.props = [mesh];

    this.hero = new Hero();
    this.hero.addTo(this.scene);

    this.mobs = [];
    this.generateItems(30, 20);
    this.generateMobs(5, 5);

    this.clock = new THREE.Clock();
  }

  public resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspectRatio = width / height;
    const d = 20 * (aspectRatio > 1 ? 2.5 : 3.5);
    const z = 100;
    this.camera.left = -d * aspectRatio;
    this.camera.right = d * aspectRatio;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.near = -z;
    this.camera.far = z;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private createLights(): THREE.DirectionalLight {
    const globalLight = new THREE.AmbientLight(0x39314b, .3);
    const shadowLight = new THREE.DirectionalLight(0xffffff, 1);
    shadowLight.position.set(-1, 1, 1);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -100;
    shadowLight.shadow.camera.right = 100;
    shadowLight.shadow.camera.top = 100;
    shadowLight.shadow.camera.bottom = -100;
    shadowLight.shadow.camera.near = -100;
    shadowLight.shadow.camera.far = 100;
    shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;
    shadowLight.shadow.radius = 10;
    shadowLight.shadow.bias = -0.0001;
    this.scene.add(globalLight);
    this.scene.add(shadowLight);

    const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.6);
    this.scene.add(hemiLight);

    return shadowLight;
  }

  private createFloor(): THREE.Object3D[] {
    const floorRows: THREE.Object3D[] = [];
    for (let i = -HALF_SIZE; i <= HALF_SIZE; ++i) {
      const row = new THREE.Group();
      row.position.z = -i * 10;
      for (let j = -HALF_SIZE; j <= HALF_SIZE; ++j) {
        const mesh = (i + j) % 2 ? createDeepBrownFloorTile() : createBrownFloorTile();
        mesh.position.x = j * 10;
        row.add(mesh);
      }
      floorRows.push(row);
      this.scene.add(row);
    }
    return floorRows;
  }

  private generateItems(min: number, vari: number): void {
    const items: Record<number, boolean> = {};
    items[0] = true;
    const propsCount = ((min + (Math.random() * vari)) * .7) | 0;
    for (let i = 0; i < propsCount; ++i) {
      const type = (Math.random() * PROPS.length)|0;
      let x, y;
      do {
        x = ((Math.random() * (HALF_SIZE * 2 -1)) | 0) - HALF_SIZE + 1;
        y = ((Math.random() * (HALF_SIZE * 2 -1)) | 0) - HALF_SIZE + 1;
      } while (items[(y*(HALF_SIZE * 2 + 1)+x)|0]);

      const dir = (Math.random() * 4)|0;
      const props = new Props(type, new THREE.Vector2(x, y), DIRS[dir].clone());
      props.addTo(this.scene);
      this.props.push(props);
      items[(y*(HALF_SIZE * 2 + 1)+x)|0] = true;
    }
  }

  private generateMobs(minMobs: number, mobVar: number): void {
    const mobCount = Math.min(HALF_SIZE * 8 - 4 - this.mobs.length, minMobs + (Math.random() * mobVar) | 0);
    for (let i = 0; i < mobCount; ++i) {
      const dir = DIRS[(Math.random() * 4) | 0].clone();
      const value = ((Math.random() * (HALF_SIZE * 2 + 1)) | 0) - HALF_SIZE;
      const x = dir.x ? -dir.x * HALF_SIZE : value;
      const y = dir.y ? -dir.y * HALF_SIZE : value;
      if (x === this.hero.position.x && y === this.hero.position.y) {
        --i;
        continue;
      }

      const mob: Mob = new Zombie(new THREE.Vector2(x, y), dir);
      mob.addTo(this.scene);
      this.mobs.push(mob);
    }
  }

  public loop(callback?: () => void): void {
    if (this.hero) {
      this.camera.position.set(0.3 + this.hero.mesh.mesh.position.x, 1, 1 + this.hero.mesh.mesh.position.z);
      this.camera.lookAt(this.hero.mesh.mesh.position.x, 0, this.hero.mesh.mesh.position.z);
    }

    if (this.mobsTurn && this.heroAlive) {
      this.moveMobs();
      this.mobsTurn = false;
    }

    this.render();
    callback?.();

    requestAnimationFrame(() => this.loop(callback));
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public move(dir: THREE.Vector2): void {
    if (!this.heroTurn || !this.heroAlive || this.hero.isMoving) return;

    const targetPos = dir.clone().add(this.hero.position);
    if (targetPos.x < -HALF_SIZE || targetPos.x > HALF_SIZE || targetPos.y < -HALF_SIZE || targetPos.y > HALF_SIZE) return;

    for (const props of this.props) {
      if (props.position.equals(targetPos)) return;
    }

    this.action++;
    if (this.action % 10 === 0) {
      this.generateMobs(5, 5 + this.action / 25);
    }

    for (let i = 0; i < this.mobs.length; ++i) {
      const mob = this.mobs[i];
      if (mob.position.equals(targetPos)) {
        this.hero.attack(dir, () => {
          mob.die(dir, ((i) => () => {
            this.mobs[i].detach();
            this.mobs[i] = this.mobs[this.mobs.length - 1];
            this.mobs.pop();
            ++this.score;
            this.heroTurn = false;        
            this.mobsTurn = true;
          })(i));
        });
        return;
      }
    }

    this.hero.move(dir, () => {
      this.heroTurn = false;  
      this.mobsTurn = true;
    });
  }

  private moveMobs(): void {
    let count = this.mobs.length;
    for (const mob of this.mobs) {
      if (!mob.isAlive) {
        --count;
        continue;
      }
      mob.takeTurn(this, (hitHero) => {
        if (hitHero && this.heroAlive) {
          this.heroDie(mob);
        } else if (--count <= 0) {
          this.heroTurn = true;
        }
      });
    }

    if (count <= 0) {
      this.heroTurn = true;
    }
  }

  private heroDie(killedBy: Mob): void {
    this.lastKilledBy = killedBy.name;
    this.hero.die(killedBy.direction, () => this.hero.detach());
    this.clock.stop();
  }
}
