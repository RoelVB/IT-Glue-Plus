import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useConnectionStatus } from '../Hooks/Connection';
import { PaperGrid } from './Options';
import { defaultSettings } from '../../Settings';
import { getBaseUrl, servers } from '../../itglue/servers';
import Button from '@mui/material/Button';
import { log } from '../../classes/Constants';
import CircularProgress from '@mui/material/CircularProgress';
import useSettings from '../Hooks/Settings';

const regionOptions: Array<{value: keyof typeof servers['production'], label: string}> = [
    {value: 'na', label: 'North America (na)'},
    {value: 'eu', label: 'Europe (eu)'},
    {value: 'au', label: 'Australia (au)'},
];

const environmentOptions: Array<{value: keyof typeof servers, label: string}> = [
    {value: 'production', label: 'Production'},
    {value: 'qa', label: 'QA'},
    {value: 'test', label: 'Test'},
    {value: 'local', label: 'Local'},
];

const ConnectionStatusDisplay: React.FC = ()=>
{
    const settings = useSettings(state=>state.settings);
    const subdomain = settings?.itGlueSubdomain || defaultSettings.itGlueSubdomain;
    const region = settings?.itGlueRegion || defaultSettings.itGlueRegion;
    const environment = settings?.itGlueEnvironment || defaultSettings.itGlueEnvironment;
    const [status, connectedSubdomain, connectionError, recheck] = useConnectionStatus([subdomain, region, environment]);

    const openLogin = React.useCallback(()=>{
        if(subdomain) chrome.tabs.create({url: getBaseUrl(subdomain, region, environment)});
    }, [subdomain, region, environment]);

    if(status === 'checking')
    {
        return (<>
            Checking...
            <CircularProgress sx={{ml: 1}} size={20} />
        </>);
    }
    else if(status === 'connected')
        return <>Connected to '{connectedSubdomain}'</>;
    else
    {
        return (<Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            {connectionError ?
                <Alert severity='error'>{connectionError}</Alert>
            :
                <>Not connected</>
            }
            <Box>
                <Button
                    id='openLoginBtn'
                    variant='contained'
                    size='small'
                    disabled={!subdomain}
                    onClick={openLogin}
                >
                    Open IT Glue login
                </Button>
                <Button
                    id='retryBtn'
                    size='small'
                    sx={{ml: 1}}
                    onClick={recheck}
                >
                    Retry
                </Button>
            </Box>
        </Box>);
    }
};

const Connection: React.FC = ()=>
{
    const [ inputSubdomain, setInputSubdomain ] = React.useState<string>();
    const [ inputRegion, setInputRegion ] = React.useState<keyof typeof servers['production']>();
    const [ inputEnvironment, setInputEnvironment ] = React.useState<keyof typeof servers>();
    const settings = useSettings(state=>state.settings);
    const isSaving = useSettings(state=>state.isSaving);
    const saveSettings = useSettings(state=>state.saveSettings);

    /** Subdomain, region or environment changed? */
    const canApply = React.useMemo(()=>{
        return (
            (inputSubdomain !== undefined && inputSubdomain !== settings?.itGlueSubdomain) // Subdomain changed
            || (inputRegion !== undefined && inputRegion !== settings?.itGlueRegion) // Region changed
            || (inputEnvironment !== undefined && inputEnvironment !== settings?.itGlueEnvironment) // Environment changed
        );
    }, [inputSubdomain, inputRegion, inputEnvironment, settings?.itGlueSubdomain, settings?.itGlueRegion, settings?.itGlueEnvironment]);

    /** Save subdomain, region and environment */
    const onApply = React.useCallback(()=>{
        const subdomain = inputSubdomain ?? (settings?.itGlueSubdomain || defaultSettings.itGlueSubdomain);
        const region = inputRegion ?? (settings?.itGlueRegion || defaultSettings.itGlueRegion);
        const environment = inputEnvironment ?? (settings?.itGlueEnvironment || defaultSettings.itGlueEnvironment);

        log('debug', `Apply IT Glue settings (${environment}/${region}/${subdomain})`);
        saveSettings({
            itGlueSubdomain: subdomain,
            itGlueRegion: region,
            itGlueEnvironment: environment,
        });
    }, [inputSubdomain, inputRegion, inputEnvironment]);

    return (<Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        <Typography>Status</Typography>
        <PaperGrid gridProps={{alignItems: 'center'}}>
            <ConnectionStatusDisplay />
        </PaperGrid>

        <Typography>IT Glue settings</Typography>
        <PaperGrid gridProps={{flexDirection: 'column', gap: 1}}>
            <Grid item container alignItems='center' gap={1}>
                <TextField
                    id='subdomainField'
                    sx={{width: '250px'}}
                    variant='filled'
                    size='small'
                    label='Subdomain'
                    value={inputSubdomain ?? (settings?.itGlueSubdomain ?? defaultSettings.itGlueSubdomain)}
                    onChange={ev=>setInputSubdomain(ev.target.value)}
                />
                <TextField
                    id='regionField'
                    select
                    sx={{width: '160px'}}
                    variant='filled'
                    size='small'
                    label='Region'
                    value={inputRegion ?? (settings?.itGlueRegion || defaultSettings.itGlueRegion)}
                    onChange={ev=>setInputRegion(ev.target.value as keyof typeof servers['production'])}
                >
                    {regionOptions.map(option=>(
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    id='environmentField'
                    select
                    sx={{width: '160px'}}
                    variant='filled'
                    size='small'
                    label='Environment'
                    value={inputEnvironment ?? (settings?.itGlueEnvironment || defaultSettings.itGlueEnvironment)}
                    onChange={ev=>setInputEnvironment(ev.target.value as keyof typeof servers)}
                >
                    {environmentOptions.map(option=>(
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item>
                <Button
                    id='applyBtn'
                    variant='contained'
                    disabled={isSaving || !canApply}
                    onClick={onApply}
                >
                    Apply
                </Button>
            </Grid>
        </PaperGrid>
    </Box>);
};

export default Connection;
