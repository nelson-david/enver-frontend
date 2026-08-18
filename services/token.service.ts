import { api } from "@/lib/api";

export interface ApiTokenMetadata {
    id: string;
    name: string;
    displayPrefix: string;
    expiresAt: string | null;
    lastUsedAt: string | null;
    createdAt: string;
}

export interface CreateTokenPayload {
    name: string;
    ttlDays: number | null;
    scopes: string[];
}

export interface CreateTokenResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        rawToken: string;
        expiresAt: string | null;
        displayPrefix: string;
        scopes: string[];
    };
}

export const tokenService = {
    async getTokens(token?: string | null): Promise<ApiTokenMetadata[]> {
        const response = await api.get<{ success: boolean; data: ApiTokenMetadata[] }>("/tokens", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data.data;
    },

    async createToken(payload: CreateTokenPayload, token?: string | null): Promise<CreateTokenResponse["data"]> {
        const response = await api.post<CreateTokenResponse>("/tokens", payload, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data.data;
    },

    async deleteToken(id: string, token?: string | null): Promise<boolean> {
        const response = await api.delete<{ success: boolean }>(`/tokens/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data.success;
    },
};
