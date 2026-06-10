import { countByField, countryStats } from './data.js';

export const ISO_MAP = {
  '250': 'France',
  '380': 'Italy',
  '276': 'Germany',
  '724': 'Spain',
  '826': 'United Kingdom',
  '752': 'Sweden',
  '208': 'Denmark',
  '616': 'Poland',
  '203': 'Czech Republic',
  '348': 'Hungary',
  '643': 'Russia',
  '040': 'Austria',
  '056': 'Belgium',
  '528': 'Netherlands',
  '620': 'Portugal',
  '300': 'Greece',
  '642': 'Romania',
  '246': 'Finland',
  '578': 'Norway',
  '756': 'Switzerland',
  '804': 'Ukraine',
  '191': 'Croatia',
  '688': 'Serbia',
  '792': 'Turkey',
  '372': 'Ireland',
  '100': 'Bulgaria',
  '705': 'Slovenia',
  '703': 'Slovakia',
  '498': 'Moldova',
  '112': 'Belarus',
  '233': 'Estonia',
  '428': 'Latvia',
  '440': 'Lithuania',
  '008': 'Albania',
  '070': 'Bosnia and Herzegovina',
  '807': 'North Macedonia',
  '499': 'Montenegro',
  '352': 'Iceland',
  '036': 'Austria',
};

const RAMP_LIGHT = ['#ffeef4','#ffd0e0','#ffaac8','#f4709a','#d4507a','#b03060','#7a1840','#4a0820'];
const RAMP_DARK  = ['#2a0818','#4a1030','#7a2050','#a83870','#cc5888','#e878a8','#f4a0c0','#ffd0e4'];

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

let _svg      = null;
let _path     = null;
let _color    = null;
let _features = null;
let _onSelect = null;

export async function initMap(containerId, onSelect) {
  _onSelect = onSelect;

  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const W = 700, H = 560;

  _svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .attr('height', 'auto')
    .attr('role', 'img')
    .attr('aria-label', 'Choropleth map of Europe');

  const projection = d3.geoMercator()
    .center([17, 55])
    .scale(470)
    .translate([W / 2 - 40, H / 2 + 30]);

  _path = d3.geoPath().projection(projection);

  const world = await d3.json(TOPO_URL);
  _features = topojson.feature(world, world.objects.countries).features;

  _svg.selectAll('path')
    .data(_features)
    .join('path')
    .attr('class', 'country-path')
    .attr('d', _path)
    .attr('id', d => `cp-${d.id}`)
    .on('mousemove', _onMouseMove)
    .on('mouseleave', _onMouseLeave)
    .on('click', _onClick);
}

export function updateMap(films) {
  const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const ramp   = isDark ? RAMP_DARK : RAMP_LIGHT;

  const counts   = countByField(films, 'country');
  const maxCount = Math.max(...Object.values(counts), 1);
  _color = d3.scaleQuantize([0, maxCount], ramp);

  const swatchEl = document.getElementById('legend-swatches');
  if (swatchEl) {
    swatchEl.innerHTML = '';
    ramp.forEach(c => {
      const s = document.createElement('div');
      s.className = 'legend-swatch';
      s.style.background = c;
      swatchEl.appendChild(s);
    });
  }

  if (!_svg) return;

  const euroNames = new Set(Object.values(ISO_MAP));

  _svg.selectAll('.country-path')
    .transition().duration(350)
    .attr('fill', d => {
      const name = _getName(d);
      if (!name || !euroNames.has(name)) return isDark ? '#1e1c16' : '#e4e0d4';
      return _color(counts[name] || 0);
    })
    .attr('stroke', isDark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.20)')
    .attr('stroke-width', 0.5);
}

export function selectCountry(name) {
  _svg?.selectAll('.country-path').classed('selected', false);
  if (!name || !_features) return;
  const feat = _features.find(d => _getName(d) === name);
  if (feat) _svg.select(`#cp-${feat.id}`).classed('selected', true);
}

function _getName(d) {
  const id = String(d.id).padStart(3, '0');
  return ISO_MAP[id] || ISO_MAP[String(d.id)] || null;
}

function _onMouseMove(event, d) {
  const name = _getName(d);
  const tt   = document.getElementById('map-tooltip');
  if (!tt) return;

  const euroNames = new Set(Object.values(ISO_MAP));
  if (!name || !euroNames.has(name)) {
    tt.style.opacity = '0';
    return;
  }

  const films = window.__mapFilms || [];
  const stats = countryStats(films, name);

  tt.innerHTML = `
    <strong>${name}</strong>
    <div class="tt-row"><span class="tt-label">Films</span><span class="tt-val">${stats.count}</span></div>
    <div class="tt-row"><span class="tt-label">Avg rating</span><span class="tt-val">${stats.avgRating}</span></div>
    <div class="tt-row"><span class="tt-label">Top genre</span><span class="tt-val">${stats.topGenre}</span></div>
  `;
  tt.style.left    = (event.clientX + 16) + 'px';
  tt.style.top     = (event.clientY - 12) + 'px';
  tt.style.opacity = '1';
}

function _onMouseLeave() {
  const tt = document.getElementById('map-tooltip');
  if (tt) tt.style.opacity = '0';
}

function _onClick(event, d) {
  const name = _getName(d);
  const euroNames = new Set(Object.values(ISO_MAP));
  if (!name || !euroNames.has(name)) return;
  if (_onSelect) _onSelect(name);
}
