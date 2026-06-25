export type UserRole = 'customer' | 'vendor' | 'admin';
export type ProductCondition = 'new' | 'used' | 'refurbished';
export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mtn_momo' | 'vodafone_cash' | 'airteltigo_money' | 'card' | 'danso_pay' | 'cash_on_delivery';
export type DeliveryMethod = 'door' | 'station';
export type MoMoNetwork = 'mtn' | 'vodafone' | 'airteltigo';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  walletBalance: number;
  isVerified: boolean;
}

export interface ProductVariant {
  type: 'color' | 'size' | 'style' | 'storage';
  options: string[];
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  subcategory: string;
  brand: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  stock: number;
  sku: string;
  variants: ProductVariant[];
  condition: ProductCondition;
  rating: number;
  reviewCount: number;
  isOfficialStore: boolean;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'deleted';
  createdAt: string;
  sellerName?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  qty: number;
  variant?: { type: string; value: string };
  priceSnapshot: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  region: string;
}

export interface TrackingStep {
  status: OrderStatus;
  description: string;
  timestamp?: string;
}

export interface OrderItem {
  productId: string;
  vendorId: string;
  qty: number;
  unitPrice: number;
  variant?: { type: string; value: string };
  productSnapshot: { name: string; image: string; category: string };
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress: DeliveryAddress;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
  trackingTimeline: TrackingStep[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
  bannerImage?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId: string;
}
