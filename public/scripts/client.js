// haal parameters uit URL op --> dit is alles na ?
// new URLSearchParams(window.location.search) --> zet string om naar object (zodat je met fav_color waarde kan werken)
const paramsFromURL = new URLSearchParams(window.location.search);

// haal waarde op uit fav_color --> hier komt dus een hex code (#000000) uit
const hexColor = paramsFromURL.get("fav_color");

if (hexColor) { // als er een hex code is, dan voer uit
    const colorInputs = document.querySelectorAll(".color-input"); // haal alle color inputs op

    colorInputs.forEach(input => { // voor elke color input
        input.checked = (input.value === hexColor); // zet checked = true, als input.value (value in liquid (dynamisch) gedefinieerd met {{ data.fav_color }})gelijk is aan de hex code (uit de URL)
    })
}

// Oude oplossing linken naar pagina (nu opgelost in app.get('/'))
// // Haal alle .color-inputs op (alle radio inputs)
// const colorInputs = document.querySelectorAll(".color-input");

// // Voeg event listener toe aan elke radio button
// colorInputs.forEach(input => {
//     input.addEventListener("change", getStudentsWithThisColor);
// });

// // Functie om door te sturen naar juiste kleur URL
// function getStudentsWithThisColor(event) {
//     let checkedInput = event.target.value.replace("#", "%23"); // Encode hex
//     window.location.href = `/kleur/${checkedInput}`;
// }