import {
  getCollection,
  getDocument,
  createDocumentWithId,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  getPaginatedCollection,
} from "../firebase/firestore";
import { where, orderBy, limit } from "firebase/firestore";

// Coupon data model based on Firebase structure
export const CouponModel = {
  couponCode: "",
  couponDescription: "",
  couponExpiry: "",
  couponName: "",
  couponType: "Generic", // "Generic" or "Targeted"
  couponValue: "",
  currentUsageCount: 0,
  isGeneric: true,
  maxUsageLimit: 10,
  targetedDoctorIds: [],
  targetedUserIds: [],
  usedByUserIds: [],
};

// Collection name
const couponsCollection = "coupons";

// Get all coupons
export const getCoupons = async (filters = {}) => {
  try {
    const constraints = [orderBy("couponName", "asc")];

    // Add filters if needed
    if (filters.couponType) {
      constraints.push(where("couponType", "==", filters.couponType));
    }

    const result = await getCollection(couponsCollection, constraints);
    return result;
  } catch (error) {
    console.error("Error in getCoupons:", error);
    return { success: false, error: error.message };
  }
};

// Get coupons with pagination
export const getCouponsPaginated = async (
  pageSize = 10,
  lastDoc = null,
  filters = {}
) => {
  try {
    const constraints = [orderBy("couponName", "asc")];

    if (filters.couponType) {
      constraints.push(where("couponType", "==", filters.couponType));
    }

    const result = await getPaginatedCollection(
      couponsCollection,
      constraints,
      pageSize,
      lastDoc
    );
    return result;
  } catch (error) {
    console.error("Error in getCouponsPaginated:", error);
    return { success: false, error: error.message };
  }
};

// Get single coupon by ID
export const getCoupon = async (couponId) => {
  try {
    const result = await getDocument(couponsCollection, couponId);
    return result;
  } catch (error) {
    console.error("Error in getCoupon:", error);
    return { success: false, error: error.message };
  }
};

// Create new coupon
export const createCoupon = async (couponData) => {
  try {
    if (!couponData.couponCode) {
      return { success: false, error: "Coupon code is required" };
    }

    // Ensure arrays are initialized
    const data = {
      ...couponData,
      targetedDoctorIds: couponData.targetedDoctorIds || [],
      targetedUserIds: couponData.targetedUserIds || [],
      usedByUserIds: couponData.usedByUserIds || [],
      currentUsageCount: couponData.currentUsageCount || 0,
    };

    // Use couponCode as the document ID
    const result = await createDocumentWithId(
      couponsCollection,
      couponData.couponCode,
      data
    );
    return result;
  } catch (error) {
    console.error("Error in createCoupon:", error);
    return { success: false, error: error.message };
  }
};

// Update coupon
export const updateCoupon = async (couponId, couponData) => {
  try {
    if (!couponData.couponCode) {
      return { success: false, error: "Coupon code is required" };
    }

    // If couponCode changed, we need to delete the old document and create a new one
    if (couponId !== couponData.couponCode) {
      // Delete old document
      await deleteDocument(couponsCollection, couponId);
      
      // Create new document with new couponCode as ID
      const data = {
        ...couponData,
        targetedDoctorIds: couponData.targetedDoctorIds || [],
        targetedUserIds: couponData.targetedUserIds || [],
        usedByUserIds: couponData.usedByUserIds || [],
        currentUsageCount: couponData.currentUsageCount || 0,
      };
      
      const result = await createDocumentWithId(
        couponsCollection,
        couponData.couponCode,
        data
      );
      return result;
    } else {
      // CouponCode hasn't changed, just update the document
      const result = await updateDocument(couponsCollection, couponId, couponData);
      return result;
    }
  } catch (error) {
    console.error("Error in updateCoupon:", error);
    return { success: false, error: error.message };
  }
};

// Delete coupon
export const deleteCoupon = async (couponId) => {
  try {
    const result = await deleteDocument(couponsCollection, couponId);
    return result;
  } catch (error) {
    console.error("Error in deleteCoupon:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to coupons real-time updates
export const subscribeToCoupons = (callback, filters = {}) => {
  try {
    const constraints = [orderBy("couponName", "asc")];

    if (filters.couponType) {
      constraints.push(where("couponType", "==", filters.couponType));
    }

    return subscribeToCollection(couponsCollection, constraints, callback);
  } catch (error) {
    console.error("Error setting up coupons subscription:", error);
    return null;
  }
};

