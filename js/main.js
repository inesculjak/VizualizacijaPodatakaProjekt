import { loadData, state, setFilter, allGenres } from './data.js';
import { initMap, updateMap, selectCountry }     from './map.js';
import { updateAllCharts, toggleGenreSort, chartState } from './charts.js';
import { updateMetrics, buildCountryList,
         highlightCountryRow, showCountryInfo,
         buildGenrePills }                        from './ui.js';

async function boot() {
  try { await loadData(); }
  catch (err) { document.getElementById('app-error').style.display='block'; return; }

  window.__mapFilms = state.filtered;
  buildGenrePills(allGenres(state.all), 'all', onGenreChange);

  document.querySelectorAll('.pill-btn[data-decade]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn[data-decade]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setFilter('decade', btn.dataset.decade);
      refresh();
    });
  });

  document.getElementById('map-badge')?.addEventListener('click', () => {
    state.selectedCountry = null;
    selectCountry(null);
    highlightCountryRow(null);
    showCountryInfo(state.filtered, null);
    document.getElementById('map-badge').textContent = 'All countries';
  });

  document.getElementById('genre-sort-btn')?.addEventListener('click', function() {
    toggleGenreSort(state.filtered, onBarGenreSelect);
    this.textContent = chartState.genreSort === 'alpha' ? '⇅ Sort by count' : '⇅ Sort A–Z';
  });

  await initMap('euro-map', onCountrySelect);
  refresh();
}

function refresh() {
  const films = state.filtered;
  window.__mapFilms = films;
  updateMetrics(films, state.all);
  buildCountryList(films, onCountrySelect);
  updateMap(films);
  updateAllCharts(films, onBarGenreSelect);
  if (state.selectedCountry) {
    showCountryInfo(films, state.selectedCountry);
    highlightCountryRow(state.selectedCountry);
  }
}

function onGenreChange(genre) { setFilter('genre', genre); refresh(); }

function onBarGenreSelect(genre) {
}

function onCountrySelect(name) {
  const next = state.selectedCountry === name ? null : name;
  state.selectedCountry = next;
  selectCountry(next);
  highlightCountryRow(next);
  showCountryInfo(state.filtered, next);
  document.getElementById('map-badge').textContent = next || 'All countries';
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.all.length) refresh();
});

boot();
