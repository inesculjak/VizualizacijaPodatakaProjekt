import { avgField, topN, countByField, countryStats } from './data.js';

export function updateMetrics(films, allFilms) {
  const total   = films.length;
  const countries = new Set(films.map(m => m.country)).size;
  const avg     = films.length ? avgField(films, 'rating').toFixed(1) : '–';
  const counts  = countByField(films, 'country');
  const top     = topN(counts, 1)[0];

  _setText('m-total',     total.toLocaleString());
  _setText('m-countries', countries);
  _setText('m-rating',    avg);
  _setText('m-top',       top ? top[0] : '–');
  _setText('m-top-count', top ? `${top[1]} films` : '');

  _setText('h-total',    allFilms.length.toLocaleString());
  _setText('h-countries', new Set(allFilms.map(m => m.country)).size);
}

export function buildCountryList(films, onSelect) {
  const list    = document.getElementById('country-list');
  if (!list) return;

  const counts  = countByField(films, 'country');
  const ranked  = topN(counts, 25);
  const maxVal  = ranked[0]?.[1] || 1;

  list.innerHTML = ranked.map(([name, count]) => `
    <div class="country-row" data-country="${name}" role="button" tabindex="0" aria-label="${name}, ${count} films">
      <span class="name">${name}</span>
      <div class="country-bar-track">
        <div class="country-bar-fill" style="width:${Math.round(count / maxVal * 100)}%"></div>
      </div>
      <span class="count">${count}</span>
    </div>
  `).join('');

  list.querySelectorAll('.country-row').forEach(row => {
    const handler = () => onSelect(row.dataset.country);
    row.addEventListener('click', handler);
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
}

export function highlightCountryRow(name) {
  document.querySelectorAll('.country-row').forEach(row => {
    row.classList.toggle('active', row.dataset.country === name);
  });
}

export function showCountryInfo(films, countryName) {
  const panel = document.getElementById('selected-info');
  if (!panel) return;

  if (!countryName) {
    panel.classList.remove('visible');
    return;
  }

  const stats = countryStats(films, countryName);
  panel.classList.add('visible');

  panel.querySelector('#si-name').textContent    = countryName;
  panel.querySelector('#si-count').textContent   = stats.count;
  panel.querySelector('#si-rating').textContent  = stats.avgRating;
  panel.querySelector('#si-genre').textContent   = stats.topGenre;
  panel.querySelector('#si-decades').textContent = stats.decades.length
    ? stats.decades.map(d => d + 's').join(', ')
    : '–';

  const filmList = panel.querySelector('#si-films');
  filmList.innerHTML = stats.topFilms.map(f => `
    <div class="film-item">
      <span class="film-title">${f.title} <span style="color:var(--muted);font-size:11px">(${f.year})</span></span>
      <span class="film-rating">★ ${f.rating.toFixed(1)}</span>
    </div>
  `).join('');
}

export function buildGenrePills(genres, currentGenre, onChange) {
  const container = document.getElementById('genre-pills');
  if (!container) return;

  const all = ['all', ...genres];
  container.innerHTML = all.map(g => `
    <button class="pill-btn${g === currentGenre ? ' active' : ''}" data-genre="${g}">
      ${g === 'all' ? 'All genres' : g}
    </button>
  `).join('');

  container.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset.genre);
    });
  });
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
