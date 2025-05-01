interface Restaurant {
  id: string;
  name: string;
  url?: string;
  // Add more fields as needed
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: "9643",
    name: "Elmo's",
    url: "https://www.elmos.co.nz/bookings",
  },
  {
    id: "391",
    name: "Coco's Cantina",
    url: "https://www.cocoscantina.co.nz/book-a-table",
  },
  {
    id: "4465",
    name: "Gemmayze Street",
    url: "https://www.gemmayzestreet.co.nz/book",
  },
  {
    id: "7400",
    name: "Ooh-fa",
    url: "https://oohfa.co.nz/bookings",
  },
  {
    id: "10184",
    name: "Tempero",
    url: "https://www.temperoakl.com/reserve",
  },
  // https://api.nowbookit.com/bookings/get-schedule/venue/3687?date=2025-5-11&numofpeople=1
  {
    id: "3687",
    name: "Onslow",
    url: "https://www.onslow.nz/reservations/",
  },
  // https://api.nowbookit.com/bookings/get-schedule/venue/7601?date=2025-5-1&numofpeople=1
  // 7 people minimum
  // {
  //   id: "7601",
  //   name: "Beau",
  //   url: "https://beauponsonby.co.nz/bookings/",
  // },
  // https://api.nowbookit.com/bookings/get-schedule/venue/5672?date=2025-5-8&numofpeople=2
  {
    id: "5672",
    name: "Atelier",
    url: "https://www.atelierkrd.co.nz/reservations",
  },
  // https://api.nowbookit.com/bookings/get-schedule/venue/4052?date=2025-5-9&numofpeople=1
  {
    id: "4052",
    name: "Ada",
    url: "https://www.adarestaurant.co.nz/book-a-table",
  },
  // https://api.nowbookit.com/bookings/get-schedule/venue/2091?date=2025-5-9&numofpeople=2
  // {
  //   id: "2091",
  //   name: "Forest",
  //   url: "https://www.forestrestaurant.co.nz/#:~:text=our%20current%20menu.-,Join%20us%20for%20dinner.,-We%20welcome%20walk"
  // },
  // Add more restaurants here
];

// Export individual IDs if needed
export const RESTAURANT_IDS = RESTAURANTS.map(r => r.id); 