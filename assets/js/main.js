const BASE_URL = "assets/data";

const PRODUCTS = document.querySelector("#products");
const SEARCH = document.querySelector("#search");
const HEADER = document.querySelector("header");
const scrollY = window.scrollY;

let brandsArr = [];

let searchQuery = "";
let sortType = localStorage.getItem("sort");
let filterCameraArr = JSON.parse(localStorage.getItem("cameras")) === null ? [] : JSON.parse(localStorage.getItem("cameras"));

const PRODUCTS_PER_PAGE = 10;
const PAGINATION = document.querySelector("#pagination");
let pages = 0;

window.addEventListener("load", function () {
	onReady(onReadyCallback);
	if (this.scrollY >= 50) {
		HEADER.classList.add("bg-dark", "size");
	} else {
		HEADER.classList.remove("bg-dark", "size");
	}

	if (this.window.location.pathname === "/shop.html") {
		SEARCH.value = "";
		fetchData(BASE_URL + "/brands.json", renderBrands);
	}
});

window.addEventListener("scroll", function () {
	if (this.scrollY >= 50) {
		HEADER.classList.add("bg-dark", "size");
	} else {
		HEADER.classList.remove("bg-dark", "size");
	}
});

// Common functions
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
	console.log(isVisible);
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
function filtered(data, searchQuery, sortQuery, cameraArr) {
	let filtered = data.filter((e) => e.name.toLowerCase().includes(searchQuery));
	filtered = sorting(filtered, sortQuery);

	if (cameraArr.length !== 0) {
		filtered = filtered.filter((e) => cameraArr.includes(e.brandId));
	}
	return filtered;
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
	const filteredArray = filtered(cameras, searchQuery, sortType, filterCameraArr);
	pages = Math.ceil(filteredArray.length / PRODUCTS_PER_PAGE);

	addCameras(filteredArray, pages);

	const brands = document.querySelectorAll(".brand");
	const sort = document.querySelector("#sort");

	//Search cameras in input field
	SEARCH.addEventListener("input", function (e) {
		searchQuery = e.target.value.toLowerCase();
		const filteredArray = filtered(cameras, searchQuery, sortType, filterCameraArr);

		addCameras(filteredArray, pages);
	});

	// Brands checkboxes
	brands.forEach((brand) => {
		if (filterCameraArr.some((id) => id === Number(brand.value))) {
			brand.checked = true;
		}
		brand.addEventListener("change", function () {
			if (this.checked) {
				filterCameraArr.push(Number(this.value));
				localStorage.setItem("cameras", JSON.stringify(filterCameraArr));
			} else {
				let index = filterCameraArr.indexOf(Number(this.value));
				filterCameraArr.splice(index, 1);
				localStorage.setItem("cameras", JSON.stringify(filterCameraArr));
			}

			console.log(filterCameraArr);
			const filteredArray = filtered(cameras, searchQuery, sortType, filterCameraArr);
			addCameras(filteredArray, pages);
		});
	});

	//Cameras Sort
	for (let i = 0; i < sort.length; i++) {
		if (sort[i].value === localStorage.getItem("sort")) {
			sort[i].selected = true;
		}
	}
	sort.addEventListener("change", function () {
		sortType = this.value;
		const filteredArray = filtered(cameras, searchQuery, sortType, filterCameraArr);

		addCameras(filteredArray, pages);
		localStorage.setItem("sort", sortType);
	});
}

function addCameras(cameras, pages) {
	let html = "";

	cameras.forEach((camera) => (html += makeCamera(camera)));

	//If there is no product, return notification...
	if (cameras.length === 0) {
		html = '<div class="alert alert-warning" role="alert">There are no products</div>';
	}
	PRODUCTS.innerHTML = html;
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
