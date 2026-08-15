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
    // NS rows are the nameserver-mode instructions: same copy-a-value UI, but
    // set at the registrar rather than added as a record in an existing zone.
    type: 'TXT' | 'CNAME' | 'NS';
    name: string;
    value: string;
}

export interface VerificationResponse {
    domain: string;
    txt_record: string;
    cname_host: string;
    cname_value: string;
}
