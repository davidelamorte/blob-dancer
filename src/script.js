import "./style.css";
import * as THREE from "three";
import fragment from "./shaders/fragment";
import vertex from "./shaders/vertex";

const fileInput = document.getElementById("inputAudio");
let dataArray = undefined;
let analyser = undefined;

fileInput.onchange = function () {
  const files = this.files;
  audio.src = URL.createObjectURL(files[0]);
  audio.load();
  audio.play();
  const context = new AudioContext();
  const src = context.createMediaElementSource(audio);
  analyser = context.createAnalyser();
  src.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
};

const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
const geometry = new THREE.SphereGeometry(1.7, 100, 100);
const material = new THREE.ShaderMaterial({
  uniforms: {
    time: {
      value: 0,
    },
  },
  side: THREE.DoubleSide,
  fragmentShader: fragment,
  vertexShader: vertex,
  wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

const animate = () => {
  if (analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray);
  }
  material.uniforms.time.value = dataArray ? dataArray[1] / 6 : 1;
  mesh.rotation.x += dataArray ? dataArray[2] / 50000 : 0.0001;
  mesh.rotation.y += dataArray ? dataArray[2] / 50000 : 0.0001;
  mesh.scale.x = dataArray ? dataArray[2] / 200 : 0;
  mesh.scale.y = dataArray ? dataArray[3] / 200 : 0;
  mesh.scale.z = dataArray ? dataArray[4] / 200 : 0;
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
