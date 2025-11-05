// Popup script for Olam Dictionary extension
document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.getElementById("loading");
  const noResultsDiv = document.getElementById("noResults");
  const navigationControls = document.getElementById("navigationControls");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const entryCounter = document.getElementById("entryCounter");
  const sourceFiltersDiv = document.getElementById("sourceFilters");
  const changeSettingsLink = document.getElementById("changeSettings");

  // State management
  let currentData = null;
  let appState = null;

  // Load last search on popup open
  loadLastSearch();

  // Settings button click
  settingsBtn.addEventListener("click", function() {
    chrome.runtime.openOptionsPage();
  });

  // Change settings link
  changeSettingsLink.addEventListener("click", function(e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Search button click
  searchBtn.addEventListener("click", performSearch);

  // Enter key in search input
  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Navigation buttons
  prevBtn.addEventListener("click", function() {
    if (appState) {
      appState.previousEntry();
      displayCurrentEntry();
    }
  });

  nextBtn.addEventListener("click", function() {
    if (appState) {
      appState.nextEntry();
      displayCurrentEntry();
    }
  });

  // Load last search from storage
  function loadLastSearch() {
    chrome.storage.local.get("lastSearch", (result) => {
      if (result.lastSearch && result.lastSearch.result) {
        searchInput.value = result.lastSearch.query;
        currentData = result.lastSearch.result;
        initializeState(currentData);
        displayCurrentEntry();
      }
    });
  }

  // Perform search
  async function performSearch() {
    const searchText = searchInput.value.trim();
    
    if (!searchText) {
      console.log("No search text provided");
      return;
    }

    console.log("Performing search for:", searchText);

    // Show loading
    loadingDiv.style.display = "flex";
    resultsDiv.innerHTML = "";
    noResultsDiv.style.display = "none";
    navigationControls.style.display = "none";
    sourceFiltersDiv.style.display = "none";

    // Get selected language
    const fromLang = document.querySelector("input[name=\"fromLang\"]:checked").value;
    const toLang = DEFAULT_TO_LANG;

    console.log("Language direction:", fromLang, "", toLang);

    try {
      const apiUrl = buildApiUrl(fromLang, toLang, searchText);
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      loadingDiv.style.display = "none";

      if (data.data && data.data.entries && data.data.entries.length > 0) {
        console.log("Found", data.data.entries.length, "entries");
        currentData = data;
        initializeState(data);
        displayCurrentEntry();
        
        // Save to storage
        chrome.storage.local.set({
          lastSearch: {
            query: searchText,
            result: data,
            timestamp: Date.now()
          }
        });
      } else {
        console.log("No results found");
        showNoResults(fromLang, toLang);
      }
    } catch (error) {
      console.error("Error searching:", error);
      loadingDiv.style.display = "none";
      resultsDiv.innerHTML = "<div class=\"error\">Error fetching results. Please try again.</div>";
    }
  }

  // Initialize app state
  function initializeState(data) {
    // Get word limit from settings (default is 3)
    chrome.storage.sync.get(["wordLimit"], (result) => {
      const wordLimit = result.wordLimit !== undefined ? result.wordLimit : 3;
      
      appState = new AppState({
        entries: data.data.entries,
        maxWords: wordLimit === -1 ? Infinity : wordLimit,
        query: data.data.query
      });

      // Build source filters if multiple sources exist
      const sources = appState.getAvailableSources();
      if (sources.length > 1) {
        buildSourceFilters(sources);
      } else {
        sourceFiltersDiv.style.display = "none";
      }
    });
  }

  // Build source filter buttons
  function buildSourceFilters(sources) {
    sourceFiltersDiv.innerHTML = "";
    sourceFiltersDiv.style.display = "flex";

    // "All Sources" button
    const allBtn = document.createElement("button");
    allBtn.className = "source-filter active";
    allBtn.textContent = "All Sources";
    allBtn.dataset.source = null;
    allBtn.addEventListener("click", function() {
      appState.setSourceFilter(null);
      updateActiveFilter(allBtn);
      displayCurrentEntry();
    });
    sourceFiltersDiv.appendChild(allBtn);

    // Individual source buttons
    sources.forEach(source => {
      const btn = document.createElement("button");
      btn.className = "source-filter";
      btn.dataset.source = source;
      
      // Add special styling classes
      if (source === 'src:ekkurup') {
        btn.classList.add('tag-ekkurup');
        btn.textContent = "E. K. Kurup";
      } else if (source === 'src:crowd') {
        btn.classList.add('tag-crowd');
        btn.textContent = "Crowd Sourced";
      } else {
        btn.textContent = source.replace('src:', '');
      }
      
      btn.addEventListener("click", function() {
        appState.setSourceFilter(source);
        updateActiveFilter(btn);
        displayCurrentEntry();
      });
      sourceFiltersDiv.appendChild(btn);
    });
  }

  // Update active filter button
  function updateActiveFilter(activeBtn) {
    const buttons = sourceFiltersDiv.querySelectorAll(".source-filter");
    buttons.forEach(btn => {
      btn.classList.remove("active", "inactive");
      if (btn !== activeBtn) {
        btn.classList.add("inactive");
      }
    });
    activeBtn.classList.add("active");
  }

  // Display current entry
  function displayCurrentEntry() {
    if (!appState) return;

    const entry = appState.getCurrentEntry();
    if (!entry) {
      noResultsDiv.style.display = "block";
      resultsDiv.innerHTML = "";
      navigationControls.style.display = "none";
      return;
    }

    noResultsDiv.style.display = "none";
    resultsDiv.innerHTML = "";

    // Show navigation if multiple entries
    const totalEntries = appState.getFilteredEntriesCount();
    if (totalEntries > 1) {
      navigationControls.style.display = "flex";
      entryCounter.textContent = (appState.getCurrentIndex() + 1) + "/" + totalEntries;
      prevBtn.disabled = !appState.hasPrevious();
      nextBtn.disabled = !appState.hasNext();
    } else {
      navigationControls.style.display = "none";
    }

    // Create entry element
    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";

    // Word header
    const wordHeader = document.createElement("div");
    wordHeader.className = "word-header";
    wordHeader.innerHTML = "<h2>" + entry.content.join(", ") + "</h2>";
    entryDiv.appendChild(wordHeader);

    // Relations (translations)
    if (entry.relations && entry.relations.length > 0) {
      entry.relations.forEach(relation => {
        const relationDiv = document.createElement("div");
        relationDiv.className = "relation";

        // Meaning - with word limit
        const meaningDiv = document.createElement("div");
        meaningDiv.className = "meaning";
        const displayWords = appState.limitWords(relation.content);
        meaningDiv.textContent = displayWords.join(", ");
        if (displayWords.length < relation.content.length) {
          meaningDiv.textContent += "...";
        }
        relationDiv.appendChild(meaningDiv);

        // Type (noun, verb, etc.)
        if (relation.relation && relation.relation.types) {
          const typeDiv = document.createElement("div");
          typeDiv.className = "type";
          typeDiv.textContent = relation.relation.types.join(", ");
          relationDiv.appendChild(typeDiv);
        }

        entryDiv.appendChild(relationDiv);
      });
    }

    resultsDiv.appendChild(entryDiv);

    // Add "View Full Details" link
    const query = appState.query;
    const linkDiv = document.createElement("div");
    linkDiv.className = "full-link";
    linkDiv.innerHTML = "<a href=\"" + buildDictionaryUrl(query.from_lang, query.to_lang, query.q) + "\" target=\"_blank\">View full details on olam.in </a>";
    resultsDiv.appendChild(linkDiv);
  }

  // Show no results message
  function showNoResults(fromLang, toLang) {
    noResultsDiv.style.display = "block";
    resultsDiv.innerHTML = "";
    navigationControls.style.display = "none";
    sourceFiltersDiv.style.display = "none";

    // Display current language settings
    const fromLangName = fromLang === "auto" ? "Auto-detect" : 
                         fromLang.charAt(0).toUpperCase() + fromLang.slice(1);
    const toLangName = toLang.charAt(0).toUpperCase() + toLang.slice(1);
    
    document.getElementById("currentFromLang").textContent = fromLangName;
    document.getElementById("currentToLang").textContent = toLangName;
  }

  // Auto-detect language based on input
  searchInput.addEventListener("input", function() {
    const text = searchInput.value;
    const isMalayalam = /[\u0D00-\u0D7F]/.test(text);
    
    if (isMalayalam) {
      document.querySelector("input[value=\"malayalam\"]").checked = true;
    } else if (text.trim()) {
      document.querySelector("input[value=\"english\"]").checked = true;
    }
  });
});
