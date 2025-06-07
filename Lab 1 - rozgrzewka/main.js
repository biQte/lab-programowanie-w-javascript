// notatnik z zajęć
const liczba1 = document.querySelector('#liczba1');
const liczba2 = document.querySelector('#liczba2');
const liczba3 = document.querySelector('#liczba3');
const inputsContainer = document.querySelector('.inputs');
const wynikiPojemnik = document.querySelector('#wyniki');
const addInputButton = document.querySelector('#addInput');

liczba1.addEventListener('input', () => {
    if (isNaN(liczba1.value)) {
        liczba1.value = '';
        return;
    }

    handleCalculations();
});

liczba2.addEventListener('input', () => {
    if (isNaN(liczba2.value)) {
        liczba2.value = '';
        return;
    }

    handleCalculations();
});

liczba3.addEventListener('input', () => {
    if (isNaN(liczba3.value)) {
        liczba3.value = '';
        return;
    }

    handleCalculations();
});

const handleCalculations = () => {
    const existingInputs = document.querySelectorAll('.numberinput');
    const isSomeEmpty = Array.from(existingInputs).find(input => {
        return input.value.trim() ===  "";
    });

    if(isSomeEmpty){
        return wynikiPojemnik.innerHTML = `
            <p>Proszę wprowadzić wszystkie liczby.</p>
        `;
    }

    const suma = Array.from(existingInputs).reduce((acc, input) => acc + parseFloat(input.value || 0), 0);
    const srednia = suma / existingInputs.length;
    const max = Math.max(...Array.from(existingInputs).map(input => parseFloat(input.value || -Infinity)));
    const min = Math.min(...Array.from(existingInputs).map(input => parseFloat(input.value || Infinity)));

    wynikiPojemnik.innerHTML = `
        <p>Suma: ${suma}</p>
        <p>Średnia: ${srednia}</p>
        <p>Maksimum: ${max}</p>
        <p>Minimum: ${min}</p>
    `;
}

addInputButton.addEventListener('click', () => {
    addInput();
});

const addInput = () => {
    const inputWrapper = document.createElement('div');
    const deleteInputButton = document.createElement('button');
    deleteInputButton.textContent = 'Usuń';
    const existingInputs = document.querySelectorAll('.numberinput');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'numberinput';
    newInput.id = `liczba${existingInputs.length + 1}`;
    newInput.addEventListener('input', () => {
        if (isNaN(newInput.value)) {
            newInput.value = '';
            return;
        }
        handleCalculations();
    });
    deleteInputButton.addEventListener('click', () => {
        inputWrapper.remove();
        handleCalculations();
    });
    inputWrapper.appendChild(newInput);
    inputWrapper.appendChild(deleteInputButton);
    inputsContainer.appendChild(inputWrapper);
    handleCalculations();
    newInput.focus();
}
