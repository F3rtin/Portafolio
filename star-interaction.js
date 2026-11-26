const starRotator = document.getElementById("starRotator");
const turnLeft = document.getElementById("turnLeft");
const turnRight = document.getElementById("turnRight");
const turnStatus = document.getElementById("turnStatus");
const projectFrame = document.querySelector(".project-frame");
const projectDetails = document.getElementById("projectDetails");
const projectPanels = Array.from(projectDetails.querySelectorAll(".project-panel"));
const armStep = 72;
let rotation = 0;
let activeProjectIndex = 0;
let pendingDirection = 0;
let isTurning = false;
let turnStage = "idle";
let turnSafetyTimer = null;
let firstScrollPending = true;
let keepNebulaAtTop = false;
let wheelGestureBlocked = false;
let wheelGestureTimer;
let touchStartY = null;
let touchGestureBlocked = false;
let blockedScrollKey = null;

const slideTargets = document.querySelectorAll(".text-section");

function updateProjectMedia(panel, shouldPlay) {
  panel.querySelectorAll("video").forEach((video) => {
    if (!shouldPlay) {
      video.pause();
      return;
    }

    video.play().catch(() => {
      turnStatus.textContent = `No se pudo reproducir el video de ${panel.querySelector("h2").textContent}.`;
    });
  });
}

if ("IntersectionObserver" in window) {
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle(
        "is-visible",
        entry.isIntersecting && entry.intersectionRatio >= 0.5
      );
    });
  }, { threshold: [0, 0.5] });

  slideTargets.forEach((target) => slideObserver.observe(target));
} else {
  slideTargets.forEach((target) => target.classList.add("is-visible"));
}

function parseCssDurationMs(rawValue, fallbackMs) {
  const trimmed = rawValue.trim();
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) {
    return fallbackMs;
  }
  return trimmed.endsWith("ms") || !trimmed.endsWith("s") ? parsed : parsed * 1000;
}

function swapActiveProjectPanel() {
  if (turnStage !== "leaving") {
    return;
  }

  turnStage = "entering";
  const leavingClass = pendingDirection > 0
    ? "is-leaving-forward"
    : "is-leaving-backward";
  projectDetails.classList.remove(leavingClass);
  projectPanels[activeProjectIndex].hidden = true;
  activeProjectIndex = (
    activeProjectIndex + pendingDirection + projectPanels.length
  ) % projectPanels.length;
  projectPanels[activeProjectIndex].hidden = false;
  updateProjectMedia(projectPanels[activeProjectIndex], true);

  const enteringClass = pendingDirection > 0
    ? "is-entering-forward"
    : "is-entering-backward";
  projectDetails.classList.add(enteringClass);
  void projectDetails.offsetWidth;
  window.requestAnimationFrame(() => {
    projectDetails.classList.remove(enteringClass);
  });

  turnStatus.textContent = `Proyecto ${projectPanels[activeProjectIndex].querySelector("h2").textContent}.`;
  window.clearTimeout(turnSafetyTimer);
  turnSafetyTimer = window.setTimeout(finishTurn, 800);
}

function finishTurn() {
  window.clearTimeout(turnSafetyTimer);
  turnSafetyTimer = null;
  projectDetails.classList.remove(
    "is-leaving-forward",
    "is-leaving-backward",
    "is-entering-forward",
    "is-entering-backward"
  );
  turnStage = "idle";
  isTurning = false;
}

function turnStar(direction) {
  if (isTurning || projectPanels.length < 2) {
    return;
  }

  isTurning = true;
  turnStage = "leaving";
  pendingDirection = direction;
  updateProjectMedia(projectPanels[activeProjectIndex], false);
  projectDetails.classList.add(
    direction > 0 ? "is-leaving-forward" : "is-leaving-backward"
  );
  rotation += direction * armStep;
  starRotator.style.setProperty("--rotation", `${rotation}deg`);
  turnStatus.textContent = direction < 0
    ? "La estrella gira a la izquierda."
    : "La estrella gira a la derecha.";

  window.clearTimeout(turnSafetyTimer);
  turnSafetyTimer = window.setTimeout(() => {
    swapActiveProjectPanel();
    finishTurn();
  }, 2200);
}

starRotator.addEventListener("transitionend", (event) => {
  if (event.target !== starRotator || event.propertyName !== "transform" || turnStage !== "leaving") {
    return;
  }

  swapActiveProjectPanel();
});

projectDetails.addEventListener("transitionend", (event) => {
  if (
    event.target === projectDetails
    && event.propertyName === "opacity"
    && turnStage === "entering"
    && !projectDetails.classList.contains("is-leaving-forward")
    && !projectDetails.classList.contains("is-leaving-backward")
  ) {
    finishTurn();
  }
});

projectDetails.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const artwork = event.target.closest(".project-artwork");
  if (!(artwork instanceof HTMLButtonElement)) {
    return;
  }

  const artworkGroup = artwork.closest(".project-artworks");
  if (!artworkGroup || artworkGroup.classList.contains("is-swapping")) {
    return;
  }

  const outgoing = artworkGroup.querySelector(".project-artwork.is-front");
  const incoming = artworkGroup.querySelector(".project-artwork.is-behind");
  if (!outgoing || !incoming) {
    return;
  }

  artworkGroup.classList.add("is-swapping");
  const swapDuration = parseCssDurationMs(
    window.getComputedStyle(outgoing).getPropertyValue("--artwork-swap-duration"),
    700
  );
  outgoing.classList.add("is-swapping-out");
  incoming.classList.add("is-swapping-in");
  window.setTimeout(() => {
    outgoing.classList.remove("is-front", "is-swapping-out");
    outgoing.classList.add("is-behind");
    incoming.classList.remove("is-behind", "is-swapping-in");
    incoming.classList.add("is-front");
    outgoing.setAttribute("aria-pressed", "false");
    incoming.setAttribute("aria-pressed", "true");
    artworkGroup.classList.remove("is-swapping");
  }, swapDuration);
});

turnLeft.addEventListener("click", () => turnStar(-1));
turnRight.addEventListener("click", () => turnStar(1));
updateProjectMedia(projectPanels[activeProjectIndex], true);

function isStarSectionActive() {
  const activeElement = document.activeElement;
  if (
    activeElement instanceof Element
    && (
      activeElement === turnLeft
      || activeElement === turnRight
      || projectDetails.contains(activeElement)
    )
  ) {
    return true;
  }

  if (!projectFrame) {
    return false;
  }

  const rect = projectFrame.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.35;
}

window.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || !isStarSectionActive()) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    turnStar(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    turnStar(1);
  }
});

function updateNebulaReveal() {
  if (window.scrollY > 0) {
    firstScrollPending = false;
    keepNebulaAtTop = false;
    document.body.classList.add("nebula-revealed");
  } else if (!keepNebulaAtTop) {
    firstScrollPending = true;
    document.body.classList.remove("nebula-revealed");
  }
}

function revealNebulaAtTop() {
  firstScrollPending = false;
  keepNebulaAtTop = true;
  document.body.classList.add("nebula-revealed");
}

function handleFirstWheelGesture(event) {
  if (wheelGestureBlocked) {
    event.preventDefault();
    window.clearTimeout(wheelGestureTimer);
    wheelGestureTimer = window.setTimeout(() => {
      wheelGestureBlocked = false;
    }, 220);
    return;
  }

  if (!firstScrollPending || event.deltaY <= 0 || window.scrollY > 0 || event.ctrlKey || event.metaKey) {
    return;
  }

  event.preventDefault();
  wheelGestureBlocked = true;
  revealNebulaAtTop();
  wheelGestureTimer = window.setTimeout(() => {
    wheelGestureBlocked = false;
  }, 220);
}

function handleFirstTouchGesture(event) {
  const touch = event.touches[0];
  if (!touch) {
    return;
  }

  if (touchGestureBlocked) {
    event.preventDefault();
    return;
  }

  if (firstScrollPending && window.scrollY === 0 && touchStartY !== null && touchStartY - touch.clientY > 8) {
    event.preventDefault();
    touchGestureBlocked = true;
    revealNebulaAtTop();
  }
}

function handleFirstScrollKey(event) {
  const scrollingDownKeys = ["ArrowDown", "PageDown", "End", " ", "Spacebar"];
  const target = event.target;
  const isTextEntry = target instanceof HTMLElement
    && (target.isContentEditable || target.matches("input, select, textarea"));
  const spaceActivatesControl = event.key === " " && target instanceof HTMLElement
    && target.matches("button, input, select, textarea, a[href]");

  if (blockedScrollKey === event.key) {
    event.preventDefault();
    return;
  }

  if (
    firstScrollPending
    && window.scrollY === 0
    && scrollingDownKeys.includes(event.key)
    && !isTextEntry
    && !spaceActivatesControl
    && !event.altKey
    && !event.ctrlKey
    && !event.metaKey
  ) {
    event.preventDefault();
    blockedScrollKey = event.key;
    revealNebulaAtTop();
  }
}

window.addEventListener("scroll", () => {
  if (firstScrollPending && window.scrollY > 0) {
    revealNebulaAtTop();
    window.scrollTo(0, 0);
    return;
  }

  updateNebulaReveal();
}, { passive: true });
window.addEventListener("wheel", handleFirstWheelGesture, { passive: false });
window.addEventListener("touchstart", (event) => {
  touchStartY = event.touches.length ? event.touches[0].clientY : null;
  touchGestureBlocked = false;
}, { passive: true });
window.addEventListener("touchmove", handleFirstTouchGesture, { passive: false });
function resetTouchGesture() {
  touchStartY = null;
  touchGestureBlocked = false;
}

window.addEventListener("touchend", resetTouchGesture, { passive: true });
window.addEventListener("touchcancel", resetTouchGesture, { passive: true });
window.addEventListener("keydown", handleFirstScrollKey);
window.addEventListener("keyup", (event) => {
  if (blockedScrollKey === event.key) {
    blockedScrollKey = null;
  }
});
window.addEventListener("blur", () => {
  blockedScrollKey = null;
});
window.addEventListener("pageshow", updateNebulaReveal);
updateNebulaReveal();
