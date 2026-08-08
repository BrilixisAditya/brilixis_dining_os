import { useState } from "react";
import { CartItem } from "../types/types";
import { MenuItem } from "../types/menuData";

function useCart(){

    const [cart, setCart] = useState<CartItem[]>([]);



    const addToCart = (item: MenuItem, quantity: number, excluded: string[], added: string[], notes: string) => {
        setCart((prevCart) => {
              const existingIndex = prevCart.findIndex(
                (cartItem) =>
                  cartItem.menuItem.id === item.id &&
                  JSON.stringify(cartItem.excludedIngredients.sort()) === JSON.stringify(excluded.sort()) &&
                  JSON.stringify(cartItem.addedIngredients.sort()) === JSON.stringify(added.sort()) &&
                  cartItem.customInstructions.trim().toLowerCase() === notes.trim().toLowerCase()
              );
        
              if (existingIndex > -1) {
                const updated = [...prevCart];
                updated[existingIndex].quantity += quantity;
                return updated;
              }
        
              const newItem: CartItem = {
                id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                menuItem: item,
                quantity,
                excludedIngredients: excluded,
                addedIngredients: added,
                customInstructions: notes,
              };
        
              return [...prevCart, newItem];
            });
    };

    const removeFromCart = (cartItemId: string) => {
          setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
    };

    const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
         if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
    };

    const clearCart = () => {
         setCart([]);
    };


    return {cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart};

};

export default useCart;