import { useState } from "react";
import { MenuItem } from "../types/menuData";

function useMenu(){
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isMenuLoading, setIsMenuLoading] = useState<boolean>(false);

    // TODO menuItems get's fetched from API

    const addMenuItem = (newItem: MenuItem) => {
        // TODO API CALL
    };
    const updateMenuItem = (itemId: string, updatedFields: Partial<MenuItem>) => {
        // TODO API CALL
    };

    const deleteMenuItem = (itemId: string) => {
        // TODO API CALL
    };

    return {menuItems, isMenuLoading, addMenuItem, updateMenuItem, deleteMenuItem};
};

export default useMenu;