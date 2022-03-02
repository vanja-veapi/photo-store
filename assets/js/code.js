const BASE_URL = "assets/data";
let genresArr = [];
let authorsArr = [];

let searchQuery = "";
let naStanjuQuery = localStorage.getItem("na-stanju"); //restart
let sortQuery = localStorage.getItem("sort");
let filterAuthorArr = JSON.parse(localStorage.getItem("authors")) === null ? [] : JSON.parse(localStorage.getItem("authors"));
let filterGenreArr = JSON.parse(localStorage.getItem("genres")) === null ? [] : JSON.parse(localStorage.getItem("genres"));

window.addEventListener("load", function () {
	fetchData(BASE_URL + "/genres.json", renderGenres);
});

// Genre Functions 1. KORAK
function renderGenres(genres) {
	const zanrovi = document.querySelector("#zanrovi");
	let html = "";

	for (let genre of genres) {
		html += makeItem(genre, "zanr", "zanrovi");
	}
	genresArr = genres;

	zanrovi.innerHTML = html;
	fetchData(BASE_URL + "/authors.json", renderAuthors);
}

// Author Functions 2. KORAK
function renderAuthors(authors) {
	const pisci = document.querySelector("#pisci");
	let html = "";

	for (let author of authors) {
		html += makeItem(author, "pisac", "pisci");
	}
	authorsArr = authors;

	pisci.innerHTML = html;
	fetchData(BASE_URL + "/books.json", renderBooks);
}

// Book Functions 3. KORAK
function renderBooks(books) {
	const filteredArray = filtered(books, searchQuery, naStanjuQuery, sortQuery, filterAuthorArr, filterGenreArr);
	addBooks(filteredArray);
	//Filter - Pretraga
	const pretraga = document.querySelector("#pretraga");

	pretraga.addEventListener("input", function () {
		searchQuery = this.value.toLowerCase();
		console.log(searchQuery);
		const filteredArray = filtered(books, searchQuery, naStanjuQuery, sortQuery, filterAuthorArr, filterGenreArr);
		addBooks(filteredArray);
	});

	//Filter - Na stanju
	const stanje = document.querySelectorAll(".stanje");
	stanje.forEach((item) => {
		if (localStorage.getItem("na-stanju") === item.value) {
			item.checked = true;
		}

		item.addEventListener("change", function () {
			naStanjuQuery = this.value;

			const filteredArray = filtered(books, searchQuery, naStanjuQuery, sortQuery, filterAuthorArr, filterGenreArr);
			addBooks(filteredArray);

			localStorage.setItem("na-stanju", naStanjuQuery);
		});
	});

	//Sort - Po ceni
	const sort = document.querySelector("#sort");

	//Local storage za sort...
	for (let i = 0; i < sort.length; i++) {
		if (sort[i].value === localStorage.getItem("sort")) {
			sort[i].selected = true;
		}
	}
	sort.addEventListener("change", function () {
		sortQuery = this.value;

		const filteredArray = filtered(books, searchQuery, naStanjuQuery, sortQuery, filterAuthorArr, filterGenreArr);
		addBooks(filteredArray);

		localStorage.setItem("sort", sortQuery);
	});

	//Filter - Pisac
	const pisci = document.querySelectorAll(".pisac");
	cbForEach(pisci, filterAuthorArr, "authors", books);

	//Filter - Zanr
	const zanrovi = document.querySelectorAll(".zanr");
	cbForEach(zanrovi, filterGenreArr, "genres", books);
}
function addBooks(books) {
	const knjige = document.querySelector("#knjige");
	let html = "";
	for (let book of books) {
		html += makeBook(book);
	}
	knjige.innerHTML = html;
}

function makeBook(book) {
	//Find ne radi ako se ide Niz sa nizom, vec samo niz sa brojem, tako da ako ide niz sa nizom mora u for petlju
	const authorName = authorsArr.find((author) => author.id === book.pisacId).name;

	//Provucemo kroz forPetlju niz zanrova iz JSON-a i onda unutar forEach ide find
	let renderGenderNames = "";
	book.zanrId.forEach((genre, index) => {
		const genreName = genresArr.find((item) => item.id === genre).name;
		book.zanrId.length - 1 === index ? (renderGenderNames += genreName) : (renderGenderNames += genreName + ", ");
	});

	return `<div class="col-lg-4 col-md-6 mb-4">
    <div class="card h-100">
      <a href="#"><img class="card-img-top" src="${book.slika.src}" alt="${book.slika.alt}"></a>
      <div class="card-body">
        <h4 class="card-title">
          <a href="#">${book.naslov}</a>
        </h4>
      <h6>${authorName}</h6>
        <h5>${book.cena.aktuelnaCena}</h5>
        <s>${book.cena.staraCena}</s>
        <p style="color: blue;">${book.stanje ? "Na stanju" : "Nije na stanju"}</p>
        <p class="card-text">
          ${renderGenderNames}
        </p>
      </div>
    </div>
  </div>`;
}

// Common functions
function fetchData(path, callback, method = "GET") {
	$.ajax({
		url: `${path}`,
		method,
		dataType: "json",
		success: function (data) {
			callback(data);
		},
		error: function (error) {
			console.log(error);
		},
	});
}

function makeItem(item, classAttr, nameAttr) {
	return `<li class="list-group-item">
    <input type="checkbox" value="${item.id}" class="${classAttr}" name="${nameAttr}"/> ${item.name}
</li>`;
}

function cbForEach(e, array, localStorageKey, booksData) {
	e.forEach((item) => {
		if (array.some((number) => number === Number(item.value)) && array !== null) {
			item.checked = true;
		}
		item.addEventListener("change", function () {
			if (this.checked) {
				array.push(Number(this.value));
				localStorage.setItem(`${localStorageKey}`, JSON.stringify(array));
			} else {
				let index = array.indexOf(Number(this.value));
				array.splice(index, 1);
				localStorage.setItem(`${localStorageKey}`, JSON.stringify(array));
			}

			const filteredArray = filtered(booksData, searchQuery, naStanjuQuery, sortQuery, filterAuthorArr, filterGenreArr);
			addBooks(filteredArray);
		});
	});
}
// Filter & sort functions
function filtered(books, searchQuery, naStanjuQuery, sortQuery, authorArr, genreArr) {
	let filtered = books.filter((e) => e.naslov.toLowerCase().includes(searchQuery) || e.pisac.toLowerCase().includes(searchQuery));
	filtered = naStanju(filtered, naStanjuQuery);
	filtered = sorting(filtered, sortQuery);
	if (authorArr.length !== 0) {
		console.log(authorArr);
		filtered = filtered.filter((e) => authorArr.includes(e.pisacId));
	}
	if (genreArr.length !== 0) {
		console.log(genreArr);
		//ako se e.zanrId nalazi(includes) u nizu genrersArr, trebalo bi ovde koristiti some
		filtered = filtered.filter((e) => genreArr.some((y) => e.zanrId.includes(y)));
	}

	return filtered;
}

function naStanju(books, query) {
	let filtered = null;
	switch (query) {
		case "true":
			filtered = books.filter((e) => e.stanje === true);
			break;
		case "false":
			filtered = books.filter((e) => e.stanje === false);
			break;
		default:
			filtered = books;
	}
	return filtered;
}

function sorting(books, sortQuery) {
	let sorted = null;
	switch (sortQuery) {
		case "asc":
			sorted = books.sort((a, b) => a.cena.aktuelnaCena - b.cena.aktuelnaCena);
			break;
		case "desc":
			sorted = books.sort((a, b) => b.cena.aktuelnaCena - a.cena.aktuelnaCena);
			break;
		case "autorAsc":
			sorted = books.sort((a, b) => {
				if (a.pisac < b.pisac) return -1;
				else if (a.pisac > b.pisac) return 1;
				else return 0;
			});
			break;
		case "autorDesc":
			sorted = books.sort((a, b) => {
				if (a.pisac > b.pisac) return -1;
				else if (a.pisac < b.pisac) return 1;
				else return 0;
			});
			break;

		default:
			sorted = books;
	}

	return sorted;
}

// pisci.forEach(pisac => {
//     if (filterAuthorArr.some(number => number === Number(pisac.value)) && filterAuthorArr !== null) {
//         pisac.checked = true;
//     }
//     pisac.addEventListener("change", function () {
//         if (this.checked) {
//             filterAuthorArr.push(Number(this.value));
//             localStorage.setItem("authors", JSON.stringify(filterAuthorArr));
//         } else {
//             let index = filterAuthorArr.indexOf(Number(this.value));
//             filterAuthorArr.splice(index, 1);
//             localStorage.setItem("authors", JSON.stringify(filterAuthorArr));
//         }

//         const filteredArray = filtered(books, searchQuery, naStanjuQuery, sortQuery, filterAuthorArr, filterGenreArr);
//         addBooks(filteredArray);
//     });
// })
// zanrovi.forEach(zanr => {
//     if (filterGenreArr.some(number => number === Number(zanr.value)) && filterGenreArr !== null) {
//         zanr.checked = true;
//     }
//     zanr.addEventListener("change", function () {
//         if (this.checked) {
//             filterGenreArr.push(Number(this.value));
//             localStorage.setItem("genres", JSON.stringify(filterGenreArr));
//         } else {
//             let index = filterAuthorArr.indexOf(Number(this.value));
//             filterGenreArr.splice(index, 1);
//             localStorage.setItem("genres", JSON.stringify(filterGenreArr));
//         }

//         const filteredArray = filtered(books, searchQuery, naStanjuQuery, sortQuery, filterAuthorArr, filterGenreArr);
//         addBooks(filteredArray);

//     })
// })
