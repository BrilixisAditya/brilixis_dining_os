import { apiRequest } from "./api/client";

import { FoodType } from "@/src/types/types";

interface LaravelFoodType {
  id: number | string;
  name: string;
  code: string;
  is_active: boolean;
}

interface LaravelFoodTypeResponse {
  success: boolean;
  message: string;
  data: LaravelFoodType[];
}

function normalizeFoodType(foodType: LaravelFoodType): FoodType {
  return {
    id: String(foodType.id),
    name: foodType.name,
    code: foodType.code,
    isActive: Boolean(foodType.is_active),
  };
}

export class FoodTypeService {
  /**
   * GET /api/v1/food-types
   *
   * Restaurant owner/manager read-only endpoint.
   */
  static async getFoodTypes(): Promise<FoodType[]> {
    const response = await apiRequest<LaravelFoodTypeResponse>(
      "/api/v1/food-types",
      {
        method: "GET",
      },
    );

    return response.data.map(normalizeFoodType);
  }
}
