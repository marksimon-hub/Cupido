(() => {
  const $ = (id) => document.getElementById(id);
  const steps = document.querySelectorAll(".step");
  const noBtn = $("no");
  const state = { activity: "", date: "", time: "" };

  const ACTIVITY_EMOJI = { Dinner: "🍝", Cinema: "🎬", Cafe: "☕" };

  function show(id) {
    steps.forEach((s) => s.classList.toggle("active", s.id === id));
  }

  // --- The "No" button runs away -------------------------------------------
  let lastDodge = 0;
  let lastNoEvent = -Infinity; // used to ignore ghost clicks that land on Yes after a No tap
  function dodge(e) {
    if (e && e.cancelable) e.preventDefault();
    lastNoEvent = performance.now();
    // One tap fires several events (pointer, touch, mouse, click); move once.
    const now = performance.now();
    if (now - lastDodge < 60) return;
    lastDodge = now;
    const margin = 8;
    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;
    const maxX = window.innerWidth - w - margin;
    const maxY = window.innerHeight - h - margin;
    const yes = $("yes").getBoundingClientRect();

    let x, y, tries = 0;
    do {
      x = margin + Math.random() * Math.max(0, maxX - margin);
      y = margin + Math.random() * Math.max(0, maxY - margin);
      tries++;
      // Never land on top of the Yes button.
    } while (
      tries < 20 &&
      x < yes.right + 12 && x + w > yes.left - 12 &&
      y < yes.bottom + 12 && y + h > yes.top - 12
    );

    if (!noBtn.classList.contains("dodging")) {
      // Keep layout stable: leave a placeholder where the button was.
      const ph = document.createElement("span");
      ph.style.width = w + "px";
      ph.style.height = h + "px";
      noBtn.parentNode.insertBefore(ph, noBtn);
      noBtn.classList.add("dodging");
    }
    noBtn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  // Pointer covers mouse, touch and pen; focus covers keyboard users.
  ["pointerenter", "pointerdown", "touchstart", "focus"].forEach((ev) =>
    noBtn.addEventListener(ev, dodge, { passive: false })
  );
  noBtn.addEventListener("click", dodge);
  document.addEventListener("pointermove", (e) => {
    if (!noBtn.classList.contains("dodging")) return;
    const r = noBtn.getBoundingClientRect();
    const near = 60;
    if (
      e.clientX > r.left - near && e.clientX < r.right + near &&
      e.clientY > r.top - near && e.clientY < r.bottom + near
    ) dodge();
  });
  window.addEventListener("resize", () => {
    if (noBtn.classList.contains("dodging")) dodge();
  });

  // Touch screens have no hover, so the finger lands before we can react.
  // React to any touch near the button and keep it wandering on its own.
  if (matchMedia("(pointer: coarse)").matches) {
    document.addEventListener("touchstart", (e) => {
      if (!$("step-ask").classList.contains("active")) return;
      // Yes sits right next to No; a tap on Yes must always go through.
      if (e.target.closest("#yes")) return;
      const t = e.touches[0];
      const r = noBtn.getBoundingClientRect();
      const near = 90;
      if (
        t.clientX > r.left - near && t.clientX < r.right + near &&
        t.clientY > r.top - near && t.clientY < r.bottom + near
      ) dodge(e);
    }, { passive: false, capture: true });

    const wander = setInterval(() => {
      if (!$("step-ask").classList.contains("active")) return clearInterval(wander);
      lastDodge = 0;
      dodge();
      lastNoEvent = -Infinity; // wandering alone must not block Yes
    }, 1100);
  }

  // --- Flow ----------------------------------------------------------------
  $("yes").addEventListener("click", () => {
    if (performance.now() - lastNoEvent < 500) return;
    noBtn.style.display = "none";
    show("step-activity");
  });

  document.querySelectorAll(".option").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.activity = btn.dataset.activity;
      $("when-emoji").textContent = ACTIVITY_EMOJI[state.activity];
      const today = new Date();
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      $("date").min = today.toISOString().slice(0, 10);
      show("step-when");
    })
  );

  function formatWhen() {
    const d = new Date(`${state.date}T${state.time}`);
    return d.toLocaleString(undefined, {
      weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  function message() {
    return `Yes! 💘 ${state.activity} on ${formatWhen()}. Can't wait!`;
  }

  $("when-form").addEventListener("submit", (e) => {
    e.preventDefault();
    state.date = $("date").value;
    state.time = $("time").value;
    $("summary").textContent = `${ACTIVITY_EMOJI[state.activity]} ${state.activity} · ${formatWhen()}`;
    show("step-done");
    burst();
  });

  // Fallback for browsers where the async Clipboard API is missing or blocked.
  function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.fontSize = "16px"; // stops iOS zooming in
    document.body.appendChild(ta);
    ta.focus();
    ta.setSelectionRange(0, text.length); // iOS ignores ta.select()
    let ok = false;
    try { ok = document.execCommand("copy"); } catch {}
    ta.remove();
    return ok;
  }

  $("copy").addEventListener("click", async () => {
    const text = message();
    const status = $("copy-status");
    // On phones, the share sheet lets her send it straight to you.
    if (navigator.share) {
      try {
        await navigator.share({ text });
        status.textContent = "Sent! 💌";
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied! Send it to me 😉";
    } catch {
      status.textContent = legacyCopy(text) ? "Copied! Send it to me 😉" : text;
    }
  });

  $("ics").addEventListener("click", () => {
    const start = new Date(`${state.date}T${state.time}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cupido//EN", "BEGIN:VEVENT",
      `UID:${Date.now()}@cupido`, `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${state.activity} date 💘`, "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "date.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // --- Floating hearts -----------------------------------------------------
  const layer = document.querySelector(".hearts");
  function heart() {
    const el = document.createElement("span");
    el.className = "heart";
    el.textContent = ["💖", "💗", "💕", "❤️"][Math.floor(Math.random() * 4)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 14 + Math.random() * 24 + "px";
    el.style.animationDuration = 6 + Math.random() * 6 + "s";
    layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
  function burst() { for (let i = 0; i < count; i++) setTimeout(heart, i * 80); }
  const light = matchMedia("(pointer: coarse)").matches;
  const count = light ? 12 : 30;
  setInterval(() => { if (!document.hidden) heart(); }, light ? 1800 : 900);
})();
