(() => {
  const regionType = document.getElementById("region-type");
  const regionInput = document.getElementById("region-input");
  const suggestions = document.getElementById("region-suggestions");
  const radiusField = document.getElementById("radius-field");
  let debounceTimer = null;
  let activeIndex = -1;

  function toggleRadius() {
    if (!radiusField || !regionType) return;
    const show = regionType.value === "Place (Radius)";
    radiusField.hidden = !show;
  }

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
    if (!regionType || !suggestions) return;
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
        regionInput.value = label;
        suggestions.hidden = true;
      });
      suggestions.appendChild(li);
    });
    suggestions.hidden = false;
  }

  function scheduleSuggest(immediate = false) {
    clearTimeout(debounceTimer);
    const run = () => {
      fetchSuggestions(regionInput.value.trim()).catch(() => {
        renderSuggestionMessage("Could not load region suggestions");
      });
    };
    // Empty focus / region-type change: show top 5 alphabetical immediately.
    if (immediate || !regionInput.value.trim()) {
      run();
      return;
    }
    debounceTimer = setTimeout(run, 150);
  }

  if (regionType) {
    regionType.addEventListener("change", () => {
      toggleRadius();
      regionInput.value = "";
      scheduleSuggest(true);
    });
  }

  if (regionInput && suggestions) {
    regionInput.addEventListener("input", () => scheduleSuggest(false));
    regionInput.addEventListener("focus", () => scheduleSuggest(true));
    regionInput.addEventListener("keydown", (e) => {
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
        regionInput.value = options[activeIndex].textContent;
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
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".suggest-wrap")) suggestions.hidden = true;
    });
  }

  toggleRadius();

  // Map view
  const mapEl = document.getElementById("map");
  const markersEl = document.getElementById("map-markers");
  if (mapEl) {
    if (!window.L) {
      mapEl.innerHTML =
        '<p class="map-empty">Map library failed to load. Hard-refresh the page.</p>';
    } else {
      let markers = [];
      try {
        markers = JSON.parse(markersEl ? markersEl.textContent : "[]").filter(
          (r) => r.lat != null && r.lon != null
        );
      } catch (_) {
        mapEl.innerHTML =
          '<p class="map-empty">Could not parse citation coordinates.</p>';
        markers = null;
      }

      if (markers) {
        const map = L.map(mapEl, { scrollWheelZoom: true }).setView(
          [34.05, -118.25],
          11
        );
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap",
        }).addTo(map);

        // Leaflet often needs a reflow after the container is laid out.
        const refresh = () => map.invalidateSize();
        requestAnimationFrame(refresh);
        setTimeout(refresh, 100);

        if (!markers.length) {
          const empty = document.createElement("p");
          empty.className = "map-empty";
          empty.textContent = "No coordinates to plot for this result set.";
          mapEl.appendChild(empty);
        } else {
          const layer = L.featureGroup();
          markers.forEach((r) => {
            const fine =
              r.fine_amount == null
                ? ""
                : `$${Number(r.fine_amount).toFixed(2)}`;
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
      }
    }
  }
})();
