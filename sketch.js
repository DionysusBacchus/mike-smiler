let midi; // Store the loaded MIDI object
let fileInput;

let show = false;
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

function setup() {
  createCanvas(windowWidth, windowHeight);

  rectMode(CENTER);

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
  // note range 48-72

  const [command, note, velocity] = event.data;

    switch (command) {
      case 248:
      case 254:
        return;
      
      case 176:
        case 177:
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
      case 145:
          if (velocity > 0) {
            notes.push(new Note(note, velocity));
          } else {
            removeNote(note);
          }
          break;
      case 128: // Note Off
      case 129:
          removeNote(note);
          break;
      default:
          console.log(`Command: ${command} Note: ${note} Velocity: ${velocity}`);
    }
}
let tick = 0;
let nn = [];
let end;
let sus = [];
function playFromFile(){
  if(!midi || !show) {
    help();
    return;
  }
  
  if (tick > end){
    show = false;
    tick = 0;
    notes.forEach(n => n.makeSilent());
  }
  push()
  fill(30, 50, 50);
  //console.log(tick)
  for (let i = 0; i < nn.length; i++) {
    const note = nn[i];
    if (tick <= note.ticks + note.durationTicks && tick >= note.ticks){
      //console.log(note.ticks)
      const there = notes.find(n => n.id === i);
      if (!there){
        notes.push(new Note(note.midi, note.velocity*128, i));
      }
      
    }
    if (tick > note.ticks + note.durationTicks){
      removeNote(i);
      //nn.splice(i, 1);
    }
    // todo calculate persise factor
    tick+=0.025;
  }
  if(sus && sus[0] && tick >= sus[0].ticks){
    sustain = sus[0].value === 0? false : true;
    //console.log(sus[0].ticks)
    sus.shift()
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
    let track = midi.tracks[0];
    end = track.endOfTrackTicks;
    nn = track.notes;
    sus = JSON.parse(JSON.stringify( track.controlChanges))["64"]
    console.log(sus)
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