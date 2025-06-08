const sounds = {
    'a': document.querySelector('#s1'),
    's': document.querySelector('#s2'),
    'd': document.querySelector('#s3'),
};

let channels = [];
let isMetronomeOn = false;
let metronomeInterval;
const metronomeSound = new Audio('./sounds/hihat.wav');

function playSound(key) {
    const sound = sounds[key];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play();

    const time = Date.now();
    channels.forEach(channel => {
    if (channel.recording) {
        channel.recorded.push({ key, time: time - channel.recordingStart });
    }
    });
}

function addChannel() {
    const id = channels.length;
    const div = document.createElement('div');
    div.className = 'channel';
    div.innerHTML = `
    <h3>Kanał ${id + 1}</h3>
    <button onclick="startRecording(${id})">Nagraj</button>
    <button onclick="playChannel(${id})">Odtwórz</button>
    <button onclick="deleteChannel(${id})">Usuń</button>
    <label><input type="checkbox" onchange="toggleLoop(${id}, this.checked)">Pętla</label>
    `;
    document.getElementById('channels').appendChild(div);
    channels.push({ recorded: [], recording: false, loop: false });
}

function deleteChannel(id) {
    channels[id] = null;
    document.querySelectorAll('.channel')[id].remove();
}

function startRecording(id) {
    channels[id].recording = true;
    channels[id].recorded = [];
    channels[id].recordingStart = Date.now();
}

function playChannel(id) {
    const channel = channels[id];
    if (!channel || !channel.recorded.length) return;
    const start = Date.now();

    channel.recorded.forEach(({ key, time }) => {
    setTimeout(() => {
        if (channel) playSound(key);
    }, time);
    });

    if (channel.loop) {
    const totalTime = Math.max(...channel.recorded.map(r => r.time)) + 100;
    setTimeout(() => playChannel(id), totalTime);
    }
}

function toggleLoop(id, value) {
    if (channels[id]) channels[id].loop = value;
}

document.addEventListener('keypress', event => playSound(event.key));

document.getElementById('metronomeToggle').addEventListener('change', e => {
    const bpm = parseInt(document.getElementById('bpm').value);
    if (e.target.checked) {
    isMetronomeOn = true;
    metronomeInterval = setInterval(() => {
        metronomeSound.currentTime = 0;
        metronomeSound.play();
    }, 60000 / bpm);
    } else {
    isMetronomeOn = false;
    clearInterval(metronomeInterval);
    }
});