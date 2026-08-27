import * as IMessage from '../IMessage';

/**
 * This class is to make the communication with the Background process easier to understand
 */
export default class BackgroundClient
{
    
    /**
     * Check the connection with IT Glue
     */
    public static async checkConnection(): Promise<IMessage.ConnectionStatus>
    {
        const res = await this.#sendMessage<IMessage.ConnectionStatus>({
            type: IMessage.RequestType.checkConnection,
        });

        if(res.Error)
            throw res.Error;
        else
            return res;
    }

    /**
     * Find credentials for current url
     */
    public static findCredentials(): Promise<IMessage.Credential[]>
    {
        return this.#sendMessage({
            type: IMessage.RequestType.findCredentials,
        });
    }

    /**
     * Open the extensions' options
     */
    public static openOptions()
    {
        return this.#sendMessage({
            type: IMessage.RequestType.openOptions,
        });
    }

    /**
     * Get extension commands/shortcuts
     */
    public static getExtensionCommands(): Promise<chrome.commands.Command[]>
    {
        return this.#sendMessage<chrome.commands.Command[]>({
            type: IMessage.RequestType.getCommands,
        });
    }

    static #sendMessage<R = IMessage.Response, M = IMessage.Request>(msg: M): Promise<R>
    {
        return chrome.runtime.sendMessage<M, R>(msg);
    }

}
