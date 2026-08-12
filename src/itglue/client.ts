import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getBaseUrl, getEndpointUrl, servers } from "./servers";
import { IGluePassword, IGlueRefresh } from './types/base';
import { IGlueSearch, IGlueSearchQuery } from './types/search';

export class ITGlueClient
{
    private _token: {token: string, expiration: Date} | undefined;

    constructor(public readonly environment: keyof typeof servers, public readonly region: keyof typeof servers['production'], public readonly subdomain: string)
    {

    }

    get baseUrl(): string
    {
        return getBaseUrl(this.subdomain, this.region, this.environment);
    }

    getEndpointUrl(endpoint: Parameters<typeof getEndpointUrl>[0]): string
    {
        return getEndpointUrl(endpoint, this.subdomain, this.region, this.environment);
    }

    async fetchPassword(id: number, includePassword?: boolean): Promise<IGluePassword>
    {
        return this.#request({
            url: this.getEndpointUrl('password').replace('{id}', String(id)).replace('{includePassword}', String(Boolean(includePassword))),
        });
    }

    async search(query: IGlueSearchQuery): Promise<IGlueSearch[]>
    {
        const queryParts: string[] = [];
        query.limit ??= 50;
        for(const [key,val] of Object.entries(query))
        {
            if(Array.isArray(val))
                queryParts.push(`${encodeURI(key)}=${encodeURI(val.join(','))}`);
            else
                queryParts.push(`${encodeURI(key)}=${encodeURI(val)}`);
        }

        const res = await this.#request<never, IGlueSearch[]>({
            url: `${this.baseUrl}/search.json?${queryParts.join('&')}`,
        });

        return res;
    }

    async #request<RequestData = any, ReponseData = any>(request: AxiosRequestConfig<RequestData>): Promise<ReponseData>
    {
        const { token } = await this.#ensureToken();

        const res = await axios({
            ...request,
            headers: {...request.headers, Authorization: `Bearer ${token}`},
        });

        return res.data;
    }

    async #ensureToken(): Promise<{token: string, expiration: Date}>
    {
        // Check if token is still valid
        if(this._token && this._token.expiration.getTime() > Date.now())
            return this._token;

        // Fetch refresh token
        let refreshToken: string;
        try {
            const res = await axios<any, AxiosResponse<IGlueRefresh>>({
                url: `${this.baseUrl}/jwt/refresh`,
            });

            refreshToken = res.data.token;
        } catch(error) {
            // TODO: Beter error handling
            throw error;
        }

        // Fetch new token
        try {
            const res = await axios<any, AxiosResponse<IGlueRefresh>>({
                method: 'POST',
                url: `${this.baseUrl}/jwt/token`,
                headers: {
                    'X-Refresh-Token': refreshToken,
                },
            });

            // Parse token
            const parsedToken = jwtDecode(res.data.token);
            if(!parsedToken?.exp) throw new Error('Received token doesn\'t contain expiration');
            this._token = {
                token: res.data.token,
                expiration: new Date(parsedToken.exp*1000),
            };
        } catch(error) {
            // TODO: Beter error handling
            throw error;
        }

        return this._token;
    }

}
