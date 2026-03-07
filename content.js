(function () {
  "use strict";
  const ROOT_ID = "bdc-tools-root";
  const MENU_CLASS = "bdc-tools-menu";
  const SEEK = 5;
  const SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  let indTimer, obsTimer;
  const css = `
    #bdc-speed-indicator { position:absolute; right:8px; background:rgba(0,0,0,.75); color:white; padding:4px 8px; border-radius:4px; font:bold 14px sans-serif; z-index:9999; pointer-events:none; opacity:0; transition:opacity .2s ease-out; }
    .${MENU_CLASS} { position:absolute; bottom:50px; right:0; background:rgba(0,0,0,.8); padding:10px; min-width:180px; border-radius:5px; z-index:9999; display:none; color:white; }
    .${MENU_CLASS} div { display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
    .${MENU_CLASS} label { width:56px; text-align:right; margin-right:10px; }
    .${MENU_CLASS} button { margin:0 2px; cursor:pointer; }
    #${ROOT_ID} { background:none; border:none; color:white; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; width:28px; height:28px; padding:0; margin-right:8px; }
  `;
  const el = (tag, props = {}) =>
    Object.assign(document.createElement(tag), props);
  function getVid() {
    const vids = [...document.querySelectorAll("video")].filter(
      (v) => v.offsetWidth > 0 && v.offsetHeight > 0,
    );
    return (
      vids.find((v) => !v.paused && v.readyState >= 2) ||
      vids.sort(
        (a, b) =>
          b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight,
      )[0]
    );
  }
  function fwd(v, amt) {
    if (v) {
      v.currentTime = Math.max(
        0,
        Math.min(v.duration || Infinity, v.currentTime + amt),
      );
    }
  }
  function showInd(speed) {
    const v = getVid();
    if (!v) {
      return;
    }
    const isFS = document.fullscreenElement;
    let cont =
      (isFS && isFS.contains(v) && isFS) ||
      v.closest(".txp_player, .player_container, .txp_video_container") ||
      v.parentElement ||
      document.body;
    let ind = cont.querySelector("#bdc-speed-indicator");
    if (!ind) {
      ind = el("div", { id: "bdc-speed-indicator" });
      if (window.getComputedStyle(cont).position === "static") {
        cont.style.position = "relative";
      }
      cont.appendChild(ind);
    }
    const prog = cont.querySelector(".txp_progress");
    let bot = prog
      ? cont.getBoundingClientRect().bottom -
        prog.getBoundingClientRect().top +
        (isFS ? 8 : 70)
      : isFS
        ? 18
        : 70;
    ind.style.bottom = `${
      Number.isFinite(bot) && bot >= 0 ? bot : isFS ? 18 : 70
    }px`;
    ind.textContent = `${speed.toFixed(2)}x`;
    clearTimeout(indTimer);
    ind.style.opacity = 1;
    indTimer = setTimeout(() => {
      ind.style.opacity = 0;
    }, 800);
  }
  function applyDyn() {
    const g = document.getElementById("guiltyDetail");
    const n = document.getElementById("notSureReason");
    if (g) {
      g.placeholder =
        "Please provide a detailed description of the violation (maximum 50 characters)";
    }
    if (n) {
      n.placeholder =
        "Insufficient supplementary evidence (maximum 50 characters)";
    }
    document.querySelectorAll(".watermark span").forEach((s) => {
      s.style.display = "none";
    });
  }
  function init() {
    if (document.getElementById(ROOT_ID)) {
      return;
    }
    const right = document.querySelector(".txp_right_controls");
    if (!right) {
      return;
    }
    if (!document.getElementById("bdc-styles")) {
      document.head.appendChild(
        el("style", { id: "bdc-styles", textContent: css }),
      );
    }
    const btn = el("button", { id: ROOT_ID, innerText: "⚙️" });
    const menu = el("div", { className: MENU_CLASS });
    const sel = el("select", {
      innerHTML: SPEEDS.map(
        (s) =>
          `<option value="${s}" ${s === 1 ? "selected" : ""}>${s}x</option>`,
      ).join(""),
    });
    sel.onchange = (e) => {
      const v = getVid();
      if (v) {
        v.playbackRate = +e.target.value;
        showInd(v.playbackRate);
      }
    };
    const row = (lbl, child) => {
      const d = el("div");
      d.append(el("label", { innerText: lbl }), child);
      return d;
    };
    menu.append(row("Speed:", sel));
    const frameBox = el("div");
    [
      ["<<", -1 / 30],
      [">>", 1 / 30],
    ].forEach(([t, a]) => {
      frameBox.append(
        el("button", {
          innerText: t,
          onclick: (e) => {
            e.stopPropagation();
            const v = getVid();
            if (v) {
              v.pause();
              fwd(v, a);
            }
          },
        }),
      );
    });
    menu.append(row("Frame:", frameBox));
    const utilBox = el("div");
    [
      [
        "|<",
        "Start",
        () => {
          const v = getVid();
          if (v) {
            v.currentTime = 0;
          }
        },
      ],
      ["«", `-${SEEK}s`, () => fwd(getVid(), -SEEK)],
      ["»", `+${SEEK}s`, () => fwd(getVid(), SEEK)],
    ].forEach(([t, title, fn]) => {
      utilBox.append(
        el("button", {
          innerText: t,
          title,
          onclick: (e) => {
            e.stopPropagation();
            fn();
          },
        }),
      );
    });
    menu.append(row("Util:", utilBox));
    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const v = getVid();
      if (v) {
        sel.value = String(v.playbackRate);
      }
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    };
    right.insertBefore(btn, right.firstChild);
    right.appendChild(menu);
  }
  if (!window.bdcKeyHandler) {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(`#${ROOT_ID}`)) {
        document.querySelectorAll(`.${MENU_CLASS}`).forEach((m) => {
          if (!m.contains(e.target)) {
            m.style.display = "none";
          }
        });
      }
    });
    document.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
        return;
      }
      const v = getVid();
      if (!v) {
        return;
      }
      const sel = document.querySelector(`.${MENU_CLASS} select`);
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        fwd(v, -SEEK);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        fwd(v, SEEK);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const idx = SPEEDS.indexOf(v.playbackRate);
        const currIdx = idx !== -1 ? idx : SPEEDS.indexOf(1);
        const nextIdx =
          e.key === "ArrowUp"
            ? Math.min(SPEEDS.length - 1, currIdx + 1)
            : Math.max(0, currIdx - 1);

        if (currIdx !== nextIdx) {
          const newSpd = SPEEDS[nextIdx];
          v.playbackRate = newSpd;
          if (sel) {
            sel.value = String(newSpd);
          }
          showInd(newSpd);
        }
      } else if (e.key === " ") {
        e.preventDefault();
        if (v.paused) {
          v.play();
        } else {
          v.pause();
        }
      }
    });
    window.bdcKeyHandler = true;
  }
  new MutationObserver(() => {
    clearTimeout(obsTimer);
    obsTimer = setTimeout(() => {
      init();
      applyDyn();
    }, 120);
  }).observe(document.body, { childList: true, subtree: true });
  init();
  applyDyn();
})();
