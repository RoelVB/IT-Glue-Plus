
export enum RequestType
{
    /** Request credentials lookup */
    findCredentials,
    /** Open the extension's options */
    openOptions,
    /** Check the connection with IT Glue */
    checkConnection,
    /** Fetch the real password for a credential, by id */
    fetchPassword,
    /** Re-detect the credentials fields */
    redetectFields,
    /** Get extension commands */
    getCommands,
    
    /** Send to a tab when the "Fill user + password" was selected in the contextmenu */
    contextMenuFillUserPass,
    /** Send to a tab when the "Fill user" was selected in the contextmenu */
    contextMenuFillUser,
    /** Send to a tab when the "Fill password" was selected in the contextmenu */
    contextMenuFillPass,
}

export interface RequestData extends Record<RequestType, unknown>
{
    [RequestType.fetchPassword]: {
        id: number;
    };
}

export type Request = {
  [K in RequestType]: {
    type: K,
  } & RequestData[K];
}[RequestType];

export type Response = Credential[] | ConnectionStatus | PasswordResult | chrome.commands.Command[];

export interface Credential
{
    id: number;
    title: string;
    username: string;
    organization: string;
}

export interface ConnectionStatus
{
    Connected: boolean;
    Subdomain?: string;
    Error?: string;
}

export interface PasswordResult
{
    password: string;
}

export interface BasicAuth
{
    command?: 'selectCredential'|'getCredentials';
    nonce: number;
    credential?: Credential;
}

export interface BasicAuthResponse
{
    credentials?: Credential[];
    url?: string;
}
