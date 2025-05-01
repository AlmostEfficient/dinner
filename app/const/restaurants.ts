interface Restaurant {
  id: string;
  name: string;
  // Add more fields as needed
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: "9643",
    name: "Elmo's",
  },
  {
    id: "391",
    name: "Coco's Cantina",
  },
  {
    id: "4465",
    name: "Gemmayze Street",
  },
  {
    id: "7400",
    name: "Ooh-fa",
  },
  {
    id: "10184",
    name: "Tempero",
  },
  // Add more restaurants here
];

// Export individual IDs if needed
export const RESTAURANT_IDS = RESTAURANTS.map(r => r.id); 