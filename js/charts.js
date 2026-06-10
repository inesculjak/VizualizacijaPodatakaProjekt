import { topN, countByField, ratingHistogram } from './data.js';

const C_GOLD  = '#f4a0be';
const C_MUTED = () => matchMedia('(prefers-color-scheme: dark)').matches ? '#c090a8' : '#a05070';
const C_GRID  = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(255,180,200,.07)' : 'rgba(180,80,110,.07)';
const C_TEXT  = () => matchMedia('(prefers-color-scheme: dark)').matches ? '#f0d8e4' : '#2a0f1a';
const C_BG    = () => matchMedia('(prefers-color-scheme: dark)').matches ? '#200e16' : '#ffffff';
const DUR     = 500;

export const GENRE_COLORS = {
  'Drama':       '#e8c45a',
  'Comedy':      '#4a90d9',
  'Thriller':    '#e07b54',
  'Crime':       '#6bbf8e',
  'Romance':     '#b57fd4',
  'Horror':      '#e06882',
  'War':         '#7ab8d4',
  'History':     '#b8a450',
  'Sci-Fi':      '#82c4b4',
  'Mystery':     '#d4a050',
  'Animation':   '#e8a0c0',
  'Adventure':   '#80c0a0',
  'Biography':   '#c090d0',
  'Action':      '#f08060',
  'Fantasy':     '#90b8e0',
  'Documentary': '#a0c070',
  'Music':       '#d4b870',
  'Western':     '#c0a060',
};
const DEFAULT_COLOR = '#aaaaaa';
export function genreColor(g) { return GENRE_COLORS[g] || DEFAULT_COLOR; }

export const chartState = {
  selectedGenre: null,
  genreSort:     'count',
};

const DECADES = [1920,1930,1940,1950,1960,1970,1980,1990,2000,2010,2020];

export function buildGenreChart(films, onSelectGenre) {
  const wrap = document.getElementById('genreChart');
  if (!wrap) return;

  const W  = wrap.clientWidth || 340;
  const m  = { top: 8, right: 44, bottom: 20, left: 96 };
  const w  = W - m.left - m.right;
  const BH = 26;

  const counts = countByField(films, 'genre');
  let data = topN(counts, 10);
  if (!data.length) { wrap.innerHTML = '<p class="no-data">No data.</p>'; return; }

  data = chartState.genreSort === 'alpha'
    ? [...data].sort((a,b) => a[0].localeCompare(b[0]))
    : [...data].sort((a,b) => b[1] - a[1]);

  const H = data.length * BH;

  let svgEl = d3.select(wrap).select('svg');
  if (svgEl.empty()) svgEl = d3.select(wrap).append('svg');
  svgEl.attr('width','100%').attr('viewBox',`0 0 ${W} ${H+m.top+m.bottom}`).attr('height', H+m.top+m.bottom);

  let g = svgEl.select('.chart-root');
  if (g.empty()) g = svgEl.append('g').attr('class','chart-root').attr('transform',`translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain([0, d3.max(data, d=>d[1])]).range([0,w]).nice();
  const y = d3.scaleBand().domain(data.map(d=>d[0])).range([0,H]).padding(0.22);

  let xG = g.select('.x-axis');
  if (xG.empty()) xG = g.append('g').attr('class','x-axis').attr('transform',`translate(0,${H})`);
  xG.transition().duration(DUR)
    .attr('transform',`translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-H))
    .call(ax=>ax.select('.domain').remove())
    .call(ax=>ax.selectAll('line').attr('stroke', C_GRID()))
    .call(ax=>ax.selectAll('text').attr('fill', C_MUTED()).attr('font-size',10));

  let yG = g.select('.y-axis');
  if (yG.empty()) yG = g.append('g').attr('class','y-axis');
  yG.transition().duration(DUR)
    .call(d3.axisLeft(y).tickSize(0).tickPadding(7))
    .call(ax=>ax.select('.domain').remove())
    .call(ax=>ax.selectAll('text').attr('fill', C_TEXT()).attr('font-size',11));

  const bars = g.selectAll('.genre-bar').data(data, d=>d[0]);

  bars.exit().transition().duration(DUR/2).attr('width',0).remove();

  const barsEnter = bars.enter().append('rect').attr('class','genre-bar')
    .attr('x',0).attr('y', d=>y(d[0])).attr('height', y.bandwidth()).attr('width',0)
    .attr('rx',3).style('cursor','pointer');

  bars.merge(barsEnter)
    .on('click', (event, d) => {
      const genre = d[0];
      chartState.selectedGenre = chartState.selectedGenre === genre ? null : genre;
      if (onSelectGenre) onSelectGenre(chartState.selectedGenre);
      _applyGenreHighlight(chartState.selectedGenre);
      g.selectAll('.genre-bar')
        .transition().duration(200)
        .attr('opacity', b => !chartState.selectedGenre || b[0] === chartState.selectedGenre ? 1 : 0.3)
        .attr('stroke', b => b[0] === chartState.selectedGenre ? C_TEXT() : 'none')
        .attr('stroke-width', 1.5);
    })
    .transition().duration(DUR)
    .attr('y', d=>y(d[0]))
    .attr('height', y.bandwidth())
    .attr('width', d=>x(d[1]))
    .attr('fill', d=>genreColor(d[0]))
    .attr('opacity', d => !chartState.selectedGenre || d[0] === chartState.selectedGenre ? 1 : 0.3)
    .attr('stroke', d => d[0] === chartState.selectedGenre ? C_TEXT() : 'none')
    .attr('stroke-width', 1.5).attr('rx',3);

  const labels = g.selectAll('.bar-label').data(data, d=>d[0]);
  labels.exit().transition().duration(DUR/2).attr('opacity',0).remove();
  labels.enter().append('text').attr('class','bar-label').attr('opacity',0)
    .merge(labels)
    .transition().duration(DUR)
    .attr('x', d=>x(d[1])+5)
    .attr('y', d=>y(d[0]) + y.bandwidth()/2 + 4)
    .attr('font-size',10).attr('fill', C_MUTED()).attr('opacity',1)
    .text(d=>d[1]);
}

export function toggleGenreSort(films, onSelectGenre) {
  chartState.genreSort = chartState.genreSort === 'count' ? 'alpha' : 'count';
  buildGenreChart(films, onSelectGenre);
}

export function buildDecadeChart(films) {
  const wrap = document.getElementById('decadeChart');
  if (!wrap) return;

  const W = wrap.clientWidth || 340;
  const m = { top: 10, right: 20, bottom: 48, left: 36 };
  const w = W - m.left - m.right;
  const h = 190;

  const decCounts = countByField(films, 'decade');
  const data = DECADES.map(d => ({ decade: d, count: decCounts[d] || 0 }));

  let svgEl = d3.select(wrap).select('svg');
  if (svgEl.empty()) svgEl = d3.select(wrap).append('svg');
  svgEl.attr('width','100%').attr('viewBox',`0 0 ${W} ${h+m.top+m.bottom}`).attr('height', h+m.top+m.bottom);

  let g = svgEl.select('.chart-root');
  if (g.empty()) g = svgEl.append('g').attr('class','chart-root').attr('transform',`translate(${m.left},${m.top})`);

  let defs = svgEl.select('defs');
  if (defs.empty()) defs = svgEl.append('defs');
  if (defs.select('#area-grad').empty()) {
    const grad = defs.append('linearGradient').attr('id','area-grad').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',1);
    grad.append('stop').attr('offset','0%').attr('stop-color', C_GOLD).attr('stop-opacity',0.32);
    grad.append('stop').attr('offset','100%').attr('stop-color', C_GOLD).attr('stop-opacity',0.02);
  }

  const x = d3.scalePoint().domain(DECADES.map(d=>d+'s')).range([0,w]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(data,d=>d.count)||1]).range([h,0]).nice();

  let xG = g.select('.x-axis');
  if (xG.empty()) xG = g.append('g').attr('class','x-axis').attr('transform',`translate(0,${h})`);
  xG.transition().duration(DUR)
    .call(d3.axisBottom(x).tickSize(0).tickPadding(8))
    .call(ax=>ax.select('.domain').attr('stroke', C_GRID()))
    .call(ax=>ax.selectAll('text')
      .attr('fill', C_MUTED()).attr('font-size',10)
      .attr('text-anchor','end')
      .attr('transform','rotate(-40)'));

  let yG = g.select('.y-axis');
  if (yG.empty()) yG = g.append('g').attr('class','y-axis');
  yG.transition().duration(DUR)
    .call(d3.axisLeft(y).ticks(4).tickSize(-w))
    .call(ax=>ax.select('.domain').remove())
    .call(ax=>ax.selectAll('line').attr('stroke', C_GRID()))
    .call(ax=>ax.selectAll('text').attr('fill', C_MUTED()).attr('font-size',10));

  const area = d3.area().x(d=>x(d.decade+'s')).y0(h).y1(d=>y(d.count)).curve(d3.curveCatmullRom);
  const line = d3.line().x(d=>x(d.decade+'s')).y(d=>y(d.count)).curve(d3.curveCatmullRom);

  let areaPath = g.select('.area-path');
  if (areaPath.empty()) areaPath = g.append('path').attr('class','area-path').attr('fill','url(#area-grad)');
  areaPath.transition().duration(DUR).attr('d', area(data));

  let linePath = g.select('.line-path');
  if (linePath.empty()) {
    linePath = g.append('path').attr('class','line-path')
      .attr('fill','none').attr('stroke', C_GOLD).attr('stroke-width',2.5);
    linePath.attr('d', line(data));
    const len = linePath.node().getTotalLength();
    linePath.attr('stroke-dasharray',len).attr('stroke-dashoffset',len)
      .transition().duration(DUR*2).attr('stroke-dashoffset',0);
  } else {
    linePath.transition().duration(DUR).attr('d', line(data));
  }

  const dots = g.selectAll('.decade-dot').data(data, d=>d.decade);
  dots.exit().transition().duration(DUR/2).attr('r',0).remove();
  dots.enter().append('circle').attr('class','decade-dot')
    .attr('cx',d=>x(d.decade+'s')).attr('cy',d=>y(d.count)).attr('r',0)
    .attr('fill', C_GOLD).attr('stroke', C_BG()).attr('stroke-width',2)
    .merge(dots)
    .transition().duration(DUR)
    .attr('cx',d=>x(d.decade+'s')).attr('cy',d=>y(d.count))
    .attr('r', d=>d.count>0 ? 5 : 0)
    .attr('fill', C_GOLD).attr('stroke', C_BG()).attr('stroke-width',2);
}

export function buildRatingChart(films) {
  const wrap = document.getElementById('ratingChart');
  if (!wrap) return;

  const W = wrap.clientWidth || 340;
  const m = { top: 10, right: 16, bottom: 30, left: 36 };
  const w = W - m.left - m.right;
  const h = 200;

  const { labels, data } = ratingHistogram(films);
  const dataset = labels.map((l,i) => ({ label:l, value:data[i] }));

  let svgEl = d3.select(wrap).select('svg');
  if (svgEl.empty()) svgEl = d3.select(wrap).append('svg');
  svgEl.attr('width','100%').attr('viewBox',`0 0 ${W} ${h+m.top+m.bottom}`).attr('height', h+m.top+m.bottom);
  let g = svgEl.select('.chart-root');
  if (g.empty()) g = svgEl.append('g').attr('class','chart-root').attr('transform',`translate(${m.left},${m.top})`);

  const x = d3.scaleBand().domain(labels).range([0,w]).padding(0.15);
  const y = d3.scaleLinear().domain([0, d3.max(data)||1]).range([h,0]).nice();
  const colorRamp = d3.scaleSequential(d3.interpolateRgb('#e8b0c8','#d4507a')).domain([0, labels.length-1]);

  let xG = g.select('.x-axis');
  if (xG.empty()) xG = g.append('g').attr('class','x-axis').attr('transform',`translate(0,${h})`);
  xG.transition().duration(DUR)
    .call(d3.axisBottom(x).tickSize(0).tickPadding(6))
    .call(ax=>ax.select('.domain').attr('stroke', C_GRID()))
    .call(ax=>ax.selectAll('text').attr('fill', C_MUTED()).attr('font-size',10));

  let yG = g.select('.y-axis');
  if (yG.empty()) yG = g.append('g').attr('class','y-axis');
  yG.transition().duration(DUR)
    .call(d3.axisLeft(y).ticks(4).tickSize(-w))
    .call(ax=>ax.select('.domain').remove())
    .call(ax=>ax.selectAll('line').attr('stroke', C_GRID()))
    .call(ax=>ax.selectAll('text').attr('fill', C_MUTED()).attr('font-size',10));

  const bars = g.selectAll('.rating-bar').data(dataset, d=>d.label);
  bars.exit().transition().duration(DUR/2).attr('y',h).attr('height',0).remove();
  bars.enter().append('rect').attr('class','rating-bar')
    .attr('x',d=>x(d.label)).attr('width',x.bandwidth()).attr('y',h).attr('height',0).attr('rx',3)
    .merge(bars)
    .transition().duration(DUR)
    .attr('x',d=>x(d.label)).attr('width',x.bandwidth())
    .attr('y',d=>y(d.value)).attr('height',d=>h-y(d.value))
    .attr('fill',(d,i)=>colorRamp(i)).attr('rx',3);
}

export function buildScatterChart(films) {
  const wrap = document.getElementById('scatterChart');
  if (!wrap) return;

  const W = wrap.clientWidth || 700;
  const m = { top: 10, right: 20, bottom: 40, left: 42 };
  const w = W - m.left - m.right;
  const h = 240;

  let svgEl = d3.select(wrap).select('svg');
  if (svgEl.empty()) svgEl = d3.select(wrap).append('svg');
  svgEl.attr('width','100%').attr('viewBox',`0 0 ${W} ${h+m.top+m.bottom}`).attr('height', h+m.top+m.bottom);
  let g = svgEl.select('.chart-root');
  if (g.empty()) g = svgEl.append('g').attr('class','chart-root').attr('transform',`translate(${m.left},${m.top})`);

  const x = d3.scaleLinear()
    .domain([d3.min(films,f=>f.year)-2, d3.max(films,f=>f.year)+2]).range([0,w]);
  const y = d3.scaleLinear()
    .domain([d3.min(films,f=>f.rating)-0.2, d3.max(films,f=>f.rating)+0.2]).range([h,0]).nice();

  let xG = g.select('.x-axis');
  if (xG.empty()) xG = g.append('g').attr('class','x-axis').attr('transform',`translate(0,${h})`);
  xG.transition().duration(DUR)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('d')).tickSize(-h))
    .call(ax=>ax.select('.domain').remove())
    .call(ax=>ax.selectAll('line').attr('stroke', C_GRID()))
    .call(ax=>ax.selectAll('text').attr('fill', C_MUTED()).attr('font-size',10));

  let yG = g.select('.y-axis');
  if (yG.empty()) yG = g.append('g').attr('class','y-axis');
  yG.transition().duration(DUR)
    .call(d3.axisLeft(y).ticks(5).tickSize(-w))
    .call(ax=>ax.select('.domain').remove())
    .call(ax=>ax.selectAll('line').attr('stroke', C_GRID()))
    .call(ax=>ax.selectAll('text').attr('fill', C_MUTED()).attr('font-size',10));

  if (g.select('.x-label').empty())
    g.append('text').attr('class','x-label').attr('x',w/2).attr('y',h+32)
      .attr('text-anchor','middle').attr('font-size',11).attr('fill', C_MUTED()).text('Year');
  if (g.select('.y-label').empty())
    g.append('text').attr('class','y-label').attr('transform','rotate(-90)')
      .attr('x',-h/2).attr('y',-32).attr('text-anchor','middle').attr('font-size',11).attr('fill', C_MUTED()).text('Rating');

  let tt = d3.select('#scatter-tooltip');
  if (tt.empty()) {
    tt = d3.select('body').append('div').attr('id','scatter-tooltip')
      .style('position','fixed').style('pointer-events','none').style('opacity',0)
      .style('background', C_BG()).style('border','1px solid rgba(0,0,0,.13)')
      .style('border-radius','8px').style('padding','10px 14px').style('font-size','12px')
      .style('z-index','9999').style('box-shadow','0 4px 16px rgba(0,0,0,.12)').style('line-height','1.6');
  }

  const dots = g.selectAll('.scatter-dot').data(films, d=>d.title+d.year);

  dots.exit().transition().duration(DUR/2).attr('r',0).attr('opacity',0).remove();

  dots.enter().append('circle').attr('class','scatter-dot')
    .attr('cx',d=>x(d.year)).attr('cy',d=>y(d.rating)).attr('r',0).attr('opacity',0)
    .merge(dots)
    .on('mouseenter', (event,d) => {
      tt.style('opacity',1)
        .style('color', C_TEXT())
        .html(`<strong style="color:${genreColor(d.genre)}">${d.title}</strong><br>
               ${d.year} · ${d.country}<br>★ ${d.rating} · ${d.genre}`);
    })
    .on('mousemove', event => tt.style('left',(event.clientX+14)+'px').style('top',(event.clientY-10)+'px'))
    .on('mouseleave', () => tt.style('opacity',0))
    .transition().duration(DUR)
    .attr('cx',d=>x(d.year)).attr('cy',d=>y(d.rating))
    .attr('r',5)
    .attr('fill',d=>genreColor(d.genre))
    .attr('opacity',d => !chartState.selectedGenre || d.genre===chartState.selectedGenre ? 0.8 : 0.08)
    .attr('stroke',d => d.genre===chartState.selectedGenre ? '#fff' : 'none')
    .attr('stroke-width',1.5);
}

function _applyGenreHighlight(genre) {
  d3.selectAll('.scatter-dot')
    .transition().duration(250)
    .attr('opacity', d => !genre || d.genre===genre ? 0.85 : 0.08)
    .attr('r', d => !genre ? 5 : d.genre===genre ? 7 : 4)
    .attr('stroke', d => d.genre===genre ? '#fff' : 'none')
    .attr('stroke-width',1.5);
}

export function updateAllCharts(films, onSelectGenre) {
  buildGenreChart(films, onSelectGenre);
  buildDecadeChart(films);
  buildRatingChart(films);
  buildScatterChart(films);
}
