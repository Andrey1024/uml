import {Injectable} from "@angular/core";
import * as THREE from "three";
import {SceneService} from "./scene.service";
import {HierarchyRectangularNode, TreemapLayout} from "d3-hierarchy";
import "../../utils/EnableThreeExamples";
import {Element} from "../model/element.model";
import {flatten} from "@angular/compiler";
import {cloneDeep} from "lodash-es";
import {Container} from "../model/container.model";
import * as d3 from "d3-hierarchy";

export interface HierarchyCityNode extends HierarchyRectangularNode<Element> {
    z0: number;
    z1: number;

    meshes: THREE.Mesh[];
}

@Injectable()
export class CityService implements SceneService {
    canvas: HTMLDivElement = null;

    animationFrame;

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

    private layout: TreemapLayout<Element>;

    private citySize = 1500;

    constructor() {
        this.layout = d3.treemap<Element>().size([this.citySize, this.citySize])
            .round(false)
            .padding(10);
        // this.camera.position.set(0, 300, 300);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.lookAt(0, 0, 0);
        this.lights = new Array(5).fill(0)
            .map(() => new THREE.PointLight(0xffffff, 0.6, 0, 0));
        this.lights.forEach(light => {
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 1500
        });

        this.lights[0].position.set(-this.citySize - 200, 600, -this.citySize - 200);
        this.lights[1].position.set(200, 600, 200);
        this.lights[2].position.set(-(this.citySize / 2), 600, -(this.citySize / 2));
        this.lights[3].position.set(200, 600, -this.citySize - 200);
        this.lights[4].position.set(-this.citySize - 200, 600, 200);
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
    }

    resize() {
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    showProject(hierarchy: HierarchyRectangularNode<Element>) {
        console.log(hierarchy);
        cancelAnimationFrame(this.animationFrame);
        const city = this.createCityHierarchy(hierarchy);
        this.scene.remove(...this.objects);
        this.objects = [];
        // this.fillScene(hierarchy);
        this.objects = flatten(city.descendants().map(node => node.meshes));
        this.scene.add(...this.objects);
        this.animate();
    }

    show(struct: Element) {
        this.scene.remove(...this.objects);
        cancelAnimationFrame(this.animationFrame);
        const tree = d3.hierarchy(struct).sum(node => {
            switch (node.type) {
                case "CONTAINER":
                    return node.children.length + 10;
                case "CLASS":
                case "INTERFACE":
                    return node.methodsCount + 10;
                default:
                    return 10;
            }
        });
        const city = this.createCityHierarchy(this.layout(tree));
        this.objects = flatten(city.descendants().map(node => node.meshes));
        this.scene.add(...this.objects);
        this.animate();
    }

    private createCityHierarchy(hierarchy: HierarchyRectangularNode<Element>): HierarchyCityNode {
        (hierarchy as HierarchyCityNode).eachBefore(node => {
            const characteristics = this.getCharacteristics(node);
            node.z0 = node.parent === null ? 0 : node.parent.z1;
            node.z1 = node.z0 + characteristics.height;
            node.meshes = [this.createNodeMesh(node, characteristics.color)];
            const title = this.createTitleMesh(node);
            title && node.meshes.push(title);
        });
        return hierarchy as HierarchyCityNode;
    }

    private getCharacteristics(node: HierarchyCityNode): { height: number, color: THREE.Color } {
        let height = 0;

        switch (node.data.type) {
            case "CONTAINER":
                height = 15;
                break;
            case "CLASS":
            case "INTERFACE":
                height = Math.max(node.data.methodsCount * 5, 15);
                break;
        }

        const color = new THREE.Color(`hsl(${node.depth * 40}, 100%, 50%)`);

        return {height, color};
    }


    private animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    // private fillScene(data: HierarchyRectangularNode<Element>, level = 0) {
    //     const h = (Math.log(data.descendants().length) + 2) * 10;
    //     const cube = this.createNodeMesh(data, level, h);
    //     const title = this.createTitleMesh(data, level, h);
    //     data.children && data.children.forEach(child => this.fillScene(child, level + h));
    //     this.objects.push(cube);
    //     title && this.objects.push(title);
    // }

    private createNodeMesh(data: HierarchyCityNode, color: THREE.Color): THREE.Mesh {
        const y = data.y1 - data.y0;
        const x = data.x1 - data.x0;
        const z = data.z1 - data.z0;
        const material = new THREE.MeshPhongMaterial({
            color
        });
        let geometry;
        if (data.data.type === "INTERFACE") {
            const rad = Math.min(x, y) / 2;
            geometry = new THREE.CylinderGeometry(rad, rad, z, 32, 32)
                .translate(data.x0 + x / 2 - this.citySize, data.z0 + z / 2, data.y0 + y / 2 - this.citySize);
        } else {
            geometry = new THREE.BoxGeometry(data.x1 - data.x0, z, data.y1 - data.y0)
                .translate(data.x0 + x / 2 - this.citySize, data.z0 + z / 2, data.y0 + y / 2 - this.citySize);
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    private createTitleMesh(node: HierarchyCityNode): THREE.Mesh {
        if (!node.data.name
            || node.data.type === "INTERFACE"
            || (node.x1 - node.x0) < 5 * node.data.name.length)
            return;
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color("white")
        });
        const geometry = new THREE.TextGeometry(node.data.name, {
            font: this.font,
            size: 5,
            height: 0.01
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(node.x0 - this.citySize, node.z1 - 10, node.y1 - this.citySize);
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