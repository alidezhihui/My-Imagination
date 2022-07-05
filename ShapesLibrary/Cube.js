import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';

class Cube {
    constructor() {
        this.boxWidth = 2;
        this.boxHeight = 1;
        this.boxDepth = 1;
        this.color = 0x44aa88;
        this.object;
    }

    render(scene) {
        const geometry = new THREE.BoxGeometry(this.boxWidth, this.boxHeight, this.boxDepth);
        const material = new THREE.MeshPhongMaterial({color: this.color});  // greenish blue
        this.object = new THREE.Mesh(geometry, material);
        scene.add(this.object);
    }
}

export {Cube};