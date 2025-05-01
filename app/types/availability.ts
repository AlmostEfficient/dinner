import type { MinimalService } from './api'

export interface RestaurantDinnerAvailability {
  restaurantId: string
  restaurantName: string
  services: MinimalService[] | null
  error?: string | null
}