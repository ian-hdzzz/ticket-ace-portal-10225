interface TokenPayload {
    userId: string;
    email: string;
    is_temporary_password: boolean;
    full_name: string;
    roles: string[];
    privileges: string[];
}

export type { TokenPayload };