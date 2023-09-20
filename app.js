//Definieren der Packages
const axios = require("axios");
const express = require("express");
const app = express();
const port = 3003;
const cheerio = require("cheerio");

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//Definieren der Märkte
const markets = ["americas", "europe-middle-east-africa", "asia-pacific", "climate-leaders", "cryptocurrencies", "currencies", "most-active", "gainers", "losers"]; // Array mit den markets

    
// Axios GET request
async function fetchData(market) {
  try { //ändert den Path je nach market. Für die ersten 3 Märkte muss nämlich /indexes/ vorangestellt werden
    const path = market === "americas" || market === "europe-middle-east-africa" || market === "asia-pacific" ? `/indexes/${market}` : `/${market}`;
    const response = await axios.get(`https://www.google.com/finance/markets${path}`); // mit Axios den HTML Code von der Seite holen und in response speichern
    const html = response.data; // HTML Code in html speichern

    const $ = cheerio.load(html); // mit Cheerio laden und formartiert in $ speichern

    const stockDataArray = []; // Erstelle ein Array

    //erstelle für jede Zeile ein Element im Array (div.SxcTic)
    $("div.SxcTic").each((index, element) => {
      const stockName = $(element).find("div.ZvmM7").text(); // finde in jedem Element die Klasse (div.ZvmM7) und speichere den Wert in stockName
      const stockScore = $(element).find("div.YMlKec").text(); // finde in jedem Element die Klasse (div.YMlKec) und speichere den Wert in stockScore
      const gainLoseToday = $(element).find("div.SEGxAb").text(); // finde in jedem Element die Klasse (span.P2Luy.Ebnabc) und speichere den Wert in gainLoseToday
      const gainLoseTodayinPercent = $(element).find("div.JwB6zf").text(); // finde in jedem Element die Klasse (div.JwB6zf) und speichere den Wert in gainLoseTodayinPerce

      // Formatieren von gainLoseTodayinPercent (+/- davor anhand von gainLoseToday)
      let formattedGainLoseTodayinPercent;

      if (gainLoseToday.startsWith("+")) { // wenn gainLoseTodayinPercent mit + beginnt
        formattedGainLoseTodayinPercent = `+${gainLoseTodayinPercent}`; // füge ein + hinzu
      } else if (gainLoseToday.startsWith("-")) { // wenn gainLoseTodayinPercent mit - beginnt 
        formattedGainLoseTodayinPercent = `-${gainLoseTodayinPercent}`; // füge ein - hinzu
      } else { // ansonsten lasse es so wie es ist
        formattedGainLoseTodayinPercent = gainLoseTodayinPercent;
      }

      const stockDataItem = { // erstelle ein Objekt mit den Werten
        Name: stockName,
        Score: stockScore,
        Gain_or_Loose: gainLoseToday,
        Gain_or_Loose_in_Percent: formattedGainLoseTodayinPercent,
      };

      stockDataArray.push(stockDataItem); //Das Objekt dem Array hinzufügen
    });

    return stockDataArray; // gebe das Array zurück

  } catch (error) {
    console.error(error);
  }
}

// Express GET request
markets.forEach((market) => { // für jeden Eintrag in markets
  app.get(`/stock/${market}`, async (req, res) => { // erstelle einen GET request mit dem Pfad /stock/${market} (Route Parameter)
      const stockData = await fetchData(market); // speichere das Array in stockData
      res.send(stockData); // sende das Array als JSON zurück
  }
  )}
  );