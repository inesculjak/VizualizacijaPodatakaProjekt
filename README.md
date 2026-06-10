# European Movies

An interactive data visualisation atlas of notable European films, built with D3.js and Chart.js.

## Dataset

The curated dataset (`data/movies.json`) contains **327 films** across **25 countries**, compiled from well-known European productions.

### Better datasets to replace it with

Two excellent open sources exist for a richer dataset:

| Dataset | Films | Notes | Link |
|---|---|---|---|
| **TMDB / MovieLens Full Dataset** (Kaggle, rounakbanik) | ~45 000 | Has `production_countries` field — filter for European countries | https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset |
| **FIDA – Film Industry Data Repository** (CresCine / Zenodo) | 2013–2024 | Academic dataset of European film production with budget, streaming presence, cross-market data | https://zenodo.org/records/18337436 |

To use the TMDB dataset:
```python
import pandas as pd, json, ast

df = pd.read_csv("movies_metadata.csv", low_memory=False)

EU_COUNTRIES = {
    'France','Italy','Germany','Spain','United Kingdom','Sweden','Denmark',
    'Poland','Russia','Belgium','Netherlands','Austria','Hungary','Romania',
    'Czech Republic','Portugal','Greece','Finland','Norway','Switzerland',
    'Ireland','Croatia','Serbia','Iceland','Turkey',
}

def is_european(prod_countries):
    try:
        countries = ast.literal_eval(str(prod_countries))
        return any(c.get('name','') in EU_COUNTRIES for c in countries)
    except:
        return False

eu = df[df['production_countries'].apply(is_european)].copy()
eu['country'] = eu['production_countries'].apply(
    lambda x: ast.literal_eval(str(x))[0]['name'] if ast.literal_eval(str(x)) else 'Unknown'
)
eu = eu.rename(columns={
    'title':'title','release_date':'year','vote_average':'rating',
    'genres':'genre','vote_count':'votes'
})
# parse year
eu['year'] = pd.to_datetime(eu['year'], errors='coerce').dt.year
eu['decade'] = (eu['year'] // 10 * 10).astype('Int64')

out = eu[['title','country','year','rating','vote_count','decade']].dropna().to_dict('records')
with open('data/movies.json','w') as f:
    json.dump(out, f, indent=2)
```

## Features

- **D3 choropleth map** — all of Europe visible; countries shaded by production count; hover for stats, click to select
- **Country detail panel** — top-rated films, avg rating, top genre, active decades
- **Country ranking sidebar** — ranked list with inline bar indicators
- **Genre bar chart**, **decade line chart**, **rating histogram**, **rating-vs-year scatter**
- **Decade + genre pill filters** — update every chart and the map simultaneously
- **Dark mode** — auto via `prefers-color-scheme`

## Structure

```
european-cinema/
├── index.html
├── README.md
├── css/style.css
├── js/
│   ├── main.js      entry point
│   ├── data.js      load / filter / aggregate
│   ├── map.js       D3 choropleth
│   ├── charts.js    Chart.js genre / decade / rating / scatter
│   └── ui.js        metrics, filter pills, country list + detail
└── data/
    └── movies.json  327 European films, 25 countries
```

## Running

ES modules + `fetch()` require a real HTTP server:

```bash
cd european-cinema
npx serve .          # → http://localhost:3000
# or
python3 -m http.server 8080
```

## Dependencies (CDN, no install)

| Library | Version | Purpose |
|---|---|---|
| D3.js | 7.8.5 | Map projection, TopoJSON |
| TopoJSON | 3.0.2 | Topology decoding |
| Chart.js | 4.4.1 | Genre, decade, rating, scatter |
| world-atlas | 2 | Country topology |
| DM Sans / DM Serif Display | — | Typography |
