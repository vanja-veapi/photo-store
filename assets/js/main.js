const BASE_URL = "assets/data";

const header = document.querySelector("header");
const products = document.querySelector("#products");
const search = document.querySelector("#search");
const cart = document.querySelector("#cart");
const modal = document.querySelector("#modal");
const scrollY = window.scrollY;

let allCameras = []; // allCameras take all cameras and put in this array, for global purpose.
let brandsArr = []; // BrandsArr take all brands and put in this array, for global purpose.

let searchQuery = "";
let sortType = localStorage.getItem("sort");
let filterCameraBrandsArr = JSON.parse(localStorage.getItem("cameras")) === null ? [] : JSON.parse(localStorage.getItem("cameras"));

const RECORDS_PER_PAGE = 10;
let currentPage = 1;

window.addEventListener("load", function () {
	onReady(onReadyCallback);
	if (this.scrollY >= 50) {
		header.classList.add("bg-dark", "size");
	} else {
		header.classList.remove("bg-dark", "size");
	}

	if (this.window.location.pathname === "/shop.html") {
		search.value = "";
		fetchData(BASE_URL + "/brands.json", renderBrands);
	}

	modal.style.transform = "translateX(0%)"
	cart.addEventListener("click", toggleModal);
});

window.addEventListener("scroll", function () {
	if (this.scrollY >= 50) {
		header.classList.add("bg-dark", "size");
		modal.style.top = "80px";
	} else {
		header.classList.remove("bg-dark", "size");
		modal.style.removeProperty("top");
	}
});

function onReady(callback) {
	var intervalId = window.setInterval(function () {
		if (document.getElementsByTagName("body")[0] !== undefined) {
			window.clearInterval(intervalId);
			callback.call(this);
		}
	}, 1000);
}
function onReadyCallback() {
	let isVisible = setVisible("#loading", false);
	if (isVisible === "none") {
		document.querySelector("body").classList.remove("overflow-hidden");
	}
}

function setVisible(selector, visible) {
	return (document.querySelector(selector).style.display = visible ? "block" : "none");
}
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

function sorting(data, sortType) {
	data.sort((a, b) => {
		if (sortType === "asc") {
			return a.price.current - b.price.current;
		} else if (sortType === "desc") {
			return b.price.current - a.price.current;
		}
	});

	return data;
}

// Brands
function renderBrands(brands) {
	const brandsID = document.querySelector("#brands");
	let html = "";

	for (let brand of brands) {
		html += makeListItem(brand, "brand");
	}
	brandsArr = brands;
	brandsID.innerHTML = html;

	fetchData(BASE_URL + "/cameras.json", renderCameras);
}

// Cameras
function renderCameras(cameras) {
	allCameras = cameras;

	const filteredArray = filtered(allCameras, searchQuery, sortType, filterCameraBrandsArr, currentPage);

	// Ovu funkciju i addPageNumber cu da pozovem u filtered
	let pageNumber = numPages(cameras);
	addPageNumber(pageNumber);
	addCameras(filteredArray);

	const pages = document.querySelectorAll(".pages");
	let activePage = 0;
	pages[activePage].classList.add("active");

	pages.forEach((page) =>
		page.addEventListener("click", function (e) {
			e.preventDefault();

			currentPage = e.target.dataset.id;
			if (e.target !== this || e.target) {
				this.classList.add("active")
			}
			if (activePage != currentPage - 1) {
				console.log(activePage, currentPage);
				pages[activePage].classList.remove("active");
			}
			console.log(pages[activePage]);
			activePage = currentPage - 1;
			console.log(activePage);

			const filteredArray = filtered(allCameras, searchQuery, sortType, filterCameraBrandsArr, currentPage);
			addCameras(filteredArray);
		})
	);

	const BRANDS = document.querySelectorAll(".brand");
	const SORT = document.querySelector("#sort");

	//Search cameras in input field
	search.addEventListener("input", function (e) {
		searchQuery = e.target.value.toLowerCase();
		const filteredArray = filtered(allCameras, searchQuery, sortType, filterCameraBrandsArr, currentPage);

		addCameras(filteredArray);
	});

	// Brands checkboxes
	BRANDS.forEach((brand) => {
		if (filterCameraBrandsArr.some((id) => id === Number(brand.value))) {
			brand.checked = true;
		}
		brand.addEventListener("change", function () {
			if (this.checked) {
				filterCameraBrandsArr.push(Number(this.value));
				localStorage.setItem("cameras", JSON.stringify(filterCameraBrandsArr));
			} else {
				let index = filterCameraBrandsArr.indexOf(Number(this.value));
				filterCameraBrandsArr.splice(index, 1);
				localStorage.setItem("cameras", JSON.stringify(filterCameraBrandsArr));
			}
			// console.log(filterCameraBrandsArr);

			const filteredArray = filtered(allCameras, searchQuery, sortType, filterCameraBrandsArr, currentPage);
			addCameras(filteredArray);
		});
	});

	//Cameras Sort
	for (let i = 0; i < SORT.length; i++) {
		if (SORT[i].value === localStorage.getItem("sort")) {
			SORT[i].selected = true;
		}
	}
	SORT.addEventListener("change", function () {
		sortType = this.value;
		const filteredArray = filtered(allCameras, searchQuery, sortType, filterCameraBrandsArr, currentPage);

		addCameras(filteredArray);
		localStorage.setItem("sort", sortType);
	});
}

function addCameras(cameras) {
	let html = "";

	cameras.forEach((camera, index) => {
		if (index < RECORDS_PER_PAGE) {
			html += makeCamera(camera);
		}
	});

	//If there is no product, return notification...
	if (cameras.length === 0) {
		html = '<div class="alert alert-warning" role="alert">There are no products</div>';
	}
	products.innerHTML = html;
}

function makeCamera(camera) {
	let cameraBrand = brandsArr.find((brand) => brand.id === camera.brandId).name;

	return `<div class="col-12 col-md-6 col-lg-4 col-xl-3 mt-3">
	<div class="card text-center position-relative">
		<div class="d-flex justify-content-center align-items-center">
			<img src="assets/images/products/${camera.img.src}" alt="${camera.img.alt}" width="250" class="img-fluid"/>
		</div>
		<h4 class="text-orange h5 mt-3">${camera.name}</h4>
		<h6 class="h5">${cameraBrand}</h6>
		<div class="price d-flex justify-content-center mb-3">
			<p class="h3">${camera.price.current} &euro;</p>
			${camera.price.old === null ? "" : `<s class="ms-3"><small class="text-muted">${camera.price.old}&euro;</small></s>`}
		</div>
	</div>
</div>`;
}

/**
 * @param {object} item - Data from json
 * @param {String} className
 * @returns
 */
function makeListItem(item, className) {
	return `<li class="list-group-item">
    <input type="checkbox" value="${item.id}" class="${className}" name="${className}"/> ${item.name}
</li>`;
}

/**
 * Function which pair all sorts and functions...
 * @param {object} data
 * @param {string} searchQuery
 * @returns
 */
function filtered(data, searchQuery, sortQuery, cameraArr, currentPage) {
	let filtered = data.filter((e) => e.name.toLowerCase().includes(searchQuery));
	filtered = sorting(filtered, sortQuery);

	// console.log("Treba da ispise trenutno stranicu pod rednim brojem " + currentPage);



	//If brands array has no length 0, then enter in if adn go through all filtered(cameras) which brandId is = with  numberId in array... 
	if (cameraArr.length !== 0) {
		filtered = filtered.filter((e) => cameraArr.includes(e.brandId));
	}
	if (cameraArr.length === 0 && searchQuery == "") {
		filtered = changePage(currentPage, filtered);
	}
	//Ako sam na drugoj ili trecoj pretraga ne radi - Trebalo bi da je sredjeno
	//Ako sortiram, on pregazi stranicu i dohvata sve iz camerasData, pa ga sortira po tom principu
	return filtered;
}

/**
 * 
 * @returns Number of page on site.
 */
function numPages(objJSON) {
	return Math.ceil(objJSON.length / RECORDS_PER_PAGE);
}
function changePage(pageNum, camerasData) {
	// console.log(camerasData);
	// console.log("Promena stranice " + pageNum);

	let productsOnPage = [];

	/*Formula za for je sledeca
		i = 2 * 10 = 20
		meni ne postoji camerasData[20] i zato on vraca undefined, 
		meni treba da ovo i bude 0 i da krene od 0 elemtna
	*/
	for (let i = (pageNum - 1) * RECORDS_PER_PAGE; i < pageNum * RECORDS_PER_PAGE; i++) {
		if (camerasData[i] === undefined) {
			break;
		}
		productsOnPage.push(camerasData[i]);
	}
	// console.log(productsOnPage);
	return productsOnPage;
}
function addPageNumber(pages) {
	const PAGINATION = document.querySelector("#pagination");

	let html = "";
	for (let i = 0; i < pages; i++) {
		html += `<li class="list-group-item border pages" data-id="${i + 1}"><a href="#" class="text-dark" data-id="${i + 1}">${i + 1}</a></li>`;
	}

	PAGINATION.innerHTML = html;
}
//Paginacija radi, samo namestiti da posle filtriranja ostane ta strana...

//With this function, I'll open a cartModal, or menuModal
function toggleModal() {
	modal.style.transform === "translateX(0%)" ? modal.style.transform = "translateX(-90%)" : modal.style.transform = "translateX(0%)";
}
