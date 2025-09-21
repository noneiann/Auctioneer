"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  FileText,
  Image,
  Tag,
  Package,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ItemType } from "@auctioneer/types";
import useAuctions from "@/hooks/useAuctions";
import DateTimePicker from "@/components/DateTimePicker";
import AnimatedInput from "@/components/AnimatedInput";
import AnimatedTextarea from "@/components/AnimatedTextarea";
import AnimatedSelect from "@/components/AnimatedSelect";

interface CreateAuctionFormData {
  title: string;
  description: string;
  imageUrl: string[];
  type: ItemType;
  price: string;
  category: string;
  startingBid: string;
  startTime: string;
  endTime: string;
}

export default function CreateAuctionForm() {
  const { createAuction } = useAuctions();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Set default start time to current time + 1 hour, end time to start time + 24 hours
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString();
  };

  const getDefaultEndTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 25); // 1 hour from now + 24 hours
    return now.toISOString();
  };

  const [form, setForm] = useState<CreateAuctionFormData>({
    title: "",
    description: "",
    imageUrl: [],
    type: "AUCTION" as ItemType,
    price: "",
    startingBid: "",
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    category: "",
  });

  const [imageInput, setImageInput] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addImageUrl = () => {
    if (imageInput && imageInput.trim()) {
      setForm({
        ...form,
        imageUrl: [...form.imageUrl, imageInput.trim()],
      });
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...form.imageUrl];
    newImages.splice(index, 1);
    setForm({ ...form, imageUrl: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!user) {
      setError("You must be logged in to create an auction");
      setIsLoading(false);
      return;
    }

    if (form.imageUrl.length === 0) {
      setError("Please add at least one image");
      setIsLoading(false);
      return;
    }

    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);
    const now = new Date();

    if (startDate <= now) {
      setError("Start time must be in the future");
      setIsLoading(false);
      return;
    }

    if (endDate <= startDate) {
      setError("End time must be after start time");
      setIsLoading(false);
      return;
    }

    try {
      await createAuction({
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        type: form.type,
        category: form.category,
        price: parseFloat(form.price) || 0,
        startingBid: parseFloat(form.startingBid),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });

      router.push("/auctions");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create auction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full shadow-sm">
      <h1 className="text-2xl font-medium mb-6 text-gray-800 dark:text-gray-100">
        Create Auction
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Information */}
        <div className="pb-4">
          <h2 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
            Item Information
          </h2>

          <div className="space-y-4">
            <AnimatedInput
              label="Item Name"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              icon={Tag}
              placeholder="e.g., Vintage Camera"
              required
              name="title"
            />

            <AnimatedTextarea
              label="Description"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              icon={FileText}
              placeholder="Describe your item in detail..."
              required
              name="description"
              maxLength={500}
            />

            <div>
              <label className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                <Image size={16} className="mr-2" />
                Images
              </label>
              <div className="flex gap-2 mb-3">
                <AnimatedInput
                  label="Image URL"
                  type="url"
                  value={imageInput}
                  onChange={setImageInput}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-4 py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 transform hover:scale-105 active:scale-95"
                >
                  Add
                </button>
              </div>

              {form.imageUrl.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {form.imageUrl.map((url, index) => (
                    <div key={index} className="relative group rounded-md overflow-hidden">
                      <img
                        src={url}
                        alt={`Item ${index + 1}`}
                        className="w-full h-24 object-cover border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/96?text=Error";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AnimatedSelect
                label="Type"
                value={form.type}
                onChange={(value) => setForm({ ...form, type: value as ItemType })}
                icon={Package}
                required
                name="type"
                options={[
                  { value: "AUCTION", label: "Auction" },
                  { value: "DIRECT", label: "Direct Sale" },
                  { value: "BARTER", label: "Barter" },
                ]}
              />

              <AnimatedSelect
                label="Category"
                value={form.category}
                onChange={(value) => setForm({ ...form, category: value })}
                icon={Layers}
                required
                name="category"
                options={[
                  { value: "Shoes", label: "Shoes" },
                  { value: "Watches", label: "Watches" },
                  { value: "Electronics", label: "Electronics" },
                  { value: "Clothing", label: "Clothing" },
                  { value: "Collectibles", label: "Collectibles" },
                  { value: "Art", label: "Art" },
                  { value: "Books", label: "Books" },
                  { value: "Sports Equipment", label: "Sports Equipment" },
                ]}
              />

              <AnimatedInput
                label="Estimated Value"
                type="number"
                value={form.price}
                onChange={(value) => setForm({ ...form, price: value })}
                icon={DollarSign}
                placeholder="0.00"
                name="price"
                min="0"
                step="0.01"
              />

              <AnimatedInput
                label="Starting Bid"
                type="number"
                value={form.startingBid}
                onChange={(value) => setForm({ ...form, startingBid: value })}
                icon={DollarSign}
                placeholder="0.00"
                required
                name="startingBid"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Auction Settings */}
        <div className="pb-4">
          <h2 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Auction Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <DateTimePicker
              value={form.startTime}
              onChange={(value) => setForm({ ...form, startTime: value })}
              label="Start Time"
              placeholder="Select start date and time"
              required
              minDate={new Date().toISOString().split('T')[0]} // Today's date only
            />

            <DateTimePicker
              value={form.endTime}
              onChange={(value) => setForm({ ...form, endTime: value })}
              label="End Time"
              placeholder="Select end date and time"
              required
              minDate={form.startTime ? new Date(form.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !user}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Auction"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
