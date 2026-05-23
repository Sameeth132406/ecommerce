"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw, Minus, Plus, ChevronLeft, CheckCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlistItem } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const isWishlisted = user?.wishlist?.includes(product?._id) ?? false;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
        // Fetch related
        const relRes = await api.get(`/products?category=${res.data.product.category}&limit=4`);
        setRelatedProducts(relRes.data.products.filter((p: any) => p._id !== id));
      } catch {
        toast.error("Product not found");
        router.push("/products");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
      quantity,
      brand: product.brand,
    }));
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return toast.error("Please login first");
    try {
      await api.post(`/auth/wishlist/${product._id}`);
      dispatch(toggleWishlistItem(product._id));
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Please login to review");
    if (!reviewComment.trim()) return toast.error("Please write a comment");
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewComment });
      toast.success("Review submitted!");
      setReviewComment("");
      // Refresh product
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const imageUrl = (url: string) =>
    url?.startsWith("http") ? url : `http://localhost:5000${url || ""}`;

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="section py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton w-3/4" />
            <div className="h-5 skeleton w-1/2" />
            <div className="h-10 skeleton w-1/3" />
            <div className="h-24 skeleton" />
            <div className="h-12 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="animate-fade-in">
      <div className="section py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600 dark:hover:text-primary-400">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-primary-600 dark:hover:text-primary-400">{product.category}</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
              {discount > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="badge bg-accent-500 text-white text-sm font-bold px-3 py-1">-{discount}%</span>
                </div>
              )}
              <img
                src={imageUrl(product.images[selectedImage])}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product._id}/600/600`;
                }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-primary-500 shadow-md" : "border-transparent opacity-60"
                    }`}
                  >
                    <img
                      src={imageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product._id}${idx}/200/200`; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">{product.brand}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.ratings) ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                ))}
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">{product.ratings.toFixed(1)}</span>
              <span className="text-slate-500">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-slate-400 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <span className="badge bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {product.stock <= 10 ? `Only ${product.stock} left in stock!` : "In Stock"}
                  </span>
                </>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-500">Max: {product.stock}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-accent flex-1 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`btn-icon w-14 h-14 border border-slate-200 dark:border-slate-700 ${
                  isWishlisted ? "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" : ""
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: "Free shipping over ₹999" },
                { icon: Shield, text: "Secure checkout" },
                { icon: RotateCcw, text: "Easy returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                  <Icon className="w-5 h-5 text-primary-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{text}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="badge badge-primary">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
            <div className="flex gap-8">
              {["description", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-all ${
                    activeTab === tab
                      ? "border-primary-600 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {tab} {tab === "reviews" && `(${product.numReviews})`}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "description" && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="card p-6 flex flex-col sm:flex-row items-center gap-8">
                <div className="text-center">
                  <p className="text-6xl font-display font-bold text-slate-900 dark:text-white">{product.ratings.toFixed(1)}</p>
                  <div className="flex justify-center my-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.ratings) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">{product.numReviews} reviews</p>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {[5,4,3,2,1].map(star => {
                    const count = product.reviews?.filter((r: any) => Math.round(r.rating) === star).length || 0;
                    const pct = product.numReviews ? (count / product.numReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 w-4">{star}</span>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm text-slate-500 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write Review */}
              {isAuthenticated && (
                <div className="card p-6">
                  <h3 className="font-display font-bold text-lg mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Your Rating</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setReviewRating(s)}>
                            <Star className={`w-8 h-8 transition-colors ${s <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      className="input resize-none"
                    />
                    <button type="submit" disabled={submittingReview} className="btn-primary">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              {product.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review: any) => (
                    <div key={review._id} className="card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {review.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{review.name}</p>
                            <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
