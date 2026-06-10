export const state = {
  all: [],
  filtered: [],
  decade: 'all',
  genre: 'all',
  selectedCountry: null,
};

export async function loadData() {
  const res = await fetch('data/movies.json');
  if (!res.ok) throw new Error(`Failed to load movies.json: ${res.status}`);
  const raw = await res.json();

  const seen = new Set();
  state.all = raw.filter(m => {
    const key = `${m.title}|${m.country}|${m.year}`;
    if (seen.has(key)) return false;
    seen.add(key);
    m.decade = Math.floor(m.year / 10) * 10;
    return true;
  });

  applyFilters();
  return state;
}

export function applyFilters() {
  state.filtered = state.all.filter(m => {
    const okDecade = state.decade === 'all' || m.decade === parseInt(state.decade);
    const okGenre  = state.genre  === 'all' || m.genre  === state.genre;
    return okDecade && okGenre;
  });
}

export function setFilter(key, value) {
  state[key] = value;
  applyFilters();
}


export function countByField(films, field) {
  const counts = {};
  films.forEach(m => { counts[m[field]] = (counts[m[field]] || 0) + 1; });
  return counts;
}

export function topN(countObj, n = 10) {
  return Object.entries(countObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

export function avgField(films, field) {
  if (!films.length) return 0;
  return films.reduce((s, m) => s + m[field], 0) / films.length;
}

export function countByDecade(films) {
  const decades = [1920,1930,1940,1950,1960,1970,1980,1990,2000,2010,2020];
  const counts  = countByField(films, 'decade');
  return {
    labels: decades.map(d => d + 's'),
    data:   decades.map(d => counts[d] || 0),
  };
}

export function ratingHistogram(films) {
  const bins   = [3,4,5,6,7,8,9,10];
  const labels = bins.slice(0,-1).map((b,i) => `${b}–${bins[i+1]}`);
  const data   = bins.slice(0,-1).map((b,i) =>
    films.filter(m => m.rating >= b && m.rating < bins[i+1]).length
  );
  return { labels, data };
}

export function allGenres(films) {
  return [...new Set(films.map(m => m.genre))].sort();
}

export function countryStats(films, country) {
  const cf   = films.filter(m => m.country === country);
  const genC = countByField(cf, 'genre');
  const topGenre = topN(genC, 1)[0]?.[0] ?? '–';
  const topFilms = [...cf].sort((a,b) => b.rating - a.rating).slice(0, 5);
  const avgRating = cf.length ? avgField(cf, 'rating').toFixed(1) : '–';
  const decades   = [...new Set(cf.map(m => m.decade))].sort();
  return { count: cf.length, avgRating, topGenre, topFilms, decades };
}
