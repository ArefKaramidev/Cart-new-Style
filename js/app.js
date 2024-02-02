const prodctDOM = document.querySelector(".product-center");
const numberOfItem = document.querySelector("#count");
const totalPriceTag = document.querySelector(".total_price");
const cartContent = document.querySelector(".cart-content");
const cartOverlay = document.querySelector(".cart-overlay");
const cartData = document.querySelector(".cart");
const cartIcon = document.querySelector("#ico");
const closeCart = document.querySelector(".close-cart");
const clearCart = document.querySelector(".clear-cart");

let cart = [];

class Product {
  async getProduct() {
    try {
      const result = await fetch("products.json");
      const data = await result.json();

      let products = data.items;

      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class View {
  displayProducts(product) {
    let result = "";
    product.forEach((item) => {
      result += `   
      <div id='container'>  
       <div class="product">
      <img src=${item.image} alt=${item.title} />
      <button id=${item.id} class="btn">افزودن به سبد خرید</button>
  
    </div>
    <div class="info">
    <span id="title">${item.title}</span>
    <div><span>قیمت : </span><span>${item.price}</span></div>
  </div>
    </div>
   `;
    });
    prodctDOM.innerHTML = result;
  }

  buttonsCart() {
    const buttons = [...document.querySelectorAll(".btn")];
    buttons.forEach((item) => {
      const id = item.id;
      item.addEventListener("click", (e) => {
        const cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValue(cart);

        this.addCartItems(cartItem);
      });
    });
  }
  setCartValue(cart) {
    let totalPrice = 0;
    let countItems = 0;

    cart.map((items) => {
      totalPrice = totalPrice + items.price * items.amount;
      countItems = countItems + items.amount;
    });
    totalPriceTag.innerText = totalPrice;
    numberOfItem.innerText = countItems;
  }

  addCartItems(item) {
    cartContent.innerHTML += ` 

<div class='cart-item'>
<img src=${item.image} alt=${item.title} />
<div>
  <h4>${item.title}</h4>
  <h5>${item.price}</h5>
  <span class="remove-item" data-id=${item.id}>حذف</span>
</div>
<div>
  <i class="fas fa-chevron-up" data-id=${item.id}></i>
  <p class="item-amount">${item.amount}</p>
  <i class="fas fa-chevron-down" data-id=${item.id}></i>
</div>
</div>
    `;
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartData.classList.add("showCart");
  }

  closeCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartData.classList.remove("showCart");
  }

  initApp() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populate(cart);

    cartIcon.addEventListener("click", this.showCart);
    closeCart.addEventListener("click", this.closeCart);
  }

  populate(cart) {
    cart.forEach((items) => {
      return this.addCartItems(items);
    });
  }

  cartProcess() {
    clearCart.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeProduct(id);
      }

      if (e.target.classList.contains("fa-chevron-up")) {
        let element = e.target;
        let id = element.dataset.id;

        let result = cart.find((item) => item.id === id);
        result.amount = result.amount + 1;

        Storage.saveCart(cart);
        this.setCartValue(cart);

        element.nextElementSibling.innerText = result.amount;
      }

      if (e.target.classList.contains("fa-chevron-down")) {
        let elementDown = e.target;
        let id = elementDown.dataset.id;

        let result = cart.find((item) => item.id === id);

        result.amount = result.amount - 1;

        if (result.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValue(cart);
          elementDown.previousElementSibling.innerText = result.amount;
        } else {
          cartContent.removeChild(elementDown.parentElement.parentElement);
          this.removeProduct(id);
        }
      }
    });
  }

  clearCart() {
    let cartItem = cart.map((item) => {
      return item.id;
    });

    cartItem.forEach((item) => {
      return this.removeProduct(item);
    });

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeProduct(id) {
    cart = cart.filter((item) => {
      return item.id !== id;
    });

    this.setCartValue(cart);
    Storage.saveCart(cart);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const get = JSON.parse(localStorage.getItem("products"));
    return get.find((item) => item.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("productsCart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("productsCart")
      ? JSON.parse(localStorage.getItem("productsCart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const view = new View();
  const product = new Product();
  view.initApp();
  product
    .getProduct()
    .then((data) => {
      view.displayProducts(data);
      Storage.saveProducts(data);
    })
    .then(() => {
      view.buttonsCart();
      view.cartProcess();
    });
});
