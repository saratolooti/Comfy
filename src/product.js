import { create_cartData } from "./main.js";

/* getting the index of the card from index.html */
const urlParams = new URLSearchParams(window.location.search);
const objValue = urlParams.get("obI");

/* whole page animation on scroll */
let delay = 0;
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${delay}s`;
        entry.target.classList.add("fadeDown");
        delay += 0.15;
      }
    });
  },
  { threshold: 0.2 }
);

const animation_elements = document.querySelectorAll(".animate");
animation_elements.forEach((el) => observer.observe(el));

/* --------------------------------------------------------------- */

// suggestion part
const card_container = document.querySelector("[suggestion-cards-container]");
const card_template = document.querySelector("[suggestion-cards-template]");

// Fetching data
let img_arr = [];
let product;
let related_products;
let selected_color;

fetch(`https://saratolooti.github.io/modern-furniture-api/db.json`)
  .then((rest) => rest.json())
  .then((data) => {
    product = data.furniture[objValue];
    related_products = data.furniture.filter(
      (data) => data.type == product.type
    );

    /* changing the page title */
    document.title = `${product.name} | Comfy Furniture Online Shop`;

    display_product(product);
    img_arr = product.image;

    // changing main pic with subpics
    let subImages = document.querySelectorAll(".sub-imgs img");

    subImages.forEach((img) => {
      img.addEventListener("click", changeMainImg);
    });

    // creating suggestion section
    suggestion();
    selected_color = product.selected_color;
  })
  .then(() => {
    // on load cart numbers in navbar
    onLoadSetCartNumber();

    const addToCart_btn = document.querySelector(".addtocart-btn");

    // after clicking add to cart
    addToCart_btn.addEventListener("click", () => {
      // setting the items of cart
      setCartItems(product);
    });
  })
  .then(() => {
    // initializing color buttons array
    let color_btns = document.querySelectorAll(".colors-container div");

    // changing product images based on color
    color_btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // removing last color selected
        color_btns.forEach((color) => color.classList.remove("color-selected"));

        // changing color selected
        btn.classList.add("color-selected");

        productColorChange(btn);

        selected_color = parseInt(btn.getAttribute("key"));
      });
    });
  });

/* display products */
function display_product(data) {
  document.getElementById("Product-name-header").textContent = data.name;
  let img_container = document.querySelector(".img-container");
  let sub_imgs = "";
  for (let key in data.image[0]) {
    sub_imgs += `
        <img
          src="${data.image[0][key]}"
          alt="${data.name}"
        />
        `;
  }

  img_container.innerHTML = `
    <div class="sub-imgs">
      ${sub_imgs}          
    </div>
    <div class="main-img" id="main-img">
    </div>
  `;

  let main_img = document.getElementById("main-img");
  main_img.style.background = `url("./${data.image[0][1]}") no-repeat center center /contain, #fff`;

  // product detail part
  document.querySelector(".price").innerHTML = `$${data.price}`;
  document.getElementById("rate-stars").style.transform = `scaleX(${
    data.rate / 5
  })`;
  document.querySelector(".general-description").innerHTML =
    data.general_description;

  let color_container = document.querySelector(".colors-container");

  data.color.forEach((color, index) => {
    let el = document.createElement("div");
    el.style.background = color;
    el.setAttribute("key", index);
    color_container.appendChild(el);
    if (index == 0) el.classList.add("color-selected");
  });

  //product detailed info part
  let secondary_img = document.getElementById("secondary-img");
  secondary_img.style.background = `url("./${data.image[0].size}") no-repeat center center /contain, #fff`;

  let accordion_container = document.querySelector(".accordion-container");
  let accordionHtml = "";
  let content = ["", "", ""];
  let rest_keys = ["features", "dimensions", "seat dimensions"];

  // features part
  data.feature.forEach((feature) => {
    content[0] += `-${feature}<br>`;
  });

  // dimensions part
  for (let key in data.dimensions) {
    content[1] += `-${key}: ${data.dimensions[key]}<br>`;
  }

  // seat dimensions part
  if (data.seat_dimensions !== undefined) {
    for (let key in data.seat_dimensions) {
      content[2] += `-${key}: ${data.seat_dimensions[key]}<br>`;
    }
  } else {
    rest_keys.splice(2);
  }
  rest_keys.forEach((key, i) => {
    accordionHtml += `
      <li>
        <label for="${key}">${key}</label>
        <input type="radio" name="accordion" id="${key}" />
        <div class="content">
          <p>
            ${content[i]}
          </p>
        </div>
      </li>
      `;
  });

  accordion_container.innerHTML = accordionHtml;
}

// product quantity number input
const quantityInput = document.getElementById("product_quantity");
const stepper_btns = document.querySelectorAll(
  ".quantity-btn-container button"
);

stepper_btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    stepper(btn, quantityInput);
  });
});

// stepper function
export function stepper(btn, quantityInput) {
  let id = btn.getAttribute("id");
  let min = quantityInput.getAttribute("min");
  let max = quantityInput.getAttribute("max");
  let value = quantityInput.getAttribute("value");
  let calcStep = id == "increment" ? 1 : -1;
  let newValue = parseInt(value) + calcStep;

  if (newValue >= min && newValue <= max) {
    quantityInput.setAttribute("value", newValue);
  }

  return newValue;
}

/* suggestion function */
function suggestion() {
  related_products.forEach((product) => {
    create_cartData(product, card_template, card_container);
  });

  //carousel slider
  const carousel = document.querySelector(".media-scroller");
  const arrowBtns = document.querySelectorAll(".carousel-btns button"),
    firstCardWidth = document.querySelector(".card").clientWidth + 22; // firs card width plus gap between two cards

  const btnOpacityChange = () => {
    let scrollWidth = carousel.scrollWidth - carousel.clientWidth; // getting max scrollable width
    arrowBtns[0].style.opacity = carousel.scrollLeft == 0 ? 0.4 : 1;
    arrowBtns[1].style.opacity = carousel.scrollLeft >= scrollWidth ? 0.4 : 1;
  };

  arrowBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      carousel.scrollLeft +=
        btn.id == "left" ? -firstCardWidth : firstCardWidth;
      setTimeout(() => btnOpacityChange(), 60);
    });
  });

  btnOpacityChange();
}

// on load cart numbers in navbar
function onLoadSetCartNumber() {
  let cart_number = localStorage.getItem("cartNumber");
  cart_number = parseInt(cart_number);

  document.querySelector("#cart span").textContent = cart_number;
}

// setting cart number after clicking add to cart
function setCartNumber(items) {
  let cart_number = localStorage.getItem("cartNumber");
  cart_number = parseInt(cart_number);

  let newNumber = 0;
  for (let key in items) {
    newNumber += items[key].inCart;
  }

  localStorage.setItem("cartNumber", newNumber);
  document.querySelector("#cart span").textContent = newNumber;
}

// setting the items of cart
function setCartItems(product) {
  let cartItems = localStorage.getItem("productsInCart");
  cartItems = JSON.parse(cartItems);

  let product_quantity = document.getElementById("product_quantity").value;
  product_quantity = parseInt(product_quantity);
  let productKey = `${product.id}c${selected_color}`;

  cartItems = {
    ...cartItems,
    [productKey]: product,
  };
  cartItems[productKey].inCart = product_quantity;

  cartItems[productKey].selected_color = selected_color;

  localStorage.setItem("productsInCart", JSON.stringify(cartItems));

  setCartNumber(cartItems);
}

// change products image based on color
function productColorChange(btn) {
  let color_index = parseInt(btn.getAttribute("key"));
  let selected_imgs = img_arr[color_index];
  let subImgs_container = document.querySelector(".sub-imgs");
  subImgs_container.innerHTML = "";
  let main_img = document.getElementById("main-img");

  // changing sub images
  for (let key in selected_imgs) {
    let img_element = document.createElement("img");
    img_element.setAttribute("src", selected_imgs[key]);
    img_element.setAttribute("alt", `product image ${key}`);
    subImgs_container.append(img_element);
  }
  // changing main image
  main_img.style.background = `url("./${selected_imgs["1"]}") no-repeat center center /contain, #fff`;

  // changing main pic with subpics
  let subImages = document.querySelectorAll(".sub-imgs img");

  subImages.forEach((img) => {
    img.addEventListener("click", changeMainImg);
  });
}

// swaping main image with clicked sub image
function changeMainImg() {
  let main_img = document.getElementById("main-img");
  let selectedImg_src = this.getAttribute("src");
  main_img.style.background = `url("./${selectedImg_src}") no-repeat center center /contain, #fff`;
}
