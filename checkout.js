
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


function renderCheckoutCart() {
  const container = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  const user = getLoggedInUser();


  if (!user) {
    container.innerHTML = `
      <div class="login-message">
        <p>Please <a href="profile.html">log in</a> to view your cart.</p>
      </div>`;
    summary.innerHTML = "";
    document.getElementById("amountToPay").textContent = "JM $0.00";
    return;
  }

  const cart = getUserCart();

  // Check if cart is empty
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <img src="../Assets/empty.png" alt="Empty Cart" />
        <p>Your cart is empty</p>
      </div>`;
    summary.innerHTML = "";
    document.getElementById("amountToPay").textContent = "JM $0.00";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      ${item.image 
        ? `<img src="${item.image}" alt="${item.name}" class="cart-item-img">`
        : `<div class="item-img-placeholder">${item.name.charAt(0)}</div>`
      }
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-qty">Qty: ${item.qty}</div>
      </div>
      <div class="item-price">JM $${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join("");


  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  let discount = 0;
  const savedCode = localStorage.getItem("appliedDiscountCode");
  if (savedCode && savedCode.toUpperCase() === "FREE20") {
    discount = subtotal * 0.20;
  }

  const tax = (subtotal - discount) * 0.10;
  const total = subtotal - discount + tax;

  summary.innerHTML = `
    <div class="summary-row">
      <span>Subtotal</span>
      <span>JM $${subtotal.toFixed(2)}</span>
    </div>
    ${discount > 0 ? `
      <div class="summary-row discount">
        <span>Discount (FREE20)</span>
        <span>-JM $${discount.toFixed(2)}</span>
      </div>` : ""}
    <div class="summary-row">
      <span>Tax (10%)</span>
      <span>JM $${tax.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>JM $${total.toFixed(2)}</span>
    </div>
  `;

  document.getElementById("amountToPay").textContent = `JM $${total.toFixed(2)}`;

  const fullNameInput = document.getElementById("fullName");
  if (user.name && fullNameInput && !fullNameInput.value) {
    fullNameInput.value = user.name;
  }
  if (user.email) {
    const emailInput = document.getElementById("email");
    if (emailInput && !emailInput.value) {
      emailInput.value = user.email;
    }
  }
}

function clearCart() {
  const user = getLoggedInUser();
  if (!user) {
    alert("Please log in first.");
    return;
  }
  if (confirm("Are you sure you want to clear your cart?")) {
    saveUserCart([]);
    renderCheckoutCart();
  }
}

function scrollToShipping() {
  const cart = getUserCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  document.querySelector(".shipping-section").scrollIntoView({ behavior: "smooth" });
  document.getElementById("fullName").focus();
}

function cancelOrder() {
  if (confirm("Are you sure you want to cancel your order?")) {
    window.location.href = "cart.html";
  }
}

function closePage() {
  window.location.href = "cart.html";
}
function closeModal() {
  document.getElementById("successModal").classList.remove("active");
  saveUserCart([]);
  localStorage.removeItem("appliedDiscountCode");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutCart();

  const shippingForm = document.getElementById("shippingForm");
  if (shippingForm) {
    shippingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const user = getLoggedInUser();
      if (!user) {
        alert("Please log in to complete your order.");
        window.location.href = "profile.html";
        return;
      }

      const cart = getUserCart();
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      const orderDetails = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        zip: document.getElementById("zip").value,
        country: document.getElementById("country").value,
        total: document.getElementById("amountToPay").textContent,
        items: cart,
        date: new Date().toISOString()
      };

      const orders = JSON.parse(localStorage.getItem("userOrders")) || {};
      if (!orders[user.name]) {
        orders[user.name] = [];
      }
      orders[user.name].push(orderDetails);
      localStorage.setItem("userOrders", JSON.stringify(orders));

      const modalMessage = document.getElementById("modalMessage");
      if (modalMessage) {
        modalMessage.innerHTML = `
          Thank you, <strong>${orderDetails.fullName}</strong>!<br>
          Your order of <strong>${orderDetails.total}</strong> has been placed.<br>
          Confirmation sent to <strong>${orderDetails.email}</strong>.
        `;
      }

      document.getElementById("successModal").classList.add("active");
    });
  }
});