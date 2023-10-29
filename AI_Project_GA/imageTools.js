class ImageTools {

  // Image Tools
  static getImagePixels(img) {
    img.loadPixels();
    return new Uint8ClampedArray(img.pixels);
  }

  static getIndex(x, y, width) {
    return 4 * (width * y + x);
  }

  // Similarity
  static getSimilarity(imgA, imgB) {
    let pixelsA = this.getImagePixels(imgA);
    let pixelsB = this.getImagePixels(imgB);
    return this.getSimilarityArrays(pixelsA, pixelsB);
  }

  static getSimilarityArrays(pixelsA, pixelsB) {
    if (CONFIG.FITNESS === 'RMS')
      return 100-this.RMS(pixelsA, pixelsB);
    else 
      return map(this.cosineSimilarity(pixelsA, pixelsB), 0.9, 1, 0, 100);
  }
  
  static cosineSimilarity(s1, s2) {
    let product = 0.0;
    let sqr1 = 0.0;
    let sqr2 = 0.0;
    for (let i = 0; i < s1.length; i++) {
      product += s1[i] * s2[i];
      sqr1 += s1[i] * s1[i];
      sqr2 += s2[i] * s2[i];
    }
    return product / (Math.sqrt(sqr1) * Math.sqrt(sqr2));
  }

  static RMS(s1, s2) {
    let diff = 0;
    let ms = 0;
    for (let i = 0; i < s1.length; i++) {
      diff = s1[i] - s2[i];
      ms += diff*diff;
    }
    ms /= s1.length;
    return sqrt(ms);
  }
  
  // Drawing
  static plot(x, y, color, img) {
    let idx = this.getIndex(x, y, img.width);
   
    let added = [color.r, color.g, color.b, map(color.a, 0, 255, 0, 1)];
    let base = [img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2], map(img.pixels[idx + 3], 0, 255, 0, 1)];
    let a01 = 1 - (1 - added[3]) * (1 - base[3]);

    img.pixels[idx + 0] = Math.round((added[0] * added[3] / a01) + (base[0] * base[3] * (1 - added[3]) / a01)); // red
    img.pixels[idx + 1] = Math.round((added[1] * added[3] / a01) + (base[1] * base[3] * (1 - added[3]) / a01)); // green
    img.pixels[idx + 2] = Math.round((added[2] * added[3] / a01) + (base[2] * base[3] * (1 - added[3]) / a01)); // blue
    img.pixels[idx + 3] = Math.round(map(a01, 0, 1, 0, 255));
  }

  static line(x0, y0, x1, y1, img, color) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    do {
      this.plot(x0, y0, color, img);
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    } while (x0 != x1 || y0 != y1);
  }

  static drawTriangle(triangle, img) {
    for (let i = 0; i < triangle.points.length; i++) {
      let point = triangle.points[i];
      let p1 =
        i === triangle.points.length - 1
          ? triangle.points[0]
          : triangle.points[i + 1];
      this.line(point.x, point.y, p1.x, p1.y, img, triangle.color);
    }
    this.fillTriangle(triangle, img);
  }

  static fillTriangle(triangle, img) {
    let vertices = Array.from(triangle.points);
    vertices.sort((a, b) => a.y > b.y);
    if (vertices[1].y == vertices[2].y) {
      this.fillBottomFlatTriangle(vertices[0], vertices[1], vertices[2], img, triangle.color);
    } else if (vertices[0].y == vertices[1].y) {
      this.fillTopFlatTriangle(vertices[0], vertices[1], vertices[2], img, triangle.color);
    } else {
      let v4 = {
        x: vertices[0].x + float(vertices[1].y - vertices[0].y) / float(vertices[2].y - vertices[0].y) * (vertices[2].x - vertices[0].x),
        y: vertices[1].y
      };
      this.fillBottomFlatTriangle(vertices[0], vertices[1], v4, img, triangle.color);
      this.fillTopFlatTriangle(vertices[1], v4, vertices[2], img, triangle.color);
    }
  }

  static fillBottomFlatTriangle(v1, v2, v3, img, color) {
    let invslope1 = (v2.x - v1.x) / (v2.y - v1.y);
    let invslope2 = (v3.x - v1.x) / (v3.y - v1.y);

    let curx1 = v1.x;
    let curx2 = v1.x;

    for (let scanlineY = v1.y; scanlineY <= v2.y; scanlineY++) {
      this.line(curx1, scanlineY, curx2, scanlineY, img, color);
      curx1 += invslope1;
      curx2 += invslope2;
    }
  }

  static fillTopFlatTriangle(v1, v2, v3, img, color) {
    let invslope1 = (v3.x - v1.x) / (v3.y - v1.y);
    let invslope2 = (v3.x - v2.x) / (v3.y - v2.y);

    let curx1 = v3.x;
    let curx2 = v3.x;

    for (let scanlineY = v3.y; scanlineY > v1.y; scanlineY--) {
      this.line(curx1, scanlineY, curx2, scanlineY, img, color);
      curx1 -= invslope1;
      curx2 -= invslope2;
    }
  }
}
