const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');
const pauseBtn = document.getElementById('pauseBtn');
const intervalInput = document.querySelector('#intervalinput');
let current = 0;
let paused = false;
let interval = null;
let intervalTime = 5000;

function startSlider() {
    interval = setInterval(() => {
    if (!paused) nextSlide();
    }, intervalTime);
}

function stopSlider() {
    clearInterval(interval);
}

function resetSliderTimer() {
    stopSlider();
    startSlider();
}

slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.addEventListener('click', () => {
    goToSlide(i);
    resetSliderTimer();
    });
    dotsContainer.appendChild(dot);
});

function updateDots() {
    dotsContainer.querySelectorAll('button').forEach((btn, i) => {
    btn.classList.toggle('active', i === current);
    });
}

function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    current = index;
    updateDots();
}

function nextSlide() {
    showSlide((current + 1) % slides.length);
}

function prevSlide() {
    showSlide((current - 1 + slides.length) % slides.length);
}

function goToSlide(i) {
    showSlide(i);
}

document.getElementById('next').onclick = () => {
    nextSlide();
    resetSliderTimer();
};

document.getElementById('prev').onclick = () => {
    prevSlide();
    resetSliderTimer();
};

pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Odtwarzaj' : 'Pauza';
};

document.querySelectorAll('.slide img, .slide video').forEach(el => {
    el.style.cursor = 'zoom-in';
    el.onclick = () => {
    paused = true;
    pauseBtn.textContent = '▶️';
    stopSlider();
    const lb = document.getElementById('lightbox');
    lb.innerHTML = '';
    const clone = el.cloneNode(true);
    clone.removeAttribute('class');
    if (clone.tagName === 'VIDEO') clone.setAttribute('controls', '');
    lb.appendChild(clone);
    lb.style.display = 'flex';
    };
});

document.getElementById('lightbox').onclick = () => {
    document.getElementById('lightbox').style.display = 'none';
};

intervalInput.addEventListener('change', (input) => {
    const value = parseInt(input.target.value, 10);
    if (!isNaN(value) && value > 0) {
        intervalTime = value * 1000;
        resetSliderTimer();
    } else {
        alert('Proszę wprowadzić prawidłową liczbę sekund.');
    }
});

updateDots();
startSlider();