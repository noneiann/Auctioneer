// services/auctionApi.ts
import { ApiResponse } from "@auctioneer/types";

export type CreateAuctionBody = {
  title: string;
  description: string;
  category: string;
  imageUrl: string[];
  type: string;
  price?: number;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  startingBid: number;
};

// Helper function to get token from Zustand persist storage
function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
    return null;
  } catch (error) {
    console.error("Error parsing auth storage:", error);
    return null;
  }
}

async function createAuction(
  body: CreateAuctionBody
): Promise<ApiResponse<any>> {
  const token = getAuthToken();

  const res = await fetch("http://localhost:4000/auctions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.data || "Failed to create auction");
  }

  return data;
}

async function getAuctions(): Promise<ApiResponse<any>> {
  const token = getAuthToken();

  const res = await fetch("http://localhost:4000/auctions", {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.data || "Failed to fetch auctions");
  }

  return data;
}

async function getAuctionById(id: string): Promise<ApiResponse<any>> {
  const token = getAuthToken();

  const res = await fetch(`http://localhost:4000/auctions/${id}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.data || "Failed to fetch auction");
  }

  return data;
}

async function updateAuction(
  id: string,
  body: Partial<CreateAuctionBody>
): Promise<ApiResponse<any>> {
  const token = getAuthToken();

  const res = await fetch(`http://localhost:4000/auctions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.data || "Failed to update auction");
  }

  return data;
}

export const auctionApi = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
};
