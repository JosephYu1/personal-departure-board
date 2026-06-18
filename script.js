const clocks = [
    {
        city: "Park Pale",
        timezone: "Europe/London",
        code: "PPB"
    },
    {
      city: "Taipei",
      timezone: "Asia/Taipei",
      code: "TPE"
    },
    {
      city: "London",
      timezone: "Europe/London",
      code: "LHR"
    },
    {
      city: "Boston",
      timezone: "America/New_York",
      code: "BOS"
    },
    {
      city: "Houston",
      timezone: "America/Chicago",
      code: "IAH"
    },
    {
      city: "Denver",
      timezone: "America/Denver",
      code: "DEN"
    }
  ];
  
  const countdowns = [
    {
      name: "Lilly & Joseph's Anniversary",
      type: "yearly",
      month: 10,
      day: 17,
      flightYear: 2025,
      hour: 0,
      minute: 0
    },
    {
      name: "Lilly's Birthday",
      type: "yearly",
      month: 8,
      day: 7,
      flightYear: 2001,
      hour: 0,
      minute: 0
    },
    {
      name: "Joseph's Birthday",
      type: "yearly",
      month: 12,
      day: 29,
      flightYear: 1999,
      hour: 0,
      minute: 0
    },
    {
      name: "Lilly & Joseph's Wedding",
      type: "exact",
      year: 2028,
      month: 5,
      day: 27,
      hour: 0,
      minute: 0
    }
  ];
  
  function formatTime(timezone) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(new Date());
  }
  
  function getTargetDate(event) {
    const now = new Date();
  
    if (event.type === "yearly") {
      let target = new Date(
        now.getFullYear(),
        event.month - 1,
        event.day,
        event.hour || 0,
        event.minute || 0,
        0
      );
  
      // If this year's event has already passed, use next year
      if (target <= now) {
        target = new Date(
          now.getFullYear() + 1,
          event.month - 1,
          event.day,
          event.hour || 0,
          event.minute || 0,
          0
        );
      }
  
      return target;
    }
  
    if (event.type === "exact") {
      return new Date(
        event.year,
        event.month - 1,
        event.day,
        event.hour || 0,
        event.minute || 0,
        0
      );
    }
  
    throw new Error(`Unknown countdown type: ${event.type}`);
  }
  
  function getCountdownParts(targetDate) {
    const now = new Date();
    let diff = targetDate - now;
  
    const hasPassed = diff < 0;
  
    if (hasPassed) {
      diff = Math.abs(diff);
    }
  
    const totalSeconds = Math.floor(diff / 1000);
  
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
  
    return {
      hasPassed,
      days,
      hours,
      minutes,
      seconds
    };
  }
  
  function formatCountdown(parts) {
    if (parts.hasPassed) {
      return `${parts.days} days ago`;
    }
  
    if (parts.days === 0) {
      return "Today";
    }
  
    if (parts.days === 1) {
      return "1 day left";
    }
  
    return `${parts.days} days left`;
  }
  
  function formatArrival(daysLeft) {
    if (daysLeft < 0) {
      return `${Math.abs(daysLeft)} DAYS AGO`;
    }
  
    if (daysLeft === 0) {
      return "TODAY";
    }
  
    if (daysLeft === 1) {
      return "1 DAY";
    }
  
    return `${daysLeft} DAYS`;
  }

  function getDaysLeft(targetDate) {
    const now = new Date();
  
    now.setHours(0, 0, 0, 0);
  
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
  
    const difference = target - now;
  
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }
  
  function getFlightNumber(event, targetDate) {
    const month = new Intl.DateTimeFormat("en-US", {
      month: "short"
    }).format(targetDate).toUpperCase();
  
    const year = event.type === "yearly" && event.flightYear
      ? event.flightYear
      : targetDate.getFullYear();
  
    return `${month} ${year}`;
  }
  
  function getGateNumber(targetDate) {
    return String(targetDate.getDate()).padStart(2, "0");
  }
  
  function getArrivalStatus(daysLeft) {
    if (daysLeft < 0) {
      return {
        text: "DEPARTED",
        className: "departed"
      };
    }
  
    if (daysLeft === 0) {
      return {
        text: "BOARDING",
        className: "boarding"
      };
    }
  
    return {
      text: "ON TIME",
      className: "on-time"
    };
  }

  function fitArrivalsText() {
    const board = document.querySelector(".board");
    const countdownSection = document.querySelector(".countdown-section");
  
    if (!board || !countdownSection) return;
  
    const cells = countdownSection.querySelectorAll(".countdown-row > div");
    if (!cells.length) return;
  
    const maxFontSize = 26;
    const minFontSize = 4;
  
    let chosenSize = minFontSize;
  
    for (let size = maxFontSize; size >= minFontSize; size--) {
      board.style.setProperty("--arrival-font-size", `${size}px`);
  
      let allFit = true;
  
      cells.forEach(cell => {
        const clippedHorizontally = cell.scrollWidth > cell.clientWidth;
        const clippedVertically = cell.scrollHeight > cell.clientHeight;
  
        if (clippedHorizontally || clippedVertically) {
          allFit = false;
        }
      });
  
      if (allFit) {
        chosenSize = size;
        break;
      }
    }
  
    board.style.setProperty("--arrival-font-size", `${chosenSize}px`);
  }
  
  function renderCountdowns() {
    const countdownRows = document.getElementById("countdownRows");
  
    const sortedCountdowns = [...countdowns].sort((a, b) => {
      return getTargetDate(a) - getTargetDate(b);
    });
  
    countdownRows.innerHTML = sortedCountdowns.map(event => {
      const targetDate = getTargetDate(event);
      const daysLeft = getDaysLeft(targetDate);
      const status = getArrivalStatus(daysLeft);
  
      return `
        <div class="countdown-row">
            <div class="arrival">${formatArrival(daysLeft)}</div>
            <div>${getFlightNumber(event, targetDate)}</div>
            <div>${event.name}</div>
            <div>${getGateNumber(targetDate)}</div>
            <div class="${status.className}">${status.text}</div>
        </div>
        `;
    }).join("");
  }
  
  function getTimezoneOffsetMinutes(timezone) {
    const now = new Date();
  
    const utcDate = new Date(
      now.toLocaleString("en-US", { timeZone: "UTC" })
    );
  
    const tzDate = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
  
    return (tzDate - utcDate) / (1000 * 60);
  }

  function formatCurrentDate() {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "2-digit",
      year: "numeric"
    }).format(new Date()).toUpperCase();
  }
  
  function renderCurrentDate() {
    const currentDate = document.getElementById("currentDate");
  
    if (currentDate) {
      currentDate.textContent = formatCurrentDate();
    }
  }
  
  function renderClocks() {
    const clockRows = document.getElementById("clockRows");
  
    const sortedClocks = [...clocks].sort((a, b) => {
      // Always keep Park Pale at the top
      if (a.city === "Park Pale") return -1;
      if (b.city === "Park Pale") return 1;
  
      // Sort all other cities by time zone
      return getTimezoneOffsetMinutes(b.timezone) - getTimezoneOffsetMinutes(a.timezone);
    });
  
    clockRows.innerHTML = sortedClocks.map(clock => {
      return `
        <div class="clock-row">
          <div>${clock.city}</div>
          <div class="time">${formatTime(clock.timezone)}</div>
          <div>${clock.code}</div>
        </div>
      `;
    }).join("");
  }

  function renderBoard() {
    renderCurrentDate();
    renderClocks();
    renderCountdowns();
  
    requestAnimationFrame(() => {
      fitArrivalsText();
    });
  }
  
  renderBoard();
  
  setInterval(renderBoard, 5000);
  
  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      fitArrivalsText();
    });
  });
