const canvas = document.getElementById("renderCanvas"); // Get the canvas element

const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Helper functions
const degToRad = function( degrees ){
  radians = (degrees * Math.PI)/180;
  return radians
}

const createScene = function () {

  const scene = new BABYLON.Scene( engine );
  scene.clearColor = new BABYLON.Color3( 0.0, 0.0, 0.0 );

  // Camera
  var camera = new BABYLON.ArcRotateCamera( "Camera", 0, 0, 10, new BABYLON.Vector3( 0, 0, 0 ), scene );
  camera.lowerRadiusLimit = .1;
  camera.upperRadiusLimit = 10;
  camera.attachControl( canvas, true );
  camera.wheelPrecision = 50;
  camera.minZ = 0.1
  camera.setPosition(new BABYLON.Vector3( -10, 1.5, 0 ));

  // Rendering pipeline
  var pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene);
  pipeline.samples = 4;
  pipeline.fxaaEnabled = true;

  // Tone mapping
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
  scene.imageProcessingConfiguration.exposure = 2.0;  

  // Environment Lighting
  var envTexture = new BABYLON.CubeTexture("environments/environment.env", scene);
  scene.environmentTexture = envTexture;
  envTexture.setReflectionTextureMatrix(BABYLON.Matrix.RotationY( degToRad(180) ));
  
  // Sky Dome
  var Dome = BABYLON.Mesh.CreateSphere('Dome', 64, 500, scene);

  var env_mat = new BABYLON.StandardMaterial("Mat_Dome", scene);
  var envtext = new BABYLON.Texture("skybox/skybox.png", scene);
  env_mat.diffuseTexture = envtext;
  env_mat.diffuseTexture.vScale = -1;
  env_mat.emissiveTexture = envtext;
  env_mat.emissiveColor = new BABYLON.Color3(1,1,1);
  env_mat.backFaceCulling = false;
  Dome.material=env_mat;

  const lightmaps = [];
  // lightmaps.push( { 'lm_shell': new BABYLON.Texture("lightmaps/lm_shell_+0.png", scene) } );
  // lightmaps.push( { 'lm_shell': new BABYLON.Texture("lightmaps/lm_shell_+2_very-high-contrast.png", scene) } );
  lightmaps.push( { 'lm_shell': new BABYLON.Texture("lightmaps/lm_shell_+3_high-contrast.png", scene) } );

  // Geometry
  BABYLON.SceneLoader.ImportMeshAsync("", "glb/", "scene.glb").then( ( model ) => {

    prepareModel( model, lightmaps );

  });

  prepareModel = function( model, lightmaps ){

    // if ( lightmaps ) {
    //   lightmaps.forEach( lightmap =>{
    //     lightmap.vScale = -1;  // flip texture vertically for correct mapping
    //   });
    // }

    if( model ) {
      if( model.meshes ) {
        model.meshes.forEach( mesh => {

          // 
          // mesh.material.environmentIntensity = 1.0;

          if ( mesh.material ) {
            if( mesh.material.metadata ){
              if( mesh.material.metadata.gltf ){
                if( mesh.material.metadata.gltf.extras ){
                  const metadata = Object.keys( mesh.material.metadata.gltf.extras );
                  const lmName = metadata[0];
                  console.log( lmName );

                  lightmaps.forEach( lightmap => {

                    const lmKey = Object.keys( lightmap )[0];
                    console.log( lmKey );

                    if( lmName == lmKey ){

                      lightmap[ lmKey ].vScale = -1;

                      mesh.material.lightmapTexture = lightmap[ lmKey ];
                      mesh.material.lightmapTexture.coordinatesIndex = 1;

                      mesh.material.useLightmapAsShadowmap = true;
                    }
                    
                  });
                }
              }
            }
          }
        });
      }
    }

  }

  return scene;

}

const scene = createScene(); // Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
  scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
  engine.resize();
});