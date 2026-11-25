
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "printstore_cart";

function getSavedCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(getSavedCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    const productId = String(product.id);

    setCart((current) => {
      const existing = current.find(
        (item) => String(item.id) === productId
      );

      if (existing) {
        if (existing.quantity >= Number(product.stock_quantity || 0)) {
          return current;
        }

        return current.map((item) =>
          String(item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (Number(product.stock_quantity || 0) < 1) {
        return current;
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image_type: product.image_type || null,
          stock_quantity: Number(product.stock_quantity || 0),
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(id, quantity) {
    const nextQuantity = Number(quantity);

    if (!Number.isFinite(nextQuantity)) return;

    setCart((current) =>
      current.map((item) => {
        if (String(item.id) !== String(id)) return item;

        return {
          ...item,
          quantity: Math.max(
            1,
            Math.min(Math.floor(nextQuantity), item.stock_quantity)
          ),
        };
      })
    );
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter((item) => String(item.id) !== String(id))
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
