const state = {
  energy: 5,
  emotion: [],
  body: [],
  need: null,
  strategy: null
};

const screens = document.querySelectorAll(".screen");

function showScreen(name) {
  screens.forEach(s => {
    s.classList.toggle("active", s.dataset.screen === name);
  });
  updateDebug();
}

document.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  // Navigation
  if (btn.dataset.next) {
    showScreen(btn.dataset.next);
  }

  // Multi-select
  if (btn.dataset.type) {
    btn.classList.toggle("selected");
    const arr = state[btn.dataset.type];
    const val = btn.dataset.value;
    if (arr.includes(val)) {
      state[btn.dataset.type] = arr.filter(v => v !== val);
    } else {
      arr.push(val);
    }
  }

  // Single select need
  if (btn.dataset.type === "need") {
    state.need = btn.dataset.value;
  }

  // Strategies
  if (btn.dataset.strategy) {
    state.strategy = btn.dataset.strategy;
    showStrategy(btn.dataset.strategy);
  }

  // Debug toggle
  if (btn.id === "debugToggle") {
    document.getElementById("debugOverlay").classList.toggle("hidden");
  }
});

// Energy slider
const slider = document.getElementById("energySlider");
const energyValue = document.getElementById("energyValue");

slider.addEventListener("input", () => {
  state.energy = slider.value;
  energyValue.textContent = slider.value;
  updateDebug();
});

// Strategy info
function showStrategy(id) {
  const panel = document.getElementById("strategyPanel");
  const title = document.getElementById("strategyTitle");
  const when = document.getElementById("strategyWhen");
  const how = document.getElementById("strategyHow");

  const strategies = {
    "wall-pushups": {
      title: "Do Wall Push-Ups",
      when: "When: Can't stop moving, hard to focus",
      how: "Find a wall. Place hands on wall. Bend elbows, push, release. Repeat."
    },
    "jumping": {
      title: "Jump Around",
      when: "When: Feeling wiggly, too much energy",
      how: "Find a safe space. Jump 5 times or for 2 minutes."
    },
    "burrito": {
      title: "Wrap Up Like a Burrito",
      when: "When: Feeling overwhelmed or restless",
      how: "Wrap tightly in a blanket with help. Roll gently."
    }
  };

  const s = strategies[id];
  title.textContent = s.title;
  when.textContent = s.when;
  how.textContent = s.how;
  panel.classList.remove("hidden");
}

// Summary
function updateDebug() {
  document.getElementById("debugOutput").textContent =
    JSON.stringify(state, null, 2);
}
