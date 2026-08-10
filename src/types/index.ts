export interface User {
  id: string;
  name: string;
  phone: string;
  upi_id: string;
  default_fuel_avg: number;
}

export interface Trip {
  id: string;
  driver_id: string;
  date: string;
  distance_km: number;
  fuel_price: number;
  total_cost: number;
  status: 'active' | 'completed';
}

export interface TripRider {
  id: string;
  trip_id: string;
  rider_id: string;
  share_amount: number;
  payment_status: 'pending' | 'paid';
}

export interface Balance {
  otherUserId: string;
  otherUserName: string;
  netAmount: number; // Positive = they owe you, Negative = you owe them
}

export interface TripHistory extends Trip {
  isDriver: boolean;
  personalShare: number;
}

