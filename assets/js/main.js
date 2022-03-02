const BASE_URL = "assets/data";
const camerasID = document.querySelector("#cameras");

let brandsArr = [];

let searchQuery = "";
let sortType = "";
let filterCameraArr = [];

window.addEventListener("load", function () {
	fetchData(BASE_URL + "/brands.json", renderBrands);
});

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
	camerasID.innerHTML = html;
}

function makeCamera(camera) {
	let cameraBrand = brandsArr.find((brand) => brand.id === camera.brandId).name;

	return `<div class="card">
    <img src="assets/images/products/${camera.img.src}" alt="${camera.img.alt}" width="250" />
    <h6>${cameraBrand}</h6>
    <h5>${camera.name}</h5>
    <div class="price">
        <p>${camera.price.current}</p>
        ${camera.price.old === null ? "" : `<small><s>${camera.price.old}</s></small>`}
    </div>
</div>`;
}
