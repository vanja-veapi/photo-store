/**
 * 1. Na index.htmlu kad se dodje skroluje, ne gubi se nav bg
 * 2. Treba da se nav ispisuje dinamicki 
 */

const BASE_URL = "assets/data";

const header = document.querySelector("header");
const products = document.querySelector("#products");
const search = document.querySelector("#search");
const cart = document.querySelector("#cart");
const hamburger = document.querySelector("#hamburger");
const modal = document.querySelector("#modal");
const scrollY = window.scrollY;

const mobileMenu = document.querySelector("#mobile-menu");
const productModal = document.querySelector("#product-modal");
const closeModal = document.querySelector("#close-modal");

const itemsInCart = document.querySelector("#items-in-cart");

let allCameras = []; // allCameras take all cameras and put in this array, for global purpose.
let brandsArr = []; // BrandsArr take all brands and put in this array, for global purpose.

let searchQuery = "";
let sortType = localStorage.getItem("sort");
let filterCameraBrandsArr = JSON.parse(localStorage.getItem("cameras")) === null ? [] : JSON.parse(localStorage.getItem("cameras"));
let cartCount = localStorage.getItem("cart-counter") === null ? 0 : localStorage.getItem("cart-counter");
let isCartOpen = false;

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

	modal.style.transform = "translateX(0%)";
	cart.addEventListener("click", toggleCart);
	hamburger.addEventListener("click", toggleMenu);
	itemsInCart.innerHTML = cartCount;

});

window.addEventListener("scroll", function () {
	if (this.scrollY >= 50) {
		header.classList.add("bg-dark", "size");
		modal.style.top = "80px";
	} else if (this.scrollY <= 50 && mobileMenu?.classList.contains('d-none')) {
		header.classList.remove("bg-dark");
		modal.style.removeProperty("top");
	}

	if (this.scrollY <= 50) {
		header.classList.remove("size")
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

	const brands = document.querySelectorAll(".brand");
	const sort = document.querySelector("#sort");

	//Search cameras in input field
	search.addEventListener("input", function (e) {
		searchQuery = e.target.value.toLowerCase();
		const filteredArray = filtered(allCameras, searchQuery, sortType, filterCameraBrandsArr, currentPage);

		addCameras(filteredArray);
	});

	// Brands checkboxes
	brands.forEach((brand) => {
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
	for (let i = 0; i < sort.length; i++) {
		if (sort[i].value === localStorage.getItem("sort")) {
			sort[i].selected = true;
		}
	}
	sort.addEventListener("change", function () {
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

	//Ako mi se budu pravili neki infiniti loopovi moguce da je ovde problem
	const productCards = document.querySelectorAll(".product-cards");
	productCards.forEach(card => {
		card.addEventListener("click", toggleProductModal);
	})

	closeModal.addEventListener("click", function () {
		productModal.classList.toggle("show");
		productModal.style.display = "none";
	});
}

function makeCamera(camera) {
	let cameraBrand = brandsArr.find((brand) => brand.id === camera.brandId).name;

	return `<div class="col-12 col-md-6 col-lg-4 col-xl-3 mt-3 product-cards" data-id="${camera.id}">
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
	const pagination = document.querySelector("#pagination");

	let html = "";
	for (let i = 0; i < pages; i++) {
		html += `<li class="list-group-item border pages" data-id="${i + 1}"><a href="#" class="text-dark" data-id="${i + 1}">${i + 1}</a></li>`;
	}

	pagination.innerHTML = html;
}
//Paginacija radi, samo namestiti da posle filtriranja ostane ta strana...

function toggleCart() {
	let cart = JSON.parse(localStorage.getItem("cart"));
	const productCart = document.querySelector("#product-cart");

	if (!isCartOpen) {
		if (cart?.products.length === 0 || cart === null) {
			console.log("Nema proizvoda");
		} else {
			let res = [];
			let quantityArr = [];
			let html = "";
			res = allCameras.filter(camera => cart.products.find(element => {

				if (camera.id === element.id) {
					return quantityArr.push(element.quantity)
					// console.log({ ...camera, kolikinaBrapoMoj: element.quantity });
					// return res = { ...camera, aaaaaaaasasasssssddddddddd: element.quantity };

				}
			}));
			res.forEach((item, index) => {
				console.log(html);
				html += makeCartItem({ ...item, quantity: quantityArr[index] });
			})

			productCart.innerHTML = html;
		}
	}
	calculateTotalCash();

	isCartOpen = !isCartOpen;
	return modal.style.transform === "translateX(0%)" ? modal.style.transform = "translateX(-100%)" : modal.style.transform = "translateX(0%)";
}

function toggleMenu() {
	mobileMenu.classList.toggle("top-100");
	if (window.scrollY <= 50) {
		header.classList.toggle("bg-dark")
	}

	if (mobileMenu.classList[6] === "d-none") {
		return mobileMenu.classList.toggle("d-none")
	}

	mobileMenu.classList.toggle("d-none");
}
function toggleProductModal() {
	const cameraId = Number(this.dataset.id);
	const camera = findCamera(cameraId);
	showCamera(camera);
}
function findCamera(cameraId) {
	return allCameras.find(cam => cam.id === cameraId);
}
function showCamera(model) {
	productModal.classList.add("show");
	productModal.style.display = "block";

	const productContent = document.querySelector("#product-content");
	productContent.innerHTML = `<div class='container'>
		<div class='row'>
			<div class='col-md-12 col-lg-4'>
				<img src="assets/images/products/${model.img.src}" alt="${model.img.alt}" class="img-fluid"/>
			</div>
			<div class='col-md-12 col-lg-8'>
				<p>${model.name}</p>
				<div class="d-flex">
					<p class="h2">${model.price.current}</p>
					${model.price.old === null ? "" : `<small class="ms-2"><s>${model.price.old}</s></small>`}
				</div>
				<p>${model.description === null ? "Product has no description." : model.description}</p>
				<button id="add-to-cart" class="btn btn-primary mt-5" data-id=${model.id}>Add to cart</button>
			</div>
		</div>
	</div>`;

	const addCartButton = document.querySelector("#add-to-cart");
	addCartButton.addEventListener("click", function () {
		let itemsCart = Number(itemsInCart.innerText);
		console.log(itemsInCart);
		let cart = null;

		if (JSON.parse(localStorage.getItem("cart")) !== null) {
			cart = JSON.parse(localStorage.getItem("cart"));
			let proba = cart.products.find(item => item.id === model.id);
			if (proba === undefined) {
				itemsInCart.innerHTML = itemsCart += 1;
			}
		} else {
			itemsInCart.innerHTML = itemsCart += 1;
		}

		localStorage.setItem("cart-counter", itemsInCart.innerHTML)
		addToCart(model.id)
	});

}
function addToCart(modelId) {
	let order = JSON.parse(localStorage.getItem("cart"));

	function fetchCart(porudzbina, id) {
		return porudzbina.products.find(e => e.id === id)
	}

	if (!order) {
		order = {
			products: []
		}
	}

	const article = fetchCart(order, modelId);


	if (article) {
		console.log("Postoji");
		article.quantity += 1;
	} else {
		console.log("Ne postoji")
		order.products.push({
			id: modelId,
			quantity: 1
		})
	}

	return localStorage.setItem("cart", JSON.stringify(order));
}

function renderCart(articles) {
	if (articles.length === 0) {

	}
}

/**
 * function toggleProductModal() {
	const cameraId = Number(this.dataset.id);
	const camera = toggleProductModal(cameraId)
	showCamera(camera);
}
function toggleProductModal(cameraId) {
	return allCameras.find(cam => cam.id === cameraId);
}

function addToCart(id) {
	return
}
function setItemToLS(naziv, porudzbine) {
	return localStorage.setItem(naziv, JSON.stringify(porudzbine));
}
function getItemFromLS(name) {
	return JSON.parse(localStorage.getItem(name));
}
 */

function makeCartItem(item) {
	console.log(item);
	return `<div class="col-4 p-3">
	<img src="assets/images/products/${item.img.src}" alt="${item.img.alt}" class="img-fluid" />
		</div>
		<div class="col-8">
			<div class="d-flex">
				<p class="me-3">Model:</p>
				<p>${item.name}</p>
			</div>
			<div class="d-flex">
				<p class="me-3">Price:</p>
				<p class="total">${item.price.current * item.quantity}</p>
			</div>
			<div class="d-flex">
				<p class="me-3">Quantity:</p>
				<input type="number" id="quantity" class="w-25 form-control" value="${item.quantity}" />
			</div>
		</div>`
}
function calculateTotalCash() {
	const total = document.querySelectorAll(".total");
	const sumId = document.querySelector("#sum");
	let sum = 0;
	total.forEach(price => sum += Number(price.innerText))
	sumId.innerHTML = sum;
}