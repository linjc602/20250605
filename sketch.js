// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let stars = [];
let grabbedStar = null;

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

  // 產生8顆星星
  for (let i = 0; i < 8; i++) {
    let r = random(15, 35);
    let x = random(r, width - r);
    let y = random(r, height - r);
    stars.push({ x, y, r, grabbed: false });
  }

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

// 畫星星的函式
function drawStar(x, y, radius) {
  let angle = TWO_PI / 5;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * (radius * 0.5);
    sy = y + sin(a + halfAngle) * (radius * 0.5);
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function draw() {
  image(video, 0, 0);

  // 畫桶子（螢幕正中間）
  fill(200, 150, 50);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 80, 100, 120, 30);

  // 畫星星
  for (let star of stars) {
    push();
    fill(star.grabbed ? color(255, 200, 0) : color(255, 255, 0));
    stroke(255, 180, 0);
    strokeWeight(2);
    drawStar(star.x, star.y, star.r);
    pop();
  }

  // 手部偵測
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
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

        // 兩點的中點
        let midX = (thumbTip.x + indexTip.x) / 2;
        let midY = (thumbTip.y + indexTip.y) / 2;

        // 檢查是否抓到星星
        if (!grabbedStar) {
          for (let star of stars) {
            let d1 = dist(thumbTip.x, thumbTip.y, star.x, star.y);
            let d2 = dist(indexTip.x, indexTip.y, star.x, star.y);
            if (d1 < star.r + 10 || d2 < star.r + 10) {
              grabbedStar = star;
              star.grabbed = true;
              break;
            }
          }
        }

        // 若有抓到星星，讓星星跟著移動
        if (grabbedStar) {
          grabbedStar.x = midX;
          grabbedStar.y = midY;
        }
      }
    }
  }

  // 若沒碰到手，釋放星星
  if (hands.length === 0 && grabbedStar) {
    grabbedStar.grabbed = false;
    grabbedStar = null;
  }
}
