const select = document.getElementById('breeds');
const card = document.querySelector('.card'); 
const form = document.querySelector('form');

// add an initial select option
const firstOption = document.createElement('option');
firstOption.textContent = 'Select a breed';
select.appendChild(firstOption);

// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------
function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .catch(error => console.log('Houston, we have a problem:', error));
}

// fetch a list of breeds and append to the select DOM object
getBreedsArray()
    .then(breeds => appendBreeds(breeds));

// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------
function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

let breedArray;
function getBreedsArray() {
    return fetchData('https://dog.ceo/api/breeds/list/all')
        .then(data => {
            const breedData = data.message;
            // create a new array of all the breeds and sub-breeds
            const breeds = [];
            for (let breed in breedData) {
                const subBreeds = breedData[breed];
                if (subBreeds.length === 0) {
                    breeds.push({name: breed, urlString: breed});
                } else {
                    subBreeds.forEach(subBreed => {
                        breeds.push({name: `${subBreed} ${breed}`, urlString: `${breed}-${subBreed}`});
                    });
                }
            }
            breeds.sort((a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
            })
            breedArray = breeds;
            return breeds;
        });
}

function appendBreeds(breeds) {
    breeds.forEach(breed => {
        const option = document.createElement('option');
        option.textContent = breed.name;
        option.value = breed.urlString;
        select.appendChild(option);
    })
}

function getImage(breed, name) {
    clearCard();
    fetchData(`https://dog.ceo/api/breed/${breed}/images/random`)
        .then(data => {
            const img = document.createElement('img');
            img.src = data.message;
            img.alt = name;
            img.id = breed;
            img.className = 'doggo';
            card.appendChild(img);
            const text = document.createElement('p');
            text.innerHTML = `Click the image to see more <span id="breed-name">${name}</span>s`;
            card.appendChild(text);
        });
}

function clearCard() {
    card.innerHTML = '';
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('comment').value = '';
}

// ------------------------------------------
//  EVENT LISTENERS
// ------------------------------------------
select.addEventListener('change', function(e) {
    const breedName = select[select.selectedIndex].innerHTML;
    getImage(e.target.value, breedName);
});

card.addEventListener('click', function(e) {
    const img = card.querySelector('.doggo');
    const breed = breedArray.find(object => {
        if (object.urlString === img.id) return object;
    })
    getImage(img.id, breed.name);
})

form.addEventListener('submit', postData);

// ------------------------------------------
//  POST DATA
// ------------------------------------------
function postData(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const comment = document.getElementById('comment').value;

    const requestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name, comment})
    };

    fetch('https://jsonplaceholder.typicode.com/comments', requestInit)
        .then(checkStatus)
        .then(response => response.json())
        .then(data => console.log(data))
        .then(clearForm);
}
