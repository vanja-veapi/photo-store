const BASE_URL = "assets/data";
const products = document.querySelector("#products");

let brandsArr = [];

let searchQuery = "";
let sortType = "";
let filterCameraArr = [];

window.addEventListener("load", function () {
	onReady(function () {
		let isVisible = setVisible("#loading", false);
		console.log(isVisible);
		if (isVisible === "none") {
			document.querySelector("body").classList.remove("overflow-hidden");
		}
	});

	if (this.window.location.pathname === "/shop.html") {
		fetchData(BASE_URL + "/brands.json", renderBrands);
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

function sorting(data, sortQuery) {
	data.sort((a, b) => {
		if (sortQuery === "asc") {
			return a.price.current - b.price.current;
		} else if (sortQuery === "desc") {
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
	addCameras(filteredArray);

	const search = document.querySelector("#search");
	const brands = document.querySelectorAll(".brand");
	const sort = document.querySelector("#sort");

	search.addEventListener("input", function (e) {
		searchQuery = e.target.value.toLowerCase();
		const filteredArray = filtered(cameras, searchQuery, sortType, filterCameraArr);

		addCameras(filteredArray);
	});

	brands.forEach((brand) => {
		if (filterCameraArr.some((id) => id === Number(brand.value))) {
			brand.checked = true;
		}
		brand.addEventListener("change", function () {
			if (this.checked) {
				filterCameraArr.push(Number(this.value));
				//LS
			} else {
				let index = filterCameraArr.indexOf(Number(this.value));
				filterCameraArr.splice(index, 1);
				//ls
			}

			console.log(filterCameraArr);
			const filteredArray = filtered(cameras, searchQuery, sortType, filterCameraArr);
			addCameras(filteredArray);
		});
	});

	sort.addEventListener("change", function () {
		sortType = this.value;
		const filteredArray = filtered(cameras, searchQuery, sortType, filterCameraArr);

		addCameras(filteredArray);
		// LS
	});
}
function addCameras(cameras) {
	let html = "";

	for (let camera of cameras) {
		html += makeCamera(camera);
	}

	//If there is no product, return notification...
	if (cameras.length === 0) {
		html = '<div class="alert alert-primary" role="alert">There are no products</div>';
	}
	products.innerHTML = html;
}

function makeCamera(camera) {
	let cameraBrand = brandsArr.find((brand) => brand.id === camera.brandId).name;

	return `<div class="card col-12 col-md-6 col-lg-3 text-center">
    <div class="d-flex justify-content-center align-items-center">
		<img src="assets/images/products/${camera.img.src}" alt="${camera.img.alt}" width="250" class="img-fluid"/>
	</div>
    <h4 class="text-orange">${camera.name}</h4>
    <h6 class="h5">${cameraBrand}</h6>
    <div class="price d-flex justify-content-center">
        <p>${camera.price.current} &euro;</p>
        ${camera.price.old === null ? "" : `<s class="ms-3"><small class="text-muted">${camera.price.old}&euro;</small></s>`}
    </div>
</div>`;
}
