import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Donation, DonationFormData, DonationStatus } from '@/types';
import { sendNotification } from './notificationService';

const DONATIONS_COLLECTION = 'donations';

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  const timestamp = Date.now();
  const storageRef = ref(storage, `donation-images/${userId}/${timestamp}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const createDonation = async (
  donorId: string,
  donorName: string,
  donorPhone: string | undefined, // from user profile
  data: DonationFormData
): Promise<string> => {
  const donationData = {
    ...data,
    donorId,
    donorName,
    donorPhone: donorPhone || null, // Keep original profile phone 
    // data.contactPhone and data.countryCode are already in 'data'
    status: 'pending' as DonationStatus,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, DONATIONS_COLLECTION), donationData);
  return docRef.id;
};

export const updateDonation = async (
  donationId: string,
  data: Partial<DonationFormData>
): Promise<void> => {
  const donationRef = doc(db, DONATIONS_COLLECTION, donationId);
  await updateDoc(donationRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

export const deleteDonation = async (donationId: string): Promise<void> => {
  const donationRef = doc(db, DONATIONS_COLLECTION, donationId);
  await deleteDoc(donationRef);
};



export const acceptDonation = async (
  donationId: string,
  ngoId: string,
  ngoName: string,
  ngoPhone?: string,
  ngoAddress?: string // Added address
): Promise<void> => {
  const donationRef = doc(db, DONATIONS_COLLECTION, donationId);
  await updateDoc(donationRef, {
    status: 'accepted',
    acceptedBy: ngoId,
    acceptedByName: ngoName,
    acceptedByPhone: ngoPhone || null,
    acceptedByAddress: ngoAddress || null, // Save address
    updatedAt: Timestamp.now()
  });

  // Get donor ID to notify
  // Note: Optimally we'd pass donorId to this function to avoid a read, but for now assuming we might not have it or just read it. 
  // Actually, we can fetch the doc first or relying on the caller to pass it? 
  // Let's modify the function to fetch the doc or pass donorId. 
  // Given the complexity of changing signature everywhere, let's fetch.
  // BUT wait, we are in 'donationService'.

  // To keep it simple, we will require the caller to notify, OR we do a read here.
  // Let's do a read here to be safe and autonomous.
  // ...Wait, that adds latency. 
  // Let's just update the function signature to take donorId? No, that breaks UI call sites.
  // Doing a quick getDoc here is fine for MVP.
  // const snap = await getDoc(donationRef);
  // const data = snap.data() as Donation;
  // if (data) {
  //   await sendNotification(data.donorId, "Donation Accepted", `Your donation was accepted by ${ngoName}`);
  // }
};

export const updateDonationStatus = async (
  donationId: string,
  status: DonationStatus
): Promise<void> => {
  const donationRef = doc(db, DONATIONS_COLLECTION, donationId);
  await updateDoc(donationRef, {
    status,
    updatedAt: Timestamp.now()
  });
};

export const subscribeToDonorDonations = (
  donorId: string,
  onSuccess: (donations: Donation[]) => void,
  onError?: (error: Error) => void
) => {
  // Removed orderBy to avoid requiring a composite index
  const q = query(
    collection(db, DONATIONS_COLLECTION),
    where('donorId', '==', donorId)
  );

  return onSnapshot(q, {
    next: (snapshot) => {
      const donations: Donation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Donation[];
      // Client-side sorting
      donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onSuccess(donations);
    },
    error: (error) => {
      console.error("Error fetching donor donations:", error);
      if (onError) onError(error);
    }
  });
};

export const subscribeToAvailableDonations = (
  onSuccess: (donations: Donation[]) => void,
  onError?: (error: Error) => void
) => {
  // Removed orderBy to avoid requiring a composite index
  const q = query(
    collection(db, DONATIONS_COLLECTION),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, {
    next: (snapshot) => {
      const donations: Donation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Donation[];
      // Client-side sorting
      donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onSuccess(donations);
    },
    error: (error) => {
      console.error("Error fetching available donations:", error);
      if (onError) onError(error);
    }
  });
};

export const subscribeToNGOAcceptedDonations = (
  ngoId: string,
  onSuccess: (donations: Donation[]) => void,
  onError?: (error: Error) => void
) => {
  // Removed orderBy to avoid requiring a composite index
  const q = query(
    collection(db, DONATIONS_COLLECTION),
    where('acceptedBy', '==', ngoId)
  );

  return onSnapshot(q, {
    next: (snapshot) => {
      const donations: Donation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Donation[];
      // Client-side sorting
      donations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      onSuccess(donations);
    },
    error: (error) => {
      console.error("Error fetching NGO pickups:", error);
      if (onError) onError(error);
    }
  });
};

export const getAvailableDonations = async (): Promise<Donation[]> => {
  // Removed orderBy to avoid requiring a composite index
  const q = query(
    collection(db, DONATIONS_COLLECTION),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  const donations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Donation[];

  // Client-side sorting
  donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return donations;
};
