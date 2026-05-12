// ===== CAR SPECIFICATIONS DATABASE =====
// This object stores different car types and their base specifications
const carTypes = {
    sedan: {
        name: 'Sedan',
        baseWeight: 1500,
        maxPower: 200,
        acceleration: 10
    },
    suv: {
        name: 'SUV',
        baseWeight: 2000,
        maxPower: 250,
        acceleration: 8
    },
    sports: {
        name: 'Sports Car',
        baseWeight: 1200,
        maxPower: 300,
        acceleration: 12
    }
};

// ===== SIMULATION DATA (Will store current values) =====
let simulationData = {
    carType: 'sedan',
    tankSize: 60,
    weight: 1500,
    motorPower: 150,
    range: 0,
    topSpeed: 0,
    efficiency: 0,
    co2Savings: 0,
    acceleration: 0
};

// ===== SLIDER UPDATE FUNCTIONS =====
// These functions update the display when you move the sliders

document.getElementById('tankSize')?.addEventListener('input', function() {
    document.getElementById('tankValue').textContent = this.value + ' kg';
    simulationData.tankSize = parseInt(this.value);
    updatePreview();
});

document.getElementById('weight')?.addEventListener('input', function() {
    document.getElementById('weightValue').textContent = this.value + ' kg';
    simulationData.weight = parseInt(this.value);
    updatePreview();
});

document.getElementById('motorPower')?.addEventListener('input', function() {
    document.getElementById('motorValue').textContent = this.value + ' kW';
    simulationData.motorPower = parseInt(this.value);
    updatePreview();
});

document.getElementById('carType')?.addEventListener('change', function() {
    simulationData.carType = this.value;
    const carType = carTypes[this.value];
    
    // Auto-adjust weight based on car type
    document.getElementById('weight').value = carType.baseWeight;
    document.getElementById('weightValue').textContent = carType.baseWeight + ' kg';
    simulationData.weight = carType.baseWeight;
    
    updatePreview();
});

// ===== CALCULATION FUNCTIONS =====
// These are the math functions that simulate how the car performs

// Function to calculate range (how far the car can drive)
function calculateRange(tankSize, efficiency) {
    // Formula: How many km per kg of hydrogen × tank size
    return tankSize * efficiency;
}

// Function to calculate efficiency based on car specs
function calculateEfficiency(motorPower, weight) {
    // Heavier cars are less efficient
    // Lighter cars with same power are more efficient
    // Base efficiency is 8 km per kg
    const baseEfficiency = 8;
    const powerToWeightRatio = motorPower / weight;
    const efficiency = baseEfficiency * (powerToWeightRatio / 0.1); // normalize to sedan ratio
    return Math.max(5, Math.min(10, efficiency)); // keep between 5-10
}

// Function to calculate top speed
function calculateTopSpeed(motorPower, weight) {
    // More power = faster
    // Heavier car = slower
    // Base formula: power divided by weight × 100
    const carType = carTypes[simulationData.carType];
    const baseSpeed = 100; // sedan base speed
    const speedBoost = (motorPower / carType.maxPower) * 80; // add power bonus
    const weightPenalty = (weight / 1500) * 30; // heavier = slower
    return Math.round(baseSpeed + speedBoost - weightPenalty);
}

// Function to calculate acceleration (0-100 km/h time)
function calculateAcceleration(motorPower, weight) {
    // More power = faster acceleration
    // Heavier = slower acceleration
    const carType = carTypes[simulationData.carType];
    const baseAccel = carType.acceleration; // each car type has base accel
    const powerBoost = (motorPower / carType.maxPower) * 3; // power helps
    const weightPenalty = (weight - carType.baseWeight) / 500; // weight hurts
    return Math.max(5, baseAccel - powerBoost + weightPenalty).toFixed(1);
}

// Function to calculate CO2 savings
// (comparing hydrogen car vs petrol car over 1 year)
function calculateCO2Savings(range) {
    // Average car drives 15,000 km per year
    // Petrol car produces about 0.23 kg CO2 per km
    // Hydrogen car produces 0 kg CO2
    
    const yearlyKm = 15000;
    const co2PerKmPetrol = 0.23; // kg of CO2 per km in petrol car
    
    const yearlyTrips = yearlyKm / range; // how many times you fill up
    const totalCO2Saved = yearlyKm * co2PerKmPetrol; // grams of CO2 saved
    
    return (totalCO2Saved / 1000).toFixed(2); // convert to tons
}

// ===== UPDATE PREVIEW FUNCTION =====
// This updates the quick preview stats when you change sliders
function updatePreview() {
    const efficiency = calculateEfficiency(
        simulationData.motorPower,
        simulationData.weight
    );
    
    const range = calculateRange(simulationData.tankSize, efficiency);
    const topSpeed = calculateTopSpeed(simulationData.motorPower, simulationData.weight);
    
    // Update preview display
    document.getElementById('previewRange').textContent = Math.round(range) + ' km';
    document.getElementById('previewSpeed').textContent = topSpeed + ' km/h';
    document.getElementById('previewEfficiency').textContent = efficiency.toFixed(1) + ' km/kg';
}

// ===== RUN SIMULATION FUNCTION =====
// This is called when user clicks "Run Simulation" button
function runSimulation() {
    // Calculate all the values
    const efficiency = calculateEfficiency(
        simulationData.motorPower,
        simulationData.weight
    );
    
    simulationData.efficiency = efficiency;
    simulationData.range = calculateRange(simulationData.tankSize, efficiency);
    simulationData.topSpeed = calculateTopSpeed(simulationData.motorPower, simulationData.weight);
    simulationData.acceleration = calculateAcceleration(simulationData.motorPower, simulationData.weight);
    simulationData.co2Savings = calculateCO2Savings(simulationData.range);
    
    // Switch to results page
    showPage('results');
    
    // Animate the results
    animateResults();
}

// ===== ANIMATION FUNCTIONS =====
// These functions create smooth animations of the gauge needles and bars

function animateResults() {
    // Animate speedometer
    animateSpeedometer();
    
    // Animate range bar
    setTimeout(() => animateRangeBar(), 300);
    
    // Animate efficiency bar
    setTimeout(() => animateEfficiencyBar(), 500);
    
    // Animate CO2 savings bar
    setTimeout(() => animateCO2Bar(), 700);
    
    // Update detailed stats
    updateDetailedStats();
}

function animateSpeedometer() {
    const maxSpeed = 250; // max possible speed
    const speedPercent = (simulationData.topSpeed / maxSpeed) * 100;
    const dashLength = 300; // circumference of gauge
    const dashOffset = dashLength - (speedPercent / 100) * dashLength;
    
    const gaugeElement = document.getElementById('speedGauge');
    const needleElement = document.getElementById('speedNeedle');
    const speedText = document.getElementById('speedText');
    
    if (gaugeElement) {
        gaugeElement.style.strokeDashoffset = dashOffset;
    }
    
    if (needleElement) {
        // Rotate needle from 0 to about 180 degrees
        const rotation = (speedPercent / 100) * 180;
        needleElement.style.transform = `rotate(${rotation}deg)`;
    }
    
    if (speedText) {
        // Animate the number counting up
        animateNumber(speedText, 0, simulationData.topSpeed, 1000);
        speedText.textContent = simulationData.topSpeed + ' km/h';
    }
}

function animateRangeBar() {
    const maxRange = 800; // max possible range
    const rangePercent = (simulationData.range / maxRange) * 100;
    const rangeFill = document.getElementById('rangeFill');
    const rangeText = document.getElementById('rangeText');
    
    if (rangeFill) {
        rangeFill.style.width = rangePercent + '%';
    }
    
    if (rangeText) {
        rangeText.textContent = Math.round(simulationData.range) + ' km';
    }
}

function animateEfficiencyBar() {
    const maxEfficiency = 10; // max efficiency
    const efficiencyPercent = (simulationData.efficiency / maxEfficiency) * 100;
    const efficiencyFill = document.getElementById('efficiencyFill');
    const efficiencyText = document.getElementById('efficiencyText');
    
    if (efficiencyFill) {
        efficiencyFill.style.width = efficiencyPercent + '%';
    }
    
    if (efficiencyText) {
        efficiencyText.textContent = simulationData.efficiency.toFixed(1) + ' km/kg';
    }
}

function animateCO2Bar() {
    const maxSavings = 10; // max co2 savings
    const savingsPercent = (simulationData.co2Savings / maxSavings) * 100;
    const savingsFill = document.getElementById('savingsFill');
    const savingsText = document.getElementById('savingsText');
    
    if (savingsFill) {
        savingsFill.style.width = Math.min(savingsPercent, 100) + '%';
    }
    
    if (savingsText) {
        savingsText.textContent = simulationData.co2Savings + ' tons';
    }
}

// Helper function to animate numbers counting up
function animateNumber(element, start, end, duration) {
    let current = start;
    const increment = (end - start) / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        // Only update if element exists
        if (element) {
            element.textContent = Math.round(current) + ' km/h';
        }
    }, 16);
}

// ===== UPDATE DETAILED STATS =====
function updateDetailedStats() {
    const carType = carTypes[simulationData.carType];
    
    document.getElementById('statCarType').textContent = carType.name;
    document.getElementById('statTankSize').textContent = simulationData.tankSize + ' kg';
    document.getElementById('statWeight').textContent = simulationData.weight + ' kg';
    document.getElementById('statMotorPower').textContent = simulationData.motorPower + ' kW';
    document.getElementById('statAccel').textContent = simulationData.acceleration + ' seconds';
}

// ===== PAGE NAVIGATION =====
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    if (pageName === 'results') {
        document.getElementById('results-page').classList.add('active');
    } else if (pageName === 'simulator') {
        document.getElementById('simulator-page').classList.add('active');
    } else {
        document.getElementById('home-page').classList.add('active');
    }
}

// ===== BUTTON CLICK HANDLERS =====
document.getElementById('runSimBtn')?.addEventListener('click', runSimulation);

document.getElementById('backBtn')?.addEventListener('click', function() {
    showPage('simulator');
});

// ===== HAMBURGER MENU =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// ===== NAVIGATION LINKS =====
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Close hamburger menu
        if (navMenu) navMenu.classList.remove('active');
    });
});

// ===== INITIAL PAGE LOAD =====
window.addEventListener('load', function() {
    // Show home page by default if we're on index.html
    if (document.getElementById('home-page')) {
        showPage('home');
    }
    // Show simulator page if we're on simulator.html
    else if (document.getElementById('simulator-page')) {
        showPage('simulator');
        updatePreview();
    }
});

// ===== CONSOLE LOG FOR DEBUGGING =====
console.log('HydroDrive simulator loaded successfully!');