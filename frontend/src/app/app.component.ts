import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import * as d3 from "d3-hierarchy";
import { HierarchyRectangularNode } from "d3-hierarchy";
import * as THREE from "three";
import "./utils/EnableThreeExamples";
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/controls/TransformControls';
import 'three/examples/js/controls/FirstPersonControls';


@Component({
    selector: 'uml-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    // @ViewChild("canvas") canvasContainer: ElementRef<HTMLDivElement>;
    //
    // renderer: THREE.Renderer;
    // scene: THREE.Scene;
    // camera: THREE.PerspectiveCamera;
    // controls: any;
    // axes: any;
    //
    // locked = false;
    //
    // clock: THREE.Clock;
    //
    // constructor(private http: HttpClient) {
    //     this.scene = new THREE.Scene();
    //     this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    //
    //     this.camera.position.set(0, 600, 600);
    //     this.camera.lookAt(0, 0, 0);
    //     this.renderer = new THREE.WebGLRenderer();
    //     // @ts-ignore
    //     this.controls = new THREE.FirstPersonControls(this.camera);
    //     this.controls.lookSpeed = 0.4;
    //     this.controls.movementSpeed = 20;
    //     this.controls.noFly = false;
    //     this.controls.lookVertical = true;
    //     this.controls.constrainVertical = true;
    //     this.controls.verticalMin = 1.0;
    //     this.controls.verticalMax = 2.0;
    //     this.controls.lon = -150;
    //     this.controls.lat = 120;
    //     const light = new THREE.DirectionalLight(0xffffff, 0.5) // soft white light
    //     light.position.set(0, 1, 1);
    //     this.scene.add(light);
    //
    //     this.clock = new THREE.Clock();
    //     // this.controls.enableDamping = true;
    //     // this.controls.dampingFactor = 0.25;
    //     // this.controls.screenSpacePanning = false;
    //     // this.controls.minDistance = 100;
    //     // this.controls.maxDistance = 1000;
    //     // this.controls.maxPolarAngle = Math.PI / 2;
    // }
    //
    // ngAfterViewInit(): void {
    //     const canvas = this.canvasContainer.nativeElement;
    //     // canvas.addEventListener("click", () => this.controls.lock(), false);
    //     // this.controls.addEventListener('lock', () => this.locked = true);
    //     // this.controls.addEventListener('unlock', () => this.locked = false);
    //     this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    //     canvas.appendChild(this.renderer.domElement);
    //
    //     this.animate();
    // }
    //
    // ngOnInit(): void {
    //     this.http.get<any>("api/model").subscribe(result => {
    //         const tree = d3.hierarchy(result);
    //         tree.count();
    //         const treemap = d3.treemap<any>().size([500, 500]).padding(10);
    //         this.fillScene(treemap(tree).sum(d => d.value));
    //     })
    // }
    //
    // private fillScene(data: HierarchyRectangularNode<any>) {
    //     const y = data.y1 - data.y0;
    //     const x = data.x1 - data.x0;
    //     const geometry = new THREE.BoxGeometry(data.x1 - data.x0, 100, data.y1 - data.y0)
    //         .translate(data.x0 + x / 2 - 500, data.depth * 100, data.y0 + y / 2 - 500);
    //     const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${data.depth * 40}, 100%, 50%)`) });
    //     const cube = new THREE.Mesh(geometry, material);
    //     data.children && data.children.forEach(child => this.fillScene(child));
    //     this.scene.add(cube);
    // }
    //
    // private animate() {
    //     requestAnimationFrame(() => this.animate());
    //
    //     const delta = this.clock.getDelta();
    //     // this.controls.update(1);
    //     this.controls.update(delta);
    //     this.renderer.render(this.scene, this.camera);
    // }
}

