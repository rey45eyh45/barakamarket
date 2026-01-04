import { Star, Send, User, Calendar, ThumbsUp, Image as ImageIcon, MessageSquare, CheckCircle2, X, Reply } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Review } from '../types';
import { toast } from 'sonner@2.0.3';
import { ImageUploader } from './ImageUploader';
import { motion, AnimatePresence } from 'motion/react';
import { useTelegram } from '../contexts/TelegramContext';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  user?: any; // User from auth context
  isVendor?: boolean; // Is current user a vendor
  vendorId?: string; // Vendor ID for response feature
}

export function ProductReviews({ productId, productName, user, isVendor = false, vendorId }: ProductReviewsProps) {
  const { haptic } = useTelegram();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [vendorResponse, setVendorResponse] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load reviews from localStorage
  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = () => {
    try {
      const stored = localStorage.getItem(`reviews_${productId}`);
      if (stored) {
        const loadedReviews = JSON.parse(stored);
        // Sort by date (newest first)
        loadedReviews.sort((a: Review, b: Review) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReviews(loadedReviews);
      } else {
        // Default demo reviews for first 3 products
        if (['1', '2', '3'].includes(productId)) {
          const demoReviews = getDemoReviews(productId);
          setReviews(demoReviews);
          localStorage.setItem(`reviews_${productId}`, JSON.stringify(demoReviews));
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const getDemoReviews = (productId: string): Review[] => {
    const baseReviews: Review[] = [
      {
        id: 'rev1',
        productId,
        userId: 'demo1',
        userName: 'Ali Valiyev',
        rating: 5,
        comment: 'Juda yaxshi mahsulot! Tavsiya qilaman. Sifati zo\'r, tez yetkazib berishdi.',
        isVerifiedPurchase: true,
        helpfulCount: 12,
        helpfulBy: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'rev2',
        productId,
        userId: 'demo2',
        userName: 'Sardor Karimov',
        rating: 4,
        comment: 'Yaxshi, lekin narxi biroz qimmat. Boshqa hamma narsa yoqdi.',
        isVerifiedPurchase: true,
        helpfulCount: 8,
        helpfulBy: [],
        vendorResponse: {
          message: 'Rahmat fikr-mulohazangiz uchun! Narxlar borasida chegirmalar mavjud. Bizni kuzatib boring! 🎁',
          respondedAt: new Date(Date.now() - 86400000 * 4).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'rev3',
        productId,
        userId: 'demo3',
        userName: 'Kamola Tursunova',
        rating: 5,
        comment: 'Ajoyib! Kutganimdan ham yaxshi chiqdi. Rahmat! 👍',
        isVerifiedPurchase: false,
        helpfulCount: 5,
        helpfulBy: [],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ];
    return baseReviews;
  };

  const saveReviews = (updatedReviews: Review[]) => {
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews));
  };

  const handleAddReview = async () => {
    if (!user) {
      toast.error('Fikr qoldirish uchun tizimga kiring');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Fikringiz kamida 10 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    // Check if user already reviewed this product
    const existingReview = reviews.find(r => r.userId === user.id);
    if (existingReview) {
      toast.error('Siz allaqachon bu mahsulotga fikr bildirgan');
      return;
    }

    setIsSubmitting(true);
    haptic.medium();

    try {
      // Check if user purchased this product (simplified check)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const hasPurchased = orders.some((order: any) => 
        order.userId === user.id && 
        order.items.some((item: any) => item.product.id === productId)
      );

      const newReview: Review = {
        id: `rev_${Date.now()}`,
        productId,
        userId: user.id,
        userName: user.name,
        rating,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
        isVerifiedPurchase: hasPurchased,
        helpfulCount: 0,
        helpfulBy: [],
        createdAt: new Date().toISOString()
      };

      const updatedReviews = [newReview, ...reviews];
      saveReviews(updatedReviews);

      // Reset form
      setRating(5);
      setComment('');
      setShowAddReview(false);
      setImages([]);

      haptic.success();
      toast.success('Fikringiz qo\'shildi! Rahmat 🎉');
    } catch (error) {
      console.error('Error adding review:', error);
      haptic.error();
      toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorResponse = (reviewId: string) => {
    if (!isVendor || !vendorResponse.trim()) {
      toast.error('Javob matnini kiriting');
      return;
    }

    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          vendorResponse: {
            message: vendorResponse.trim(),
            respondedAt: new Date().toISOString()
          }
        };
      }
      return review;
    });

    saveReviews(updatedReviews);
    setRespondingTo(null);
    setVendorResponse('');
    haptic.success();
    toast.success('Javobingiz yuborildi!');
  };

  const handleHelpful = (reviewId: string) => {
    if (!user) {
      toast.error('Tizimga kiring');
      return;
    }

    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        const helpfulBy = review.helpfulBy || [];
        const hasVoted = helpfulBy.includes(user.id);

        if (hasVoted) {
          // Remove vote
          return {
            ...review,
            helpfulCount: (review.helpfulCount || 0) - 1,
            helpfulBy: helpfulBy.filter(id => id !== user.id)
          };
        } else {
          // Add vote
          return {
            ...review,
            helpfulCount: (review.helpfulCount || 0) + 1,
            helpfulBy: [...helpfulBy, user.id]
          };
        }
      }
      return review;
    });

    saveReviews(updatedReviews);
    haptic.light();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugun';
    if (diffDays === 1) return 'Kecha';
    if (diffDays < 7) return `${diffDays} kun oldin`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
    
    return date.toLocaleDateString('uz-UZ', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Average Rating */}
          <div className="flex-shrink-0 text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {reviews.length} ta fikr
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Review Button */}
      {user && !reviews.some(r => r.userId === user.id) && !isVendor && (
        <div>
          {!showAddReview ? (
            <button
              onClick={() => {
                setShowAddReview(true);
                haptic.light();
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 font-medium"
            >
              <Star className="w-5 h-5" />
              Fikr bildirish
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white font-semibold">
                  "{productName}" uchun fikr
                </h3>
                <button
                  onClick={() => {
                    setShowAddReview(false);
                    setComment('');
                    setRating(5);
                    setImages([]);
                    haptic.light();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                >
                  Bekor qilish
                </button>
              </div>

              {/* Rating Stars */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                  Baholang:
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        haptic.light();
                      }}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600 dark:text-gray-400 self-center">
                    {rating} yulduz
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                  Fikringiz:
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Mahsulot haqidagi fikringizni yozing (kamida 10 ta belgi)..."
                  className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {comment.length}/500 belgi
                  </p>
                  {comment.length > 0 && comment.length < 10 && (
                    <p className="text-red-500 text-xs">
                      Yana {10 - comment.length} ta belgi kerak
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                  Rasm yuklash (ixtiyoriy):
                </label>
                <ImageUploader
                  maxImages={3}
                  onUpload={setImages}
                  images={images}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddReview}
                disabled={isSubmitting || comment.trim().length < 10}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Fikr yuborish
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Foydalanuvchi fikrlari ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const hasVoted = review.helpfulBy?.includes(user?.id);
              
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {review.userName}
                          </p>
                          {review.isVerifiedPurchase && (
                            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Tasdiqlangan
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                          <Calendar className="w-3 h-3" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Comment */}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          onClick={() => {
                            setSelectedImage(image);
                            haptic.light();
                          }}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                        />
                      ))}
                    </div>
                  )}

                  {/* Vendor Response */}
                  {review.vendorResponse && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Sotuvchi javobi
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          • {formatDate(review.vendorResponse.respondedAt)}
                        </span>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {review.vendorResponse.message}
                      </p>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={() => handleHelpful(review.id)}
                      className={`flex items-center gap-1 text-sm transition ${
                        hasVoted
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                      <span>Foydali ({review.helpfulCount || 0})</span>
                    </button>

                    {isVendor && !review.vendorResponse && (
                      <button
                        onClick={() => {
                          setRespondingTo(review.id);
                          haptic.light();
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition text-sm"
                      >
                        <Reply className="w-4 h-4" />
                        Javob berish
                      </button>
                    )}
                  </div>

                  {/* Vendor Response Form */}
                  {respondingTo === review.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <textarea
                        value={vendorResponse}
                        onChange={(e) => setVendorResponse(e.target.value)}
                        placeholder="Mijozga javobingizni yozing..."
                        className="w-full h-24 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white resize-none text-sm"
                        maxLength={300}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {vendorResponse.length}/300
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRespondingTo(null);
                              setVendorResponse('');
                              haptic.light();
                            }}
                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                          >
                            Bekor qilish
                          </button>
                          <button
                            onClick={() => handleVendorResponse(review.id)}
                            disabled={!vendorResponse.trim()}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Yuborish
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Hali fikrlar yo'q
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Birinchi bo'lib fikr bildiring!
            </p>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50"
              onClick={() => setSelectedImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
