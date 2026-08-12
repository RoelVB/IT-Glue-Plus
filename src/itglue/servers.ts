
export const servers = Object.freeze({
    production: {
        na: {
            apiUrl: "https://itg-oregon-production-api-lb.itglue.com/api",
            baseUrl: "https://{subdomain}.{project}.com"
        },
        eu: {
            apiUrl: "https://itg-frankfurt-production-api-lb.eu.itglue.com/api",
            baseUrl: "https://{subdomain}.eu.{project}.com"
        },
        au: {
            apiUrl: "https://itg-sydney-production-api-lb.au.itglue.com/api",
            baseUrl: "https://{subdomain}.au.{project}.com"
        }
    },
    qa: {
        na: {
            apiUrl: "https://itg-oregon-qa-api-lb.qa.itglue.com/api",
            baseUrl: "https://{subdomain}.qa.{project}.com"
        },
        eu: {
            apiUrl: "https://itg-frankfurt-qa-api-lb.qa.eu.itglue.com/api",
            baseUrl: "https://{subdomain}.qa.eu.{project}.com"
        },
        au: {
            apiUrl: "https://itg-sydney-qa-api-lb.qa.au.itglue.com/api",
            baseUrl: "https://{subdomain}.qa.au.{project}.com"
        }
    },
    local: {
        na: {
            apiUrl: "http://localhost:3001/api",
            baseUrl: "http://{subdomain}.{project}.localhost:8080"
        },
        eu: {
            apiUrl: "http://localhost:3001/api",
            baseUrl: "http://{subdomain}.{project}.localhost:8080"
        },
        au: {
            apiUrl: "http://localhost:3001/api",
            baseUrl: "http://{subdomain}.{project}.localhost:8080"
        }
    },
    test: {
        na: {
            apiUrl: "https://itg-{subdomain}-api.test.{project}.com/api",
            baseUrl: "https://{subdomain}.test.{project}.com"
        },
        eu: {
            apiUrl: "https://itg-{subdomain}-api.test.eu.{project}.com/api",
            baseUrl: "https://{subdomain}.test.eu.{project}.com"
        },
        au: {
            apiUrl: "https://itg-{subdomain}-api.test.au.{project}.com/api",
            baseUrl: "https://{subdomain}.test.au.{project}.com"
        }
    }
});

export const endpoints = Object.freeze({
    accounts: "/users/{userId}/relationships/accounts",
    passwords: "/passwords",
    password: "/passwords/{id}?show_password={includePassword}",
    passwordOTP: "/passwords/{id}/otp",
    passwordsForOrg: "/organizations/{orgId}/relationships/passwords",
    organizations: "/organizations",
    passwordCategories: "/password_categories",
    user: "/users/{userId}",
    flexibleAssetTypes: "/flexible_asset_types",
    favOrganizations: "/users/{userId}/relationships/favorite_organizations",
    getDocument: "/{orgId}/docs/{id}/versions/draft",
    getContact: "/contacts/{id}",
    getOperatingSystems: "/operating_systems?page[size]=1000",
    getConfiguration: "/configurations/{id}?include=configuration_interfaces,rmm_records",
    getLocation: "/locations/{id}",
    getFlexibleAsset: "/flexible_assets/{id}",
    getFlexibleAssetFields: "flexible_asset_types/{id}/relationships/flexible_asset_fields"
});

export function getEndpointUrl(endpoint: keyof typeof endpoints, subdomain: string, region: keyof typeof servers['production'], environment: keyof typeof servers = 'production')
{
    return `${getApiUrl(subdomain, region, environment)}${endpoints[endpoint]}`;
}

export function getBaseUrl(subdomain: string, region: keyof typeof servers['production'], environment: keyof typeof servers = 'production')
{
    return servers[environment][region].baseUrl.replace('{subdomain}', subdomain).replace('{project}', 'itglue');
}

export function getApiUrl(subdomain: string, region: keyof typeof servers['production'], environment: keyof typeof servers = 'production')
{
    return servers[environment][region].apiUrl.replace('{subdomain}', subdomain).replace('{project}', 'itglue');
}
