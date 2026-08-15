import { api } from "@/lib/api";

export interface OnboardUserPayload {
    clerkId: string;
    email: string;
    name: string;
    imageUrl?: string;
}

export interface OnboardUserResponse {
    success: boolean;
    user: {
        _id: string;
        clerkId: string;
        email: string;
        name: string;
        imageUrl?: string;
    };
}

export const onboardingService = {
    async completeOnboarding(
        payload: OnboardUserPayload,
    ): Promise<OnboardUserResponse> {
        const response = await api.post<OnboardUserResponse>(
            "/users",
            payload,
        );
        return response.data;
    },
};
