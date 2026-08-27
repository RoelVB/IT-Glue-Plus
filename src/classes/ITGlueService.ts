import { ITGlueClient } from '../itglue/client';
import * as IMessage from '../IMessage';
import { loadSettings } from '../Settings';
import { log } from './Constants';

/** Get the hostname (without a leading "www.") for a URL, or undefined if it can't be parsed */
function hostnameOf(url?: string | null): string | undefined
{
    if(!url) return undefined;

    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return undefined;
    }
}

/** Does the credential's hostname belong to the page's hostname (exact match, or a sub/parent domain)? */
function hostnamesMatch(pageHostname: string, credentialHostname: string): boolean
{
    return pageHostname === credentialHostname
        || pageHostname.endsWith(`.${credentialHostname}`)
        || credentialHostname.endsWith(`.${pageHostname}`);
}

export class ITGlueService
{
    private _client?: ITGlueClient;
    private _clientKey?: string;

    /** The subdomain the (cached) client is currently configured for */
    public get subdomain(): string | undefined
    {
        return this._client?.subdomain;
    }

    /**
     * Test the connection with IT Glue (i.e. can we authenticate using the browser's IT Glue session?)
     */
    public async testConnection(): Promise<{connected: boolean, error?: string}>
    {
        try {
            const client = await this._getClient();
            await client.checkConnection();
            return {connected: true};
        } catch(error) {
            log('warn', 'IT Glue connection check failed', error);
            return {connected: false, error: error instanceof Error ? error.message : String(error)};
        }
    }

    /**
     * fetch credentials for a URL from IT Glue
     */
    public async getLogins(url: string): Promise<IMessage.Credential[]>
    {
        const pageHostname = hostnameOf(url);
        if(!pageHostname) return [];

        const client = await this._getClient();

        const searchResults = await client.search({query: `host:${pageHostname}`, kind: ['passwords'], limit: 25, include_personal_password: true});


        const credentials: IMessage.Credential[] = [];
        for(const result of searchResults)
        {
            credentials.push({
                id: result.id,
                title: result.name,
                username: result.username,
                organization: result.organization_name,
            });
        }

        log('debug', `Got ${credentials.length} logins for "${pageHostname}"`);

        return credentials;
    }

    /**
     * Fetch the real password for a credential. Kept separate from `getLogins` so we only ever
     * retrieve a password's actual value right before it's needed (e.g. when it's entered into a field).
     */
    public async fetchPassword(id: number): Promise<string>
    {
        const client = await this._getClient();
        const password = await client.fetchPassword(id, true);

        if(!password.attributes.password)
            throw new Error('IT Glue did not return a password for this entry');
        else
            return password.attributes.password;
    }

    /**
     * Get an IT Glue client configured for the current settings. The client is cached (and its JWT along with it)
     * as long as the environment/region/subdomain don't change.
     */
    private async _getClient(): Promise<ITGlueClient>
    {
        const settings = await loadSettings();
        if(!settings.itGlueSubdomain)
            throw new Error('The IT Glue subdomain is not configured. Please configure it in the extension options.');

        const clientKey = `${settings.itGlueEnvironment}|${settings.itGlueRegion}|${settings.itGlueSubdomain}`;
        if(!this._client || this._clientKey !== clientKey)
        {
            this._client = new ITGlueClient(settings.itGlueEnvironment, settings.itGlueRegion, settings.itGlueSubdomain);
            this._clientKey = clientKey;
        }

        return this._client;
    }

}

const ITGlueServiceInstance = new ITGlueService();
export default ITGlueServiceInstance;
