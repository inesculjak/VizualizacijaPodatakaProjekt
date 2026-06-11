## 5.1. Projektna dokumentacija

### Hijerarhija projekta

Projekt je organiziran u četiri glavne cjeline. Korijenski direktorij sadrži `index.html` koji definira cjelokupnu HTML strukturu stranice. Mapa `css/` sadrži jednu datoteku `style.css` koja pokriva sve stilove projekta. Mapa `js/` podijeljena je na pet modula od kojih svaki ima jasno definiranu odgovornost: `main.js`, `data.js`, `map.js`, `charts.js`, `ui.js`. Mapa `data/` sadrži jednu datoteku `movies.json` s filtriranim datasetom filmova.

---

### Popis korištenih tehnologija

- Visual Studio Code
- Live Server ekstenzija u VS Code
- HTML
- CSS
- JavaScript
- D3
- Python
- pandas

---

### Upute za postavljanje

Preporučeni način pokretanja je kroz Visual Studio Code s ekstenzijom Live Server:

1. Preuzeti i instalirati [Visual Studio Code](https://code.visualstudio.com/)
2. Otvoriti VS Code i u bočnoj traci otvoriti karticu Extensions
3. Potražiti **Live Server** i kliknuti Install
4. Otvoriti projekt u VS Code-u putem File → Open Folder
5. Desnim klikom na `index.html` u bočnom panelu odabrati **Open with Live Server**

Aplikacija se automatski otvara u pregledniku na adresi `http://127.0.0.1:5500`. Svaka promjena u kodu automatski osvježava stranicu u pregledniku.

---

### Upute za korištenje

Aplikacija se u potpunosti može koristiti u pregledniku bez registracije ili prijave.

Filtriranje podataka vrši se kroz dvije grupe gumba pri vrhu stranice. Gornji red služi za odabir desetljeća, a donji za odabir žanra. Oba filtera mogu biti aktivna istovremeno - primjerice, moguće je prikazati samo dramske filmove iz 1990-ih. Klik na **All** ili **All genres** poništava filtere i vraća prikaz na sve podatke.

Interakcija s kartom odvija se na dva načina. Prelaskom miša iznad pojedine države prikazuje se skočni prozor s brojem filmova, prosječnom ocjenom i najčešćim žanrom za tu državu u trenutnom odabiru filtera. Klikom na državu otvara se bočni panel s detaljnijim informacijama: popis pet najcjenjenijih filmova s godinom i ocjenom, prosječna ocjena, dominantni žanr i desetljeća u kojima je zemlja bila aktivna. Odabir se poništava ponovnim klikom na istu državu. Bočni panel se također može otvoriti klikom na zemlju u dijelu **Country ranking**.

Grafikon žanrova ima gumb **Sort A–Z** koji prebacuje između sortiranja po broju filmova i abecednog sortiranja, pri čemu se stupci animirano premještaju na nove pozicije. Klik na bilo koji stupac izdvaja odgovarajuće točke na scatter plotu u donjem dijelu stranice dok sve ostale blijede. Ponovni klik na isti stupac vraća scatter plot na normalan prikaz svih točaka. Na scatter plotu svaka točka predstavlja jedan film, a prelaskom miša prikazuje se naziv filma, godina, zemlja, ocjena i žanr. Boje točaka određene su žanrovima i usklađene su s onima na grafikonu žanrova.
