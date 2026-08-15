import { atom } from "jotai";

export interface UserData {
    _id: string;
    clerkId: string;
    email: string;
    name: string;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** The main user atom — null means not loaded yet, undefined means checked but no user */
export const userAtom = atom<UserData | null | undefined>(null);

/** Whether the hydration fetch is in-flight */
export const userLoadingAtom = atom<boolean>(true);
