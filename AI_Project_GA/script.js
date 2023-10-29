let imagePath = CONFIG.IMAGE;
let imgOrig;
let gen;
let pixelsOrig;
let startDate;

let WIDTH;
let HEIGHT;

function preload() {
  imgOrig = loadImage(imagePath);
}

function setup() {

  WIDTH = Math.max(imgOrig.width + 220, 450);
  HEIGHT = imgOrig.height + imgOrig.height * WIDTH / imgOrig.width;
  createCanvas(WIDTH, HEIGHT);
  background(50);

  pixelsOrig = ImageTools.getImagePixels(imgOrig);
  gen = new GeneticShape(imgOrig, pixelsOrig, CONFIG.POP, CONFIG.MUTATE_RATE);

  startDate = new Date();
  print("Done by Spondan \nInspired by a plunker example.");
}

function draw() {
  let now = new Date();
  let ellapsed = now - startDate;

  let best = Model.clone(gen.getBestShape());
  let imgBestModel = best.getImage();
  let similarity = ImageTools.getSimilarityArrays(pixelsOrig, best.pixels);

  background(0);
  image(imgOrig, 0, 0, imgOrig.width, imgOrig.height);
  image(imgBestModel, 0, imgBestModel.height, WIDTH,  imgBestModel.height * WIDTH / imgBestModel.width);

  fill(220);
  noStroke();
  text('Similarity: ' + similarity + '%', imgOrig.width + 20, 20);
  text('Gen: ' + gen.getGen(), imgOrig.width + 20, 40);
  text('Ellapsed: ' + msToTime(ellapsed), imgOrig.width + 20, 60);

  gen.getNextGen();
}

function msToTime(duration) {
  var milliseconds = parseInt((duration%1000)/100)
      , seconds = parseInt((duration/1000)%60)
      , minutes = parseInt((duration/(1000*60))%60)
      , hours = parseInt((duration/(1000*60*60))%24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
