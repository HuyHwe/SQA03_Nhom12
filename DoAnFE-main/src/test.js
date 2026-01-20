
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeDistricts(url) {
  try {
    // Send an HTTP GET request to the website
    const response = await axios.get(url);

    // Load the HTML content of the page using Cheerio
    const $ = cheerio.load(response.data);

    // Select the district rows from the HTML table
    const districtRows = $('tr');

    // Create an array to store district data
    const districtData = [];

    // Iterate over each district row
    districtRows.each((index, element) => {
      // Extract district name, latitude, and longitude from the row
      const cells = $(element).find('td');
      if (cells.length >= 3) {
        const districtName = $(cells[0]).text().trim();
        const latitude = $(cells[1]).text().trim();
        const longitude = $(cells[2]).text().trim();

        // Append district data to the array
        districtData.push({
          'District Name': districtName,
          'Latitude': latitude,
          'Longitude': longitude
        });
      }
    });
    console.log(`Fetch data: ${districtData}`);
    return districtData;
  } catch (error) {
    // Print an error message if the request fails
    console.error(`Failed to fetch data: ${error}`);
    return null;
  }
}

// URL of the website to scrape
const url = 'https://geokeo.com/database/district/vn/';

// Call the function to scrape district data
scrapeDistricts(url)
  .then((districts) => {
    // Print the scraped district data
    if (districts) {
      districts.forEach((district) => {
        console.log(district);
      });
    }
  })
  .catch((error) => {
    console.error(error);
  });
