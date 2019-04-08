import {Injectable} from "@angular/core";
import * as THREE from "three";
import {SceneService} from "./scene.service";
import {HierarchyRectangularNode} from "d3-hierarchy";
import "../../utils/EnableThreeExamples";
import {Element} from "../model/element.model";

@Injectable()
export class CityService implements SceneService {
    canvas: HTMLDivElement = null;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    controls: any;
    clock = new THREE.Clock();

    private objects: THREE.Mesh[] = [];
    private readonly lights: THREE.PointLight[];

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;

    private font;


    constructor() {
        // this.camera.position.set(0, 300, 300);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.lookAt(0, 0, 0);
        this.lights = new Array(3).fill(0)
            .map(() => new THREE.PointLight(0xffffff, 0.6, 0));
        this.lights.forEach(light => {
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 1000
        });

        this.lights[0].position.set(-600, 600, -600);
        this.lights[1].position.set(100, 600, 100);
        this.lights[2].position.set(-250, 600, -250);
        this.scene.add(...this.lights);
        this.scene.add(...this.lights.map(light => new THREE.PointLightHelper(light, 1)));
        // @ts-ignore
        this.controls = new THREE.PointerLockControls(this.camera);
        this.controls.getObject().position.set(0, 300, 300);
        this.scene.add(this.controls.getObject());
        new THREE.FontLoader().load("assets/helvetiker_regular.typeface.json", (font => {
            this.font = font
        }));
    }

    init(canvas: HTMLDivElement) {
        this.canvas = canvas;
        this.canvas.appendChild(this.renderer.domElement);
        this.controls.addEventListener('lock', () => {
                document.addEventListener('keydown', this.keyDown, false);
                document.addEventListener('keyup', this.keyUp, false);

            }
        );
        this.controls.addEventListener('unlock', () => {
                document.removeEventListener('keydown', this.keyDown, false);
                document.removeEventListener('keyup', this.keyUp, false);

            }
        );
        this.canvas.addEventListener("click", () => this.controls.lock());
        this.resize();
        this.animate();
    }

    resize() {
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    showProject(hierarchy: HierarchyRectangularNode<Element>) {
        console.log(hierarchy);
        this.scene.remove(...this.objects);
        this.objects = [];
        this.fillScene(hierarchy);
        this.scene.add(...this.objects);
    }


    private animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    private fillScene(data: HierarchyRectangularNode<Element>, level = 0) {
        const h = (Math.log(data.descendants().length) + 2) * 10;
        const cube = this.createNodeMesh(data, level, h);
        const title = this.createTitle(data, level, h);
        data.children && data.children.forEach(child => this.fillScene(child, level + h));
        this.objects.push(cube);
        title && this.objects.push(title);
    }

    private createNodeMesh(data: HierarchyRectangularNode<Element>, level: number, height: number): THREE.Mesh {
        const y = data.y1 - data.y0;
        const x = data.x1 - data.x0;
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(`hsl(${data.depth * 40}, 100%, 50%)`)
        });
        if (data.data.type === "CLASS" || data.data.type === "INTERFACE") {
            height = (Math.log(data.data.methodsCount + 2) + 2) * 10;
        }
        const geometry = new THREE.BoxGeometry(data.x1 - data.x0, height, data.y1 - data.y0)
            .translate(data.x0 + x / 2 - 500, level + height / 2, data.y0 + y / 2 - 500);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    private createTitle(data: HierarchyRectangularNode<Element>, level: number, height: number): THREE.Mesh {
        if (!data.data.name || (data.x1 - data.x0) < 5 * data.data.name.length) return;
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color("white")
        });
        const geometry = new THREE.TextGeometry(data.data.name, {
            font: this.font,
            size: 5,
            height: 0.01
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(data.x0 - 500, level + height - 10, data.y1 - 500);
        return mesh;
    }

    private update(delta: number) {
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction).normalize();
            if (this.moveForward || this.moveBackward) {
                direction.multiplyScalar(delta * 100 * (Number(this.moveForward) - Number(this.moveBackward)));

                this.controls.getObject().position.add(direction);
            }

        }
    }

    private keyDown = (event) => {

        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
            // case 32: // space
            //     if (canJump === true) velocity.y += 350;
            //     canJump = false;
            //     break;
        }
    };

    private keyUp = (event) => {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
        }

    };
}