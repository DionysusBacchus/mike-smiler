const fadeCoef = 1;

const speedSensitivity = -0.05;
const speedOffset = 1;

const sizeSensitivity = 0.1;
const sizeOffset = 1;

const positionSensitivity = 1.5;
const positionOffset = 2;

class Note {
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
  
      const interval = 12;
        const octave = Math.floor(this.note/interval);
        // 5 == 50
        // 4 == 0
        // 3 == 330
        // 2 == 280
        // 1 == 230
        // 0 == 180
        //230-250
        switch(octave){
            case 0:
                console.log(this.note)
                this.hue =  map(this.note, 4, 11, 230, 240)
                break;
            case 1:
                this.hue =  250;
                break;
            case 2:
                this.hue =  280;
                break;
            case 3:
                this.hue =  330;
                break;
            case 4:
                this.hue =  0;
                break;
            case 6:
            case 5:
                this.hue =  map(this.note, 48, 67, 40, 55)
                break;
            default:
                this.hue =  map(Math.round(this.note/interval), 0, 5, 330,0);
                break;
        }
        console.log(this.note)
        console.log(octave)
        this.value = map(this.note%interval, 0, interval-1, 20, 80);
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
      if (this.note > 36){
        this.drawSquare()
      }
      else{
        this.drawCircle()
      }
      pop();
    }
  
    drawCircle(){
      circle(this.pos.x, this.pos.y, 10 * this.size);
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