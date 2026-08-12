import React from 'react';
import Client from '../../classes/BackgroundClient';

export type ConnectionCheckStatus = 'checking'|'notConnected'|'connected';

/**
 * Get IT Glue connection status
 * @param deps Connection is re-checked if values in this list change
 * @returns [status, subdomain, error message, re-check method]
 */
export const useConnectionStatus = (deps?: React.DependencyList): [ConnectionCheckStatus|undefined, string|undefined, string|undefined, ()=>void] =>
{
    const [status, setStatus] = React.useState<ConnectionCheckStatus>('checking');
    const [subdomain, setSubdomain] = React.useState<string>();
    const [errorMsg, setErrorMsg] = React.useState<string>();

    const check = React.useCallback(()=>{
        setStatus('checking');
        setErrorMsg(undefined);

        (async ()=>{
            try {
                const status = await Client.checkConnection();

                setStatus(status.Connected?'connected':'notConnected');
                setSubdomain(status.Subdomain);
            } catch(error) {
                setStatus('notConnected');
                setErrorMsg(String(error));
            }
        })();
    }, []);

    React.useEffect(check, deps || []);

    return [status, subdomain, errorMsg, check];
};
