export interface UserProfile {
    full_name: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    birth_date: string | null;
    language: string;
    timezone: string;
}

export interface UserContact {
    id: number;
    contact_type: 'email' | 'phone';
    value: string;
    is_verified: boolean;
    is_primary: boolean;
    created_at: string;
}

export interface UserIdentity {
    id: number;
    provider: string;
    provider_id: string;
    created_at: string;
}

export interface User {
    id: number;
    is_active: boolean;
    global_role: string;
    created_at: string;
    profile: UserProfile;
    contacts: UserContact[];
    identities: UserIdentity[];
}

export interface UserSession {
    id: string;
    user_agent: string;
    ip_address: string;
    expires_at: string;
    is_revoked: boolean;
    updated_at: string;
}