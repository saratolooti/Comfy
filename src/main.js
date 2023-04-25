/* whole page animation on scroll */
let delay = 0;
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${delay}s`;
        entry.target.classList.add("fadeDown");
        delay += 0.12;
      }
    });
  },
  { threshold: 0.5 }
);

const animation_elements = document.querySelectorAll(".animate");
animation_elements.forEach((el) => observer.observe(el));

/* --------------------------------------------------------------- */

const shopCards_template = document.querySelector("[shop-cards-template]");
const shopCards_container = document.querySelector("[shop-cards-container]");

//Fetching data
fetch("https://saratolooti.github.io/modern-furniture-api/db.json")
  .then((rest) => rest.json())
  .then((data) => {
    data.furniture.forEach((product, index) => {
      if (index < 10) {
        create_cartData(product, shopCards_template, shopCards_container);
      }
    });
  })
  .then(() => {
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
  })
  .then(() => {
    // set cart number variable in localStorage and navbar
    let cart_number = localStorage.getItem("cartNumber");
    if (!cart_number) localStorage.setItem("cartNumber", 0);
    else {
      document.querySelector("#cart span").textContent = parseInt(cart_number);
    }
  });

// Creating card's data function
export function create_cartData(product, template, elementContainer) {
  const card = template.content.cloneNode(true).children[0];
  const img = card.querySelector("[card-image]");
  const title = card.querySelector("[card-title]");
  const price = card.querySelector("[card-price]");
  const rate = card.querySelector("[rate-stars]");
  img.setAttribute("src", product.image[0][1]);
  img.setAttribute("alt", product.name);
  title.textContent = product.name;
  title.setAttribute("href", `./product?obI=${product.id}`);
  price.textContent = `$${product.price}`;
  rate.style.transform = `scaleX(${product.rate / 5})`;
  elementContainer.append(card);
  return {
    name: product.name,
    price: product.price,
    rate: product.rate,
    type: product.type,
    material: product.material,
    element: card,
  };
}
