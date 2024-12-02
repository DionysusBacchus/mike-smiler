const fadeCoef = 1;

const speedSensitivity = -0.05;
const speedOffset = 1;

const sizeSensitivity = 0.1;
const sizeOffset = 1;

class Note {
    constructor(note, velocity, id ) {
      console.log(note)
      this.note = (note - 28);
      this.id = id?? note;
      this.pos = createVector(width/2, height/2);
      this.vel = createVector(random(-1, 1), random(-1, 1));
  
  
      this.speed = speedOffset + speedSensitivity * velocity;
      this.size = sizeOffset + sizeSensitivity * velocity;
  
  
      this.vel.setMag(this.speed);
      this.silent = false;
      this.fade = -1;
  
      const interval = 12;
  
      this.hue =  map(Math.round(this.note-2/interval), 0, 6, 0, 360);
      this.value = map(this.note%interval, 0, interval-1, 80, 20);
    }
  
    update() {
      if (this.silent) return;
      this.pos.add(this.vel);
      if (this.isFading() ) {
        this.fade -= fadeCoef;
        if (this.fade <= 0){
          this.silent = true;
        }
      }
      if (sustain){
        this.size = max(this.size - 0.003, 0);
        if (this.size <= 0){
          this.silent = true;
        }
      }
    }
  
    draw() {
      if (this.silent) return;
      push();
      let c = color(this.hue, 80, this.value);
      if (this.isFading()) {
        c.setAlpha(this.fade/100);
      }
      fill(c);
      console.log(this.note)
      if (this.note > 36){
        this.drawSquare()
      }
      else{
        this.drawCircle()
      }
      pop();
    }
  
    drawCircle(){
      //circle(this.pos.x, this.pos.y, 10 * this.size);
    }
  
    drawSquare(){
      square(this.pos.x, this.pos.y, 10 * this.size);
    }
  
    makeSilent() {
      // todo on sustain off -> on all notes regain full alpha
      if (sustain) return;
      this.fade = 100;
    }
  
    isFading() {
      return this.fade > 0;
    }
  }