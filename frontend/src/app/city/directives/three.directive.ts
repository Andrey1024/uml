import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges
} from '@angular/core';
import * as THREE from 'three';
import { PointerLockControls } from '../utils/pointer-lock-controls';

@Directive({
    selector: '[umlThree]'
})
export class ThreeDirective implements OnChanges, OnDestroy {
    @Input('umlThree') objects: THREE.Object3D[] = [];
    @Input() citySize = 1500;
    @Output() select = new EventEmitter();

    private scene = new THREE.Scene();
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    private controls = new PointerLockControls(this.camera);
    private clock = new THREE.Clock();

    private animationFrame: number;


    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;


    private readonly rayCaster = new THREE.Raycaster();
    private intersected: THREE.Object3D | null = null;

    private mouse = new THREE.Vector2();

    constructor(private element: ElementRef<HTMLDivElement>) {
        element.nativeElement.appendChild(this.renderer.domElement);
        this.resize(element.nativeElement.clientWidth, element.nativeElement.clientHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.shadowCameraNear = 3;
        // this.renderer.shadowCameraFar = this.camera.far;
        // this.renderer.shadowCameraFov = 50;
        // this.renderer.shadowMapBias = 0.0039;
        // this.renderer.shadowMapDarkness = 0.5;
        // this.renderer.shadowMapWidth = 1024;
        // this.renderer.shadowMapHeight = 1024;
        this.camera.lookAt(0, 0, 0);
        this.controls.getObject().position.set(0, 300, 300);
        this.scene.add(this.controls.getObject());
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(0, 600, 0);
        directionalLight.target.position.set(-750, 0, -750);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 1500;
        directionalLight.shadow.camera.left = -750;
        directionalLight.shadow.camera.right = 750;
        directionalLight.shadow.camera.top = 750;
        directionalLight.shadow.camera.bottom = -750;
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(1, 0, 1);
        dirLight.castShadow = false;

        const lights = new Array(1).fill(0)
            .map(() => new THREE.PointLight(0xffffff, 0.6, 0, 0));
        lights.forEach(light => {
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 1500;
        });

        lights[0].position.set(-this.citySize - 200, 600, -this.citySize - 200);
        // lights[1].position.set(200, 600, 200);
        // lights[2].position.set(-(this.citySize / 2), 600, -(this.citySize / 2));
        // lights[3].position.set(200, 600, -this.citySize - 200);
        // lights[4].position.set(-this.citySize - 200, 600, 200);
        // this.scene.add(...lights);
        this.scene.add(directionalLight);
        this.scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
        // this.scene.add(dirLight);
        this.scene.add(directionalLight.target);
        // this.scene.add(dirLight.target);
        this.scene.add(new THREE.DirectionalLightHelper(directionalLight, 10));
        this.scene.add(new THREE.DirectionalLightHelper(dirLight, 10));
        // this.scene.add(ambientLight);
        this.scene.add(...lights.map(light => new THREE.PointLightHelper(light, 1)));
        this.animate();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        const container = this.element.nativeElement;
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(evt: MouseEvent) {
        this.mouse.x = (evt.offsetX / this.element.nativeElement.clientWidth) * 2 - 1;
        this.mouse.y = -(evt.offsetY / this.element.nativeElement.clientHeight) * 2 + 1;
        // this.tooltip.style.left = `${evt.offsetX}px`;
        // this.tooltip.style.top = `${evt.offsetY}px`;
    }

    @HostListener('click')
    onClick() {
        this.controls.lock();
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (!this.controls.isLocked) {
            return;
        }
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
        }
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(e: KeyboardEvent) {
        if (!this.controls.isLocked) {
            return;
        }
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.objects) {
            if (!changes.objects.isFirstChange() && changes.objects.previousValue.length) {
                this.scene.remove(...changes.objects.previousValue);
            }
            if (this.objects.length) {
                this.scene.add(...this.objects);
            }
        }
    }

    ngOnDestroy(): void {
        cancelAnimationFrame(this.animationFrame);
        this.controls.dispose();
    }


    resize(width: number, height: number) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    private addLight() {

    }

    private animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();


        this.rayCaster.setFromCamera(this.mouse, this.camera);

        // calculate objects intersecting the picking ray
        const intersects = this.rayCaster.intersectObjects(this.scene.children);

        if (this.intersected !== null) {
            this.intersected['material'].color.setHex(this.intersected['savedColor']);
        }
        if (intersects.length > 0) {
            // if (!this.tooltipOverlay.hasAttached()) {
            //     this.tooltipComponent = this.tooltipOverlay.attach(new ComponentPortal(TooltipComponent));
            // }
            this.intersected = intersects[0].object;
            this.intersected['savedColor'] = this.intersected['material'].color.getHex();
            this.intersected['material'].color.setHex(0xff0000);
            // this.tooltipComponent.instance.object = this.intersected.rawObject;
            // this.tooltipOverlay.updatePosition();
        } else {
            // this.tooltipOverlay.detach();
        }

        this.renderer.render(this.scene, this.camera);
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction).normalize();
            if (this.moveForward || this.moveBackward) {
                direction.multiplyScalar(delta * 100 * (Number(this.moveForward) - Number(this.moveBackward)));

                this.controls.getObject().position.add(direction);
            }

        }
    }
}
