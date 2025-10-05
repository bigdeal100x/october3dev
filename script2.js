/*
FACE DETECTION + TOUCH ZONES
Grow/shrink GIF with screen touches

Uses BlazeFace for face tracking
and touch zones to control GIF size
*/

let video; // webcam input
let model; // BlazeFace model
let face;  // detected face
let firstFace = true;
let value = 255;

// GIF image
let dance;
let gifSize = 65; // starting size of GIF

function preload() {
  dance = loadImage("dance-happy.gif");
}

function setup() {
  createCanvas(640, 460); // phone-size canvas
  video = createCapture(VIDEO);
  video.hide();
  loadFaceModel();
  textAlign(CENTER, CENTER);
  textSize(24);
}

// Load the BlazeFace model asynchronously
async function loadFaceModel() {
  model = await blazeface.load();
}

function draw() {
  background(240);

  // Update face detection if video and model ready
  if (video.loadedmetadata && model !== undefined) {
    getFace();
  }

  // If a face is detected
  if (face !== undefined) {
    image(video, 0, 0, width, height);

    if (firstFace) {
      console.log(face);
      firstFace = false;
    }

    let rightEye = scalePoint(face.landmarks[0]);
    let leftEye = scalePoint(face.landmarks[1]);
    let nose = scalePoint(face.landmarks[2]);
    let mouth = scalePoint(face.landmarks[3]);
    let rightEar = scalePoint(face.landmarks[4]);
    let leftEar = scalePoint(face.landmarks[5]);

    noFill();
    stroke(value);
    strokeWeight(2);

    if (
      mouseX < leftEar.x &&
      mouseX > rightEar.x &&
      mouseY < mouth.y &&
      mouseY > rightEye.y
    ) {
      value = [240, 30, 30];
    } else {
      value = 255;
    }

    // draw GIFs on the eyes, scaled based on gifSize
    image(dance, leftEye.x - gifSize / 2, leftEye.y - gifSize / 2, gifSize, gifSize);
    image(dance, rightEye.x - gifSize / 2, rightEye.y - gifSize / 2, gifSize, gifSize);
  }



}

// Utility to convert video points to canvas
function scalePoint(pt) {
  let x = map(pt[0], 0, video.width, 0, width);
  let y = map(pt[1], 0, video.height, 0, height);
  return createVector(x, y);
}

// Get face predictions asynchronously
async function getFace() {
  const predictions = await model.estimateFaces(
    document.querySelector("video"),
    false
  );
  face = predictions.length === 0 ? undefined : predictions[0];
}

// =========================
// TOUCH / MOUSE CONTROLS
// =========================

function getZone(x, y) {
  return y < height / 2 ? 1 : 2; // 1 = top, 2 = bottom
}

function touchStarted() {
  let zone = getZone(touches[0].x, touches[0].y);
  adjustGifSize(zone);
  return false;
}

function mousePressed() {
  let zone = getZone(mouseX, mouseY);
  adjustGifSize(zone);
  return false;
}

// Increase/decrease gif size
function adjustGifSize(zone) {
  if (zone === 1) {
    gifSize += 10;
  } else {
    gifSize = max(10, gifSize - 10); // prevent shrinking too small
  }
}

// Handle resizing
function windowResizing() {
    if (windowWidth < 640) {
        resizeCanvas(640/2, 460/2);
    } else {
        resizeCanvas(640, 460);
    }
}