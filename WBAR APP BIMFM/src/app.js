import { Group, Vector3, Matrix4, AxesHelper, PerspectiveCamera, Scene, WebGLRenderer, Mesh, AmbientLight, Color, MeshStandardMaterial, Box3, Vector2, Raycaster, MeshPhongMaterial, Material, DirectionalLight, Matrix3} from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {Mouse, Keyboard, Touch, MouseButton} from 'syncinput';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {IFCLoader} from "web-ifc-three";
import {ARButton} from 'three/addons/webxr/ARButton.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls.js';
import {IFCSPACE} from 'web-ifc';

//Class to store all app logic.
export class App {
    constructor(canvas) {
        // Canvas is used to present the output to the webpage
        this.canvas = canvas;

        // Renderer is used to draw the scene into the screen
        this.renderer = new WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
        this.renderer.sortObjects = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;
        
        // When the XR session starts, check how many markers there are to track
		this.renderer.xr.addEventListener('sessionstart', async () => {
			const session = this.renderer.xr.getSession();
			const scores = await session.getTrackedImageScores();

			let trackableImages = 0;
			for (let index = 0; index < scores.length; ++index) {
				if (scores[index] != 'untrackable') {
					trackableImages++;
				}
			}

			if (trackableImages == 0) {
				console.log('No trackable images');
			}
		});

        // Scene where the render objects are placed
        this.scene = new Scene();
        this.scene.background = new Color(0x000000);

        // Environment model that will follow pose of the marker
        this.model = new Group();
        this.scene.add(this.model);

        // Camera to define the perspective used to view the scene
        this.camera = new PerspectiveCamera(60, 1, 0.1, 1e4);
        this.camera.position.set(0, 10, 0);
        this.scene.add(this.camera);

        // Ambient light
        this.scene.add(new AmbientLight(0x777777));

        // Point light used to iluminate the scene for a point in all directions
        this.point = new DirectionalLight();
        this.point.position.set(1, 1, 0);
        this.scene.add(this.point);

        // Keyboard input
        this.keyboard = new Keyboard();

        // Mouse input
        this.mouse = new Mouse(document.body, true);

        // Touch input
        this.touch = new Touch();

        // Orbit controls are used for interaction in non-AR environment
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.listenToKeyEvents(window);

        // Resize observer watches for changes in the window geometry and updates the renderer size
        this.resizeObserver = new ResizeObserver(() => {
            this.resize();
        });
        this.resizeObserver.observe(this.canvas);
    }

    // Load a image bitmap from URL.
    // Load image into DOM element and then extracts image data as bitmap
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            // Create DOM img element
            const img = document.createElement('img');
            img.src = url;
            img.onload = async () => {
                // Convert image to bitmap
                const bitmap = await createImageBitmap(img);
                
                // Hide image from DOM
                img.style.display = 'none';
                
                resolve(bitmap);
            };
            img.onerror = reject;

            // Append image to document to that the content gets loaded
            document.body.appendChild(img);
        });
    }

    /**
     * Make all materials associated with the object transparent.
     */
    async makeTransparent(model) {
        // Create individual materials for each geometry (transparent with white color).
        model.traverse((child) => {
            if (child instanceof Mesh) {
                const material = child.material;
                if (material instanceof Material) {
                    child.material = new MeshStandardMaterial({
                        transparent: true,
                        opacity    : 0.8,
                        // blending: AdditiveBlending,
                        // depthTest: false,
                        // depthWrite: false,
                        color: material.color || 0xffffff
                    });
                } else if (material instanceof Array) {
                    for (let m = 0; m < material.length; m++) {
                        child.material[m] = new MeshStandardMaterial({
                            transparent: true,
                            opacity    : 0.8,
                            // blending: AdditiveBlending,
                            // depthTest: false,
                            // depthWrite: false,
                            color: child.material[m].color || 0xffffff
                        });;
                    }
                }
            }
        });
    }

    // Initializes the code of the application.
    // Loads required data for scene.
    async initialize() {
        // Enable XR button and load marker data set 'image-tracking' as optional feature
        const arButton = ARButton.createButton( this.renderer, {
            optionalFeatures: [ 'image-tracking' ],
            trackedImages: [
                {
                    // Load market to be tracked
                    image: await this.loadImage('assets/aruco.png'),
                    widthInMeters: 0.19, // 0.2
                }
            ]
        } );
        document.body.appendChild(arButton);

        // Axes helper
        const axesHelper = new AxesHelper(1);
        this.model.add(axesHelper);

        // Load model from FBX file
        const loader = new FBXLoader();
        loader.load('assets/20230807_eqs.fbx', (model) => {
            const scene = model;
            scene.scale.setScalar(1.0);
            scene.position.set(0, -1, -1);
        
            console.log('FBX model loaded', model);
            // this.model.add(scene);
        });
        
        // Load data from STL file
        const stlGeometry = await (new STLLoader()).loadAsync('assets/robot.stl');
        const robotArm = new Mesh(stlGeometry, new MeshPhongMaterial({color: 0xad4000}));
        robotArm.scale.setScalar(0.002);
        robotArm.position.set(0, -0.65, -1.3);
        robotArm.rotation.set(-Math.PI/2, 0, -Math.PI/2)
        // this.scene.add(robotArm);

        const box = new Box3();
        box.setFromObject(robotArm);
        console.log('STL Robot Arm Model loaded', robotArm, box);
            
        // Create a welcome text
        // this.createText('AR BIM+', new Vector3(1.2, 0.3, -3.9));

        // Configure IFC loader
        const ifcLoader = new IFCLoader();
        await ifcLoader.ifcManager.setWasmPath('web-ifc/', true);
        await ifcLoader.ifcManager.parser.setupOptionalCategories({
            [ IFCSPACE ]: false,
        });
        await ifcLoader.ifcManager.applyWebIfcConfig({
            USE_FAST_BOOLS: true
        });

        // Load IFC file
        ifcLoader.load('assets/20230807_eqs.ifc', (model) => {
            // Center the model
            const position = new Matrix4();
            position.makeTranslation(10, 0, 5);
            model.geometry.applyMatrix4(position);
            this.makeTransparent(model);
            this.model.add(model);

            document.body.addEventListener('touchstart', (event) =>{
                // model.rotation.y += 0.2;
            });
        });

        // Get IFC data
        // TODO <ADD CODE HERE>
    }

    /**
     * Start the execution of the application.
     * 
     * Runs the application login in loop until the stop() method is called.
     */
    start() {
        this.resize();
        this.renderer.setAnimationLoop((time, frame) => {
            this.update(time, frame);
        });
    }


    // Create next text object and place it on the scene.
    createText(nametext, manuftext, nameposition, manufposition, onLoad) {
        const loaderf = new FontLoader();
        loaderf.load('assets/robotofont.json', (font) => {
            const nameGeometry = new TextGeometry(nametext, {
                font: font,
                size: 20,    
                height: 2, // Depth of font geometry
            });
            const manufgeometry = new TextGeometry(manuftext, {
                font: font,
                size: 20,    
                height: 2, // Depth of font geometry
            })


            const nameMesh = new Mesh(nameGeometry, [
                // Use diferent colors for face and border
                new MeshPhongMaterial({color: 0xad4000}),
                new MeshPhongMaterial({color: 0x5c2301}),
            ]);
            nameMesh.castShadow = true //good way to cast shadows
            nameMesh.position.copy(nameposition);
            this.scene.add(nameMesh);

            const manufMesh = new Mesh(manufgeometry, [
                // Use diferent colors for face and border
                new MeshPhongMaterial({color: 0xad4000}),
                new MeshPhongMaterial({color: 0x5c2301}),
            ]);
            manufMesh.castShadow = true //good way to cast shadows
            manufMesh.position.copy(manufposition);
            this.scene.add(manufMesh);
            
            if (onLoad) {
                onLoad(nameMesh, manufMesh);
            }
        })
    }

    /**
     * Stop the application loop.
     */
    stop() {
        // Set animation loop null to stop rendering
        this.renderer.setAnimationLoop(null);
    }

    /**
     * Update the app every frame automatically called by the three.js renderer on each frame.
     * 
     * Matches the frequency that the application is running.
     */
    update(time, frame) {
        // If not running in XR mode update the controls object.
        if (!this.renderer.xr.enabled) {
            this.controls.update();
        }
        
        // If there is a XR frame available update the marker tracking positions
        if (frame) {
            const results = frame.getImageTrackingResults();
            for (const result of results) {            
                // Get the pose of the image relative to a reference space.
                const pose = frame.getPose(result.imageSpace, this.renderer.xr.getReferenceSpace());
                const state = result.trackingState;
                if (state == 'tracked') {
                    // Update the pose of the group from marker position
                    const matrix = new Matrix4();
                    matrix.fromArray(pose.transform.matrix);

                    console.log("Model Pose updated from marker", this.model);
                    this.model.position.setFromMatrixPosition(matrix);
                }
            }
        }

        // Update input devices (mouse, keyboard and touch inputs)
        this.keyboard.update();
        this.mouse.update();
        this.touch.update();

        // Update raycaster using the positions of the mouse
        const pointer = new Vector2(); //2D vector to keep track of the mouse
        const raycaster = new Raycaster();
        pointer.x = (this.mouse.position.x / window.innerWidth) * 2 - 1; // updating the 2D vector with the mouse coordinates
        pointer.y = (-this.mouse.position.y / window.innerHeight) * 2 + 1; //calculates pointer position in normalized device coordinates, -1 to +1 for both components

        // Setting the raycaster from camera to pointer to obtain the interesting objects
        raycaster.setFromCamera(pointer, this.camera);

        // If there are intersections, handle them
        if (this.mouse.buttonJustPressed(MouseButton.LEFT)) {
            // Perform intersection checks with objects in the scene
            const intersects = raycaster.intersectObjects(this.scene.children); 
            if (intersects.length > 0) { 
                const obj = intersects[0].object;
               
                console.log('Object Properties:', obj);
                //Define all requested text objects
                const NameText = 'Name: ' + obj.Name;
                const DescText = 'Description: ' + obj.Description;

                // Display all the requested object in text and destroy after 2 secs 
                this.createText(
                    NameText,
                    DescText,
                    new Vector3(obj.position.x-100, obj.position.y+160, obj.position.z),
                    new Vector3(obj.position.x-100, obj.position.y+140, obj.position.z),
                    (nameMesh, manufMesh) => {
                    setTimeout(() => {
                        nameMesh.removeFromParent();
                        manufMesh.removeFromParent();
                    }, 2000);
                });

                // Changes the color of the first intersected object
                const material = obj.material;

                if (material instanceof Material) {
                    material.color = new Color(0xFFFFFF * Math.random());
                } else if (material instanceof Array) {
                    for (let m = 0; m < material.length; m++) {
                        material[m].color = new Color(0xFFFFFF * Math.random());
                    }
                }
            }
        }



        // Render the frame to the screen
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Called when the screen is resized to calculate new camera frustum and projection properties.
     * 
     * Matches the screen aspect ration and resolution.
     */
    resize() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        
        // Calculate aspect ratio
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Set renderer size
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height, false);        
        
        console.log('Resize', width, height);
    }
}