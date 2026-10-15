import { useCallback, useEffect, useState } from "react";

import {
  MenuCategory,
  CreateMenuCategoryPayload,
  UpdateMenuCategoryPayload,
} from "@/src/types/types";

import { MenuCategoryService } from "@/src/services/menu_category.service";
import { getApiErrorMessage } from "@/src/services/api/client";

interface UseCategoriesReturn {
  categories: MenuCategory[];
  isLoading: boolean;
  error: string | null;

  refreshCategories: () => Promise<void>;

  addCategory: (payload: CreateMenuCategoryPayload) => Promise<MenuCategory>;

  editCategory: (
    categoryId: string,
    payload: UpdateMenuCategoryPayload,
  ) => Promise<MenuCategory>;

  removeCategory: (categoryId: string) => Promise<void>;
}

function sortCategories(categories: MenuCategory[]): MenuCategory[] {
  return [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id),
  );
}

export default function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * GET /api/v1/menu-item-category/categories
   */
  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedCategories = await MenuCategoryService.getCategories();

      setCategories(sortCategories(fetchedCategories));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to load menu categories.",
      );

      setError(message);

      console.error("Failed to fetch menu categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCategories();
  }, [refreshCategories]);

  /**
   * POST /api/v1/menu-item-category/create-category
   */
  const addCategory = useCallback(
    async (payload: CreateMenuCategoryPayload): Promise<MenuCategory> => {
      setError(null);

      try {
        const createdCategory =
          await MenuCategoryService.createCategory(payload);

        setCategories((currentCategories) =>
          sortCategories([...currentCategories, createdCategory]),
        );

        return createdCategory;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to create menu category.",
        );

        setError(message);

        console.error("Failed to create menu category:", error);

        throw error;
      }
    },
    [],
  );

  /**
   * PATCH /api/v1/menu-item-category/update-category/{category}
   */
  const editCategory = useCallback(
    async (
      categoryId: string,
      payload: UpdateMenuCategoryPayload,
    ): Promise<MenuCategory> => {
      setError(null);

      try {
        const updatedCategory = await MenuCategoryService.updateCategory(
          categoryId,
          payload,
        );

        setCategories((currentCategories) =>
          sortCategories(
            currentCategories.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    ...updatedCategory,
                  }
                : category,
            ),
          ),
        );

        return updatedCategory;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to update menu category.",
        );

        setError(message);

        console.error("Failed to update menu category:", error);

        throw error;
      }
    },
    [],
  );

  /**
   * DELETE /api/v1/menu-item-category/remove-category/{category}
   */
  const removeCategory = useCallback(
    async (categoryId: string): Promise<void> => {
      setError(null);

      try {
        await MenuCategoryService.deleteCategory(categoryId);

        setCategories((currentCategories) =>
          currentCategories.filter((category) => category.id !== categoryId),
        );
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to delete menu category.",
        );

        setError(message);

        console.error("Failed to delete menu category:", error);

        throw error;
      }
    },
    [],
  );

  return {
    categories,
    isLoading,
    error,
    refreshCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}
