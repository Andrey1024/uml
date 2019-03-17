import {Injectable} from "@angular/core";
import * as THREE from "three";
import {SceneService} from "./scene.service";
import {HierarchyRectangularNode} from "d3-hierarchy";
import "../../utils/EnableThreeExamples";
import {Node} from "../model/node.model";

@Injectable()
export class CityService implements SceneService {
    canvas: HTMLDivElement = null;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    controls: any;
    clock = new THREE.Clock();


    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;


    constructor() {
        // this.camera.position.set(0, 300, 300);
        this.camera.lookAt(0, 0, 0);
    }

    init(canvas: HTMLDivElement) {
        this.canvas = canvas;
        this.canvas.appendChild(this.renderer.domElement);
        // @ts-ignore
        this.controls = new THREE.PointerLockControls(this.camera);
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
        // this.controls.lookSpeed = 0.4;
        // this.controls.movementSpeed = 100;
        // this.controls.noFly = false;
        // this.controls.lookVertical = true;
        // this.controls.constrainVertical = true;
        // this.controls.verticalMin = 1.0;
        // this.controls.verticalMax = 2.0;
        // this.controls.lon = -150;
        // this.controls.lat = 120;
        this.resize();
        this.animate();
        this.canvas.addEventListener("click", () => this.controls.lock());
    }

    resize() {
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    addHierarchy(hierarchy: HierarchyRectangularNode<any>) {
        this.scene.remove.apply(this.scene, this.scene.children);
        this.fillScene(hierarchy);
        const light = new THREE.DirectionalLight(0xffffff, 0.5); // soft white light
        light.position.set(0, 1, 1);
        this.scene.add(light);
        this.controls.getObject().position.set(0, 300, 300);
        this.scene.add(this.controls.getObject());
    }


    private animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.update(delta);
        // this.controls.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    private fillScene(data: HierarchyRectangularNode<Node>, height = 0) {
        const y = data.y1 - data.y0;
        const x = data.x1 - data.x0;
        const h = (Math.log(data.descendants().length) + 2) * 10;
        const material = new THREE.MeshStandardMaterial({color: new THREE.Color(`hsl(${data.depth * 40}, 100%, 50%)`)});
        const geometry = new THREE.BoxGeometry(data.x1 - data.x0, h, data.y1 - data.y0)
            .translate(data.x0 + x / 2 - 500, height + h / 2, data.y0 + y / 2 - 500);
        const cube = new THREE.Mesh(geometry, material);
        data.children && data.children.forEach(child => this.fillScene(child, height + h));
        this.scene.add(cube);
    }

    private createNodeMesh(data: HierarchyRectangularNode<Node>, height: number) {
    }

    private update(delta: number) {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction).normalize();
        if (this.moveForward) {
            this.controls.getObject().position.add(direction.multiplyScalar(delta * 100));
        }
        if (this.moveBackward) {
            this.controls.getObject().position.sub(direction.multiplyScalar(delta * 100));
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