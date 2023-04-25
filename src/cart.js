import { stepper } from "./product.js";
// getting all product items from localstorage
let items = localStorage.getItem("productsInCart");
items = JSON.parse(items);

// create totalPrice variable in localStorage
localStorage.setItem("totalPrice", 0);

// create table rows of cart items
let cartItem_template = document.querySelector("[cart-item-template]");
let cartItem_container = document.querySelector("[cart-items-container]");

if (Object.keys(items).length != 0) {
  document.getElementById("empty-cart").style.display = "none";
  document.getElementById("cart-items-wrapper").style.display = "block";

  for (let key in items) {
    createTableRow(items[key]);
  }
}

calculateTotalPrice();

function createTableRow(data) {
  let tr = cartItem_template.content.cloneNode(true).children[0];
  let img = tr.querySelector("[product-img]");
  let name = tr.querySelector("[name]");
  let color_el = tr.querySelector("[color]");
  let price = tr.querySelector("[price]");
  let quantity = tr.querySelector("[product-quantity]");
  let total = tr.querySelector("[total]");

  let itemId = `product${data.id}c${data.selected_color}`;
  tr.setAttribute("id", itemId);
  tr.setAttribute("key", `${data.id}c${data.selected_color}`);
  img.setAttribute("src", data.image[data.selected_color][1]);
  img.setAttribute("alt", data.name);
  name.textContent = data.name;
  name.setAttribute("href", `./product?obI=${data.id}`);
  // color
  color_el.style.background = data.color[data.selected_color];

  price.textContent = `$${data.price}`;
  quantity.setAttribute("value", data.inCart);
  total.textContent = `$${(data.inCart * data.price).toFixed(2)}`;

  cartItem_container.append(tr);
  itemQuantityInput(itemId, data);
  deleteItemBtn(tr, itemId);
}

// calculate the total price
function calculateTotalPrice() {
  let totalPrice = localStorage.getItem("totalPrice");
  totalPrice = parseFloat(totalPrice);

  let newPrice = 0;
  for (let key in items) newPrice += items[key].inCart * items[key].price;

  localStorage.setItem("totalPrice", newPrice.toFixed(2));
  setTotalPrice();
}

// setting total price in page
function setTotalPrice() {
  let totalPrice = localStorage.getItem("totalPrice");
  totalPrice = parseFloat(totalPrice).toFixed(2);

  let subTotal_el = document.getElementById("sub-total");
  let totalPrice_el = document.querySelector("#total-price span");

  subTotal_el.textContent = `$${totalPrice}`;
  totalPrice_el.textContent = `$${totalPrice}`;
}

// set car number in localStorage after changeing quantity
function setCartNumber() {
  let cartNumber = localStorage.getItem("cartNumber");
  cartNumber = parseInt(cartNumber);

  let newNumber = 0;
  for (let key in items) newNumber += items[key].inCart;

  localStorage.setItem("cartNumber", newNumber);
}

// product quantity number input
function itemQuantityInput(id, data) {
  const quantityInput = document.querySelector(`#${id} [product-quantity]`);
  const stepper_btns = document.querySelectorAll(
    `#${id} .quantity-btn-container button`
  );

  stepper_btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      let quantity = stepper(btn, quantityInput);
      if (quantity > 0 && quantity < 10) {
        let total = document.querySelector(`#${id} [total]`);
        let price = document
          .querySelector(`#${id} [price]`)
          .textContent.replace("$", "");

        total.textContent = `$${(parseFloat(price) * quantity).toFixed(2)}`;
        change_inCart(data, quantity);
        calculateTotalPrice();
        setCartNumber();
      }
    });
  });
}

function change_inCart(data, quantity) {
  data.inCart = quantity;
  items = {
    ...items,
    [`${data.id}c${data.selected_color}`]: data,
  };

  localStorage.setItem("productsInCart", JSON.stringify(items));
}

// deleting item from table
function deleteItemBtn(element, id) {
  let delete_btn = document.querySelector(`#${id} [delete-item-btn]`);

  delete_btn.addEventListener("click", () => {
    let elementKey = element.getAttribute("key");
    element.remove();
    delete items[elementKey];

    localStorage.setItem("productsInCart", JSON.stringify(items));

    calculateTotalPrice();
    setCartNumber();

    if (Object.keys(items).length === 0) {
      document.getElementById("empty-cart").style.display = "flex";
      document.getElementById("cart-items-wrapper").style.display = "none";
    }
  });
}
