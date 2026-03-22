// --- DOM Elements ---
const elements = {
    output: document.getElementById('passwordOutput'),
    lengthSlider: document.getElementById('lengthSlider'),
    lengthVal: document.getElementById('lengthValue'),
    uppercase: document.getElementById('includeUppercase'),
    lowercase: document.getElementById('includeLowercase'),
    numbers: document.getElementById('includeNumbers'),
    symbols: document.getElementById('includeSymbols'),
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    strengthText: document.getElementById('strengthText'),
    strengthBars: document.getElementById('strengthBars'),
    toast: document.getElementById('toast')
};

// --- Character Sets ---
const CHAR_SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// --- State Management ---
let config = {
    length: 16,
    upper: true,
    lower: true,
    number: true,
    symbol: true
};

// --- Core Functions ---

// 1. CSPRNG Random Number (The Security Core)
function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

// 2. Password Generation
function generatePassword() {
    let charPool = '';
    if (config.upper) charPool += CHAR_SETS.upper;
    if (config.lower) charPool += CHAR_SETS.lower;
    if (config.number) charPool += CHAR_SETS.number;
    if (config.symbol) charPool += CHAR_SETS.symbol;

    if (charPool === '') {
        elements.output.value = "Select at least one character option!";
        resetStrength();
        return;
    }

    let password = '';
    const poolLength = charPool.length;

    for (let i = 0; i < config.length; i++) {
        const randomIndex = getSecureRandomInt(poolLength);
        password += charPool[randomIndex];
    }

    elements.output.value = password;
    calculateStrength(charPool.length, config.length);
}

// 3. Entropy Calculation (Strength Meter)
function calculateStrength(poolSize, length) {
    const entropy = length * Math.log2(poolSize);
    
    elements.strengthBars.classList.remove('weak', 'good', 'strong', 'very-strong');
    
    let label = '';
    let className = '';

    if (entropy < 40) {
        label = 'Weak';
        className = 'weak';
    } else if (entropy < 70) {
        label = 'Good';
        className = 'good';
    } else if (entropy < 100) {
        label = 'Strong';
        className = 'strong';
    } else {
        label = 'Very Strong';
        className = 'very-strong';
    }

    elements.strengthText.textContent = label;
    elements.strengthBars.classList.add(className);
}

function resetStrength() {
    elements.strengthBars.classList.remove('weak', 'good', 'strong', 'very-strong');
    elements.strengthText.textContent = '---';
}

// 4. Copy to Clipboard
async function copyToClipboard() {
    const text = elements.output.value;
    if (!text || text.includes('Select at least')) return;

    try {
        await navigator.clipboard.writeText(text);
        showToast("Password copied to clipboard!");
    } catch (err) {
        console.error('Failed to copy!', err);
        showToast("Failed to copy password", true);
    }
}

function showToast(message, isWarning = false) {
    elements.toast.textContent = message;
    
    if (isWarning) {
        elements.toast.classList.add('warning');
    } else {
        elements.toast.classList.remove('warning');
    }

    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2000);
}

// --- Event Listeners ---

elements.lengthSlider.addEventListener('input', (e) => {
    config.length = parseInt(e.target.value);
    elements.lengthVal.textContent = config.length;
    generatePassword();
});

const checkboxMap = {
    'uppercase': 'upper',
    'lowercase': 'lower',
    'numbers': 'number',
    'symbols': 'symbol'
};

Object.keys(checkboxMap).forEach(elementKey => {
    const configKey = checkboxMap[elementKey];
    const el = elements[elementKey];

    if (el) {
        el.addEventListener('change', (e) => {
            const checkedCount = Object.keys(checkboxMap).reduce((count, key) => {
                return count + (elements[key].checked ? 1 : 0);
            }, 0);

            if (checkedCount === 0) {
                e.preventDefault();
                e.target.checked = true;
                showToast("At least one option must be selected!", true);
                return;
            }

            config[configKey] = e.target.checked;
            generatePassword();
        });
    }
});

elements.generateBtn.addEventListener('click', generatePassword);
elements.copyBtn.addEventListener('click', copyToClipboard);

// Initial Generate on Load
generatePassword();