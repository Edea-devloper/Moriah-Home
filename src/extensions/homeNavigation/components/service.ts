import { SPFI } from "@pnp/sp";
import { ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IUser } from "./Navigation";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import "@pnp/graph/users";
import "@pnp/graph/groups";
import "@pnp/graph/members";
// import { graphfi, SPFx as graphSPFx } from '@pnp/graph'
// import { WebPartContext } from "@microsoft/sp-webpart-base";

const EXTERNAL_USERS_LIST_ID = '3ceb47a9-f7a6-4e4d-906a-132459a0b981';

export const getNavItems = (sp: SPFI, listTitle: string): Promise<ICommandBarItemProps[]> => sp.web.lists.getByTitle(listTitle)
    .items.select('Title', 'LinkUrl', 'IsNewTab').orderBy('Order0')()
    .then(items => items.map(x => ({
        key: x.Id,
        text: x.Title,
        onClick: () => { window.open(x.LinkUrl, x.IsNewTab ? '_blank' : '_self') }
    })))
    .catch((e) => { console.error("Could not get navigation items", e); return [] });


export const getInternalUsers = async (context: ApplicationCustomizerContext): Promise<IUser[]> => {
    // const graph = graphfi().using(graphSPFx(context));
    // const items = await graph.groups.getById('83e14a22-ee33-429b-a240-86ea11f224af').members();

    const client = await context.msGraphClientFactory.getClient('3');
    const response = await client.api('/groups/{83e14a22-ee33-429b-a240-86ea11f224af}/members').top(999).get();
    // const items = await graphClient
    //     .api('users')
    //     .version("v1.0")
    //     .select("mobilePhone,id,displayName,mail,userPrincipalName,givenName,surname,businessPhones,department,jobTitle,accountEnabled")
    //     .filter(`userType eq 'Member'`)
    //     .top(999)
    //     .get()
    // const users: IUser[] = items.value.filter((x: any) => x.mail && x.mail.includes('@moriah')).map((x: any) => {
    const users: IUser[] = response.value.map((x: any) => {
        const phones = [...x.businessPhones];
        if (x.mobilePhone) phones.push(x.mobilePhone);
        return {
            id: x.id,
            accountEnabled: x.accountEnabled,
            name: x.displayName,
            email: x.mail,
            phones,
            jobTitle: x.jobTitle,
            department: x.department,
            isExternal: false,
            imageUrl: '/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(x.mail)
        }
    })
        .sort((a: IUser, b: IUser) => (a.name > b.name ? 1 : -1))
    // let hebrewUsers: IUser[] = [];
    // users.forEach(value => {
    //     if (!/[a-zA-Z0-9]+/.test(value.name)) {
    //         hebrewUsers.push(value)
    //     }
    // });
    // return hebrewUsers;
    return users;
}

const renderExternalUsers = (items: any) => items.map((x: any) => {
    const name = (x.LastName ? (x.LastName + ' ') : '') + (x.FirstName || '') + (x.SecondFirstName ? ` (${x.SecondFirstName})` : '')
    const phones: string[] = [];
    [x.MobilePhone, x.WorkPhone, x.HomePhone, x.FaxWork].forEach(phone => {
        if (phone) phones.push(phone)
    })
    return {
        id: x.Id,
        accountEnabled: x.accountEnabled,
        name,
        email: x.Email,
        phones,
        jobTitle: x.JobTitle,
        department: (x.Company || '') + (x.Address ? ` ${x.Address}` : '') + ' ' + (x.AddressCity ? ` ${x.AddressCity}` : '') + ' ' + (x.AddressState ? ` ${x.AddressState}` : ''),
        isExternal: true,
        imageUrl: '/_layouts/15/userphoto.aspx?size=M&accountName='
    }
})

export const getExternalUsers = async (sp: SPFI): Promise<IUser[]> => {
    let items = await sp.web.lists.getById(EXTERNAL_USERS_LIST_ID).items.top(999).getPaged()
    if (!items.results.length) {
        console.error('User is not found in the users list');
        return [];
    }
    let users = renderExternalUsers(items.results)
    if (items.hasNext) {
        items = await items.getNext();
        if (items.results.length) {
            users = [...users, ...renderExternalUsers(items.results)]
            if (items.hasNext) {
                items = await items.getNext();
                if (items.results.length) {
                    users = [...users, ...renderExternalUsers(items.results)]
                }
            }
        }
    }
    users.sort((a: IUser, b: IUser) => (a.name > b.name ? 1 : -1))
    return users;
}

