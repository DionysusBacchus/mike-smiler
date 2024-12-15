let midi; // Store the loaded MIDI object
let fileInput;

let show = false;
let toggleHelp = false;

let liveText;
const liveError = '\nCan\'t start the live stream mode!';

let buffer;

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

function resetBuffer(){
  buffer = createGraphics(windowWidth, windowHeight);
  buffer.noStroke();
  buffer.colorMode(HSL);
  buffer.rectMode(CENTER);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  colorMode(HSL)
  rectMode(CENTER);

  resetBuffer();

  lineGap = height / 5;
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(100,100,100);

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
  background(0);
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
  for (let i = 0; i < nn.length; i++) {
    const note = nn[i];
    if (tick <= note.ticks + note.durationTicks && tick >= note.ticks){
      const there = notes.find(n => n.id === i);
      if (!there){
        notes.push(new Note(note.midi, note.velocity*128, i));
      }
      
    }
    if (tick > note.ticks + note.durationTicks){
      removeNote(i);
    }
    // todo calculate persise factor
    tick+=0.025;
  }
  if(sus && sus[0] && tick >= sus[0].ticks){
    sustain = sus[0].value === 0? false : true;
    sus.shift()
  }
  pop()
}

function draw() {
  image(buffer, 0, 0);
  background(0,0,0, 0.1);
  if(toggleHelp){
    help();
  }
  text("H", width-10, 15);
  if(show){
    playFromFile();
  }
  notes = notes.filter(n => !n.silent);
  for (let note of notes) {
    note.update();
    note.draw();
  }
}
let tmp =0;

function keyPressed() {
  if (key === 's') {
    show = !show;
    notes = [];
    background(0);
    resetBuffer();
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
    resetBuffer();
    background(0);
  }
  if( key === 'd' || key === 'D'){
    saveCanvas();
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