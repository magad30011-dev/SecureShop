export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
};

export function getCart(): CartItem[] {
  const raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const found = cart.find((p) => p.id === item.id);

  if (found) {
    found.qty += 1;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function removeFromCart(id: number) {
  const cart = getCart().filter((p) => p.id !== id);
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem("cart");
}