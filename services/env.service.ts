import { api } from "@/lib/api";

export interface CreateSecretPayload {
    projectId: string;
    environment: string;
    ciphertext: string;
    iv: string;
    salt: string;
    shares: Array<{
        shareIndex: number;
        shareData: string;
    }>;
}

export interface CreateSecretResponse {
    success: boolean;
    message: string;
    data: {
        projectId: string;
        environment: string;
    };
}

export interface EnvMetadata {
    id: string;
    projectId: string;
    environment: "PRODUCTION" | "STAGING" | "DEVELOPMENT";
    sharesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetEnvsResponse {
    success: boolean;
    data: EnvMetadata[];
}

export interface DeleteSecretResponse {
    success: boolean;
    message: string;
}

export const envService = {
    async createSecret(
        payload: CreateSecretPayload,
        token?: string | null,
    ): Promise<CreateSecretResponse> {
        const response = await api.post<CreateSecretResponse>(
            "/envs",
            payload,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
        );
        return response.data;
    },

    async getUserEnvs(token?: string | null): Promise<EnvMetadata[]> {
        const response = await api.get<GetEnvsResponse>("/envs", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data.data;
    },

    async deleteEnv(
        projectId: string,
        environment?: string,
        token?: string | null,
    ): Promise<DeleteSecretResponse> {
        const query = environment ? `?environment=${environment}` : "";
        const response = await api.delete<DeleteSecretResponse>(
            `/envs/${projectId}${query}`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
        );
        return response.data;
    },
};
