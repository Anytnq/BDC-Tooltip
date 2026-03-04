(function () {
  "use strict";
  const ROOT_ID = "bdc-tools-root";
  const MENU_CLASS = "bdc-tools-menu";
  const OBSERVER_DEBOUNCE_MS = 120;
  const SEEK_TIME_SECONDS = 5;
  let hasGlobalMenuClickHandler = false;
  let refreshTimer = null;
  function getActiveVideo() {
    const videos = Array.from(document.querySelectorAll("video"));
    if (!videos.length) {
      return null;
    }
    const visibleVideos = videos.filter((video) => {
      const rect = video.getBoundingClientRect();
      const style = window.getComputedStyle(video);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none"
      );
    });
    const candidates = visibleVideos.length ? visibleVideos : videos;
    const playingVideo = candidates.find(
      (video) => !video.paused && !video.ended && video.readyState >= 2,
    );
    if (playingVideo) {
      return playingVideo;
    }
    return candidates.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return rectB.width * rectB.height - rectA.width * rectA.height;
    })[0];
  }
  function clampTime(video, time) {
    if (!Number.isFinite(time)) {
      return video.currentTime;
    }
    const maxTime = Number.isFinite(video.duration) ? video.duration : Infinity;
    return Math.max(0, Math.min(maxTime, time));
  }
  function stopEventBubble(element) {
    [
      "mousedown",
      "mouseup",
      "click",
      "dblclick",
      "pointerdown",
      "pointerup",
    ].forEach((eventName) => {
      element.addEventListener(eventName, (event) => {
        event.stopPropagation();
      });
    });
  }
  function applyDynamicEnhancements() {
    const guiltyDetail = document.getElementById("guiltyDetail");
    if (guiltyDetail) {
      guiltyDetail.placeholder =
        "Please provide a detailed description of the violation (maximum 50 characters)";
    }
    const notSureReason = document.getElementById("notSureReason");
    if (notSureReason) {
      notSureReason.placeholder =
        "Insufficient supplementary evidence (maximum 50 characters)";
    }
    const watermarkSpans = document.querySelectorAll(".watermark span");
    watermarkSpans.forEach((watermarkSpan) => {
      watermarkSpan.style.display = "none";
    });
  }
  function initialize() {
    if (document.getElementById(ROOT_ID)) {
      return;
    }
    const controlsContainer = document.querySelector(".txp_center_controls");
    const rightControls = document.querySelector(".txp_right_controls");
    if (controlsContainer && rightControls) {
      const speedLabel = document.createElement("label");
      speedLabel.innerText = "Speed:";
      speedLabel.style.color = "white";
      speedLabel.style.display = "inline-block";
      speedLabel.style.width = "56px";
      speedLabel.style.textAlign = "right";
      speedLabel.style.margin = "0 10px 0 0";
      const speedSelector = document.createElement("select");
      const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
      speeds.forEach((speed) => {
        const option = document.createElement("option");
        option.value = speed;
        option.innerText = `${speed}x`;
        if (speed === 1.0) {
          option.selected = true;
        }
        speedSelector.appendChild(option);
      });
      speedSelector.addEventListener("change", (event) => {
        const activeVideo = getActiveVideo();
        if (!activeVideo) {
          return;
        }
        activeVideo.playbackRate = parseFloat(event.target.value);
      });
      speedSelector.style.marginLeft = "5px";
      const settingsButton = document.createElement("button");
      settingsButton.innerText = "⚙️";
      settingsButton.style.background = "none";
      settingsButton.style.border = "none";
      settingsButton.style.color = "white";
      settingsButton.style.fontSize = "20px";
      settingsButton.style.width = "28px";
      settingsButton.style.height = "28px";
      settingsButton.style.cursor = "pointer";
      settingsButton.style.padding = "0";
      settingsButton.style.marginRight = "8px";
      settingsButton.style.display = "flex";
      settingsButton.style.alignItems = "center";
      settingsButton.style.justifyContent = "center";
      settingsButton.id = ROOT_ID;
      rightControls.insertBefore(settingsButton, rightControls.firstChild);
      const settingsMenu = document.createElement("div");
      settingsMenu.style.position = "absolute";
      settingsMenu.style.bottom = "50px";
      settingsMenu.style.right = "0";
      settingsMenu.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      settingsMenu.style.padding = "10px";
      settingsMenu.style.minWidth = "180px";
      settingsMenu.style.borderRadius = "5px";
      settingsMenu.style.zIndex = "9999";
      settingsMenu.style.display = "none";
      settingsMenu.classList.add(MENU_CLASS);
      rightControls.appendChild(settingsMenu);
      stopEventBubble(settingsButton);
      stopEventBubble(settingsMenu);
      const syncSpeed = () => {
        const activeVideo = getActiveVideo();
        if (!activeVideo) {
          return;
        }
        speedSelector.value = String(activeVideo.playbackRate);
      };
      settingsButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        syncSpeed();
        settingsMenu.style.display =
          settingsMenu.style.display === "none" ? "block" : "none";
      });
      if (!hasGlobalMenuClickHandler) {
        document.addEventListener("click", (e) => {
          const clickedButton = e.target.closest(`#${ROOT_ID}`);
          if (clickedButton) {
            return;
          }
          const menus = document.querySelectorAll(`.${MENU_CLASS}`);
          menus.forEach((menu) => {
            if (!menu.contains(e.target)) {
              menu.style.display = "none";
            }
          });
        });
        hasGlobalMenuClickHandler = true;
      }
      if (!hasGlobalKeydownHandler) {
        document.addEventListener("keydown", (event) => {
          if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
          ) {
            return;
          }
          const video = getActiveVideo();
          if (!video) {
            return;
          }
          switch (event.key) {
            case "ArrowLeft":
              event.preventDefault();
              video.currentTime = clampTime(
                video,
                video.currentTime - SEEK_TIME_SECONDS,
              );
              break;
            case "ArrowRight":
              event.preventDefault();
              video.currentTime = clampTime(
                video,
                video.currentTime + SEEK_TIME_SECONDS,
              );
              break;
          }
        });
        hasGlobalKeydownHandler = true;
      }
      const speedContainer = document.createElement("div");
      speedContainer.style.display = "flex";
      speedContainer.style.alignItems = "center";
      speedContainer.style.justifyContent = "center";
      speedContainer.style.marginBottom = "10px";
      speedContainer.appendChild(speedLabel);
      speedContainer.appendChild(speedSelector);
      settingsMenu.appendChild(speedContainer);
      const frameStep = 1 / 30;
      const frameControls = document.createElement("div");
      frameControls.style.display = "flex";
      frameControls.style.alignItems = "center";
      frameControls.style.justifyContent = "center";
      frameControls.style.marginBottom = "10px";
      const frameLabel = document.createElement("label");
      frameLabel.innerText = "Frame:";
      frameLabel.style.color = "white";
      frameLabel.style.display = "inline-block";
      frameLabel.style.width = "56px";
      frameLabel.style.textAlign = "right";
      frameLabel.style.marginRight = "10px";
      frameControls.appendChild(frameLabel);
      const frameBackButton = document.createElement("button");
      frameBackButton.innerText = "<<";
      frameBackButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const activeVideo = getActiveVideo();
        if (!activeVideo) {
          return;
        }
        activeVideo.pause();
        activeVideo.currentTime = clampTime(
          activeVideo,
          activeVideo.currentTime - frameStep,
        );
      });
      frameControls.appendChild(frameBackButton);
      const frameForwardButton = document.createElement("button");
      frameForwardButton.innerText = ">>";
      frameForwardButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const activeVideo = getActiveVideo();
        if (!activeVideo) {
          return;
        }
        activeVideo.pause();
        activeVideo.currentTime = clampTime(
          activeVideo,
          activeVideo.currentTime + frameStep,
        );
      });
      frameControls.appendChild(frameForwardButton);
      settingsMenu.appendChild(frameControls);
      const seekControls = document.createElement("div");
      seekControls.style.display = "flex";
      seekControls.style.alignItems = "center";
      seekControls.style.justifyContent = "center";
      const seekLabel = document.createElement("label");
      seekLabel.innerText = "Util:";
      seekLabel.style.color = "white";
      seekLabel.style.display = "inline-block";
      seekLabel.style.width = "56px";
      seekLabel.style.textAlign = "right";
      seekLabel.style.marginRight = "10px";
      seekControls.appendChild(seekLabel);
      const restartButton = document.createElement("button");
      restartButton.innerText = "|<";
      restartButton.title = "Zum Anfang springen";
      restartButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const video = getActiveVideo();
        if (video) {
          video.currentTime = 0;
        }
      });
      seekControls.appendChild(restartButton);
      const seekBackButton = document.createElement("button");
      seekBackButton.innerText = "«";
      seekBackButton.title = `-${SEEK_TIME_SECONDS} Sekunden springen`;
      seekBackButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const video = getActiveVideo();
        if (video) {
          video.currentTime = clampTime(
            video,
            video.currentTime - SEEK_TIME_SECONDS,
          );
        }
      });
      seekControls.appendChild(seekBackButton);
      const seekForwardButton = document.createElement("button");
      seekForwardButton.innerText = "»";
      seekForwardButton.title = `+${SEEK_TIME_SECONDS} Sekunden springen`;
      seekForwardButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const video = getActiveVideo();
        if (video) {
          video.currentTime = clampTime(
            video,
            video.currentTime + SEEK_TIME_SECONDS,
          );
        }
      });
      seekControls.appendChild(seekForwardButton);
      [restartButton, seekBackButton, seekForwardButton].forEach((btn) => {
        btn.style.margin = "0 2px";
      });
      settingsMenu.appendChild(seekControls);
    }
    applyDynamicEnhancements();
  }
  function refreshUi() {
    initialize();
    applyDynamicEnhancements();
  }
  function scheduleRefresh() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      refreshUi();
    }, OBSERVER_DEBOUNCE_MS);
  }
  const observer = new MutationObserver(() => {
    scheduleRefresh();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  refreshUi();
})();
