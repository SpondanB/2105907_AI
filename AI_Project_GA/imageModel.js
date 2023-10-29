class Model {
  constructor(width, height, nItems,  mode = "triangle") {
    this.items = new Array(nItems);
    this.mode = mode;
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(4 * width * height);
    this.score = -1;

    for (let i = 0; i < nItems; i++) {
      this.items[i] = Model.getNewShape(width, height, mode);
    }
  }

  getImage() {
    let img = createImage(this.width, this.height);
    img.loadPixels();
    for (let i = 0 ; i < this.pixels.length; i++) {
      img.pixels[i] = this.pixels[i];
    }
    img.updatePixels();
    return img;
  }

  updatePixels() {

    var canvas = document.createElement('canvas');
    canvas.id = "CursorLayer";
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.display = "none";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = CONFIG.BACKCOLOR;
    ctx.fillRect(0, 0, this.width, this.height);
    
    for (let i = 0; i < this.items.length; i++) {
      let item = this.items[i];
      ctx.fillStyle = "rgba(" +item.color.r + ','+item.color.g+','+item.color.b+','+map(item.color.a, 0, 255, 0, 1)+")";
      if (this.mode === Modes.TRIANGLE) {
        Model.drawTriangle(ctx, item);
      } else if (this.mode === Modes.RECTANGLE) {
        Model.drawRectangle(ctx, item);
      } else if (this.mode === Modes.CIRCLE) {
        Model.drawCircle(ctx, item);
      } else if (this.mode === Modes.CHAR) {
        Model.drawChar(ctx, item);
      }
    }
    this.pixels = ctx.getImageData(0, 0, this.width, this.height).data;
    //delete canvas
    body.removeChild(canvas);
    return pixels;
  }

  static drawTriangle(ctx, item) {
    ctx.beginPath();
    ctx.moveTo(item.points[0].x, item.points[0].y);
    ctx.lineTo(item.points[1].x, item.points[1].y);
    ctx.lineTo(item.points[2].x, item.points[2].y);
    ctx.fill();
  }

  static drawRectangle(ctx, item) {
    ctx.beginPath();
    ctx.fillRect(item.x, item.y, item.w, item.h);
  }

  static drawCircle(ctx, item) {
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2, true);
    ctx.fill();
  } 
  
  static drawChar(ctx, item) {
    ctx.font = item.fs + "px Arial";
    ctx.fillText(item.c, item.x, item.y);
  }

  static clone(itm) {
    let m = new Model(itm.width, itm.height, itm.nItems, itm.mode);
    m.pixels = itm.pixels.slice(0);
    m.items = itm.items.slice(0);
    m.score = itm.score;
    return m;
  }

  static getNewShape(width, height, mode) {
    let shape = {};
    let maxDim = Math.min(width, height) / CONFIG.MAX_DIST_ITEM;
    if (mode === Modes.TRIANGLE) {
      shape = { points: new Array(3) };
      shape.points[0] = { x: Math.floor(random(width)), y: Math.floor(random(height)) };
      let minX = Math.max(0, shape.points[0].x - maxDim);
      let maxX = Math.min(width, shape.points[0].x + maxDim);
      let minY = Math.max(0, shape.points[0].y - maxDim);
      let maxY = Math.min(width, shape.points[0].y + maxDim);
      shape.points[1] = { x: Math.floor(random(minX, maxX)), y: Math.floor(random(minY, maxY)) };
      shape.points[2] = { x: Math.floor(random(minX, maxX)), y: Math.floor(random(minY, maxY)) };
    } else if (mode === Modes.RECTANGLE) {
      shape = { 
        x: Math.floor(random(0, width)), 
        y: Math.floor(random(0, height)), 
        w: Math.floor(random(1, maxDim)),
        h: Math.floor(random(1, maxDim))
      };
    } else if (mode === Modes.CIRCLE) {
      shape = { 
        x: Math.floor(random(0, width)), 
        y: Math.floor(random(0, height)), 
        r: Math.floor(random(1, maxDim))
      };
    } else if (mode === Modes.CHAR) {
      shape = { 
        x: Math.floor(random(0, width)), 
        y: Math.floor(random(0, height)), 
        fs: Math.floor(random(5, 50)),
        c: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 1)
      };
    }
    shape.color = {
      a: Math.floor(random(255)),
      r: Math.floor(random(255)),
      g: Math.floor(random(255)),
      b: Math.floor(random(255))
    };
    return shape;
  }
}
