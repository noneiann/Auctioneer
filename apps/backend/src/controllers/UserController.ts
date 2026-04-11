import { Request, Response } from "express";
import { ApiResponse, AuthenticatedRequest } from "@auctioneer/types/src";
import prisma from "@auctioneer/db";

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, firstName: true, lastName: true, username: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ success: false, data: "User not found" });
        res.json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, data: "Server error" });
    }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        const { firstName, lastName, username } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.user.userId },
            data: { firstName, lastName, username },
            select: { id: true, email: true, firstName: true, lastName: true, username: true }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, data: "Server error" });
    }
};

// Get reports stats (admin dashboard overview)
export const getReportsStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        // Example stats logic
        const auctionCount = await prisma.auction.count({ where: { ownerId: req.user.userId } });
        const purchaseCount = await prisma.purchase.count({ where: { item: { ownerId: req.user.userId } } });
        const barterCount = await prisma.barterOffer.count({ where: { targetItem: { ownerId: req.user.userId } } });
        res.json({
            success: true,
            data: {
                totalAuctions: auctionCount,
                totalSales: purchaseCount,
                totalBarters: barterCount,
                revenue: 0 // placeholder
            }
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ success: false, data: "Server error" });
    }
};
