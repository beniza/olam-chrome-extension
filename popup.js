// Popup script for Olam Dictionary extension
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  const noResultsDiv = document.getElementById('noResults');
  const languageRadios = document.querySelectorAll('input[name="fromLang"]');

  // Load last search on popup open
  loadLastSearch();

  // Search button click
  searchBtn.addEventListener('click', performSearch);

  // Enter key in search input
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Load last search from storage
  function loadLastSearch() {
    chrome.runtime.sendMessage({ action: 'getLastSearch' }, (lastSearch) => {
      if (lastSearch && lastSearch.result) {
        searchInput.value = lastSearch.query;
        displayResults(lastSearch.result);
      }
    });
  }

  // Perform search
  async function performSearch() {
    const searchText = searchInput.value.trim();
    
    if (!searchText) {
      console.log('No search text provided');
      return;
    }

    console.log('Performing search for:', searchText);

    // Show loading
    loadingDiv.style.display = 'flex';
    resultsDiv.innerHTML = '';
    noResultsDiv.style.display = 'none';

    // Get selected language
    const fromLang = document.querySelector('input[name="fromLang"]:checked').value;
    const toLang = DEFAULT_TO_LANG;

    console.log('Language direction:', fromLang, '→', toLang);

    try {
      const apiUrl = buildApiUrl(fromLang, toLang, searchText);
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      loadingDiv.style.display = 'none';

      if (data.data && data.data.entries && data.data.entries.length > 0) {
        console.log('Found', data.data.entries.length, 'entries');
        displayResults(data);
        
        // Save to storage
        chrome.storage.local.set({
          lastSearch: {
            query: searchText,
            result: data,
            timestamp: Date.now()
          }
        });
      } else {
        console.log('No results found');
        noResultsDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Error searching:', error);
      loadingDiv.style.display = 'none';
      resultsDiv.innerHTML = '<div class="error">Error fetching results. Please try again.</div>';
    }
  }

  // Display search results
  function displayResults(data) {
    resultsDiv.innerHTML = '';

    if (!data.data || !data.data.entries || data.data.entries.length === 0) {
      noResultsDiv.style.display = 'block';
      return;
    }

    // Get the query info for the link
    const query = data.data.query;
    const searchWord = query.q;
    const fromLang = query.from_lang;
    const toLang = query.to_lang;

    data.data.entries.forEach((entry, index) => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'entry';

      // Word header
      const wordHeader = document.createElement('div');
      wordHeader.className = 'word-header';
      wordHeader.innerHTML = `<h2>${entry.content.join(', ')}</h2>`;
      entryDiv.appendChild(wordHeader);

      // Relations (translations)
      if (entry.relations && entry.relations.length > 0) {
        // Limit to first relation only for preview
        const relation = entry.relations[0];
        
        const relationDiv = document.createElement('div');
        relationDiv.className = 'relation';

        // Meaning - limit to first 3 words
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'meaning';
        const words = relation.content.slice(0, 3); // Take first 3 words
        meaningDiv.textContent = words.join(', ');
        if (relation.content.length > 3) {
          meaningDiv.textContent += '...';
        }
        relationDiv.appendChild(meaningDiv);

        // Type (noun, verb, etc.)
        if (relation.relation && relation.relation.types) {
          const typeDiv = document.createElement('div');
          typeDiv.className = 'type';
          typeDiv.textContent = relation.relation.types.join(', ');
          relationDiv.appendChild(typeDiv);
        }

        entryDiv.appendChild(relationDiv);

        // Show count if there are more relations
        if (entry.relations.length > 1) {
          const moreDiv = document.createElement('div');
          moreDiv.className = 'more-info';
          moreDiv.textContent = `+${entry.relations.length - 1} more meanings`;
          entryDiv.appendChild(moreDiv);
        }
      }

      resultsDiv.appendChild(entryDiv);
    });

    // Add "View Full Details" link
    const linkDiv = document.createElement('div');
    linkDiv.className = 'full-link';
    linkDiv.innerHTML = `
      <a href="${buildDictionaryUrl(fromLang, toLang, searchWord)}" target="_blank">
        View full details on olam.in →
      </a>
    `;
    resultsDiv.appendChild(linkDiv);
  }

  // Auto-detect language based on input
  searchInput.addEventListener('input', function() {
    const text = searchInput.value;
    const isMalayalam = /[\u0D00-\u0D7F]/.test(text);
    
    if (isMalayalam) {
      document.querySelector('input[value="malayalam"]').checked = true;
    } else if (text.trim()) {
      document.querySelector('input[value="english"]').checked = true;
    }
  });
});
