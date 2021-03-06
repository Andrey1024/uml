import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    InjectionToken,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import * as THREE from 'three';
import { PointerLockControls } from '../utils/pointer-lock-controls';
import { Overlay } from '@angular/cdk/overlay';

export const RENDERER = new InjectionToken<THREE.Renderer>('renderer');

@Directive({
    selector: '[umlThree]',
    exportAs: 'three'
})
export class ThreeDirective implements OnInit, OnChanges, OnDestroy {
    @Input('umlThree') object: THREE.Object3D;
    @Input() pickingObject: THREE.Object3D;
    @Output() select = new EventEmitter();
    @Output() hover = new EventEmitter<number>();
    //
    // tooltipEl: HTMLDivElement;
    // tooltipComponent: ComponentRef<TooltipComponent>;
    // tooltipOverlay: OverlayRef;

    private scene = new THREE.Scene();
    private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    private controls = new PointerLockControls(this.camera);
    private clock = new THREE.Clock();

    private pickingScene = new THREE.Scene();
    private pickingTexture = new THREE.WebGLRenderTarget(1, 1)

    private animationFrame: number;


    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;


    private mouse = new THREE.Vector2();
    private hoveredId = 0;
    private renderer = new THREE.WebGLRenderer({ alpha: true });


    constructor(private element: ElementRef<HTMLDivElement>,
                private overlay: Overlay) {
        this.controls.onUnlock = () => this.moveBackward = this.moveForward = this.moveLeft = this.moveRight = false;
        // this.tooltipEl = document.createElement('div');
        // this.tooltipEl.style.position = 'absolute';
        //
        // this.tooltipOverlay = this.overlay.create({
        //     positionStrategy: this.overlay.position().flexibleConnectedTo(this.tooltipEl)
        //         .withPositions([{
        //             originX: 'center', originY: 'center', overlayX: 'start', overlayY: 'bottom'
        //         }]),
        //     minWidth: 100,
        //     minHeight: 20
        // });

        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // const renderer = <any>this.renderer;
        // renderer.shadowCameraNear = 3;
        // renderer.shadowCameraFar = this.camera.far;
        // renderer.shadowCameraFov = 50;
        // renderer.shadowMapBias = 0.0039;
        // renderer.shadowMapDarkness = 0.5;
        // renderer.shadowMapWidth = 2048;
        // renderer.shadowMapHeight = 2048;
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
        // dirLight.castShadow = false;

        // lights[0].position.set(-this.citySize - 200, 600, -this.citySize - 200);
        this.scene.add(directionalLight);
        // this.scene.add(dirLight);
        this.scene.add(new THREE.AxesHelper(50))
        this.scene.add(directionalLight.target);
        this.scene.background = null;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        const container = this.element.nativeElement;
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    onMouseMove(e) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    @HostListener('click')
    onClick() {
        if (this.hoveredId) {
            this.select.emit(this.hoveredId);
        }
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

    ngOnInit() {
        this.element.nativeElement.appendChild(this.renderer.domElement);
        this.renderer.domElement.addEventListener('mousemove', e => this.onMouseMove(e));
        // this.element.nativeElement.appendChild(this.tooltipEl);
        this.resize();
        this.animate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.object) {
            if (!changes.object.isFirstChange() && changes.object.previousValue) {
                this.scene.remove(changes.object.previousValue);
                this.disposeObjects(changes.object.previousValue);
            }
            if (this.object) {
                this.scene.add(this.object);
            }
        }
        if (changes.pickingObject) {
            if (changes.pickingObject.previousValue) {
                this.pickingScene.remove(changes.pickingObject.previousValue)
            }
            if (this.pickingObject) {
                this.pickingScene.add(this.pickingObject);
            }
        }
        // if (this.objects && (changes.visibleNodes || changes.objects)) {
        //     this.objects.forEach(o => this.toggleVisibility(o))
        // }
        // if (changes.highLighted) {
        //     if (this.highLightedObject && this.highLighted !== this.highLightedObject.name) {
        //         this.highLightedObject['material'].color.setHex(this.highLightedObject['savedColor']);
        //         this.highLightedObject = null;
        //     }
        //     if (this.highLighted) {
        //         this.highLightedObject = this.scene.getObjectByName(this.highLighted);
        //         this.highLightedObject['savedColor'] = this.highLightedObject['material'].color.getHex();
        //         this.highLightedObject['material'].color.setHex(0x39e639);
        //     }
        // }
    }

    //
    // toggleVisibility(obj: THREE.Object3D) {
    //     if (obj.type === 'Group') {
    //         obj.children.forEach(child => this.toggleVisibility(child));
    //     }
    //     obj.visible = !obj.name || this.visibleNodes.includes(obj.name);
    // }

    ngOnDestroy(): void {
        // this.renderer.domElement.removeE
        cancelAnimationFrame(this.animationFrame);
        this.disposeObjects(this.object);
        this.controls.dispose();
        this.scene.dispose();
        this.element.nativeElement.remove();
    }


    resize() {
        const width = this.element.nativeElement.clientWidth, height = this.element.nativeElement.clientHeight;
        this.renderer.setSize(width, height, true);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }


    focus(name: string) {
        const object = this.scene.getObjectByName(name);
        if (!object) {
            return;
        }

        const target = new THREE.Vector3();
        object.getWorldPosition(target);
        this.camera.lookAt(target);
    }

    private disposeObjects(...objects: THREE.Object3D[]) {
        objects.forEach(obj => {
            if (obj.parent) {
                obj.parent.remove(obj);
            }
            if (obj.children) {
                this.disposeObjects(...obj.children)
            }
            if (obj.type === 'Mesh') {
                // @ts-ignore
                obj.geometry.dispose();
                // @ts-ignore
                obj.material.dispose();
            }
        })
    }

    private animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();

        // this.rayCaster.setFromCamera(this.mouse, this.camera);
        //
        // const intersects = this.rayCaster.intersectObjects(this.objects, true);
        //
        // if (this.intersected !== null) {
        //     this.intersected['material'].color.setHex(this.intersected['savedColor']);
        // }
        // if (intersects.length > 0 && intersects[0].object.userData && intersects[0].object.userData.data) {
        //     this.intersected = intersects[0].object;
        //     if (!this.tooltipOverlay.hasAttached()) {
        //         this.tooltipComponent = this.tooltipOverlay.attach(new ComponentPortal(TooltipComponent));
        //     }
        //     this.intersected['savedColor'] = this.intersected['material'].color.getHex();
        //     this.intersected['material'].color.setHex(0xff0000);
        //     this.tooltipComponent.instance.object = this.intersected.userData;
        //     this.tooltipOverlay.updatePosition();
        // } else {
        //     this.tooltipOverlay.detach();
        // }
        if (!this.controls.isLocked) {
            this.pick();
            this.renderer.setRenderTarget(null);
        }

        this.renderer.render(this.scene, this.camera);
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction).normalize();
            if (this.moveForward || this.moveBackward) {
                direction.multiplyScalar(Number(this.moveForward) - Number(this.moveBackward));
            }
            if (this.moveLeft || this.moveRight) {
                const yNormal = new THREE.Vector3(0, 1, 0)
                direction.projectOnPlane(yNormal).applyAxisAngle(yNormal, Math.PI / 2)
                    .multiplyScalar(Number(this.moveLeft) - Number(this.moveRight)).normalize();
            }
            this.camera.position.add(direction.multiplyScalar(delta * 150));
        }
    }

    private pick() {
        const pixelRatio = this.renderer.getPixelRatio();
        this.camera.setViewOffset(
            this.renderer.getContext().drawingBufferWidth,   // full width
            this.renderer.getContext().drawingBufferHeight,  // full top
            this.mouse.x * pixelRatio | 0,             // rect x
            this.mouse.y * pixelRatio | 0,             // rect y
            1,                                          // rect width
            1,                                          // rect height
        );
        this.renderer.setRenderTarget(this.pickingTexture);
        this.renderer.render(this.pickingScene, this.camera);


        this.camera.clearViewOffset();

        const pixelBuffer = new Uint8Array(4);


        this.renderer.readRenderTargetPixels(this.pickingTexture, 0, 0, 1, 1, pixelBuffer);
        const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
        if (id !== this.hoveredId) {
            this.hoveredId = id;
            this.hover.emit(id);
        }
    }
}
