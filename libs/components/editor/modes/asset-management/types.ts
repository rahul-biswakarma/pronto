export interface Asset {
    id: string;
    filename: string;
    url: string;
    contentType: string;
    size: number;
    userId: string;
    portfolioId: string;
    createdAt: string;
}

export interface AssetUploadResult {
    success: boolean;
    asset?: Asset;
    error?: string;
    assetPath?: string | null;
}
