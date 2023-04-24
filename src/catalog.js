import { create_cartData } from "./main.js";

/* getting the index of the card from index.html */
const urlParams = new URLSearchParams(window.location.search);
const objValue = urlParams.get("vl");

/* Fetching data */
const productCard_container = document.querySelector("[products-container]");
const productCard_template = document.querySelector("[product-cards-template]");

let productList = [];

fetch(`https://saratolooti.github.io/modern-furniture-api/db.json`)
  .then((rest) => rest.json())
  .then((data) => {
    data = data.furniture.filter((data) => data.catalog == objValue);
    productList = data.map((product) => {
      return create_cartData(
        product,
        productCard_template,
        productCard_container
      );
    });
    display_header();
    set_filter();
  })
  .then(() => {
    // set cart number variable in localStorage and navbar
    let cart_number = localStorage.getItem("cartNumber");
    if (!cart_number) localStorage.setItem("cartNumber", 0);
    else {
      document.querySelector("#cart span").textContent = parseInt(cart_number);
    }
  });

/* display haeder */
function display_header() {
  const header_img = document.querySelector("[catalog-header-img]");
  header_img.style.background = `linear-gradient(
      hsla(240, 14%, 13%, 0.4),
      hsla(240, 14%, 13%, 0.4)
    ),
    url("../img/${objValue}.png") no-repeat center center / cover`;
  header_img.textContent = objValue;
}

/* setting filter*/
const filter_container1 = document.querySelector("[filter-container1]");
const filter_container2 = document.querySelector("[filter-container2]");
const filter_template = document.querySelector("[filter-template]");

function set_filter() {
  let set = new Set();
  productList.forEach((p) => {
    // types
    if (!set.has(p.type))
      create_filter_section("type", p.type, filter_container1);
    set.add(p.type);
    // material
    if (!set.has(p.material))
      create_filter_section("material", p.material, filter_container2);
    set.add(p.material);
  });
}

function create_filter_section(name, value, container) {
  container.querySelector("[filter-header]").textContent = name;
  const label = filter_template.content.cloneNode(true).children[0];
  label.innerHTML = `
  <input type="checkbox" name="${name}" id="${value}" value="${value}"/>${value.replace(
    "-",
    " "
  )}`;

  container.append(label);
}

/* search bar */
const search_form = document.getElementById("search-bar-form");
const search_input = document.querySelector("[data-search]");
const select_box = document.querySelector("[data-sort]");

search_form.addEventListener("submit", (e) => {
  e.preventDefault();
});

search_input.addEventListener("input", (e) => {
  const input_value = e.target.value.toLowerCase();
  productList.forEach((product) => {
    const isVisible = product.name.toLowerCase().includes(input_value);
    product.element.classList.toggle("hide", !isVisible);
  });
});

/* sorting based on select box option */
select_box.addEventListener("input", (e) => {
  const sort_value = e.target.value;
  let sortedList;
  switch (sort_value) {
    case "all":
      showProducts(productList);
      break;
    case "low-high":
      sortedList = productList.sort((a, b) =>
        a.price > b.price ? 1 : a.price < b.price ? -1 : 0
      );
      showProducts(sortedList);
      break;
    case "high-low":
      sortedList = productList.sort((a, b) =>
        a.price < b.price ? 1 : a.price > b.price ? -1 : 0
      );
      showProducts(sortedList);
      break;
  }
});

/* Range slider */
const rangeInput = document.getElementById("price_range");
const slider_value = document.getElementById("slider_value");

rangeInput.addEventListener("input", slider);
function slider() {
  let valPercent = (rangeInput.value / rangeInput.max) * 100;
  rangeInput.style.background = `linear-gradient(to right, #ec9a78 ${valPercent}%,
        #1c1c2540 ${valPercent}%)`;

  slider_value.textContent = `$${rangeInput.value}`;
}

/* filter form */
const filter_form = document.getElementById("filter-form");

filter_form.addEventListener("submit", (e) => {
  e.preventDefault();

  const checked_box_type = [];
  const checked_box_material = [];
  get_form_data(checked_box_type, checked_box_material);

  let filtered_list;
  // range input
  filtered_list = productList.filter((p) => p.price <= rangeInput.value);
  // type
  if (checked_box_type.length !== 0)
    filtered_list = filtered_list.filter((p) =>
      checked_box_type.includes(p.type)
    );

  // material
  if (checked_box_material.length !== 0)
    filtered_list = filtered_list.filter((p) =>
      checked_box_material.includes(p.material)
    );

  // displayin data
  showProducts(filtered_list);
});

// get data from form
function get_form_data(type_arr, material_arr) {
  const form_data = new FormData(filter_form);
  for (let item of form_data) {
    if (item[0] === "type") type_arr.push(item[1]);
    else if (item[0] === "material") material_arr.push(item[1]);
  }
}

/* displaying product after filtering */
function showProducts(elementList) {
  productCard_container.innerHTML = "";
  elementList.forEach((el) => {
    productCard_container.append(el.element);
  });
}

/* Filter btn toggle */
const filter_toggle = document.querySelector(".filter-toggle");
const filter_close_btn = document.querySelector(".close-btn");
const sidebar = document.querySelector(".sidebar");

filter_toggle.addEventListener("click", () => {
  sidebar.classList.add("is-active");
});

filter_close_btn.addEventListener("click", () => {
  sidebar.classList.remove("is-active");
});

slider();
