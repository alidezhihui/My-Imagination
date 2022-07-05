import * as THREE from './build/three.module.js';
import { OrbitControls } from './example/jsm/controls/OrbitControl.js';
import { GUI } from './example/jsm/libs/lil-gui.module.min.js';
import { OBJLoader } from './example/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './example/jsm/loaders/MTLLoader.js';

// Global Variable
let renderer;
let scene;
let canvas;
let loader; 
let texture_loader;
let loadManager;
let g_camera; 
let trees = [];
let animation_cube;
let animation_sphere;
let g_time;
let objLoader;
let g_light;


const geometry_cube = new THREE.BoxGeometry(1, 1, 1);
/* geometry_cube.translate(0.5, 0.5, 0.5) */

function main() {
    initializeCanvas()
    setCamera()
    preliminaryScene()
    loadingAndMakingMaterials()
    requestAnimationFrame(tick);
}


function loadingAndMakingMaterials() {
    
    const materials = [
        new THREE.MeshBasicMaterial({map: loader.load('textureResources/furnace/furnace_front.png')}),
        new THREE.MeshBasicMaterial({map: loader.load('textureResources/furnace/furnace_back.png')}),
        new THREE.MeshBasicMaterial({map: loader.load('textureResources/furnace/furnace_top.png')}),
        new THREE.MeshBasicMaterial({map: loader.load('textureResources/furnace/furnace_back.png')}),
        new THREE.MeshBasicMaterial({map: loader.load('textureResources/furnace/furnace_back.png')}),
        new THREE.MeshBasicMaterial({map: loader.load('textureResources/furnace/furnace_back.png')}),
    ]

    const material_ground = loader.load('textureResources/grassMine.jpg')
    const material_football = loader.load('textureResources/football.png')
    const material_tent = loader.load('textureResources/Tent/redSilk.jpeg')

    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem.querySelector('.progressbar');


    loadManager.onLoad = () => {
        loadingElem.style.display = 'none';
        // 1 cube

        const cube = new THREE.Mesh(geometry_cube, materials);
        cube.position.set(-2.8, 0.5, 5.3)
        cube.rotation.y = THREE.Math.degToRad(90)
        animation_cube = cube;
        scene.add(cube);
        // 2 ground
        {
            const planeSize = 100;
            material_ground.wrapS = THREE.RepeatWrapping;
            material_ground.wrapT = THREE.RepeatWrapping;
            material_ground.magFilter = THREE.NearestFilter;
            const repeats = planeSize /2;
            material_ground.repeat.set(repeats, repeats);
        
            const groundGeo = new THREE.PlaneGeometry(planeSize, planeSize)
            const groundMat = new THREE.MeshPhongMaterial({
                map: material_ground,
                side: THREE.DoubleSide,
            })
            const mesh = new THREE.Mesh(groundGeo, groundMat);
            mesh.rotation.x = Math.PI * -.5
            mesh.receiveShadow = true;
            scene.add(mesh)
        }
        // 3 Sphere
        {
            const sphereGeo = new THREE.SphereGeometry(.2, 32, 32)
            const sphereMat = new THREE.MeshPhongMaterial({
                map: material_football,
            })
            const mesh = new THREE.Mesh(sphereGeo, sphereMat)
            mesh.position.set(1, .3, .4)
            mesh.scale.set(1.5, 1.5, 1.5)
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            animation_sphere = mesh;
            scene.add(mesh)
        }
    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;
    };

    //👴的🐶
    objLoader.load('textureResources/Dog/13463_Australian_Cattle_Dog_v3.obj', root=> {
        root.traverse((obj) => {
            if (obj.isMesh) {
                obj.receiveShadow = true;
                obj.castShadow = true;
                obj.material.color.set(0x696969)
            }
        })
/*         root.rotation.z = THREE.Math.degToRad(90)
        root.rotation.y = THREE.Math.degToRad(90) */
        root.scale.set(.05, .05, .05)
        root.position.set(-1, 0, 2)
        
        root.rotation.x = THREE.Math.degToRad(-90)
        root.rotation.z = THREE.Math.degToRad(90)
        makeNameLabel('dog', [-1, 3, 2])

        scene.add(root)
        
    })
    //👴
    const mtlLoader = new MTLLoader();
    mtlLoader.load('textureResources/guy/materials.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('textureResources/guy/model.obj', (root)=> {
            root.traverse(obj => {
                if (obj.isMesh) {
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            scene.add(root)
            root.scale.set(2, 2, 2)
            root.translateY(0.6)
            root.rotation.y = THREE.Math.degToRad(-90)
        })
    })
    makeNameLabel('Me', [0, 0, 0])
    //👴的SUV
    objLoader.load('textureResources/mycar/Lamborghini_Aventador.obj', root=> {
        root.traverse(obj => {
            if (obj.isMesh) {
                obj.receiveShadow = true;
                obj.castShadow = true;
                obj.material.color.set(0x343434)
            }
        })
        root.position.set(-4, 0, -4)
        root.rotation.y = THREE.Math.degToRad(90)
        root.scale.set(0.015, 0.015, 0.015)
        scene.add(root)
    })
    //👴的tent
    objLoader.load('textureResources/Tent/Canopy.obj', root=> {
        const tentMat = new THREE.MeshPhongMaterial({
            map: material_tent,
            side: THREE.DoubleSide,
        })
        root.traverse(obj => {
            if (obj.isMesh) {
                obj.material = tentMat
                obj.receiveShadow = true;
                obj.castShadow = true;
            }
        })
        root.position.set(-3, 0, 5)
        root.scale.set(0.005, 0.005, 0.005)
        root.rotation.y = THREE.Math.degToRad(180)

        scene.add(root)
    })

    //🌲🌲🌲
    for (let i=0; i<35; i++) {
        let pos = [getRandomInt(-50, 50),0, getRandomInt(8, 45)]
        /* makeTrees(pos) */
        makeObjects('tree', pos)
    }

    for (let i=0; i<35; i++) {
        let pos = [getRandomInt(-50, 50),0, getRandomInt(-8, -45)]
        makeObjects('tree', pos)
    }

    //small stones
    for (let i=0; i<30; i++) {
        let pos = [getRandomInt(-50, 50),0, getRandomInt(-50, 50)]
        makeObjects('small stone', pos)
    }
    /* makeObjects('small stone', [getRandomInt(-10, -20),0, getRandomInt(-20, 20)], getRandomInt(0, 180)) */

    //stones
    for (let i=0; i<2; i++) {
        let pos = [getRandomInt(-50, 50),0, getRandomInt(10, 50)]
        console.log(pos)
        makeObjects('stone', pos, getRandomInt(0, 180))
    }

    for (let i=0; i<2; i++) {
        let pos = [getRandomInt(-50, 50),0, getRandomInt(-10, -50)]
        console.log(pos)
        makeObjects('stone', pos, getRandomInt(0, 180))
    }


    
    makeObjects('deer', [getRandomInt(45, 50),0, getRandomInt(-20, 20)], getRandomInt(0, 180))
    makeObjects('rabbit', [getRandomInt(30, 45),0, getRandomInt(-20, 20)], getRandomInt(0, 180))
    makeObjects('horse', [getRandomInt(10, 30),1.3, getRandomInt(-20, 20)], getRandomInt(0, 180))
    makeObjects('bear', [getRandomInt(-35, -40),0, getRandomInt(-20, 20)], getRandomInt(0, 180))
    makeObjects('fox', [getRandomInt(-10, -20),0, getRandomInt(-20, 20)], getRandomInt(0, 180))
   
    

    /*         const box = new THREE.Box3().setFromObject(root);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
        console.log(boxSize);
        console.log(boxCenter); */
}

function makeObjects(type, pos, rot) {
    if (type === 'tree') {
        objLoader.load('textureResources/christmasTree/ChristmasTree.obj', root=> {
            root.traverse(obj => {
                if (obj.isMesh) {
                    obj.material.color.set(0x228b22)
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            root.scale.set(0.3, 0.3, 0.3)
            root.position.set(pos[0], pos[1], pos[2])
            scene.add(root)
            trees.push(root)
        })
    } else if (type === 'stone') {
        objLoader.load('textureResources/stones/model.obj', root=>{
            root.traverse(obj => {
                if(obj.isMesh) {
                    obj.material.color.set(0x808080)
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            root.scale.set(20, 20, 20)
            root.position.set(pos[0], pos[1], pos[2])
            root.rotation.y = THREE.Math.degToRad(rot)
            scene.add(root)
        })
    } else if (type === 'deer') {
        objLoader.load('textureResources/deer/Deer.obj', root=>{
            root.traverse(obj => {
                if(obj.isMesh) {
                    obj.material.color.set(0xffa500)
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            root.scale.set(0.01, 0.01, 0.01)
            root.position.set(pos[0], pos[1], pos[2])
            root.rotation.y = THREE.Math.degToRad(rot)
            makeNameLabel('deer', [pos[0], 3, pos[2]])
            scene.add(root)
        })
    } else if (type === 'rabbit') {
        objLoader.load('textureResources/rabbit/Cottontails.obj', root=>{
            root.traverse(obj => {
                if(obj.isMesh) {
                    obj.material.color.set(0xffffff)
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            root.scale.set(0.15, 0.15, 0.15)
            root.position.set(pos[0], pos[1], pos[2])
            root.rotation.y = THREE.Math.degToRad(rot)
            makeNameLabel('rabbit', [pos[0], 3, pos[2]])
            scene.add(root)
        })
    } else if (type === 'fox') {
        objLoader.load('textureResources/fox/ArcticFox_Posed.obj', root=>{
            root.traverse(obj => {
                if(obj.isMesh) {
                    obj.material.color.set(0xffe5b4)
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            root.scale.set(0.3, 0.3, 0.3)
            root.position.set(pos[0], pos[1], pos[2])
            root.rotation.y = THREE.Math.degToRad(rot)
            makeNameLabel('fox', [pos[0], 3, pos[2]])
            scene.add(root)
        })
    } else if (type === 'bear') {
        objLoader.load('textureResources/bear/BlackBear.obj', root=>{
            root.traverse(obj => {
                if(obj.isMesh) {
                    obj.material.color.set(0x483c32)
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            root.scale.set(0.24, 0.24, 0.24)
            root.position.set(pos[0], pos[1], pos[2])
            root.rotation.y = THREE.Math.degToRad(rot)
            makeNameLabel('bear', [pos[0], 3, pos[2]])
            scene.add(root)
    })
    } else if (type === 'horse') {
        objLoader.load('textureResources/Horse/Mesh_Horse.obj', root=>{
            root.traverse(obj => {
                if(obj.isMesh) {
                    obj.material.color.set(0xffffff)
                    obj.receiveShadow = true;
                    obj.castShadow = true;
                }
            })
            root.scale.set(0.013, 0.013, 0.013)
            root.position.set(pos[0], pos[1], pos[2])
            root.rotation.y = THREE.Math.degToRad(rot)
            makeNameLabel('horse', [pos[0], 3, pos[2]])
            scene.add(root)
    })
    } else if (type === 'small stone'){
        const cube = new THREE.Mesh(geometry_cube, new THREE.MeshPhongMaterial({color: 'brown'}));
        cube.position.set(pos[0], pos[1], pos[2])
        cube.scale.set(.5, .2, .5)
        
        scene.add(cube)
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function setCamera() {
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 1;
    const far = 100;
    g_camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    g_camera.position.set(0, 3, -5);

    const controls = new OrbitControls(g_camera, canvas);
    /* controls.target.set(0, 5, 0); */
    controls.update();
}

function initializeCanvas() {
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({canvas});
    scene = new THREE.Scene();
    loadManager = new THREE.LoadingManager();
    loader = new THREE.TextureLoader(loadManager);
    texture_loader = new THREE.TextureLoader();
    objLoader = new OBJLoader();
}



function tick(time) {
    g_time = time*0.001;  // convert time to seconds
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        g_camera.aspect = canvas.clientWidth/canvas.clientHeight;
        g_camera.updateProjectionMatrix();
    }

    //change some data based on time
    animationShapes();
    requestAnimationFrame(tick);
}

function resizeRendererToDisplaySize(renderer1) {
    const canvas = renderer1.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer1.setSize(width, height, false);
  }
  return needResize;
}

/* cubes = [makeInstance(geometry_cube, 0, 0, 1)] */
function animationShapes() {
    
/*     cubes.forEach((cube, ndx) => {
        
        const speed = 1 + ndx * .1;
        const rot = g_time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
        })  */
    if (animation_cube !== undefined) {
        animation_cube.translateY(0.002*Math.sin(5*g_time))
    }
    if (animation_sphere !== undefined) {
        animation_sphere.rotation.y = 5*g_time
    }

    if (g_light !== undefined) {
        g_light.rotation.x = g_time
        g_light.rotation.y = g_time
    }

    trees.forEach((tree) => {
        
        tree.rotation.x = 0.04*Math.sin(g_time)
        tree.rotation.y = 0.04*Math.sin(g_time)
    })


    renderer.render(scene, g_camera);
}

function preliminaryScene() {
    scene.background = new THREE.Color('white');
    renderer.shadowMap.enabled = true;
    const gui = new GUI();
    //light
    const color = 0xFFFFFF;


    // 1 Direcitonal light
    const sun_color = 0xF5b8b8;
    const sun_light = new THREE.DirectionalLight(sun_color, 0.7);
    /* let light_pos = [50, 30, 0] */
    let light_pos = [40, 5, 0]
    sun_light.position.set(light_pos[0], light_pos[1], light_pos[2]);
    /* sun_light.target.position.set(0, 0, 0); */
    sun_light.castShadow = true;

    const shadowSize = 100;
    sun_light.shadow.camera.left = -shadowSize;
    sun_light.shadow.camera.right = shadowSize;
    sun_light.shadow.camera.top = shadowSize;
    sun_light.shadow.camera.bottom = -shadowSize;
    sun_light.shadow.camera.near = 0.01;
    sun_light.shadow.camera.far = 100;
    sun_light.shadow.camera.width = 1024;
    sun_light.shadow.camera.height = 1024;

    
    const radiusTop = 4;
    const radiusBottom = 4;
    const height = 8;
    const radialSegments = 30;
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), new THREE.MeshBasicMaterial({color: 'yellow'}))
    cylinder.position.set(light_pos[0], light_pos[1], light_pos[2]);
    cylinder.scale.set(0.1, 0.1, 0.1)
    g_light = cylinder
    scene.add(cylinder);
    
    scene.add(sun_light);
    /* scene.add(sun_light.target) */
    // 2 Ambient Light
    const ambient_light = new THREE.AmbientLight(color, 0.3);
    scene.add(ambient_light)
    // 3 HemisphereLihgt
    const skyColor = 0xB1E1FF;
    const groundColor = 0x98FB98;
    const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 0.3)
    scene.add(hemisphereLight)

    // background
    const background_texture = texture_loader.load(
        'textureResources/grassBack.png',
        ()=> {
            const rt = new THREE.WebGLCubeRenderTarget(background_texture.image.height);
            rt.fromEquirectangularTexture(renderer, background_texture);
            scene.background = rt.texture;
        });

    // fog
    const near = 1;
    const far = 90;
    
    scene.fog = new THREE.Fog('white', near, far);
    scene.background = new THREE.Color('white');
   
    const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
    gui.add(fogGUIHelper, 'near', near, far).listen().name('fog near');
    gui.add(fogGUIHelper, 'far', near, far).listen().name('fog far');
    gui.addColor(fogGUIHelper, 'color').name('fog color');

    
    gui.addColor(new ColorGUIHelper(sun_light, 'color'), 'value').name('sun color');
    gui.addColor(new ColorGUIHelper(ambient_light, 'color'), 'value').name('ambient light color');
    gui.addColor(new ColorGUIHelper(hemisphereLight, 'color'), 'value').name('skyColor')
    gui.addColor(new ColorGUIHelper(hemisphereLight, 'groundColor'), 'value').name('groundColor');
    gui.add(sun_light, 'intensity', 0, 2, 0.01).name('sun light intensity')
    gui.add(hemisphereLight, 'intensity', 0, 2, 0.01).name('sky and ground light intensity')
    
 /*    scene.background = new THREE.Color('black'); */
}

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}
class FogGUIHelper {
    constructor(fog, backgroundColor) {
      this.fog = fog;
      this.backgroundColor = backgroundColor;
    }
    get near() {
      return this.fog.near;
    }
    set near(v) {
      this.fog.near = v;
      this.fog.far = Math.max(this.fog.far, v);
    }
    get far() {
      return this.fog.far;
    }
    set far(v) {
      this.fog.far = v;
      this.fog.near = Math.min(this.fog.near, v);
    }
    get color() {
      return `#${this.fog.color.getHexString()}`;
    }
    set color(hexString) {
      this.fog.color.set(hexString);
      this.backgroundColor.set(hexString);
    }
}

function makeNameLabel(name, pos) {
    const x = pos[0]
    const y = pos[1]
    const z = pos[2]
    const canvas = canvasLabel(name, 150, 30);
    const texture = new THREE.CanvasTexture(canvas);

    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    })

    const root = new THREE.Object3D();

    const label = new THREE.Sprite(labelMaterial)
    root.add(label);
    label.position.x = x
    label.position.y = y+2.5
    label.position.z = z
    label.scale.x = canvas.width * 0.02;
    label.scale.y = canvas.height * 0.02;

    scene.add(root)
    return root
}

function canvasLabel(name, bw, size) {
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.font = `${size}px bold monospace`

    const textWidth = ctx.measureText(name).width;

    const doubleBorderSize = 4;
    const width = (bw + doubleBorderSize)/2;
    const height = (size + doubleBorderSize)/2;
    ctx.canvas.width = 2*width;
    ctx.canvas.height = 2*height;

    ctx.textAligh = 'center';
    ctx.font = `${size}px bold monospace`
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 2*width, 2*height)

    const scaleFactor = Math.min(1, bw/textWidth)
    ctx.translate(width, height)
    ctx.scale(scaleFactor, 1)
    ctx.fillStyle = 'pink';
    ctx.fillText(name, 0, 0)

    return ctx.canvas;
}

function shapesAnimation() {}
// call main()



main()