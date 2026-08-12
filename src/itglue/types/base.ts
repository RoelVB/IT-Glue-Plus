
export interface IGlueRefresh
{
    accounts: any[];
    token: string;
    user_id: number;
}

export interface IGlueBase<DataType extends string = string>
{
    id: string;
    type: DataType;
}

export interface IGluePassword extends IGlueBase<'password'>
{
    attributes: {
      'organization-id': number,
      'organization-name': string,
      'resource-url': string,
      restricted: boolean,
      'my-glue': boolean,
      name: string,
      'autofill-selectors': string | null,
      username: string,
      password?: string,
      url: string,
      notes: string | null,
      'password-updated-at': string,
      'updated-by': number,
      'resource-id': null,
      'resource-type': null,
      'cached-resource-type-name': null,
      'cached-resource-name': null,
      'password-category-id': number,
      'password-category-name': string,
      'created-at': string,
      'updated-at': string,
      'is-live': boolean,
    }
}

export interface IGluePage<Data extends IGlueBase[]>
{
    data: Data;
    links: {
        first: string,
        last: string,
        next?: string,
        prev?: string,
        self: string,
    };
    meta: {
        'current-page': number,
        filters: {}, // TODO: Implement
        'next-page'?: string,
        'prev-page'?: string,
        'total-count': number,
        'total-pages': number,
    };
}
