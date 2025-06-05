// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let stars = [];
let grabbedStar = null;
let score = 0;
let timeLeft = 30; // 秒數，改成30秒
let gameOver = false;
let lastSecond = 0;
let finishedEarly = false; // 新增：是否提前完成

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  if (gameOver) {
    // 重設遊戲
    stars = [];
    for (let i = 0; i < 8; i++) {
      let r = random(15, 35);
      let x = random(r, width - r);
      let y = random(r, height - r);
      stars.push({ x, y, r, grabbed: false, collected: false });
    }
    score = 0;
    timeLeft = 15; // 重設為15秒
    gameOver = false;
    grabbedStar = null;
    lastSecond = millis();
    finishedEarly = false; // 重設
  } else {
    console.log(hands);
  }
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
    stars.push({ x, y, r, grabbed: false, collected: false });
  }

  // Start detecting hands
  handPose.detectStart(video, gotHands);
  lastSecond = millis();
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
  background(255);

  // 計算分數
  score = stars.filter(star => star.collected).length;

  // 提前完成判斷
  if (!gameOver && score === 8) {
    gameOver = true;
    finishedEarly = true;
  }

  if (gameOver) {
    fill(0);
    textSize(40);
    textAlign(CENTER, CENTER);
    if (finishedEarly) {
      text("時間到了！你能更快嗎？", width / 2, height / 2 - 60);
    } else {
      text("差一點就完成了！再挑戰一次看看！", width / 2, height / 2 - 60);
    }
    textSize(32);
    text("分數：" + score, width / 2, height / 2);

    // 只顯示「再玩一次」文字，無邊框按鈕
    fill(0);
    textSize(28);
    textAlign(CENTER, CENTER);
    text("再玩一次", width / 2, height / 2 + 65);

    return;
  }

  image(video, 0, 0);

  // 畫桶子（螢幕正中間）
  fill(200, 150, 50);
  rectMode(CENTER);
  let bucketX = width / 2;
  let bucketY = height / 2 + 80;
  let bucketW = 100;
  let bucketH = 120;
  rect(bucketX, bucketY, bucketW, bucketH, 30);

  // 畫星星
  for (let star of stars) {
    if (!star.collected) {
      push();
      fill(star.grabbed ? color(255, 200, 0) : color(255, 255, 0));
      stroke(255, 180, 0);
      strokeWeight(2);
      drawStar(star.x, star.y, star.r);
      pop();
    }
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
            if (star.collected) continue; // 已收集的不再抓取
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
        if (grabbedStar && !grabbedStar.collected) {
          grabbedStar.x = midX;
          grabbedStar.y = midY;

          // 判斷是否進桶子
          if (
            grabbedStar.x > bucketX - bucketW / 2 &&
            grabbedStar.x < bucketX + bucketW / 2 &&
            grabbedStar.y > bucketY - bucketH / 2 &&
            grabbedStar.y < bucketY + bucketH / 2
          ) {
            grabbedStar.collected = true;
            grabbedStar.grabbed = false;
            grabbedStar = null;
          }
        }
      }
    }
  }

  // 若沒碰到手，釋放星星
  if (hands.length === 0 && grabbedStar) {
    grabbedStar.grabbed = false;
    grabbedStar = null;
  }

  // 顯示分數在左上角（永遠 #0077b6）
  fill("#0077b6");
  noStroke();
  textSize(32);
  textAlign(LEFT, TOP);
  text("分數：" + score, 10, 10);

  // 顯示時間在分數下方（剩10秒內才變紅）
  if (timeLeft <= 10) {
    fill("#d62828");
  } else {
    fill("#0077b6");
  }
  textSize(28);
  text("剩餘時間：" + timeLeft + " 秒", 10, 50);

  // 倒數計時
  if (millis() - lastSecond >= 1000) {
    timeLeft--;
    lastSecond = millis();
    if (timeLeft <= 0) {
      gameOver = true;
      finishedEarly = false;
    }
  }
}
