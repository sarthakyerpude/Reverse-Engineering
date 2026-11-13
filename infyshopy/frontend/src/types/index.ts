export type Marketplace = 'MEESHO' | 'FLIPKART' | 'AMAZON' | 'MYNTRA' | 'SNAPDEAL' | 'SMARTBIZ';

export interface User {
  email: string;
  fullName?: string;
  role: string;
  balance: number;
  sellerCode?: string;
}

export interface Brand {
  id: string;
  name: string;
  manufacturer?: string;
  packer?: string;
  hsn?: string;
  gst?: number;
}

export interface Category {
  id: string;
  handle: string;
  name: string;
  symbol: string;
  is_ready: number;
  description?: string;
}

export interface MasterProduct {
  master_sku: string;
  title: string;
  base_price: number;
  mrp: number;
  fabric: string;
  color: string;
  blouse_type: string;
  occasion?: string;
  saree_length?: string;
  blouse_length?: string;
  hsn?: string;
  gst?: number;
  images: string[];
}

export interface PlanningTask {
  id: string;
  master_sku: string;
  category: string;
  target_price: number;
  assigned_to: string;
  target_date?: string;
  status: 'planned' | 'inProgress' | 'done' | 'issues';
  created_at?: string;
}

export interface StockItem {
  id: string;
  master_sku: string;
  stock_quantity: number;
  reserved_quantity: number;
  last_updated?: string;
}

export interface GstSummary {
  period: string;
  outputTax: {
    taxableSupplies: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGstLiability: number;
  };
  tcsUnderSection52: {
    meeshoTcs: number;
    flipkartTcs: number;
    amazonTcs: number;
    totalTcsClaimable: number;
  };
  netPayableTax: number;
}

export interface PnlResult {
  sellingPrice: number;
  manufacturingCost: number;
  marketplace: string;
  marketplaceCommission: number;
  packagingCost: number;
  forwardShipping: number;
  rtoLossAllocation: string;
  totalCost: string;
  netProfit: string;
  netMarginPercent: number;
}

