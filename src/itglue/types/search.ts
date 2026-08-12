
export interface IGlueSearchBase
{
    id: number;
    class: 'organization'|'password';
    class_name: string;
    url: string;
    account_name: string;
    hint: string;
    name: string;
}

export interface IGlueSearchOrganization extends IGlueSearchBase
{
    class: 'organization';
    description: string | null;
    organization: true;
    short_name: string;
}

export interface IGlueSearchPassword extends IGlueSearchBase
{
    class: 'password';
    username: string;
    archived: boolean;
    hint: string;
    password: true;
    password_category_name: string;
    resource_name: string | null;
    organization_name: string;
}

export type IGlueSearch = IGlueSearchOrganization | IGlueSearchPassword;

export interface IGlueSearchQuery
{
    related?: boolean;
    limit?: number;
    query: string;
    include_personal_password?: boolean;
    kind: Array<'organizations'|'passwords'>;
}
