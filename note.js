const fadeCoef = 0.5;

const speedSensitivity = -0.05;
const speedOffset = 1;

const sizeSensitivity = 0.1;
const sizeOffset = 1;

const positionSensitivity = 1.5;
const positionOffset = 2;

class Note {
  static interval = 12;
    constructor(note, velocity, id ) {
      console.log(note)
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
      const octave = Math.floor(note/Note.interval);
      console.log(octave)
        // 5 == 50
        // 4 == 0
        // 3 == 330
        // 2 == 280
        // 1 == 230
        // 0 == 180
        //230-250
        switch(octave){
            case 0:
                console.log(note)
                return map(note, 4, 11, 230, 240)
            case 1:
                return 250;
            case 2:
                return 280;
            case 3:
                return 330;
            case 4:
                return 0;
            case 6:
            case 5:
                return map(note, 48, 67, 40, 55)
            default:
                return map(Math.round(note/Note.interval), 0, 5, 330,0);
        }
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
      //if (this.silent) return;
      push();
      let c = color(this.hue, 80, this.value);
      if (this.isFading()) {
        c.setAlpha(this.fade/100);
      }
      if (this.silent){
        c.setAlpha(0.01);
      }
      fill(c);
      if (this.note > 36){
        this.drawCircle()
      }
      else{
        this.drawSquare()
      }
      pop();
    }
  
    drawCircle(){
      circle(this.pos.x, this.pos.y, 10 * this.size);
    }
  
    drawSquare(){
      rect(this.pos.x, this.pos.y, 10 * this.size, 10 * this.size, 10);
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