const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado Econômico e Ambiental da Fazenda
let farmWallet = 10; 
let carbonBalance = 0; // Balanço acumulado de carbono em kg
let activeVehicleIndex = 0; 
let farmLoopInterval = null;
let activeKeys = {};

// Entidades do Universo
let vehiclesList = [];
let landSectors = [];

// Estruturas de Processamento Integradas
let biocharFactory = { x: 620, y: 20, w: 130, h: 120, storedBiomass: 0, readyBiochar: 0 };
let creditAgency = { x: 620, y: 300, w: 130, h: 120 };

const hamburgerMenu = document.getElementById('hamburger-menu');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarMoneyEl = document.getElementById('sidebar-money');
const gameMoneyEl = document.getElementById('game-money');
const gameCarbonEl = document.getElementById('game-carbon');
const carbonBadge = document.getElementById('carbon-badge');
const currentVehicleTxt = document.getElementById('current-vehicle-txt');
const cargoStatsTxt = document.getElementById('cargo-stats-txt');
const switchVehBtn = document.getElementById('switch-veh-btn');
const sidebarStartBtn = document.getElementById('sidebar-start-btn');
const buyLand3Btn = document.getElementById('buy-land-3');
const buyLand4Btn = document.getElementById('buy-land-4');

// Escutadores de Menus
hamburgerMenu.addEventListener('click', () => sidebar.classList.remove('hidden'));
closeSidebar.addEventListener('click', () => sidebar.classList.add('hidden'));
sidebarStartBtn.addEventListener('click', () => { sidebar.classList.add('hidden'); initFarmSimulator(); });
switchVehBtn.addEventListener('click', () => {
    activeVehicleIndex = (activeVehicleIndex + 1) % vehiclesList.length;
    updateUserInterface();
});

buyLand3Btn.addEventListener('click', () => purchaseSector(3, buyLand3Btn));
buyLand4Btn.addEventListener('click', () => purchaseSector(4, buyLand4Btn));

function initFarmSimulator() {
    farmWallet = 20;
    carbonBalance = 0;
    activeVehicleIndex = 0;
    activeKeys = {};
    
    biocharFactory.storedBiomass = 0;
    biocharFactory.readyBiochar = 0;

    // Frotas com consumo, pegada de carbono ativa e capacidade de transporte
    vehiclesList = [
        { id: 0, nome: "Colheitadeira Vermelha (Soja)", tipo: "harvester_soja", x: 420, y: 180, w: 42, h: 48, speed: 2.5, color: "#ef4444", cargoType: null, cargoAmount: 0, cargoMax: 100, emissionRate: 0.15 },
        { id: 1, nome: "Colheitadeira Amarela (Milho)", tipo: "harvester_milho", x: 480, y: 180, w: 42, h: 48, speed: 2.5, color: "#fbbf24", cargoType: null, cargoAmount: 0, cargoMax: 100, emissionRate: 0.15 },
        { id: 2, nome: "Caminhão de Logística Azul", tipo: "truck", x: 540, y: 180, w: 38, h: 55, speed: 3.5, color: "#3b82f6", cargoType: null, cargoAmount: 0, cargoMax: 250, emissionRate: 0.08 }
    ];

    // Setores com status de enriquecimento orgânico (Biochar)
    landSectors = [
        { id: 1, x: 30, y: 30, w: 160, h: 180, cropType: "milho", label: "Gleba Milho Alfa", harvested: false, regrowthTime: 0, locked: false, hasBiochar: false },
        { id: 2, x: 220, y: 30, w: 160, h: 180, cropType: "soja", label: "Gleba Soja Alfa", harvested: false, regrowthTime: 0, locked: false, hasBiochar: false },
        { id: 3, x: 30, y: 250, w: 160, h: 180, cropType: "milho", label: "Expansão Norte", harvested: false, regrowthTime: 0, locked: true, cost: 30, hasBiochar: false },
        { id: 4, x: 220, y: 250, w: 160, h: 180, cropType: "soja", label: "Expansão Sul", harvested: false, regrowthTime: 0, locked: true, cost: 50, hasBiochar: false }
    ];

    // Resetar botões de compra visualmente
    buyLand3Btn.innerHTML = `Desbloquear Expansão Norte (Milho) <br><strong>Custo: R$ 30</strong>`;
    buyLand3Btn.style.background = "#f59e0b";
    buyLand4Btn.innerHTML = `Desbloquear Expansão Sul (Soja) <br><strong>Custo: R$ 50</strong>`;
    buyLand4Btn.style.background = "#f59e0b";

    window.removeEventListener('keydown', registerKeyDown);
    window.removeEventListener('keyup', registerKeyUp);
    window.addEventListener('keydown', registerKeyDown);
    window.addEventListener('keyup', registerKeyUp);

    if (farmLoopInterval) clearInterval(farmLoopInterval);
    farmLoopInterval = setInterval(renderFarmStep, 1000 / 60);
    updateUserInterface();
}

function registerKeyDown(e) {
    activeKeys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'g') transboardCargo();
    if (e.key.toLowerCase() === 'f') interactWithStructures();
    if (e.key.toLowerCase() === 'e') applyBiocharToField();
}

function registerKeyUp(e) { activeKeys[e.key.toLowerCase()] = false; }

function purchaseSector(id, buttonEl) {
    let sector = landSectors.find(s => s.id === id);
    if (!sector || !sector.locked) return;

    if (farmWallet >= sector.cost) {
        farmWallet -= sector.cost;
        sector.locked = false;
        buttonEl.innerHTML = `${sector.label} <br><strong>[LIBERADO]</strong>`;
        buttonEl.style.background = "#10b981";
        updateUserInterface();
    } else {
        alert(`Saldo insuficiente! São necessários R$ ${sector.cost}.`);
    }
}

function updateUserInterface() {
    gameMoneyEl.innerText = farmWallet;
    sidebarMoneyEl.innerText = farmWallet;
    
    gameCarbonEl.innerText = carbonBalance.toFixed(1);
    if (carbonBalance <= 0) {
        carbonBadge.className = "badge-ui bg-carbon-good";
    } else {
        carbonBadge.className = "badge-ui bg-carbon-bad";
    }

    let activeVeh = vehiclesList[activeVehicleIndex];
    currentVehicleTxt.innerText = activeVeh.nome;
    let currentCargo = activeVeh.cargoType ? activeVeh.cargoType.toUpperCase() : "VAZIO";
    cargoStatsTxt.innerText = `Armazenamento: ${currentCargo} (${activeVeh.cargoAmount}/${activeVeh.cargoMax} unidades)`;
}

function transboardCargo() {
    let current = vehiclesList[activeVehicleIndex];
    if (!current.tipo.startsWith("harvester")) return;

    let truck = vehiclesList.find(v => v.tipo === "truck");
    let dist = Math.hypot((current.x + current.w/2) - (truck.x + truck.w/2), (current.y + current.h/2) - (truck.y + truck.h/2));

    if (dist <= 80) {
        if (current.cargoAmount === 0) return;
        if (truck.cargoType === "biochar") {
            alert("O caminhão está carregado de Biochar processado! Descarregue antes.");
            return;
        }
        if (truck.cargoType === null || truck.cargoType === current.cargoType) {
            let space = truck.cargoMax - truck.cargoAmount;
            let moveAmount = Math.min(current.cargoAmount, space);

            if (moveAmount > 0) {
                truck.cargoType = current.cropType || current.cargoType;
                truck.cargoAmount += moveAmount;
                current.cargoAmount -= moveAmount;
                if (current.cargoAmount === 0) current.cargoType = null;
                updateUserInterface();
            }
        } else {
            alert("Mistura inválida! O caminhão já possui outra cultura na caçamba.");
        }
    }
}

function interactWithStructures() {
    let current = vehiclesList[activeVehicleIndex];
    if (current.tipo !== "truck") return;

    if (current.x + current.w > biocharFactory.x && current.y < biocharFactory.y + biocharFactory.h) {
        if (current.cargoType === "milho" || current.cargoType === "soja") {
            biocharFactory.storedBiomass += current.cargoAmount;
            let converted = Math.floor(current.cargoAmount * 0.8);
            biocharFactory.readyBiochar += converted;
            carbonBalance -= (converted * 0.5); 

            current.cargoAmount = 0;
            current.cargoType = null;
            updateUserInterface();
        } else if (current.cargoAmount === 0 && biocharFactory.readyBiochar > 0) {
            current.cargoType = "biochar";
            current.cargoAmount = Math.min(current.cargoMax, biocharFactory.readyBiochar);
            biocharFactory.readyBiochar -= current.cargoAmount;
            updateUserInterface();
        }
    }

    if (current.x + current.w > creditAgency.x && current.y + current.h > creditAgency.y) {
        if (current.cargoType === "biochar" && current.cargoAmount > 0) {
            let creditValue = Math.ceil(current.cargoAmount * 0.4);
            farmWallet += creditValue;
            
            if (carbonBalance < 0) {
                farmWallet += 5;
            }

            current.cargoAmount = 0;
            current.cargoType = null;
            updateUserInterface();
        }
    }
}

function applyBiocharToField() {
    let current = vehiclesList[activeVehicleIndex];
    if (current.tipo !== "truck" || current.cargoType !== "biochar" || current.cargoAmount <= 0) return;

    landSectors.forEach(sector => {
        if (!sector.locked && sector.harvested) {
            if (current.x < sector.x + sector.w && current.x + current.w > sector.x &&
                current.y < sector.y + sector.h && current.y + current.h > sector.y) {
                
                if (!sector.hasBiochar) {
                    sector.hasBiochar = true;
                    let now = Date.now();
                    let remaining = sector.regrowthTime - now;
                    if (remaining > 0) {
                        sector.regrowthTime = now + (remaining / 2);
                    }
                    
                    current.cargoAmount = Math.max(0, current.cargoAmount - 50);
                    if (current.cargoAmount === 0) current.cargoType = null;
                    
                    carbonBalance -= 15;
                    farmWallet += 5; 
                    updateUserInterface();
                }
            }
        }
    });
}

function renderFarmStep() {
    let now = Date.now();

    ctx.fillStyle = "#16a34a"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#7c2d12"; 
    ctx.fillRect(400, 0, 200, canvas.height);
    ctx.fillRect(0, 430, canvas.width, 50);

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(biocharFactory.x, biocharFactory.y, biocharFactory.w, biocharFactory.h);
    ctx.fillStyle = "#cfd8dc";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("🏭 FÁBRICA BIOCHAR", biocharFactory.x + 8, biocharFactory.y + 25);
    ctx.font = "10px monospace";
    ctx.fillText(`Biochar Disp: ${biocharFactory.readyBiochar}u`, biocharFactory.x + 10, biocharFactory.y + 60);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(biocharFactory.x + 10, biocharFactory.y + 90, biocharFactory.w - 20, 15);
    ctx.fillStyle = "#000";
    ctx.fillText("PROCESSAR (F)", biocharFactory.x + 32, biocharFactory.y + 101);

    ctx.fillStyle = "#475569";
    ctx.fillRect(creditAgency.x, creditAgency.y, creditAgency.w, creditAgency.h);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("🏦 BANCO VERDE", creditAgency.x + 18, creditAgency.y + 25);
    ctx.font = "10px sans-serif";
    ctx.fillText("Venda de Carbono", creditAgency.x + 20, creditAgency.y + 55);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(creditAgency.x + 10, creditAgency.y + 90, creditAgency.w - 20, 15);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("DESCARREGAR (F)", creditAgency.x + 22, creditAgency.y + 101);

    landSectors.forEach(sector => {
        if (sector.locked) {
            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.fillRect(sector.x, sector.y, sector.w, sector.h);
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 2;
            ctx.strokeRect(sector.x, sector.y, sector.w, sector.h);
            ctx.fillStyle = "#ffffff";
            ctx.font = "11px sans-serif";
            ctx.fillText("🔒 ÁREA TRANCADA", sector.x + 25, sector.y + sector.h / 2);
            return;
        }

        if (sector.harvested && now >= sector.regrowthTime) {
            sector.harvested = false;
            sector.hasBiochar = false;
        }

        if (!sector.harvested) {
            ctx.fillStyle = (sector.cropType === "milho") ? "#eab308" : "#a16207";
            ctx.fillRect(sector.x, sector.y, sector.w, sector.h);
            
            ctx.fillStyle = (sector.cropType === "milho") ? "#fef08a" : "#ca8a04";
            for (let i = 15; i < sector.w; i += 30) {
                ctx.fillRect(sector.x + i, sector.y + 10, 5, sector.h - 20);
            }
        } else {
            ctx.fillStyle = sector.hasBiochar ? "#1a0f00" : "#451a03"; 
            ctx.fillRect(sector.x, sector.y, sector.w, sector.h);
            
            let timeLeft = Math.max(0, Math.round((sector.regrowthTime - now) / 1000));
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px monospace";
            ctx.fillText(`Crescendo: ${timeLeft}s`, sector.x + 25, sector.y + sector.h / 2);
            if (sector.hasBiochar) {
                ctx.fillStyle = "#38bdf8";
                ctx.fillText("⚡ [BIOCHAR ATIVO]", sector.x + 15, sector.y + sector.h / 2 + 20);
            }
        }
        
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(sector.x, sector.y, sector.w, sector.h);
    });

    let activeVeh = vehiclesList[activeVehicleIndex];
    let isMoving = false;

    if (activeKeys['w']) { activeVeh.y -= activeVeh.speed; isMoving = true; }
    if (activeKeys['s']) { activeVeh.y += activeVeh.speed; isMoving = true; }
    if (activeKeys['a']) { activeVeh.x -= activeVeh.speed; isMoving = true; }
    if (activeKeys['d']) { activeVeh.x += activeVeh.speed; isMoving = true; }

    activeVeh.x = Math.max(0, Math.min(canvas.width - activeVeh.w, activeVeh.x));
    activeVeh.y = Math.max(0, Math.min(canvas.height - activeVeh.h, activeVeh.y));

    if (isMoving) {
        carbonBalance += activeVeh.emissionRate;
        updateUserInterface();

        ctx.fillStyle = "rgba(100, 116, 139, 0.5)";
        ctx.beginPath();
        ctx.arc(activeVeh.x + activeVeh.w / 2, activeVeh.y + activeVeh.h + 2, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    landSectors.forEach(sector => {
        if (!sector.locked && !sector.harvested) {
            if (activeVeh.x < sector.x + sector.w && activeVeh.x + activeVeh.w > sector.x &&
                activeVeh.y < sector.y + sector.h && activeVeh.y + activeVeh.h > sector.y) {
                
                if (activeVeh.tipo === "harvester_milho" && sector.cropType === "milho" && activeVeh.cargoAmount < activeVeh.cargoMax) {
                    sector.harvested = true;
                    sector.regrowthTime = now + 45000; 
                    activeVeh.cargoType = "milho";
                    activeVeh.cargoAmount = Math.min(activeVeh.cargoMax, activeVeh.cargoAmount + 25);
                    updateUserInterface();
                }
                else if (activeVeh.tipo === "harvester_soja" && sector.cropType === "soja" && activeVeh.cargoAmount < activeVeh.cargoMax) {
                    sector.harvested = true;
                    sector.regrowthTime = now + 45000;
                    activeVeh.cargoType = "soja";
                    activeVeh.cargoAmount = Math.min(activeVeh.cargoMax, activeVeh.cargoAmount + 25);
                    updateUserInterface();
                }
            }
        }
    });

    vehiclesList.forEach(v => {
        ctx.fillStyle = v.color;
        ctx.fillRect(v.x, v.y, v.w, v.h);

        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(v.x + 5, v.y + 6, v.w - 10, 12);

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(v.x - 2, v.y + 8, 3, 12);
        ctx.fillRect(v.x + v.w, v.y + 8, 3, 12);
        ctx.fillRect(v.x - 2, v.y + v.h - 18, 3, 12);
        ctx.fillRect(v.x + v.w, v.y + v.h - 18, 3, 12);

        if (v.cargoAmount > 0) {
            let pct = v.cargoAmount / v.cargoMax;
            ctx.fillStyle = (v.cargoType === "milho") ? "#eab308" : (v.cargoType === "biochar" ? "#0f172a" : "#854d0e");
            ctx.fillRect(v.x + 5, v.y + v.h - 12, (v.w - 10) * pct, 6);
        }

        if (v.id === vehiclesList[activeVehicleIndex].id) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.strokeRect(v.x - 4, v.y - 4, v.w + 8, v.h + 8);
        }
    });
}

window.onload = initFarmSimulator;
