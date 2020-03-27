const scrapeIt = require('scrape-it');
const fetch = require('node-fetch');
const urls = require('./recipes.json');

const API_ENDPOINT = 'https://recipes-api.fknussel.com/recipes';
const API_TOKEN = '';

const scraperOptions = {
    title: {
        selector: '.header h2',
        convert: str => str.replace('← ', '')
    },
    image: {
        selector: '.content img.image',
        attr: 'src'
    }
};

const scraperPromises = urls
    .map(url => scrapeIt(url, scraperOptions))
    .map(scraperPromise => scraperPromise.then(({ data, response }) => ({
        title: data.title,
        image_url: data.image,
        source_url: response.responseUrl
    })))
    .map(scraperPromise => scraperPromise.catch(err => {
        console.log('🚨 Error while scraping site:', err);
    }));

const apiPromises = scraperPromises
    .map(scraperPromise => scraperPromise.then(payload => {
        return fetch(API_ENDPOINT, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    }))
    .map(fetchPromise => fetchPromise.then(response => response.json()))
    .map(fetchPromise => fetchPromise.then(json => {
       console.log(`✅ [${json.meta.status}] ${json.data.title}`);
    }))
    .map(fetchPromise => fetchPromise.catch(err => {
        console.log('🚨 Error while posting to API:', err);
    }));
