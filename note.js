const fadeCoef = 0.5;

const speedSensitivity = -0.05;
const speedOffset = 1;

const sizeSensitivity = 0.1;
const sizeOffset = 1;

const positionSensitivity = 1.5;
const positionOffset = 2;

const sizeMultiplier = 10;

//  todo fade in ??
// todo white background for tisk

class Note {
  static interval = 12;
    constructor(note, velocity, id ) {
      this.note = (note - 28)+4;
      this.id = id?? note;
      
      this.vel = createVector(random(-1, 1), random(-1, 1));

      this.pos = createVector(width/2, height/2);
      const offset = -(this.note*positionSensitivity)+positionOffset;
      this.pos.add(p5.Vector.setMag(this.vel, offset))

      this.speed = speedOffset + speedSensitivity * velocity;
      this.size = sizeOffset + sizeSensitivity * velocity;
  
  
      this.vel.setMag(this.speed);
      this.silent = false;
      this.fade = -1;
  
      this.hue = this.calculateHue(this.note);
      this.value = map(this.note%Note.interval, 0, Note.interval-1, 50, 80);
    }

    calculateHue(note){
      const x = map(note, 4, 79, 0, 214);
      return (Math.round(x)+223)%360;
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
        this.size = max(this.size - 0.01, 0);
        if (this.size <= 0){
          this.silent = true;
        }
      }
    }
  
    draw() {
      push();
      let c = color(this.hue, 80, this.value);
      if (this.silent){
        c.setAlpha(0.01);
        buffer.fill(c);
        this.drawShape(buffer)
        return;
      }
      if (this.isFading()) {
        c.setAlpha(this.fade/100);
      }
      fill(c);
      this.drawShape()
      pop();
    }

    drawShape(buffer){
      if (this.note > 36){
        const circle_fun = buffer? buffer.circle : circle;
        circle_fun(this.pos.x, this.pos.y, this.trueSize());
      }
      else{
        const rect_fun = buffer? buffer.rect : rect;
        rect_fun(this.pos.x, this.pos.y, this.trueSize(), this.trueSize(), 10);
      }
    }

    trueSize(){
      return sizeMultiplier * this.size;
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