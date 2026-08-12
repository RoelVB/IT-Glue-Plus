import * as IMessage from '../IMessage';

/**
 * This class is to make the communication with the Background process easier to understand
 */
export default class BackgroundClient
{
    
    /**
     * Check the connection with IT Glue
     */
    public static checkConnection(): Promise<IMessage.ConnectionStatus>
    {
        return new Promise<IMessage.ConnectionStatus>((resolve, reject)=>{
            chrome.runtime.sendMessage({
                type: IMessage.RequestType.checkConnection,
            } as IMessage.Request, (response: IMessage.ConnectionStatus)=>{
                if(response.Error) // We got an error?
                    reject(response.Error);
                else // No error
                    resolve(response);
            });
        });
    }

    /**
     * Find credentials for current url
     */
    public static findCredentials(): Promise<IMessage.Credential[]>
    {
        return new Promise<IMessage.Credential[]>((resolve)=>{
            chrome.runtime.sendMessage({
                type: IMessage.RequestType.findCredentials,
            } as IMessage.Request, (response)=>{
                resolve(response);
            });
        });
    }

    /**
     * Open the extensions' options
     */
    public static openOptions(): void
    {
        chrome.runtime.sendMessage({
            type: IMessage.RequestType.openOptions,
        } as IMessage.Request);
    }

    /**
     * Get extension commands/shortcuts
     */
    public static getExtensionCommands(): Promise<chrome.commands.Command[]>
    {
        return new Promise<chrome.commands.Command[]>((resolve)=>{
            chrome.runtime.sendMessage({
                type: IMessage.RequestType.getCommands,
            } as IMessage.Request, (response)=>{
                resolve(response);
            });
        });
    }

}
