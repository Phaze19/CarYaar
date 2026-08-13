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
  group_id?: string;
  date: string;
  distance_km: number;
  fuel_price: number;
  total_cost: number;
  status: 'active' | 'completed';
  created_at: string;
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

export interface Group {
  id: string;
  name: string;
  created_by: string;
  invite_code?: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  user?: User;
}

export interface Friend {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend_user?: User; // joined user object
}

