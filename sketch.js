let midi; // Store the loaded MIDI object
let fileInput;

let show = false;
let start;
let toggleHelp = false;

let liveText;
const liveError = '\nCan\'t start the live stream mode!';

function help(){
  text(liveText, width / 2, lineGap);

  if(!midi){
    text('No MIDI File Loaded!', width / 2, lineGap * 3);
  }
  if(midi && !show){
    text('MIDI File Loaded!\n Press "s" to show visualisation', width / 2, lineGap * 3);
  }
  text('Press "f" to upload a MIDI file', width / 2, lineGap * 4);
}

const fadeCoef = 1;

// const speedCoef = 

const speedSensitivity = -0.1;
const speedOffset = 1;

const sizeSensitivity = 0.1;
const sizeOffset = 1;

class Note {
  constructor(note, velocity ) {
    this.id = note;
    this.pos = createVector(width/2, height/2);
    this.vel = createVector(random(-1, 1), random(-1, 1));


    this.speed = speedOffset + speedSensitivity * velocity;
    this.size = sizeOffset + sizeSensitivity * velocity;


    this.vel.setMag(this.speed);
    this.silent = false;
    this.fade = -1;

    const n = note - 28;

    const interval = 12;

    this.hue = map(n%interval, 0, interval-1, 200, 360);
    this.value = map(Math.round(n/12), 0, 6, 20, 80);
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
    if (this.silent) return;
    push();
    let c = color(this.hue, 80, this.value);
    if (this.isFading()) {
      c.setAlpha(this.fade/100);
    }
    fill(c);
    circle(this.pos.x, this.pos.y, 10 * this.size);
    pop();
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

function setup() {
  createCanvas(windowWidth, windowHeight);

  lineGap = height / 5;
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(100,100,100);
  noStroke();
  colorMode(HSL)

  speedRange = createVector(1, 5);
  sizeRange = createVector(1, 8);
  notes = [];

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: true })
      .then(onMIDISuccess, onMIDIFailure);
  } else {
    liveText = 'Web MIDI API not supported.'+liveError;
  }
  fileInput = createFileInput(handleFile);
  fileInput.hide();
}

function onMIDISuccess(midi) {
  midiAccess = midi;

  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = handleMIDIMessage;
  }
  liveText = 'MIDI Device Connected!';
}

function onMIDIFailure(error) {
  console.error('MIDI Access Error:', error);
  liveText = 'Failed to access MIDI devices.'+liveError;
}

let sustain = false;
function removeNote(id){
  n = notes.find(n => {
    return n.id === id && !n.isFading() && !n.silent;
  });
  if(n){
    n.makeSilent();
  }
}

function handleMIDIMessage(event) {

  // note range 28-103

  const [command, note, velocity] = event.data;

    switch (command) {
      case 248:
      case 254:
        return;
      
      case 176:
        if (velocity === 0) {
          sustain = false;
          notes.forEach(n => n.makeSilent());
          return;
        }
        if (note === 64) {
          sustain = true;
        }
        break;
      case 144: // Note On
          if (velocity > 0) {
            notes.push(new Note(note, velocity));
            //console.log(`Note On: ${note} Velocity: ${velocity}`);
          } else {
            removeNote(note);
            //console.log(`Note Off: ${note}`);
          }
          break;
      case 128: // Note Off
          removeNote(note);
          //console.log(`Note Off: ${note}`);
          break;
      default:
          console.log(`Command: ${command} Note: ${note} Velocity: ${velocity}`);
    }
  

  // Example: Draw a circle based on velocity (data2)
  // let x = random(width);
  // let y = random(height);
  // let size = map(data, 0, 127, 10, 100);

  // ellipse(x, y, size);
}

function playFromFile(){
  if(!midi || !show) {
    help();
    return;
  }
  push()
  background(0,80,0);
  fill(255);
  let track = midi.tracks[0];
  let end = track.endOfTrackTicks;
  if (start > end){
    show = false;
    console.log(millis()-tmp)
  }
  
  let notes = track.notes;
  //text(midi.tracks.length, width / 2, height / 2)
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const tick = start;
    
    if(tick > note.ticks && tick < note.ticks + note.durationTicks){
      console.log(note)
      let x = map(i, 0, notes.length, 0, width);
      let y = map(notes[i].midi, 0, 127, height, 0);
      ellipse(x, y, 10, 10);

    }


    // let dur = (note.durationTicks+note.ticks)*factor;
    // if ((millis() - start)/factor < dur ){
    //   console.log(note.midi)
    // }
    
    start+=factor;
  }
  pop()
}

function draw() {
  background(0,0,0);
  if(toggleHelp){
    help();
  }
  text("H", width-10, 15);
  if(show){
    playFromFile();
  }
  notes = notes.filter(n => !n.silent);
  for (let note of notes) {

    note.draw();
    note.update();
  }
}
let tmp =0;

function keyPressed() {
  if (key === 's') {
    show = !show;
    start = 0;
    tmp = millis()
  }
  if (key === 'f' || key === 'F') {
    fileInput.elt.click();
  }
  if (key === 'h' || key === 'H') {
    toggleHelp = !toggleHelp;
  }
  if (key === 'c' || key === 'C') {
    notes = [];
  }
}

const defaultBPMS = 120;
const defaultPPQ = 480;

const factor = 30000/(defaultBPMS * defaultPPQ);

async function handleFile(file) {
  if (file.type === 'audio/midi' || file.name.endsWith('.mid')) {
    // Use Tone.js MIDI parser to read the file
    const response = await fetch(file.data);
    if (response.status !== 200) {
      throw new Error('Failed to load MIDI file:', response.statusText);
    }
    const data = await response.arrayBuffer();

    midi = new Midi(data); // Parse MIDI file
    console.log(midi); // Inspect the MIDI object
  } else {
    console.log('Please upload a valid MIDI file.');
  }
}

// map midi keys from 35-81
// ticks mean when the note starts
// durationTicks means how long the note lasts 


// Example MIDI track structure
// {
//   "name": "C Major Scale Test",
//   "notes": [
//     {
//       "midi": 60,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 0,
//       "durationTicks": 96
//     },
//     {
//       "midi": 62,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 96,
//       "durationTicks": 96
//     },
//     {
//       "midi": 64,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 192,
//       "durationTicks": 96
//     },
//     {
//       "midi": 65,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 288,
//       "durationTicks": 96
//     },
//     {
//       "midi": 67,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 384,
//       "durationTicks": 96
//     },
//     {
//       "midi": 69,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 480,
//       "durationTicks": 96
//     },
//     {
//       "midi": 71,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 576,
//       "durationTicks": 96
//     },
//     {
//       "midi": 72,
//       "velocity": 1,
//       "noteOffVelocity": 0.5039370078740157,
//       "ticks": 672,
//       "durationTicks": 96
//     }
//   ],
//   "pitchBends": [],
//   "instrument": {
//     "number": 0
//   },
//   "channel": 0,
//   "endOfTrackTicks": 768
// }