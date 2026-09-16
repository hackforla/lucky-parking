(() => {
  const regionType = document.getElementById("region-type");
  const radiusField = document.getElementById("radius-field");
  const queryModeInput = document.getElementById("query-mode");
  const singleFields = document.getElementById("single-region-fields");
  const compareFields = document.getElementById("compare-region-fields");
  const page = document.querySelector(".page");
  const modeButtons = document.querySelectorAll(".mode-btn");

  function toggleRadius() {
    if (!radiusField || !regionType) return;
    radiusField.hidden = regionType.value !== "Place (Radius)";
  }

  function setMode(mode) {
    const next = mode === "compare" ? "compare" : "single";
    if (queryModeInput) queryModeInput.value = next;
    if (singleFields) singleFields.hidden = next !== "single";
    if (compareFields) compareFields.hidden = next !== "compare";
    if (page) page.classList.toggle("page-wide", next === "compare");

    const singleInput = document.getElementById("region-input");
    const region1 = document.getElementById("region-1-input");
    const region2 = document.getElementById("region-2-input");
    if (singleInput) singleInput.required = next === "single";
    if (region1) region1.required = next === "compare";
    if (region2) region2.required = next === "compare";

    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === next);
    });
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  function wireSuggest(wrap) {
    const input = wrap.querySelector("[data-region-input]");
    const suggestions = wrap.querySelector(".suggestions");
    if (!input || !suggestions || !regionType) return;

    let debounceTimer = null;
    let activeIndex = -1;

    function renderSuggestionMessage(text) {
      suggestions.innerHTML = "";
      activeIndex = -1;
      const li = document.createElement("li");
      li.className = "suggest-msg";
      li.textContent = text;
      suggestions.appendChild(li);
      suggestions.hidden = false;
    }

    async function fetchSuggestions(q) {
      const params = new URLSearchParams({
        region_type: regionType.value,
        q: q || "",
        limit: "5",
      });
      const res = await fetch(`/api/regions/suggest?${params}`);
      if (!res.ok) {
        let msg = "Could not load region suggestions";
        try {
          const err = await res.json();
          if (err.error) msg = err.error;
        } catch (_) {
          /* ignore */
        }
        renderSuggestionMessage(msg);
        return;
      }
      const data = await res.json();
      const items = data.suggestions || [];
      suggestions.innerHTML = "";
      activeIndex = -1;
      if (!items.length) {
        renderSuggestionMessage(
          q ? "No matching regions" : "No regions available for this type"
        );
        return;
      }
      items.forEach((label, i) => {
        const li = document.createElement("li");
        li.textContent = label;
        li.setAttribute("role", "option");
        li.dataset.index = String(i);
        li.addEventListener("mousedown", (e) => {
          e.preventDefault();
          input.value = label;
          suggestions.hidden = true;
        });
        suggestions.appendChild(li);
      });
      suggestions.hidden = false;
    }

    function scheduleSuggest(immediate = false) {
      clearTimeout(debounceTimer);
      const run = () => {
        fetchSuggestions(input.value.trim()).catch(() => {
          renderSuggestionMessage("Could not load region suggestions");
        });
      };
      if (immediate || !input.value.trim()) {
        run();
        return;
      }
      debounceTimer = setTimeout(run, 150);
    }

    input.addEventListener("input", () => scheduleSuggest(false));
    input.addEventListener("focus", () => scheduleSuggest(true));
    input.addEventListener("keydown", (e) => {
      const options = [...suggestions.querySelectorAll("li:not(.suggest-msg)")];
      if (suggestions.hidden || !options.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % options.length;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + options.length) % options.length;
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        input.value = options[activeIndex].textContent;
        suggestions.hidden = true;
        return;
      } else if (e.key === "Escape") {
        suggestions.hidden = true;
        return;
      } else {
        return;
      }
      options.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    });

    return { input, suggestions, scheduleSuggest };
  }

  const suggestControls = [...document.querySelectorAll("[data-suggest]")].map(
    wireSuggest
  );

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-suggest]")) return;
    document.querySelectorAll(".suggestions").forEach((el) => {
      el.hidden = true;
    });
  });

  if (regionType) {
    regionType.addEventListener("change", () => {
      toggleRadius();
      suggestControls.forEach((ctrl) => {
        if (!ctrl) return;
        ctrl.input.value = "";
        ctrl.scheduleSuggest(true);
      });
    });
  }

  toggleRadius();
  setMode(queryModeInput ? queryModeInput.value : "single");

  function initMap(mapEl) {
    if (!mapEl) return;
    const source =
      mapEl.parentElement &&
      mapEl.parentElement.querySelector("[data-map-markers]");

    if (!window.L) {
      mapEl.innerHTML =
        '<p class="map-empty">Map library failed to load. Hard-refresh the page.</p>';
      return;
    }

    let markers = [];
    try {
      markers = JSON.parse(source ? source.textContent : "[]").filter(
        (r) => r.lat != null && r.lon != null
      );
    } catch (_) {
      mapEl.innerHTML =
        '<p class="map-empty">Could not parse citation coordinates.</p>';
      return;
    }

    const map = L.map(mapEl, { scrollWheelZoom: true }).setView(
      [34.05, -118.25],
      11
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const refresh = () => map.invalidateSize();
    requestAnimationFrame(refresh);
    setTimeout(refresh, 100);

    if (!markers.length) {
      const empty = document.createElement("p");
      empty.className = "map-empty";
      empty.textContent = "No coordinates to plot for this result set.";
      mapEl.appendChild(empty);
      return;
    }

    const layer = L.featureGroup();
    markers.forEach((r) => {
      const fine =
        r.fine_amount == null ? "" : `$${Number(r.fine_amount).toFixed(2)}`;
      const popup = [
        `<strong>${r.ticket_number}</strong>`,
        r.issue_datetime || "",
        r.violation_description || r.violation_code || "",
        fine,
      ]
        .filter(Boolean)
        .join("<br>");
      L.circleMarker([r.lat, r.lon], {
        radius: 5,
        weight: 1,
        color: "#083f37",
        fillColor: "#0f6b5c",
        fillOpacity: 0.85,
      })
        .bindPopup(popup)
        .addTo(layer);
    });
    layer.addTo(map);
    map.fitBounds(layer.getBounds().pad(0.15));
    setTimeout(refresh, 150);
  }

  document.querySelectorAll("[data-map]").forEach(initMap);
})();
