let midi; // Store the loaded MIDI object
let fileInput;

function setup() {
  createCanvas(400, 400);
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(0);

  text('Drop a MIDI file here', width / 2, height / 2);

  // Create file input element for MIDI files
  fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);
}

let show = false;
let start;

function draw() {
  //console.log(frameCount)
  if (midi) {
    background(220);
    if(!show){
      //console.log(midi)
      text('MIDI File Loaded! Press "s" to show visualisation', width / 2, height / 2);
    }
    else{
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
    }

    // Visualize MIDI data (example: notes from first track)
    
  }
}
let tmp =0;

function keyPressed() {
  if (key === 's') {
    show = !show;
    start = 0;
    tmp = millis()
  }
}

const defaultBPMS = 120;
const defaultPPQ = 480;

const factor = 30000/(defaultBPMS * defaultPPQ);

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
