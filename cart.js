/* ---Image Popup---- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".clickableImage").forEach(img => {
    img.addEventListener("click", () => {
      const popup = document.getElementById("imagePopup");
      const popupImg = document.getElementById("popupImage");
      popupImg.src = img.src;
      popup.style.display = "flex";
    });
  });

  const closeBtn = document.getElementById("closePopup");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("imagePopup").style.display = "none";
    });
  }
});

/* ----User Function----- */
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

function getUserCart() {
  const user = getLoggedInUser();
  if (!user) return [];

  const allCarts = JSON.parse(localStorage.getItem("userCarts")) || {};
  return allCarts[user.name] || [];
}

function saveUserCart(cart) {
  const user = getLoggedInUser();
  if (!user) return;

  const allCarts = JSON.parse(localStorage.getItem("userCarts")) || {};
  allCarts[user.name] = cart;

  localStorage.setItem("userCarts", JSON.stringify(allCarts));
}

/* ---Add Cart Btn Logic---- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".addBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const user = getLoggedInUser();

      if (!user) {
        alert("You must be logged in to add items to your cart.");
        window.location.href = "profile.html";
        return;
      }

      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const image = btn.dataset.image;
      const video = btn.dataset.video; 

      let cart = getUserCart();

      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price, image, video, qty: 1 }); 
      }

      saveUserCart(cart);

      alert(`${name} added to your cart!`);

      if (document.getElementById("cartItems")) {
        renderCart();
      }
    });
  });

  if (document.getElementById("cartItems")) {
    renderCart();
  }
});

function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = "";

  const user = getLoggedInUser();

  if (!user) {
    cartItemsContainer.innerHTML = `<p>Please log in to view your cart.</p>`;
    updateCartSummary([]);
    return;
  }

  let cart = getUserCart();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="emptyCart">
        <img src="../Assets/empty.png" alt="Empty Cart" />
        <p>Your cart is empty</p>
      </div>
    `;
    updateCartSummary([]);
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cartItem";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cartItemImg" />
      <div class="cartItemDetails">
        <h3>${item.name}</h3>
        <p>JM $${item.price}</p>
        <input type="number" class="itemQty" value="${item.qty}" min="1" data-index="${index}">
        <img src="../Assets/delete.svg" alt="Delete" class="removeItem" data-index="${index}">
        ${item.video ? `<video src="${item.video}" controls class="cartItemVideo"></video>` : ""}
      </div>
    `;

    cartItemsContainer.appendChild(div);
  });

  document.querySelectorAll(".itemQty").forEach(input => {
    input.addEventListener("input", e => {
      let cart = getUserCart();
      cart[e.target.dataset.index].qty = parseInt(e.target.value);
      saveUserCart(cart);
      updateCartSummary(cart);
    });
  });

  /* --- Delete Icon--- */
  document.querySelectorAll(".removeItem").forEach(btn => {
    btn.addEventListener("click", e => {
      let cart = getUserCart();
      cart.splice(e.target.dataset.index, 1);
      saveUserCart(cart);
      renderCart();
    });
  });

  updateCartSummary(cart);
}

function updateCartSummary(cart) {
  if (!document.getElementById("subtotal")) return;

  let subtotal = 0;
  cart.forEach(item => subtotal += item.price * item.qty);

  let discount = 0;

  // Check code
  const codeInput = document.getElementById("discountCode");
  const code = codeInput ? codeInput.value.trim() : "";

  if (code.toUpperCase() === "FREE20") {
    discount = subtotal * 0.20; 
  } else if (code) {
    alert("Invalid discount code. Only FREE20 is accepted.");
  }

  const tax = (subtotal - discount) * 0.10;
  const total = subtotal - discount + tax;

  document.getElementById("subtotal").textContent = `JM $${subtotal.toFixed(2)}`;
  document.getElementById("discount").textContent = `JM $${discount.toFixed(2)}`;
  document.getElementById("tax").textContent = `JM $${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `JM $${total.toFixed(2)}`;
}

const applyBtn = document.getElementById("applyDiscountBtn");
if (applyBtn) {
  applyBtn.addEventListener("click", () => {
    let cart = getUserCart();
    updateCartSummary(cart); 
  });
}

/* CheckOut Logic */
const checkoutBtn = document.querySelector(".checkoutBtn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const user = getLoggedInUser();
    if (!user) {
      alert("You must be logged in to checkout.");
      window.location.href = "profile.html";
      return;
    }

    const cart = getUserCart();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const discountCode = document.getElementById("discountCode");
    if (discountCode && discountCode.value.trim()) {
      localStorage.setItem("appliedDiscountCode", discountCode.value.trim());
    }

    window.location.href = "checkout.html";
  });
}
