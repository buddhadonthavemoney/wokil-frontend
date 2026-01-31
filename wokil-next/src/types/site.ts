export type SiteStatus = 'deployed' | 'requested' | 'link_pending';
export type SiteType = 'subdomain' | 'external';

export interface Site {
    id: number;
    domain: string;
    reference: string;
    status: SiteStatus;
    type: SiteType;
    created_at: string;
    updated_at: string;
}

export interface CreateSiteRequest {
    domain: string;
    status: 'requested' | 'link_pending';
}

export interface VerificationRecord {
    type: 'TXT' | 'CNAME';
    name: string;
    value: string;
}

export interface VerificationResponse {
    domain: string;
    txt_record: string;
    cname_host: string;
    cname_value: string;
}
