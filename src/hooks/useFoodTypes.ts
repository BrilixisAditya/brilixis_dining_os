import { useCallback, useEffect, useState } from "react";

import { FoodType } from "@/src/types/types";

import { FoodTypeService } from "@/src/services/food_type.service";

import { getApiErrorMessage } from "@/src/services/api/client";

interface UseFoodTypesReturn {
  foodTypes: FoodType[];

  isLoading: boolean;
  error: string | null;

  refreshFoodTypes: () => Promise<void>;
}

export default function useFoodTypes(): UseFoodTypesReturn {
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshFoodTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await FoodTypeService.getFoodTypes();

      setFoodTypes(result);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to load food types.");

      setError(message);

      console.error("Failed to fetch food types:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFoodTypes();
  }, [refreshFoodTypes]);

  return {
    foodTypes,
    isLoading,
    error,
    refreshFoodTypes,
  };
}
