import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  endBefore,
  limitToLast,
} from "firebase/firestore";
import { db } from "./config";

// Generic CRUD operations
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create document with specific ID
export const createDocumentWithId = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, id: docId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Document not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCollection = async (collectionName, constraints = []) => {
  try {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef, ...constraints);

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const subscribeToCollection = (
  collectionName,
  constraints = [],
  callback
) => {
  const collectionRef = collection(db, collectionName);
  let q = query(collectionRef, ...constraints);

  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};

// Pagination support
export const getPaginatedCollection = async (
  collectionName,
  constraints = [],
  pageSize = 10,
  lastDoc = null
) => {
  try {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef, ...constraints, limit(pageSize));

    if (lastDoc) {
      q = query(
        collectionRef,
        ...constraints,
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const documents = [];
    let lastVisible = null;

    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
      lastVisible = doc;
    });

    return {
      success: true,
      data: documents,
      lastDoc: lastVisible,
      hasMore: documents.length === pageSize,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Collection names
export const usersCollection = "Users";
export const doctorsCollection = "doctors";
export const patientsCollection = "patients";
export const withdrawalRequestsCollection = "withdrawalRequests";
export const verificationsCollection = "verifications";
export const consultationsCollection = "Consultations";
export const reportsCollection = "reports";
export const couponsCollection = "coupons";
export const notificationsCollection = "notifications";