// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';
// import { isPropertyAccessToken } from 'liquidjs/dist/util';

// Je kunt de volgende URLs uit onze API gebruiken:
// - https://fdnd.directus.app/items/tribe
// - https://fdnd.directus.app/items/squad
// - https://fdnd.directus.app/items/person
// En combineren met verschillende query parameters als filter, sort, search, etc.
// Gebruik hiervoor de documentatie van https://directus.io/docs/guides/connect/query-parameters
// En de oefeningen uit https://github.com/fdnd-task/connect-your-tribe-squad-page/blob/main/docs/squad-page-ontwerpen.md

// general
const apiEndpoint = "https://fdnd.directus.app/items/person";
const filterStudentsCurrentYear = "&filter{_and:[{squads:{squad_id:{tribe:{name:FDND%20Jaar%201}}}},{squads:{squad_id:{cohort:2425}}}]}";

// person response
const sortByName = "?sort=name";
const fields = "&fields=name,github_handle,avatar,fav_color";

// color response
const fieldFavColor = "?fields=fav_color";
const filterOnlyFilledFavColor = "&filter[fav_color][_neq]=null";
const groupByFavColor = "&groupBy=fav_color";
const countFavColor = "&aggregate[count]=fav_color";
const sortByCountFavColorDesc = "&sort=-count.fav_color";

// Haal alle eerstejaars squads uit de WHOIS API op van dit jaar (2024–2025)
const squadResponse = await fetch('https://fdnd.directus.app/items/squad?filter={"_and":[{"cohort":"2425"},{"tribe":{"name":"FDND Jaar 1"}}]}')

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
const squadResponseJSON = await squadResponse.json()

// Controleer de data in je console (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
// console.log(squadResponseJSON)

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({extended: true}))


// Om Views weer te geven, heb je Routes nodig
// Maak een GET route voor de index
app.get('/', async function (request, response) {
  const colorsResponse = await fetch(`${apiEndpoint}/${fieldFavColor}${filterOnlyFilledFavColor}${groupByFavColor}${countFavColor}${sortByCountFavColorDesc}${filterStudentsCurrentYear}`)
  const colorsResponseJSON = await colorsResponse.json()
  let personResponseJSON

  if(request.query.fav_color) {
    let hexColor = request.query.fav_color;
    hexColor = hexColor.slice(1);
    const personResponse = await fetch(`${apiEndpoint}/${sortByName}${fields}&filter={"fav_color":"%23${hexColor}"}${filterStudentsCurrentYear}`)
    personResponseJSON = await personResponse.json();  
  } else { 
      const personResponse = await fetch(`${apiEndpoint}/${sortByName}${fields}${filterOnlyFilledFavColor}${filterStudentsCurrentYear}`)
      personResponseJSON = await personResponse.json();  
  }
  response.render('index.liquid', {persons: personResponseJSON.data, squads: squadResponseJSON.data, colors: colorsResponseJSON.data})
})

app.get('/birthdays', async function (request, response){
  const personReponse = await fetch('https://fdnd.directus.app/items/person/?fields=name,birthdate&filter=%7B%22_and%22:%5B%7B%22squads%22:%7B%22squad_id%22:%7B%22tribe%22:%7B%22name%22:%22FDND%20Jaar%201%22%7D%7D%7D%7D,%7B%22squads%22:%7B%22squad_id%22:%7B%22cohort%22:%222425%22%7D%7D%7D%5D%7D&sort=birthdate')
  const personResponseJSON = await personReponse.json()

  response.render('birthdays.liquid', {persons: personResponseJSON.data})
})



// // statisch
// app.get('/kleur/zwart', async function (request, response){
//   const hexcode = "9914e1";
//   const personResponse = await fetch(`https://fdnd.directus.app/items/person/?sort=name&fields=name,github_handle,avatar,fav_color&filter={"fav_color":"%23${hexcode}"}&filter{_and:[{squads:{squad_id:{tribe:{name:FDND%20Jaar%201}}}},{squads:{squad_id:{cohort:2425}}}]}`)
//   const personResponseJSON = await personResponse.json()
//   response.render('kleur.liquid', {persons: personResponseJSON.data})
// }) 

// // dynamisch --> kleur is nieuwe pagina
// app.get('/kleur/:fav_color', async function (request, response){
//   let hexColor = request.params.fav_color;
//   hexColor = hexColor.slice(1);
//   const personColorResponse = await fetch(`https://fdnd.directus.app/items/person/?sort=name&fields=name,github_handle,avatar,fav_color&filter={"fav_color":"%23${hexColor}"}&filter{_and:[{squads:{squad_id:{tribe:{name:FDND%20Jaar%201}}}},{squads:{squad_id:{cohort:2425}}}]}`);
//   const personColorResponseJSON = await personColorResponse.json();
//   response.render('kleur.liquid', {persons: personColorResponseJSON.data})
// })

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
app.post('/', async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van POST, redirect naar GET op /
  response.redirect(303, '/')
})

let messages = []

app.get('/berichten', async function (request, response) {
  response.render('messages.liquid', {messages: messages})
})

app.post('/berichten', async function (request, response) {
  messages.push(request.body.messageInput)
  response.redirect(303, '/berichten') // redirect en stuur daarna terug met GET route
})

// Maak een GET route voor een detailpagina met een route parameter, id
// Zie de documentatie van Express voor meer info: https://expressjs.com/en/guide/routing.html#route-parameters
app.get('/student/:id', async function (request, response) {
  // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
  const personDetailResponse = await fetch('https://fdnd.directus.app/items/person/' + request.params.id)
  // En haal daarvan de JSON op
  const personDetailResponseJSON = await personDetailResponse.json()
  
  // Render student.liquid uit de views map en geef de opgehaalde data mee als variable, genaamd person
  // Geef ook de eerder opgehaalde squad data mee aan de view
  response.render('student.liquid', {person: personDetailResponseJSON.data, squads: squadResponseJSON.data})
})

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})