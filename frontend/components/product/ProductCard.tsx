"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlistItem } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  images: string[];
  ratings: number;
  numReviews: number;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const isWishlisted = user?.wishlist?.includes(product._id) ?? false;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error("Out of stock");
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
      quantity: 1,
      brand: product.brand,
    }));
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Please login to add to wishlist");
    try {
      await api.post(`/auth/wishlist/${product._id}`);
      dispatch(toggleWishlistItem(product._id));
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const imageUrl = product.images[0]?.startsWith("http")
    ? product.images[0]
    : `http://localhost:5000${product.images[0] || ""}`;

  return (
    <Link href={`/products/${product._id}`} className="group card-hover block overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product._id}/400/400`;
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-accent-500 text-white text-xs font-bold">-{discount}%</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-slate-700 text-white text-xs">Out of Stock</span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="badge bg-amber-500 text-white text-xs">Only {product.stock} left</span>
          )}
        </div>
        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white"
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>
        {/* Add to cart button - slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">{product.brand}</p>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(product.ratings)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">({product.numReviews})</span>
        </div>
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
