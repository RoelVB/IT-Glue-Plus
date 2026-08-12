import * as IMessage from '../IMessage';
import { log } from './Constants';
import ITGlueService from './ITGlueService';

export default class BackgroundListener
{

    constructor()
    {
        chrome.runtime.onMessage.addListener(this._onMessage.bind(this));

        // noinspection JSIgnoredPromiseFromCall
        this._checkConnection();
    }

    /** When a message is received */
    private _onMessage(message: IMessage.Request, sender: chrome.runtime.MessageSender, sendResponse: (response: IMessage.Response)=>void)
    {
        let responsePromise: Promise<IMessage.Response> | undefined;

        switch(message.type)
        {
            case IMessage.RequestType.openOptions:
                chrome.runtime.openOptionsPage();
                break;
            case IMessage.RequestType.checkConnection:
                responsePromise = this._checkConnection();
                break;
            case IMessage.RequestType.findCredentials:
                responsePromise = this._findCredentials(sender.url || '');
                break;
            case IMessage.RequestType.getCommands:
                responsePromise = this._getExtensionCommands();
                break;
        }

        if(responsePromise) // Did the switch-case result in a promise?
        {
            // Send the response when the Promise finishes
            responsePromise.then((response)=>sendResponse(response)).catch((error)=>log('error', 'Uncaught error in BackgroundListener', error));

            return true; // We need to return true, to let Chrome know the sendResponse will be called asynchronously
        }
    }

    /**
     * We got a credentials request
     * @param url URL the user wants credentials for
     */
    private _findCredentials(url: string): Promise<IMessage.Credential[]>
    {
        return new Promise<IMessage.Credential[]>((resolve, reject)=>{
            log('debug', 'Get credentials for ', url);
            if(url)
            {
                ITGlueService.getLogins(url).then((result)=>{
                    BackgroundListener._setErrorIcon(true);
                    resolve(result);
                }).catch((error)=>{
                    BackgroundListener._setErrorIcon();
                    reject(error);
                });
            }
            else
                resolve([]); // We didn't get a URL
        });
    }

    /** Check the connection with IT Glue */
    private _checkConnection(): Promise<IMessage.ConnectionStatus>
    {
        return new Promise<IMessage.ConnectionStatus>((resolve)=>{
            ITGlueService.testConnection().then(({connected, error})=>{
                BackgroundListener._setErrorIcon(connected);
                resolve({
                    Connected: connected,
                    Subdomain: ITGlueService.subdomain,
                    Error: error,
                });
            });
        });
    }

    private _getExtensionCommands(): Promise<chrome.commands.Command[]>
    {
        return new Promise<chrome.commands.Command[]>((resolve, _reject)=>{
            chrome.commands.getAll((commands)=>{
                resolve(commands);
            });
        });
    }

    /**
     * Set the icon next to the address bar to the error icon
     * @param clear If true, te default icon is shown
     */
    private static _setErrorIcon(clear?: boolean)
    {
        if(clear)
            chrome.action.setIcon({path: '../images/icon48.png'});
        else
            chrome.action.setIcon({path: '../images/icon48_red.png'});
    }

}
