import { useState } from 'react';
import { CartItem } from '../types/types';
import { MenuItem } from '../types/menuData';

/** Customer cart is local UI state; the backend receives it only at order submission. */
function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (
    item: MenuItem,
    quantity: number,
    excludedIngredients: string[],
    addedIngredients: string[],
    customInstructions: string,
  ) => {
    const normalizedExcluded = [...excludedIngredients].sort();
    const normalizedAdded = [...addedIngredients].sort();

    setCart((previousCart) => {
      const existingIndex = previousCart.findIndex((cartItem) =>
        cartItem.menuItem.id === item.id &&
        JSON.stringify([...cartItem.excludedIngredients].sort()) === JSON.stringify(normalizedExcluded) &&
        JSON.stringify([...cartItem.addedIngredients].sort()) === JSON.stringify(normalizedAdded) &&
        cartItem.customInstructions.trim().toLowerCase() === customInstructions.trim().toLowerCase(),
      );

      if (existingIndex >= 0) {
        return previousCart.map((cartItem, index) =>
          index === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem,
        );
      }

      return [
        ...previousCart,
        {
          id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          menuItem: item,
          quantity,
          excludedIngredients: [...excludedIngredients],
          addedIngredients: [...addedIngredients],
          customInstructions,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((previousCart) => previousCart.filter((item) => item.id !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  return { cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart };
}

export default useCart;
