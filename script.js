// --- DOUBLE ELIMINATION BRACKET JS SCRIPT ---

const filled = {};
const losses = {};
const eliminated = new Set();

const matchups = {
  // ROUND 1
  south: { winnerSlot: "G9_1", loserSlot: "G7_1", opponent: "troy" },
  troy:  { winnerSlot: "G9_1", loserSlot: "G7_1", opponent: "south" },
  txst:  { winnerSlot: "G9_2", loserSlot: "G7_2", opponent: "ul" },
  ul:    { winnerSlot: "G9_2", loserSlot: "G7_2", opponent: "txst" },
  mu:    { winnerSlot: "G10_1", loserSlot: "G8_1", opponent: "gs" },
  gs:    { winnerSlot: "G10_1", loserSlot: "G8_1", opponent: "mu" },
  jmu:   { winnerSlot: "G10_2", loserSlot: "G8_2", opponent: "odu" },
  odu:   { winnerSlot: "G10_2", loserSlot: "G8_2", opponent: "jmu" },

  // LOSER BRACKET
  G7_1: { winnerSlot: "G11_1", loserSlot: null, opponent: "G7_2" },
  G7_2: { winnerSlot: "G11_1", loserSlot: null, opponent: "G7_1" },
  G8_1: { winnerSlot: "G12_1", loserSlot: null, opponent: "G8_2" },
  G8_2: { winnerSlot: "G12_1", loserSlot: null, opponent: "G8_1" },
  G11_1: { winnerSlot: "G13_2", loserSlot: null, opponent: "G11_2" },
  G11_2: { winnerSlot: "G13_2", loserSlot: null, opponent: "G11_1" },

  // WINNER BRACKET ADVANCEMENT
  G9_1: { winnerSlot: "G13_1", loserSlot: "G11_2", opponent: "G9_2" },
  G9_2: { winnerSlot: "G13_1", loserSlot: "G11_2", opponent: "G9_1" },
  G10_1: { winnerSlot: "G14_1", loserSlot: "G12_2", opponent: "G10_2" },
  G10_2: { winnerSlot: "G14_1", loserSlot: "G12_2", opponent: "G10_1" },
  G12_1: { winnerSlot: "G14_2", loserSlot: null, opponent: "G12_2" },
  G12_2: { winnerSlot: "G14_2", loserSlot: null, opponent: "G12_1" },

  G13_1: { winnerSlot: "finalL", loserSlot: null, opponent: "G13_2" },
  G13_2: { winnerSlot: "finalL", loserSlot: null, opponent: "G13_1" },
  G14_1: { winnerSlot: "finalR", loserSlot: null, opponent: "G14_2" },
  G14_2: { winnerSlot: "finalR", loserSlot: null, opponent: "G14_1" },

  // FINAL
  finalL: { winnerSlot: "final", loserSlot: null, opponent: "finalR" },
  finalR: { winnerSlot: "final", loserSlot: null, opponent: "finalL" },
};

const winSound = new Audio("win.mp3");

function registerAllClickEvents() {
  Object.keys(matchups).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => handleClick(id, el.src));
    }
  });
}

function handleClick(teamId, src) {
  if (eliminated.has(teamId)) return;
  const match = matchups[teamId];
  if (!match) return;

  const winnerSlot = document.getElementById(match.winnerSlot);
  const loserSlot = match.loserSlot ? document.getElementById(match.loserSlot) : null;
  const opponent = match.opponent;

  if (filled[match.winnerSlot] && filled[match.winnerSlot] !== teamId) return;

  if (winnerSlot) {
    winnerSlot.src = src;
    filled[match.winnerSlot] = teamId;
    winnerSlot.classList.add("winner-glow", "slam");
    winSound.play();
    setTimeout(() => registerClickForSlot(match.winnerSlot, teamId, src), 10);
  }

  if (opponent && match.loserSlot && !filled[match.loserSlot]) {
    const opponentEl = document.getElementById(opponent);
    if (opponentEl && opponentEl.src) {
      loserSlot.src = opponentEl.src;
      filled[match.loserSlot] = opponent;
      losses[opponent] = (losses[opponent] || 0) + 1;
      if (losses[opponent] >= 2) eliminated.add(opponent);
      setTimeout(() => registerClickForSlot(match.loserSlot, opponent, opponentEl.src), 10);

      losses[teamId] = (losses[teamId] || 0) + 1;
      if (losses[teamId] >= 2) eliminated.add(teamId);
      setTimeout(() => registerClickForSlot(match.loserSlot, teamId, src), 10);
    }
  }

  if (match.winnerSlot === "final") {
    winnerSlot.classList.add("champion");
    confetti({
      particleCount: 500,
      spread: 160,
      startVelocity: 60,
      origin: { y: 0.6 }
    });
  }
}

function registerClickForSlot(slotId, teamId, src) {
  const el = document.getElementById(slotId);
  if (!el) return;

  el.addEventListener("click", () => {
    const match = matchups[slotId];
    if (!match || (filled[match.winnerSlot] && filled[match.winnerSlot] !== teamId)) return;

    const winnerEl = document.getElementById(match.winnerSlot);
    if (winnerEl) {
      winnerEl.src = src;
      filled[match.winnerSlot] = teamId;
      winnerEl.classList.add("winner-glow");
      winSound.play();
      registerClickForSlot(match.winnerSlot, teamId, src);

      if (match.opponent && match.loserSlot && !filled[match.loserSlot]) {
        const oppEl = document.getElementById(match.opponent);
        if (oppEl && oppEl.src) {
          filled[match.loserSlot] = match.opponent;
          losses[match.opponent] = (losses[match.opponent] || 0) + 1;
          if (losses[match.opponent] >= 2) eliminated.add(match.opponent);

          const loserEl = document.getElementById(match.loserSlot);
          if (loserEl) {
            loserEl.src = oppEl.src;
            registerClickForSlot(match.loserSlot, match.opponent, oppEl.src);
          }
        }
      }

      if (match.winnerSlot === "final") {
        winnerEl.classList.add("winner");
        confetti({
          particleCount: 500,
          spread: 160,
          startVelocity: 60,
          origin: { y: 0.6 }
        });
      }
    }
  });
}

function resetBracket() {
  const keep = ["south", "troy", "txst", "ul", "mu", "gs", "jmu", "odu"];
  document.querySelectorAll(".team").forEach(el => {
    if (!keep.includes(el.id)) {
      el.src = "";
      el.classList.remove("winner", "winner-glow", "champion", "slam");
    }
  });
  Object.keys(filled).forEach(k => filled[k] = false);
  eliminated.clear();
  Object.keys(losses).forEach(k => (losses[k] = 0));
}

function enableEditMode() {
  const targets = document.querySelectorAll('.team');

  targets.forEach(el => {
    el.style.pointerEvents = 'auto';
    el.style.border = '1px dashed red';
    el.draggable = true;

    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', null);
      el.startX = e.clientX;
      el.startY = e.clientY;
    });

    el.addEventListener('dragend', e => {
      const parent = el.closest('.bracket-container');
      const deltaX = e.clientX - el.startX;
      const deltaY = e.clientY - el.startY;

      const parentRect = parent.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const leftPercent = ((elRect.left + deltaX - parentRect.left + elRect.width / 2) / parentRect.width) * 100;
      const topPercent = ((elRect.top + deltaY - parentRect.top + elRect.height / 2) / parentRect.height) * 100;

      el.style.left = `${leftPercent.toFixed(2)}%`;
      el.style.top = `${topPercent.toFixed(2)}%`;

      console.log(`"${el.id}": top: ${topPercent.toFixed(2)}%; left: ${leftPercent.toFixed(2)}%;`);
    });
  });
}

registerAllClickEvents();
