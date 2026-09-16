
// ------------------- Persistent & Downsampled Janitza Graph -------------------

let historyData = []
let realtimeData = []
let predictionData = []

let lastMode = null;
let startPicker;
let endPicker;    
let today 
let firstDay 

let ACT_podesena_snaga_rucno = 0;
let ACT_rucno = 0;
let SOC_BAT_AUTO = -1;

let writeRegistersList = []
let charts = {}

// ---------------- Hook into glavni_program ----------------
function glavni_program() {
    updateLocalClock();
    fetchAndUpdateValues();
    fetchRealtimePoint();
    fetchPrediction();
    updateMainValues();
    updateSpecialValues();
    updateCharts();
    setReadOnlyGrid();
}

// ---------------- On page load ----------------
window.onload = function() {  
    cacheDOM();        
    fetchHistory();
    initCharts();
    fetchAndUpdateValues();
    
    setDefaultDates();
    sendDateRange(); // initial energy fetch
};

// Run main program every second
setInterval(glavni_program, 1000);

function reloadPage() {  
    window.location.reload();
}

// Run main program every second
setInterval(reloadPage, 300000);


//kompletna mapa s backenda na frontend
const backend_map ={
    "M_PV_proizvodnja": {value: 0},
    "M_PV_proizvodnja_VIZ": {value: 0},
    "MAX_PV_proizvodnja": {value: 0},
    "MAX_potrosnja": {value: 0},
    "M_PV_postotak": {value: 0},
    "M_EnergyMeter": {value:0},
    "M_Baterija_SOC": {value: 0},
    "M_Baterija_snaga": {value: 0},
    "M_Baterija_postotak": {value: 0},
    "M_ACT_podesena_snaga": {value: 0},
    "M_ABS_POS_FLEX": {value: 0},
    "M_ABS_NEG_FLEX": {value: 0},
    "M_ACT_flag_read": {value:0},
    "M_DELTA_POS_FLEX": {value:0},
    "M_DELTA_NEG_FLEX": {value:0},
	"M_HEP_podeseno": {value:0},
    "M_Potrosnja": {value:0},
    "M_Potrosnja_VIZ": {value:0},
    "M_OZRACENOST": {value:0},
    "M_SOC_AUTO_VIZ":{value:0},
    "M_SOC_AUTO_AI":{value:0},
    "M_AMB_TEMP":{value:0},
    "M_Baseline":{value:0},
    "M_energyPlus":{value:0},
    "M_energyMinus":{value:0},
    "M_energySum":{value:0},
    "M_cijenaSum":{value:0},
    "M_energyBurzePlus":{value:0},
    "M_energyBurzeMinus":{value:0},
    "M_energyBurzePlusSum":{value:0},
    "M_cijenaBurzePlus":{value:0},
    "M_energyBurzeNocnaPlus":{value:0},
    "M_energyBurzeNocnaMinus":{value:0},
    "M_energyBurzeMinusSum":{value:0},
    "M_cijenaBurzeMinus":{value:0},
    "M_cijenaUkupno":{value:0},
    "M_energijaGasenja":{value:0},
    "M_cijenaGasenja":{value:0},
    "M_PV_prediction":{value:0},
    "M_CS_prediction":{value:0},
    "M_PASSWORD":{value:null},
    "M_ENTSOE_cijena":{value:0},
    "M_Vrsta_prodaje":{value:0},
    "M_Koeficijent_prodaje":{value:0},
    "M_Vrsta_kupovine":{value:0},
    "M_Koeficijent_kupovine":{value:0},
    "M_Trosarina":{value:0},
    "M_Mrezarina_VT":{value:0},
    "M_Mrezarina_NT":{value:0},
    "M_OIE":{value:0},
    "M_Cijena_agregacije_plus":{value:0},
    "M_Cijena_agregacije_minus":{value:0},
    "M_naziv_elektrane":{value:""},
    "M_lokacija":{value:""},
    "M_url_DM":{value:""},
    "M_url_ESS":{value:""},
    "M_url_HEP":{value:""},
    "M_max_PV_proizvodnja":{value:""},
    "M_max_potrosnja":{value:""},
    "M_ACE_OL":{value:0},
    "M_VARIJABLE":{value:""},
    "M_baterija_postoji_flag":{value:0},
    "M_vrsta_agregatora":{value:0}
};


const valueBindings = {
    Slika_elektrana: "M_PV_proizvodnja_VIZ",
    Slika_Janitza: "M_EnergyMeter",
    Slika_potrosnja: "M_Potrosnja_VIZ",
    Slika_baterija_snaga: "M_Baterija_snaga",
    setpoint_scada: "M_ACT_podesena_snaga",


    Baseline: "M_Baseline",
    energyPlus: "M_energyPlus",
    energyMinus: "M_energyMinus",
    energySum: "M_energySum",
    cijenaSum: "M_cijenaSum",

    energyBurzePlus: "M_energyBurzePlus",
    energyBurzeNocnaPlus: "M_energyBurzeNocnaPlus",
    energyBurzeMinus: "M_energyBurzeMinus",
    energyBurzeNocnaMinus: "M_energyBurzeNocnaMinus",
    energyBurzePlusSum: "M_energyBurzePlusSum",
    energyBurzeMinusSum: "M_energyBurzeMinusSum",

    cijenaBurzePlus: "M_cijenaBurzePlus",
    cijenaBurzeMinus: "M_cijenaBurzeMinus",
    cijenaUkupno: "M_cijenaUkupno",
    energijaGasenja: "M_energijaGasenja",
    cijenaGasenja: "M_cijenaGasenja",

    maxPVprocjena: "M_OZRACENOST",
    SOC_AUTO: "M_SOC_AUTO_VIZ",
    SOC_AUTO_AI: "M_SOC_AUTO_AI",

    M_ABS_POS_FLEX: "M_ABS_POS_FLEX",
    M_ABS_NEG_FLEX: "M_ABS_NEG_FLEX",
    M_DELTA_POS_FLEX: "M_DELTA_POS_FLEX",
    M_DELTA_NEG_FLEX: "M_DELTA_NEG_FLEX",

    M_PV_postotak: "M_PV_postotak",
    M_Baterija_postotak: "M_Baterija_postotak",

    M_HEP_podeseno: "M_HEP_podeseno",
    M_naziv_elektrane: "M_naziv_elektrane",
    M_lokacija: "M_lokacija",
    M_max_PV_proizvodnja: "M_max_PV_proizvodnja",
    M_max_potrosnja: "M_max_potrosnja",
    Slika_baterija_SOC: "M_Baterija_SOC",
    temperature: "M_AMB_TEMP",

    ACE_OL: "M_ACE_OL",
    ENTSOE_cijena: "M_ENTSOE_cijena",

    vrstaProdaje: "M_Vrsta_prodaje",
    koeficijentProdaje: "M_Koeficijent_prodaje",
    vrstaKupovine: "M_Vrsta_kupovine",
    koeficijentKupovine: "M_Koeficijent_kupovine",
    trosarina: "M_Trosarina",
    mrezarinaVT: "M_Mrezarina_VT",
    mrezarinaNT: "M_Mrezarina_NT",
    OIE: "M_OIE",
    CijenaAgregacijePlus: "M_Cijena_agregacije_plus",
    CijenaAgregacijeMinus: "M_Cijena_agregacije_minus"

};

const DOM = {};

const DECIMAL_SPLIT_IDS = new Set(["Slika_elektrana",
                                    "Slika_baterija_snaga",
                                    "Slika_potrosnja",
                                    "Slika_Janitza",
                                    "setpoint_scada",
                                    "M_ABS_NEG_FLEX",
                                    "M_ABS_POS_FLEX",
                                    "M_DELTA_NEG_FLEX",
                                    "M_DELTA_POS_FLEX",
                                    "M_PV_postotak",
                                    "M_Baterija_postotak",
                                    "M_HEP_podeseno"
                                    ]);							   

function cacheDOM() {
    document.querySelectorAll("[id]").forEach(el => {
        DOM[el.id] = el;
    });
}

function renderSplitDecimalValue(el, value) {
    const raw = String(value ?? "").trim();

    if (!raw) {
        el.textContent = "";
        return;
    }

    const sepIndex = Math.max(raw.lastIndexOf(","), raw.lastIndexOf("."));
    const hasDecimalPart =
        sepIndex > 0 &&
        sepIndex < raw.length - 1 &&
        /^\d+$/.test(raw.slice(sepIndex + 1)) &&
        /\d/.test(raw.slice(0, sepIndex));

    if (!hasDecimalPart) {
        el.textContent = raw;
        return;
    }

    const intPart = raw.slice(0, sepIndex);
    const decPart = raw.slice(sepIndex);

    el.innerHTML = "";

    const intSpan = document.createElement("span");
    intSpan.className = "value-int";
    intSpan.textContent = intPart;

    const decSpan = document.createElement("span");
    decSpan.className = "value-decimal";
    decSpan.textContent = decPart;

    el.appendChild(intSpan);
    el.appendChild(decSpan);
}
function updateMainValues() {
    for (const id in valueBindings) {
        const el = DOM[id];
        if (!el) continue;

        const key = valueBindings[id];
        const value = backend_map[key]?.value ?? "";
        if (DECIMAL_SPLIT_IDS.has(id)) {
            renderSplitDecimalValue(el, value);
            continue;
        }

        el.textContent = value;
    }
}

function updateSpecialValues() {

    // --- ACT STATUS ---
    const ackt = backend_map["M_ACT_flag_read"].value;

    if (DOM.act_viz) {
        const statusText = DOM.act_viz.querySelector(".status-window__text");
        const statusValue = ackt == 1 ? "Aktivna" : "Neaktivna";
        if (statusText) {
            statusText.textContent = statusValue;
        } else {
            DOM.act_viz.textContent = statusValue;
        }
    }

    //     // --- ENNA SETPOINT ---
    // if (DOM.setpoint_scada) {
    //     DOM.setpoint_scada.textContent =
    //         backend_map["M_ACT_podesena_snaga"].value;
    // }

    // --- LINKOVI ---
    const links = [
        ["M_url_DM", ["M_url_DM", "M_url_DM_2"]],
        ["M_url_ESS", ["M_url_ESS", "M_url_ESS_2"]],
        ["M_url_HEP", ["M_url_HEP", "M_url_HEP_2", "M_url_HEP_3"]]
    ];

    links.forEach(([mapKey, ids]) => {
        const url = backend_map[mapKey]?.value;
        ids.forEach(id => {
            if (DOM[id]) DOM[id].href = url;
        });
    });
}

function updateColor(element) {
    const el = element;

    let text = el.textContent
        .replace(".", "")      // fix decimal separator
        .replace(",", ".")      // fix decimal separator

    let value = parseFloat(text);

    if (!isNaN(value)) {
        if (value > 0) {
            el.style.color = "var(--green)";
        } else if (value < 0) {
            el.style.color = "var(--red)";
        } else {
            el.style.color = ""; // optional for zero
        }
    }
}
//...............Dohvat podataka s backenda........................

function fetchAndUpdateValues() {
    fetch('/Frontend_primi_podatke', { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
            // Update backend mape
            for (const key in data) {
                if (backend_map[key] && data[key] && typeof data[key].value !== "undefined") {
                    backend_map[key].value = data[key].value;
                }
            }           
        })
        .catch(err => console.error("Error fetching values:", err));

    fetch('/get_mode', {cache: "no-store"})
        .then(res => res.json())
        .then(data => {
            if (data && typeof data.mode !== "undefined") {
                updateModeButtons(data.mode);
            }
        })
        .catch(err => console.error("Error fetching mode:", err));  
    
    updateColor(document.getElementById("cijenaUkupno"));
    updateColor(document.getElementById("cijenaSum"));
}

function SendAndUpdateValues() {    
 const dataToSend = {
        M_ACT_podesena_snaga_rucno: ACT_podesena_snaga_rucno,
        M_ACT_rucno: ACT_rucno,
        M_SOC_AUTO: SOC_BAT_AUTO // optional if you want SOC manual value too
    };

    fetch('/Frontend_salji_podatke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })
    .then(res => res.json())
        .then(data => {
        if (data.status === "success") {
            const values = Object.entries(data.current_values)
                .map(([key, value]) => `${key}: ${value}`)  // each key-value
                .join("<br>");  // use <br> for line break in HTML

            showAutoInputMessage(`${data.message}<br>${values}`, true, 10000);

            } else {
                showAutoInputMessage(data.message || "Greška pri primjeni vrijednosti", false);
            }
        })
        .catch(err => {
            showAutoInputMessage("Greška u komunikaciji s backendom", false);
            console.error(err);
        });
    }
//...............Periodičko slanje na backend........................

function showAutoInputMessage(msg, success = true, duration = 3000) {
    const div = document.getElementById("outputWindowAuto");
    div.innerHTML = msg;  // use innerHTML
    div.style.color = success ? "#00aa00" : "#ff3333";
    div.style.fontWeight = "bold";

    if (duration > 0) {
        setTimeout(() => {
            div.innerHTML = "";
        }, duration);
    }
}

//...............Render prozora za upis podataka........................
    
function createWriteRegisterRow(register) {
    const container = document.getElementById("writeRegisters");

    const descDiv = document.createElement("div");
    descDiv.textContent = register.description;
    descDiv.style.fontWeight = "500";

    const inputEl = document.createElement("input");
    inputEl.type = "number";
    inputEl.id = `writeValue-${register.id}-${register.client}`;
    inputEl.placeholder = "Vrijednost";
    inputEl.style.width = "100px";

    const buttonEl = document.createElement("button");
    buttonEl.textContent = "Upiši";
    buttonEl.onclick = () => manualWriteRegister(register.id, register.client);

    const explDiv = document.createElement("div");
    explDiv.textContent = register.explanation;
    explDiv.style.fontSize = "0.8em";
    explDiv.style.color = "gray";

    container.appendChild(descDiv);
    container.appendChild(inputEl);
    container.appendChild(buttonEl);
    container.appendChild(explDiv);
}

//Funkcija za pisanje podataka 
function manualWriteRegister(registerId, client) {
    const inputEl = document.getElementById(`writeValue-${registerId}-${client}`);
    const value = inputEl.value;
    
    if (value === "") { 
        alert("Molimo unesite vrijednost!"); 
        return; 
    }

    // Find the selected register based on registerId and client
    const selectedRegister = writeRegistersList.find(register => register.id === registerId && register.client === client);
    
    if (!selectedRegister) {
        alert("Ne postoji registracija za odabrani ID i klijent!");
        return;
    }
    const calculatedValue = value * selectedRegister.gain;

    // Now perform the fetch request using the selected register's details
    fetch('/write', {   
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            address: selectedRegister.id,     // Correctly using the selected register
            value: calculatedValue,                     // The value from the input field
            client: selectedRegister.client,
            bit_size: selectedRegister.bit_size
        })
    })
    .then(res => res.json())
    .then(data => {
        const outputWindow = document.getElementById("outputWindow");
        const timestamp = new Date().toLocaleTimeString('hr-HR', { hour12: false });
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `[${timestamp}] ${JSON.stringify(data)}`;
        messageDiv.style.color = "#00ff99";
        outputWindow.appendChild(messageDiv);

        if (outputWindow.children.length > 5) {
            outputWindow.removeChild(outputWindow.firstChild);
        }

        inputEl.value = "";
    })
    .catch(err => {
        alert("Greška pri komunikaciji sa serverom!");
        console.error(err);
    });
}

function loadAutoCurrentValues() {   //napuni prozore s trenutnim vrijednostima koje su upisane u backendu
    fetch('/Frontend_primi_podatke')
        .then(res => res.json())
        .then(data => {
            // Fill each input with current backend value
            document.getElementById("ACT_podesena_snaga_rucno").value = data["M_ACT_podesena_snaga_rucno"]?.value ?? "";
            document.getElementById("ACT_rucno").value = data["M_ACT_rucno"]?.value ?? "";
            document.getElementById("SOC-bat-auto").value = data["M_SOC_AUTO"]?.value ?? "";
        })
        .catch(err => {
            console.error("Greška pri učitavanju vrijednosti", err);
        });
}

function loadManualCurrentValues() {   //napuni prozore s trenutnim vrijednostima koje su upisane u backendu
    fetch('/Frontend_primi_podatke')
        .then(res => res.json())
        .then(data => {
            // Fill each input with current backend value
            
            const container = document.getElementById("writeRegisters");
            container.innerHTML = "";

            writeRegistersList = JSON.parse(data["manualne_postavke"]?.value ?? "");
            
            writeRegistersList.forEach(createWriteRegisterRow); // existing SCADA UI
        })
        .catch(err => {
            console.error("Greška pri učitavanju vrijednosti", err);
        });
}


//...............Postavljanje načina rada........................
async function setMode(newMode) {
    const correctPassword = backend_map["M_PASSWORD"].value;
    let modeValue = 1;

    if (newMode === 'ručni') {
        if (!confirm("UPOZORENJE:\n\nBudite oprezni kod ručnog upisa podataka!\nNeopreznim direktnim upisivanjem u registre sunčane elektrane i baterija, može se premašiti maksimalna dozvoljena izlazna snaga, što može rezultatirati proradom strujnih zaštita i izbacivanjem cijelog postrojenja iz mreže.\n\nŽelite li nastaviti?")) return;

        const enteredPassword = await askPassword();
        if (enteredPassword !== correctPassword) {
            alert("Pogrešna lozinka.");
            return;
        }

        openModal('manualInputModal');
        loadManualCurrentValues();  // pre-fill the fields immediately
        modeValue = 0;

    } else if (newMode === 'automatski') {
        if (!confirm("UPOZORENJE:\n\nAutomatski način rada - daljinsko upravljanje postrojenjem pomoću sustava aktivacije\n\n\nŽelite li nastaviti?")) return;

        const enteredPassword = await askPassword();
        if (enteredPassword !== correctPassword) {
            alert("Pogrešna lozinka.");
            return;
        }

        openModal('AutoInputModal');
        loadAutoCurrentValues();
        modeValue = 1;

    } else {
        return;
    }

    /* SEND TO BACKEND */
    fetch("/set_mode", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ mode: modeValue })
    })
    .then(() => {
        updateModeButtons(modeValue);
    });
}



function updateModeButtons(zastavica) {
    if (zastavica === lastMode) return;
    lastMode = zastavica;

    const manualBtn = document.getElementById('manualBtn');
    const autoBtn   = document.getElementById('autoBtn');

    if (zastavica !== 0) {
        manualBtn.classList.remove('active');
        autoBtn.classList.add('active');
    } else {
        manualBtn.classList.add('active');
        autoBtn.classList.remove('active');
    }
}


function sendManualValue() {
    ACT_podesena_snaga_rucno = document.getElementById('ACT_podesena_snaga_rucno').value;
    ACT_rucno = document.getElementById('ACT_rucno').value;
    SOC_BAT_AUTO = document.getElementById('SOC-bat-auto').value;
    if((ACT_podesena_snaga_rucno == "")&&(ACT_rucno == "")&&(SOC_BAT_AUTO=="")){
        alert("Molimo unesite vrijednost!");
        return;
        }
    SendAndUpdateValues();       
}

(function () {
    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    const bindings = [
        { spanId: "Slika_baterija_SOC", mapKey: "M_Baterija_SOC", fillId: "socFillNew" },
        { spanId: "Slika_potrosnja", mapKey: "M_Potrosnja", fillId: "consumptionFill" },
        { spanId: "Slika_elektrana", mapKey: "M_PV_proizvodnja", fillId: "pvFill" }
    ];

    function readBackendSoc(mapKey) {
        if (typeof backend_map === "undefined") return 0;
        const raw = backend_map?.[mapKey]?.value;
        let value = Number(raw);
        if (Number.isNaN(value)) return 0;
        if(mapKey == "M_PV_proizvodnja"){
            const max = backend_map?.["MAX_PV_proizvodnja"]?.value;
            value = value / Number(max) * 100
        }
        
        if(mapKey == "M_Potrosnja"){
            const max = backend_map?.["MAX_potrosnja"]?.value;
            value = value / Number(max) * 100
        }
        return clamp(value, 0, 100);
    }

    function setFillFromBackend(mapKey, fillId) {
        const fill = document.getElementById(fillId);
        if (!fill) return;
        const value = readBackendSoc(mapKey);
        // if(fillId == "pvFill")
        //     fill.style.width = value + " kW";
        // else
        fill.style.width = value + "%";
        fill.dataset.empty = value <= 0 ? "true" : "false";
    }

    function updateSocSliders() {
        for (const b of bindings) setFillFromBackend(b.mapKey, b.fillId);
    }

    // Expose for manual testing in DevTools
    window.__scadaUpdateSocSliders = updateSocSliders;

    function observe(binding) {
        const span = document.getElementById(binding.spanId);
        if (!span) return;
        updateSocSliders();
        const obs = new MutationObserver(() => updateSocSliders());
        obs.observe(span, { characterData: true, childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            updateSocSliders();
            bindings.forEach(observe);
        });
    } else {
        updateSocSliders();
        bindings.forEach(observe);
    }

    // Activation status pill (do not modify legacy JS; it writes textContent + inline bg)
    function getActivationStateFromText(text) {
        const t = String(text ?? "").trim().toLowerCase();
        if (!t) return "unknown";
        // Prefer explicit inactive match first
        if (t.includes("neaktiv")) return "inactive";
        if (t.includes("aktiv")) return "active";
        return "unknown";
    }

    function applyActivationState() {
        const el = document.getElementById("act_viz");
        if (!el) return;
        el.dataset.state = getActivationStateFromText(el.textContent);
    }

    function observeActivationStatus() {
        const el = document.getElementById("act_viz");
        if (!el) return;
        applyActivationState();
        const obs = new MutationObserver(() => applyActivationState());
        obs.observe(el, { characterData: true, childList: true, subtree: true });
    }

    // Miner status pill (legacy JS writes Running/Paused + inline colors)
    function getMinerStateFromText(text) {
        const t = String(text ?? "").trim().toLowerCase();
        if (!t) return "unknown";
        if (t.includes("pauzirano") || t.includes("neaktiv")) return "inactive";
        if (t.includes("u radu") || t.includes("aktiv")) return "active";
        return "unknown";
    }

    function applyMinerState() {
        const el = document.getElementById("Slika_mineri");
        if (!el) return;
        el.dataset.state = getMinerStateFromText(el.textContent);
    }

    function observeMinerStatus() {
        const el = document.getElementById("Slika_mineri");
        if (!el) return;
        applyMinerState();
        const obs = new MutationObserver(() => applyMinerState());
        obs.observe(el, { characterData: true, childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            observeActivationStatus();
            observeMinerStatus();
        });
    } else {
        observeActivationStatus();
        observeMinerStatus();
    }

    // Chart.js theme adjustments (canvas; cannot be styled by CSS)
    window.addEventListener("load", () => {
    const chart = charts["janitzaChart"];
    const chart_1 = charts["janitzaChart_1"];
    const chart_2 = charts["janitzaChart_2"];
    const chart_3 = charts["janitzaChart_3"];
    const chart_4 = charts["janitzaChart_4"];
        if (!chart || !chart.options 
            || !chart_1 || !chart_1.options
            || !chart_2 || !chart_2.options
            || !chart_3 || !chart_3.options
            || !chart_4 || !chart_4.options) return;

        const root = getComputedStyle(document.documentElement);
        const muted = root.getPropertyValue("--muted").trim() || "#A7B0C2";
        const grid = root.getPropertyValue("#b4c1db");
        const blue = root.getPropertyValue("--blue").trim() || "#2F6BFF"; //"rgba(47,107,255,0.10)"
        const green = root.getPropertyValue("--green").trim() || "#22C55E"; //"rgba(34,197,94,0.10)"
        const orange = root.getPropertyValue("--orange").trim() || "#F59E0B"; //"rgba(245,158,11,0.10)"
        const red = root.getPropertyValue("--red").trim() || "#FF0000"; //"rgba(239,20,20,0.10)"
        const brown = root.getPropertyValue("--brown").trim() || "#43270f"; //"rgba(67, 39, 15, 0.10)"
        const magenta = root.getPropertyValue("--magenta").trim() || "#ff80ff"; // "rgba(255,128,255,0.10)"

        const datasets = chart.data?.datasets || [];
        if (datasets[0]) {
            datasets[0].borderColor = blue;
            datasets[0].backgroundColor = "rgba(47,107,255,0.10)";
        }
        if (datasets[1]) {
            datasets[1].borderColor = green;
            datasets[1].backgroundColor = "rgba(34,197,94,0.10)";
        }
        const legendLabels = chart.options.plugins?.legend?.labels;
        if (legendLabels) {
            legendLabels.color = muted;
            legendLabels.font = { size: 12, weight: "600" };
        }

        chart.update("none");
        
        const datasets_1 = chart_1.data?.datasets || [];
        if (datasets_1[0]) {
            datasets_1[0].borderColor = orange;
            datasets_1[0].backgroundColor = "rgba(245,158,11,0.10)";
        }
        if (datasets_1[1]) {
            datasets_1[1].borderColor = green;
            datasets_1[1].backgroundColor = "rgba(34,197,94,0.10)";
        }

        if (datasets_1[2]) {
            datasets_1[2].borderColor = blue;
            datasets_1[2].backgroundColor = "rgba(47,107,255,0.10)";
        }
        const legendLabels_1 = chart_1.options.plugins?.legend?.labels;
        if (legendLabels_1) {
            legendLabels_1.color = muted;
            legendLabels_1.font = { size: 12, weight: "600" };
        }

        chart_1.update("none");
        
        const datasets_2 = chart_2.data?.datasets || [];
        
        if (datasets_2[0]) {
            datasets_2[0].borderColor = red;
            datasets_2[0].backgroundColor = "rgba(239,20,20,0.10)";
        }
        if (datasets_2[1]) {
            datasets_2[1].borderColor = blue;
            datasets_2[1].backgroundColor = "rgba(47,107,255,0.10)";
        }
        const legendLabels_2 = chart_2.options.plugins?.legend?.labels;
        if (legendLabels_2) {
            legendLabels_2.color = muted;
            legendLabels_2.font = { size: 12, weight: "600" };
        }

        
        chart_2.update("none");
        
        const datasets_3 = chart_3.data?.datasets || [];
        
        if (datasets_3[0]) {
            datasets_3[0].borderColor = green;
            datasets_3[0].backgroundColor = "rgba(34,197,94,0.10)";
        }
        if (datasets_3[1]) {
            datasets_3[1].borderColor = blue;
            datasets_3[1].backgroundColor = "rgba(47,107,255,0.10)";
        }
        if (datasets_3[2]) {
            datasets_3[2].borderColor = red;
            datasets_3[2].backgroundColor = "rgba(239,20,20,0.10)";
        }
        if (datasets_3[3]) {
            datasets_3[3].borderColor = orange;
            datasets_3[3].backgroundColor = "rgba(245,158,11,0.10)";
        }
        if (datasets_3[4]) {
            datasets_3[4].borderColor = magenta;
            datasets_3[4].backgroundColor = "rgba(255,128,255,0.10)";
        }
        const legendLabels_3 = chart_3.options.plugins?.legend?.labels;
        if (legendLabels_3) {
            legendLabels_3.color = muted;
            legendLabels_3.font = { size: 12, weight: "600" };
        }

        chart_3.update("none");

        const datasets_4 = chart_4.data?.datasets || [];
                
        if (datasets_4[0]) {
            datasets_4[0].borderColor = green;
            datasets_4[0].backgroundColor = "rgba(34,197,94,0.10)";
        }
        if (datasets_4[1]) {
            datasets_4[1].borderColor = blue;
            datasets_4[1].backgroundColor = "rgba(47,107,255,0.10)";
        }
        if (datasets_4[2]) {
            datasets_4[2].borderColor = red;
            datasets_4[2].backgroundColor = "rgba(239,20,20,0.10)";
        }
        if (datasets_4[3]) {
            datasets_4[3].borderColor = orange;
            datasets_4[3].backgroundColor = "rgba(245,158,11,0.10)";
        }
        if (datasets_4[4]) {
            datasets_4[4].borderColor = magenta;
            datasets_4[4].backgroundColor = "rgba(255,128,255,0.10)";
        }
        const legendLabels_4 = chart_4.options.plugins?.legend?.labels;
        if (legendLabels_4) {
            legendLabels_4.color = muted;
            legendLabels_4.font = { size: 12, weight: "600" };
        }
        
        chart_4.update("none");
    });
})();    


function openDataPopupAFRR() {

    const overlayAFRR = document.getElementById("overlayAFRR");

    overlayAFRR.style.display = "flex";   // make it visible again

    // small delay ensures animation works properly
    setTimeout(() => {
        overlayAFRR.classList.remove("hidden");
    }, 10);
}

function openDateModal() {
    
    //startPicker.setDate(firstDay);
    startPicker.setDate(firstDay);
    endPicker.setDate(today);

    const overlayDate = document.getElementById("overlayDate");
    
    overlayDate.style.display = "flex";   // make it visible again

    // small delay ensures animation works properly
    setTimeout(() => {
        overlayDate.classList.remove("hidden");
    }, 10);
    
}

function closePopup() {
    const overlayAFRR = document.getElementById("overlayAFRR");
    overlayAFRR.classList.add("hidden");

    const overlayDate = document.getElementById("overlayDate");
    overlayDate.classList.add("hidden");
}

// Close with ESC key
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        closePopup();
    }
});


//Funkcija za upis lozinke
function askPassword() {
    return new Promise((resolve) => {
        const modal = document.getElementById("passwordModal");
        const input = document.getElementById("passwordInput");

        modal.style.display = "block";
        input.value = "";
        input.focus();

        window.submitPassword = function () {
            modal.style.display = "none";
            resolve(input.value);
        };

        window.closePasswordModal = function () {
            modal.style.display = "none";
            resolve(null);
        };
    });
}
  // Trigger submitPassword() on Enter key press
  const passwordInput = document.getElementById('passwordInput');
  passwordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      submitPassword();
    }
  });



//...............KALENDAR ZA ODABIR DATUMA........................

flatpickr("#startDate", {
    locale: "hr",
    defaultDate: new Date()
});

flatpickr("#endDate", {
    locale: "hr",
    defaultDate: new Date()
});

document.addEventListener("DOMContentLoaded", function () {

    startPicker = flatpickr("#startDate", {
        dateFormat: "d.m.Y.",
        locale: "hr",          
        onChange: function(selectedDates) {
            endPicker.set("minDate", selectedDates[0]);
        }
    });

    endPicker = flatpickr("#endDate", {
        dateFormat: "d.m.Y.",
        locale: "hr"
    });

});

function formatDate(dateStr) {
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
}

function sendDateRange() {

    const startRaw = document.getElementById("startDate").value;
    const endRaw = document.getElementById("endDate").value;
    today = endRaw
    firstDay = startRaw

    const start = formatDate(startRaw);
    const end = formatDate(endRaw);

    let datumiIspis = document.getElementById("datumi_ispis");
    
    let text = ""
    
    if(start == end){
        text = startRaw 
    }
    else{
        text = startRaw + " " + endRaw
    }

    datumiIspis.textContent = text;

    if (!start || !end || start == "undefined-undefined-" || end == "undefined-undefined-") {
        alert("Odaberi datume");
        return;
    }

    fetch('/dohvati_aku_energiju', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_date: start,
            end_date: end
        })
    })
    .catch(() => alert("Greška"));
}
 
/* Default dates (timezone safe) */

function setDefaultDates() {

    today = new Date();
    firstDay = new Date();
    function formatDateLocal(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${d}.${m}.${y}.`;
    }
      
    const endDate = formatDateLocal(today);

    document.getElementById("startDate").value = endDate;
    document.getElementById("endDate").value = endDate;
}


function updateLocalClock() {
    const now = new Date();
    document.getElementById("ntpClock").textContent = 
    now.toLocaleTimeString('hr-HR', { hour12: false });
}   
    
//...............Otvaranje zatvaranje modalnih prozora........................

function openModal(id) {
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('manualInputModal');
    if(event.target === modal) {
        closeModal('manualInputModal');
    }
}



// Add event listeners to all buttons
document.querySelectorAll(".reset-zoom-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const chartId = btn.dataset.chart;
        const chart = charts[chartId];
        if (chart && typeof chart.resetZoom === "function") {
            chart.resetZoom();
        }
    });
});

//definiranje chartova
const chartConfigs = [
{
    id: "janitzaChart",
    y1: "gridPower",
    y2: "baseline",
    label1: "Snaga prema mreži",
    label2: "Baseline"
},
{
    id: "janitzaChart_1",
    y1: "proizvodnja",
    y2: "predikcija_proiz",
    y3: "insolacija_PV",
    label1: "Proizvodnja",
    label2: "Predikcija proizvodnje",
    label3: "Procjena proizvodnje"
},
{
    id: "janitzaChart_2",
    y1: "potrosnja",
    y2: "predikcija_potr",
    label1: "Potrošnja",
    label2: "Predikcija potrošnje"
},
{
    id: "janitzaChart_3",
    y1: "soc",
    y2: "optimalni_soc",
    y3: "SOC_dohvat",
    y4: "CROPEX",
    y5: "SOC_izracun",
    label1: "Trenutni SOC",
    label2: "Podešeni SOC",
    label3: "AI SOC",
    label4: "CROPEX",
    label5: "Izračunati SOC"
}
]

const chartConfigsCustom = [
{
    id: "janitzaChart_4",
    y1: "gridPower",
    y2: "baseline",
    y3: "baseline_with_battery",
    y4: "baseline_no_battery",
    y5: "batteryPower",
    label1: "Snaga prema mreži",
    label2: "Baseline",
    label3: "Baseline s baterijom",
    label4: "Baseline bez baterije",
    label5: "Snaga baterije"
}
]


// ---------------- Downsample history (15min buckets) ----------------

function downsampleHistory(data){

    const buckets = {}

    data.forEach(d => {

        const bucket = new Date(d.time)
        const m = bucket.getMinutes()
        const rounded = Math.floor(m/2)*2

        bucket.setMinutes(rounded,0,0)
        const key = bucket.getTime()

        if(!buckets[key]){
            buckets[key] = {
                time: bucket,
                count: 0,
                count_baseline: 0
            }
        }

        buckets[key].count++

        const isBaseline = ("baseline_no_battery" in d) || ("baseline_with_battery" in d)
        if (isBaseline) {
            buckets[key].count_baseline++
        }

        for (let k in d) {
            if (k === "time") continue

            if (buckets[key][k] === undefined) {
                buckets[key][k] = d[k]
            } else {
                buckets[key][k] += d[k]
            }
        }
    })

    return Object.values(buckets).map(b => { 

        const avg = {time:b.time}

        for(let k in b){
            if(k !== "time" && k !== "count"){                
                if (k == "baseline_no_battery" || k == "baseline_with_battery")
                    avg[k] = b[k] / (b.count_baseline) 
                else
                    avg[k] = b[k] / (b.count - b.count_baseline) 
            }
        }
        return avg

    }).sort((a,b)=>a.time-b.time)
}


const doubleTapZoomInPlugin = {
    id: 'doubleTapZoomIn',

    afterInit(chart) {
        let lastTap = 0;

        chart.canvas.addEventListener('touchend', (e) => {
            const now = Date.now();
            const delta = now - lastTap;

            if (delta > 0 && delta < 300) {

                const xScale = chart.scales.x;

                const min = xScale.min;
                const max = xScale.max;

                const range = max - min;

                // zoom in factor
                const zoomFactor = 0.7;

                const center = min + range / 2;
                const newRange = range * zoomFactor;

                chart.zoomScale(
                    'x',
                    {
                        min: center - newRange / 2,
                        max: center + newRange / 2
                    },
                    'default'
                );

                e.preventDefault();
            }

            lastTap = now;

        }, { passive: false });
    }
};


const aktivacijaBackgroundPlugin = {
    id: 'aktivacijaBackground',

    beforeDraw(chart) {

        if (
            chart.canvas.id !== "janitzaChart_3" &&
            chart.canvas.id !== "janitzaChart_4"
        ) return;

        const { ctx, chartArea } = chart;
        const rawData = chart.$rawData || [];

        if (!rawData.length) return;

        // use first visible dataset meta
        const meta = chart.getDatasetMeta(0);

        if (!meta?.data?.length) return;

        ctx.save();

        for (let i = 0; i < rawData.length; i++) {

            const point = rawData[i];
            if (!point) continue;

            if (point.aktivacija === 0) continue;

            const current = meta.data[i];
            const next = meta.data[i + 1];

            if (!current) continue;

            const x = current.x;
            const nextX = next ? next.x : chartArea.right;

            if (point.aktivacija_vrsta > 0) {
                ctx.fillStyle = "rgba(34, 201, 95, 0.3)";
            }
            else if (point.aktivacija_vrsta < 0) {
                ctx.fillStyle = "rgba(252, 4, 4, 0.3)";
            }
            else {
                continue;
            }

            ctx.fillRect(
                x,
                chartArea.top,
                nextX - x,
                chartArea.bottom - chartArea.top
            );
        }

        ctx.restore();
    }
};

// ---------------- Load history once ----------------

async function fetchHistory(){

    const res = await fetch('/get_graph_data')
    const data = await res.json()

    const parsed = data.map(d => ({
        ...d,
        time:new Date(d.time)
    }))

    historyData = downsampleHistory(parsed)

    
}


// ---------------- Fetch realtime point ----------------

async function fetchRealtimePoint(){

    const res = await fetch('/get_latest_realtime')
    const point = await res.json()

    if(!point.time) return

    realtimeData.push({
        ...point,
        time:new Date(point.time)
    })

    // keep only last x hours realtime
    const cutoff = Date.now() - 5*60*1000

    realtimeData = realtimeData.filter(
        p => p.time.getTime() >= cutoff
    )

}

// ---------------- Fetch prediction ----------------

async function fetchPrediction(){

    const res = await fetch('/get_prediction')
    const data = await res.json()

    const parsed = data.map(d => ({
        ...d,
        time:new Date(d.time)
    }))

    predictionData = parsed

}

const REALTIME_WINDOW = 5 * 60 * 1000

function getChartData(){

    const now = Date.now()
    const realtimeStart = now - REALTIME_WINDOW

    const history = historyData.filter(
        d => d.time.getTime() < realtimeStart
    )

    const realtime = realtimeData.filter(
        d => d.time.getTime() >= realtimeStart
    )

    return [...history, ...realtime]

}

function getChartDataCustom(){

    const now = Date.now()
    const sixHoursAgo = now - (6 * 60 * 60 * 1000); 

    const history = historyData.filter(
        d => d.time.getTime() < now && d.time.getTime() >= sixHoursAgo
    )

    const future = predictionData.filter(
        d => d.time.getTime() > now
    )

    return [...history, ...future]

}


//inicijalizacija chartova
function initCharts(){

    chartConfigs.forEach(cfg => {

        const ctx = document.getElementById(cfg.id).getContext('2d')
        if(cfg.id == "janitzaChart_3")
            charts[cfg.id] = new Chart(ctx, {

                type:'line',

                data:{
                    labels:[],
                    datasets:[
                    {
                        label:cfg.label1,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    },
                    {
                        label:cfg.label2,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    },
                    {
                        label:cfg.label3,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    },
                    {
                        label:cfg.label4,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    },
                    {
                        label:cfg.label5,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    }]
                },

                options:{
                    responsive:true,
                    maintainAspectRatio:false,

                    plugins:{
                        zoom:{
                            limits:{
                                x:{ minRange: 10 }
                            },
                            pan:{
                                enabled:true,
                                mode:'x'
                            },
                            zoom:{
                                wheel:{enabled:true},
                                pinch:{enabled:true}, 
                                mode:'x'
                            }
                        }
                    },

                    scales:{

                        x:{
                            ticks:{color:"#ffffff"},
                            grid:{color:"#97a9cc"}
                        },

                        y:{
                            min:cfg.min,
                            max:cfg.max,
                            ticks:{color:"#ffffff"},
                            grid:{color:"#97a9cc"}
                        }
                    }
                },
                plugins:[aktivacijaBackgroundPlugin, doubleTapZoomInPlugin]
            })
        else if(cfg.id == "janitzaChart_1")
            charts[cfg.id] = new Chart(ctx, {

                type:'line',

                data:{
                    labels:[],
                    datasets:[
                    {
                        label:cfg.label1,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    },
                    {
                        label:cfg.label2,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    },
                    {
                        label:cfg.label3,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    }]
                },

                options:{
                    responsive:true,
                    maintainAspectRatio:false,

                    plugins:{
                        zoom:{
                            limits:{
                                x:{ minRange: 10 }
                            },
                            pan:{
                                enabled:true,
                                mode:'x'
                            },
                            zoom:{
                                wheel:{enabled:true},
                                pinch:{enabled:true}, 
                                mode:'x'
                            }
                        }
                    },

                    scales:{

                        x:{
                            ticks:{color:"#ffffff"},
                            grid:{color:"#97a9cc"}
                        },

                        y:{
                            min:cfg.min,
                            max:cfg.max,
                            ticks:{color:"#ffffff"},
                            grid:{color:"#97a9cc"}
                        }
                    }
                },
                plugins:[doubleTapZoomInPlugin]
            })
        else
            charts[cfg.id] = new Chart(ctx, {

                type:'line',

                data:{
                    labels:[],
                    datasets:[
                    {
                        label:cfg.label1,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    },
                    {
                        label:cfg.label2,
                        data:[],
                        tension:0.3,
                        pointRadius:0
                    }]
                },

                options:{
                    responsive:true,
                    maintainAspectRatio:false,

                    plugins:{
                        zoom:{
                            limits:{
                                x:{ minRange: 10 }
                            },
                            pan:{
                                enabled:true,
                                mode:'x'
                            },
                            zoom:{
                                wheel:{enabled:true},
                                pinch:{enabled:true},
                                mode:'x'
                            }
                        }
                    },

                    scales:{

                        x:{
                            ticks:{color:"#ffffff"},
                            grid:{color:"#97a9cc"}
                        },

                        y:{
                            min:cfg.min,
                            max:cfg.max,
                            ticks:{color:"#ffffff"},
                            grid:{color:"#97a9cc"}
                        }
                    }
                },
                plugins: [aktivacijaBackgroundPlugin, doubleTapZoomInPlugin]
            })
    })
    chartConfigsCustom.forEach(cfg => {

        const ctx = document.getElementById(cfg.id).getContext('2d')

        charts[cfg.id] = new Chart(ctx, {

            type:'line',

            data:{
                labels:[],
                datasets:[
                {
                    label:cfg.label1,
                    data:[],
                    tension:0.3,
                    pointRadius:0
                },
                {
                    label:cfg.label2,
                    data:[],
                    tension:0.3,
                    pointRadius:0
                },
                {
                    label:cfg.label3,
                    data:[],
                    tension:0.3,
                    pointRadius:0,
                    hidden: true
                },
                {
                    label:cfg.label4,
                    data:[],
                    tension:0.3,
                    pointRadius:0
                },
                {
                    label:cfg.label5,
                    data:[],
                    tension:0.3,
                    pointRadius:0
                }]
            },

            options:{
                responsive:true,
                maintainAspectRatio:false,

                plugins:{
                    zoom:{
                        limits:{
                            x:{ minRange: 10 }
                        },
                        pan:{
                            enabled:true,
                            mode:'x'
                        },
                        zoom:{
                            wheel:{enabled:true},
                            pinch:{enabled:true},
                            mode:'x'
                        }
                    }
                },

                scales:{
                    
                    x:{
                        ticks:{color:"#ffffff"},
                        grid:{color:"#97a9cc"}
                    },

                    y:{
                        min:cfg.min,
                        max:cfg.max,
                        ticks:{color:"#ffffff"},
                        grid:{color:"#97a9cc"}
                    }
                }
            },
            plugins: [aktivacijaBackgroundPlugin, doubleTapZoomInPlugin]
        })

    })
}

function updateCharts(){

    const dataset = getChartData()

    const labels = dataset.map(d =>
        d.time.toLocaleTimeString('hr-HR',{hour12:false})
    )

    chartConfigs.forEach(cfg => {

        const chart = charts[cfg.id]
        if(!chart) return
        
        chart.$rawData = dataset;

        chart.data.labels = labels
        chart.data.datasets[0].data = dataset.map(d => d[cfg.y1])
        chart.data.datasets[1].data = dataset.map(d => d[cfg.y2])
        
        if(cfg.id == "janitzaChart_1"){
            chart.data.datasets[2].data = dataset.map(d => d[cfg.y3])
        }
        if(cfg.id == "janitzaChart_3"){
            chart.data.datasets[2].data = dataset.map(d => d[cfg.y3])
            chart.data.datasets[3].data = dataset.map(d => d[cfg.y4])
            chart.data.datasets[4].data = dataset.map(d => d[cfg.y5])
        }

        chart.update('none')

    })
    updateChartsCustom()
}

function updateChartsCustom(){
    
    const dataset = getChartDataCustom()

    const labels = dataset.map(d =>
        d.time.toLocaleTimeString('hr-HR',{hour12:false})
    )

    chartConfigsCustom.forEach(cfg => {

        const chart = charts[cfg.id]
        if(!chart) return

        chart.$rawData = dataset;
        
        chart.data.labels = labels       
        chart.data.datasets[0].data = dataset.map(d => d[cfg.y1] ?? null)
        chart.data.datasets[1].data = dataset.map(d => d[cfg.y2] ?? null)
        chart.data.datasets[2].data = dataset.map(d => d[cfg.y3] ?? null)
        chart.data.datasets[3].data = dataset.map(d => d[cfg.y4] ?? null)
        chart.data.datasets[4].data = dataset.map(d => d[cfg.y5] ?? null)

        chart.update('none')

    })
}


const radios = document.querySelectorAll('input[name="viewMode"]');

radios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            const chartPower = document.getElementById('chart_power');
            const chartProduction = document.getElementById('chart_production');
            const chartConsuption = document.getElementById('chart_consuption');
            const chartSOC = document.getElementById('chart_SOC');
            const chartBaseline = document.getElementById('chart_baseline');	
            chartPower.style.display = 'none';      
            chartProduction.style.display = 'none';      
            chartConsuption.style.display = 'none';    
            chartSOC.style.display = 'none';   
            chartBaseline.style.display = 'none';   
            switch (radio.value) {
                case 'power':                
                    chartPower.style.display = 'block';              
                break;
                case 'production':
                    chartProduction.style.display = 'block';           
                break;
                case 'consuption': 
                    chartConsuption.style.display = 'block';  
                break;
                case 'soc': 
                    chartSOC.style.display = 'block';  
                break;
                case 'baseline': 
                    chartBaseline.style.display = 'block';  
                break;
            }
        }
    });
});
    

function setReadOnlyGrid() {

    const baterija_flag = backend_map["M_baterija_postoji_flag"].value;
    const agregator_flag = backend_map["M_vrsta_agregatora"].value;
    
    if(baterija_flag == 0){
        document.getElementById("Baterija_grid").classList.add("readonly-section");
    }

    if(agregator_flag == 0){
        document.getElementById("Agregiranje_grid").classList.add("readonly-section");
    }

}