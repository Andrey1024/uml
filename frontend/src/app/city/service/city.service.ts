import { Injectable } from "@angular/core";
import * as THREE from "three";
import { SceneService } from "./scene.service";
import { HierarchyRectangularNode } from "d3-hierarchy";
import "../../utils/EnableThreeExamples";
import { Node } from "../model/node.model";

@Injectable()
export class CityService implements SceneService {
    canvas: HTMLDivElement = null;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    controls: any;
    clock = new THREE.Clock();

    constructor() {
        this.camera.position.set(0, 600, 600);
        this.camera.lookAt(0, 0, 0);
    }

    init(canvas: HTMLDivElement) {
        this.canvas = canvas;
        this.canvas.appendChild(this.renderer.domElement);
        // @ts-ignore
        this.controls = new THREE.FirstPersonControls(this.camera);
        this.controls.lookSpeed = 0.4;
        this.controls.movementSpeed = 20;
        this.controls.noFly = false;
        this.controls.lookVertical = true;
        this.controls.constrainVertical = true;
        this.controls.verticalMin = 1.0;
        this.controls.verticalMax = 2.0;
        this.controls.lon = -150;
        this.controls.lat = 120;
        this.resize();
        this.animate();
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
    }


    private animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        // this.controls.update(1);
        this.controls.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    private fillScene(data: HierarchyRectangularNode<Node>) {
        const y = data.y1 - data.y0;
        const x = data.x1 - data.x0;
        const geometry = new THREE.BoxGeometry(data.x1 - data.x0, 100, data.y1 - data.y0)
            .translate(data.x0 + x / 2 - 500, data.depth * 100, data.y0 + y / 2 - 500);
        const cube = new THREE.Mesh(geometry, material);
        data.children && data.children.forEach(child => this.fillScene(child));
        this.scene.add(cube);
    }

    private createNodeMesh(data: HierarchyRectangularNode<Node>, height: number) {
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${data.depth * 40}, 100%, 50%)`) });
    }

}