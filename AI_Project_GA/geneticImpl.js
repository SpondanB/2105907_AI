class GeneticShape {
  constructor(imgCible, pixCible, popSize, mutateRate) {
    this.imgCible = imgCible;
    this.pixImgCible = pixCible;
    this.POP_SIZE = popSize;
    this.MUTATE_RATE = mutateRate;
    this.mutateMethods = [];

    this.genetic = new GeneticAlgorithm(this);

    this.genetic.generateInitialPool = this.generateInitialPool;
    this.genetic.evaluatePool = this.evaluatePool;
    this.genetic.selectBestFromGen = this.selectBestFromGen;
    this.genetic.createFromBest = this.createFromBest;
    this.genetic.mate = this.mate;
    this.genetic.mutate = this.mutate;
    this.mutateMethods.push(this.mutate_deleteItem);
    this.mutateMethods.push(this.mutate_addItem);
    this.mutateMethods.push(this.mutate_changeItem);
    //this.mutateMethods.push(this.mutate_switchItems);
    this.mutateMethods.push(this.mutate_generateRandomImage);
    //this.mutateMethods.push(this.mutate_moveItemPointX);
    //this.mutateMethods.push(this.mutate_moveItemPointY);
    //this.mutateMethods.push(this.mutate_changeItemColor);
    //this.mutateMethods.push(this.mutate_changeItemColorAlpha);
    

    this.genetic.generateInitialPool();
  }

  getBestShape() {
    return this.genetic.getBest();
  }

  getGen() {
    return this.genetic.getGen();
  }

  getPool() {
    return this.genetic.pool;
  }

  getNextGen() {
    return this.genetic.getNextGen();
  }

  generateInitialPool() {
    this.pool = [];
    for (let i = 0; i < this.parent.POP_SIZE; i++) {
      this.pool[i] = GeneticShape.generateRandomImage(
        CONFIG.MIN_ITEMS,
        CONFIG.MAX_ITEMS,
        this.parent.imgCible.width,
        this.parent.imgCible.height
      );
      this.pool[i].score = -1;
    }
    this.evaluatePool();
  }

  evaluatePool() {
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].score === -1) {
        this.pool[i].updatePixels();
        this.pool[i].score = ImageTools.getSimilarityArrays(this.parent.pixImgCible, this.pool[i].pixels);
      }
    }
    //Order by score
    this.pool = this.pool.sort((a, b) => {
      return b.score - a.score;
    });
  }

  selectBestFromGen() {
    let threshold = Math.ceil(this.parent.POP_SIZE * 0.25);
    this.genBest = new Array(threshold);
    for (let i = 0; i < threshold; i++) {
      this.genBest[i] = Model.clone(this.pool[i]);
    }
  }

  createFromBest() {
    this.pool = new Array(this.parent.POP_SIZE);
    let i = 0;
    for (i = 0; i < this.genBest.length; i++) {
      this.pool[i] = Model.clone(this.genBest[i]);
    }
    while (i < this.parent.POP_SIZE) {
      this.pool[i] = (this.mate(random(this.genBest), random(this.genBest)));

      i++;
    }
  }

  mate(p1, p2) {
    let lp1 = p1.items.length;
    let lp2 = p2.items.length;

    let minL = Math.min(lp1, lp2);
    let maxL = Math.max(lp1, lp2);

    let childLength = Math.round(random(minL, maxL));
    let child = new Model(p1.width, p2.height, childLength, p1.mode);

    let sp1, sp2;
    do {
      sp1 = Math.round(random(childLength));
      sp2 = Math.round(random(childLength));
    } while (sp1 === sp2);

    if (sp1 > sp2) {
      let tmp = sp1;
      sp1 = sp2;
      sp2 = tmp;
    }

    for (let i = 0; i < childLength; i++) {
      let chromosomeP1Index = Math.min(
        lp1 - 1,
        Math.round(map(i, 0, childLength, 0, lp1))
      );
      let chromosomeP2Index = Math.min(
        lp2 - 1,
        Math.round(map(i, 0, childLength, 0, lp2))
      );
      let c1 = p1.items[chromosomeP1Index];
      let c2 = p2.items[chromosomeP2Index];
      if (i >= sp1 && i <= sp2) {
        child.items[i] = c1;
      } else {
        child.items[i] = c2;
      }
    }
    return child;
  }

  mutate() {
    if (random(100) > this.parent.MUTATE_RATE) {
      let mutated = random(this.pool);
      if (this.pool.indexOf(mutated) === 0) {
        return;
      }
      random(this.parent.mutateMethods)(this.parent, mutated);
      mutated.score = -1;
    }
  }

  mutate_deleteItem(data, itm) {
    if (itm.items.length > CONFIG.MIN_ITEMS) {
      let remove = random(itm.items);
      itm.items.splice(itm.items.indexOf(remove), 1);
    }
  }
  mutate_addItem(data, itm) {
    if (itm.items.length < CONFIG.MAX_ITEMS) {
      itm.items.push(Model.getNewShape(itm.width, itm.height, itm.mode));
    }
  }
  mutate_changeItem(data, itm) {
    let i = Math.floor(random(itm.items.length));
      itm.items[i] = Model.getNewShape(itm.width, itm.height, itm.mode);
  }
  mutate_switchItems(data, itm) {
    let a = random(itm.items);
    let b = itm.items[itm.items.indexOf(a) - 1];
    let c = itm.items[itm.items.indexOf(a) + 1];
    let d = random([b, c]);
    if (d) {
      let idxA = itm.items.indexOf(a);
      let idxB = itm.items.indexOf(d);
      itm.items[idxA] = d;
      itm.items[idxB] = a;
    }
  }
  mutate_generateRandomImage(data, itm) {
    itm = GeneticShape.generateRandomImage(
      CONFIG.MIN_ITEMS,
      CONFIG.MAX_ITEMS,
      data.imgCible.width,
      data.imgCible.height
    );
  }
  mutate_moveItemPointX(data, itm) {
     let m = random(itm.items);
     m = random(m.points);
     m.x = Math.floor(Math.max(Math.min(m.x + random(-50, 50), itm.width), 0));
  }
  mutate_moveItemPointY(data, itm) {
     let m = random(itm.items);
     m = random(m.points);
     m.y = Math.floor(Math.max(Math.min(m.y + random(-50, 50), itm.height), 0));
  }
  mutate_changeItemColor(data, itm) {
    let m = random(itm.items);
    m.color = {
      a: Math.floor(random(255)),
      r: Math.floor(random(255)),
      g: Math.floor(random(255)),
      b: Math.floor(random(255))
    };
  }
  mutate_changeItemColorAlpha(data, itm) {
    let m = random(itm.items);
    m.color.a = random(255);
  }

  static generateRandomImage(minItems, maxItems, width, height) {
    let nItems = Math.floor(random(minItems, maxItems));
    return new Model(width, height, nItems, CONFIG.MODE);
  }
}
