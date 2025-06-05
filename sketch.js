// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 確保至少偵測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 取得拇指與食指的關鍵點
        let thumbTip = hand.keypoints[4];
        let indexTip = hand.keypoints[8];

        // 畫出兩點
        fill(255, 0, 0);
        noStroke();
        circle(thumbTip.x, thumbTip.y, 20);

        fill(0, 255, 0);
        noStroke();
        circle(indexTip.x, indexTip.y, 20);

        // 用線連接兩點
        stroke(0, 255, 255);
        strokeWeight(4);
        line(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);
      }
    }
  }
}
