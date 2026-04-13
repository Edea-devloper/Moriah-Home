import { WebPartContext } from "@microsoft/sp-webpart-base";
import { addHours } from "date-fns";
import { IUser } from "./PeopleSearch";
const INTERNAL_USERS_KEY = 'InternalUsers';
const EXTERNAL_USERS_KEY = 'ExternalUsers';
const EXTERNAL_USERS_LIST_ID = '3ceb47a9-f7a6-4e4d-906a-132459a0b981';
import { SPFx, spfi } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/graph/users";
import "@pnp/graph/groups";
import "@pnp/graph/members";
// import { graphfi, SPFx as graphSPFx } from '@pnp/graph'

export const getInternalUsers = async (context: WebPartContext, cachingHours: number): Promise<IUser[]> => {
    // let cachedData = cachingHours ? JSON.parse(localStorage.getItem(INTERNAL_USERS_KEY)) : null;
    // if (cachedData) {
    //     if (cachedData.date && new Date(cachedData.date).getTime() - new Date().getTime() > 0) {
    //         console.log('Cached data is used')
    //         return (cachedData.users);
    //     } else {
    //         localStorage.removeItem(INTERNAL_USERS_KEY);
    //         console.log('Cached data is REMOVED')
    //         cachedData = null;
    //     }
    // }
    // if (!cachedData) {
    // const graph = graphfi().using(graphSPFx(context));
    // const items = await graph.groups.getById('83e14a22-ee33-429b-a240-86ea11f224af').members();

    const client = await context.msGraphClientFactory.getClient('3');
    const response = await client.api('/groups/{83e14a22-ee33-429b-a240-86ea11f224af}/members').select('*').top(999).get();

    // const graphClient = await context.msGraphClientFactory.getClient("3")
    // const items = await graphClient
    // .api('users')
    // .version("v1.0")
    // .select("mobilePhone,id,displayName,mail,userPrincipalName,givenName,surname,businessPhones,department,jobTitle,userType,accountEnabled")
    // .top(999)
    // .filter("userType eq 'Member'")
    // .get()   

    // const users:IUser[] = items.value.filter((x:any)=>x.mail && x.mail.includes('@moriah')).map((x:any)=>{        
    const users: IUser[] = response.value.map((x: any) => {
        const phones = [...x.businessPhones];
        if (x.mobilePhone) phones.push(x.mobilePhone)
        return {
            phones,
            accountName: x.userPrincipalName,
            name: x.displayName,
            department: x.department,
            jobTitle: x.jobTitle,
            email: x.mail,
            id: x.id,
            letter: x.displayName ? x.displayName[0].toUpperCase() : '',
            isMember: true,
            accountEnabled: x.accountEnabled
        }
    })
        .sort((a: IUser, b: IUser) => (a.name > b.name ? 1 : -1))
    // .sort((a: IUser, b: IUser) => (a.department > b.department ? 1 : -1))
    if (cachingHours) localStorage.setItem(INTERNAL_USERS_KEY, JSON.stringify({ users, date: addHours(new Date(), 24).toISOString() }))
    // let hebrewUsers: IUser[] = [];
    // users.forEach(value => {
    //     if (!/[a-zA-Z0-9]+/.test(value.name)) {
    //         hebrewUsers.push(value)
    //     }
    // });
    // return hebrewUsers;
    return users;
    // }
}

export const getInternalUsersDepartment = async (context: WebPartContext, cachingHours: number): Promise<IUser[]> => {
    // let cachedData = cachingHours ? JSON.parse(localStorage.getItem(INTERNAL_USERS_KEY)) : null;
    // if (cachedData) {
    //     if (cachedData.date && new Date(cachedData.date).getTime() - new Date().getTime() > 0) {
    //         console.log('Cached data is used')
    //         return (cachedData.users);
    //     } else {
    //         localStorage.removeItem(INTERNAL_USERS_KEY);
    //         console.log('Cached data is REMOVED')
    //         cachedData = null;
    //     }
    // }
    // if (!cachedData) {
    // const graph = graphfi().using(graphSPFx(context));
    // const items = await graph.groups.getById('83e14a22-ee33-429b-a240-86ea11f224af').members();

    const client = await context.msGraphClientFactory.getClient('3');
    const response = await client.api('/groups/{83e14a22-ee33-429b-a240-86ea11f224af}/members').select('*').top(999).get();

    // const graphClient = await context.msGraphClientFactory.getClient("3")
    // const items = await graphClient
    // .api('users')
    // .version("v1.0")
    // .select("mobilePhone,id,displayName,mail,userPrincipalName,givenName,surname,businessPhones,department,jobTitle,userType,accountEnabled")
    // .top(999)
    // .filter("userType eq 'Member'")
    // .get()   

    // const users:IUser[] = items.value.filter((x:any)=>x.mail && x.mail.includes('@moriah')).map((x:any)=>{        
    const users: IUser[] = response.value.map((x: any) => {
        const phones = [...x.businessPhones];
        if (x.mobilePhone) phones.push(x.mobilePhone)
        return {
            phones,
            accountName: x.userPrincipalName,
            name: x.displayName,
            department: x.department,
            jobTitle: x.jobTitle,
            email: x.mail,
            id: x.id,
            letter: x.department ? x.department : '',
            isMember: true,
            accountEnabled: x.accountEnabled
        }
    })
        // .sort((a: IUser, b: IUser) => (a.name > b.name ? 1 : -1))
        .sort((a: IUser, b: IUser) => (a.department > b.department ? 1 : -1))
    if (cachingHours) localStorage.setItem(INTERNAL_USERS_KEY, JSON.stringify({ users, date: addHours(new Date(), 24).toISOString() }))
    // let hebrewUsers: IUser[] = [];
    // users.forEach(value => {
    //     if (!/[a-zA-Z0-9]+/.test(value.name)) {
    //         hebrewUsers.push(value)
    //     }
    // });
    // return hebrewUsers;
    return users;
    // }
}


const renderExternalUsers = (items: any) => items.map((x: any) => {
    const name = (x.LastName ? (x.LastName + ' ') : '') + (x.FirstName || '') + (x.SecondFirstName ? ` (${x.SecondFirstName})` : '')
    const phones: string[] = [];
    [x.MobilePhone, x.WorkPhone, x.HomePhone, x.FaxWork].forEach(phone => {
        if (phone) phones.push(phone)
    })
    return {
        id: x.Id,
        name,
        accountName: '',
        phones,
        department: (x.Company || '') + (x.Address ? ` ${x.Address}` : '') + ' ' + (x.AddressCity ? ` ${x.AddressCity}` : '') + ' ' + (x.AddressState ? ` ${x.AddressState}` : ''),
        jobTitle: x.JobTitle,
        email: x.Email,
        // letter: name ? name[0].toUpperCase() : '',
        letter: (x.Company || '') + (x.Address ? ` ${x.Address}` : '') + ' ' + (x.AddressCity ? ` ${x.AddressCity}` : '') + ' ' + (x.AddressState ? ` ${x.AddressState}` : ''),
        isMember: false,
        accountEnabled: x.accountEnabled
    }
})



export const getExternalUsers = async (context: WebPartContext, cachingHours: number): Promise<IUser[]> => {
    // let cachedData = cachingHours ? JSON.parse(localStorage.getItem(EXTERNAL_USERS_KEY)) : null;
    // if (cachedData) {
    //     if (cachedData.date && new Date(cachedData.date).getTime() - new Date().getTime() > 0) {
    //         console.log('Cached data is used')
    //         return (cachedData.users);
    //     } else {
    //         localStorage.removeItem(EXTERNAL_USERS_KEY);
    //         console.log('Cached data is REMOVED')
    //         cachedData = null;
    //     }
    // }

    // if (!cachedData) {
    const sp = spfi().using(SPFx(context));
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
    if (cachingHours) localStorage.setItem(EXTERNAL_USERS_KEY, JSON.stringify({ users, date: addHours(new Date(), cachingHours).toISOString() }))
    return users;
    // }
}
