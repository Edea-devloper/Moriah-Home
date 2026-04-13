import { SPFI } from "@pnp/sp";
import { IDay, IUpcomingPerson } from "./Birthday";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { format, startOfToday, startOfMonth, endOfMonth, isSameDay, isAfter/*, compareAsc, subHours*/, addDays } from 'date-fns';
import { MSGraphClientFactory } from '@microsoft/sp-http';
import "@pnp/sp/fields/list";
import { PermissionKind } from "@pnp/sp/security";
import { graphfi, SPFx as graphSPFx } from '@pnp/graph'
import "@pnp/graph/users";
import "@pnp/graph/groups";
import "@pnp/graph/members";
import { WebPartContext } from "@microsoft/sp-webpart-base";
// import * as moment from 'moment';

export const checkAdmin = async (sp: SPFI, /*birthdaysListId: string,*/ eventsListId: string, upcomingPersonListId: string): Promise<any[]> => {
    const perms = await sp.web.getCurrentUserEffectivePermissions();
    if (!sp.web.hasPermissions(perms, PermissionKind.AddAndCustomizePages)) return [];
    // const birthdayTitle = await sp.web.lists.getById(birthdaysListId).fields();
    const eventsTitle = await sp.web.lists.getById(eventsListId).fields();
    const upcomingTitle = await sp.web.lists.getById(upcomingPersonListId).fields();
    return [/*birthdayTitle[0].Scope,*/ eventsTitle[0].Scope, upcomingTitle[0].Scope];
}

export const getBirthdays = async (sp: SPFI, eventsListId: string, context: WebPartContext): Promise<IDay[]> => {
    const now = new Date();
    // const todayStart = startOfToday();
    const todayStart = startOfToday();
    const currentMonth = format(new Date(), 'MM');
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd') + 'T00:00:00Z';
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd') + 'T23:59:59Z';
    const graph = graphfi().using(graphSPFx(context));
    const graphClient = await context.msGraphClientFactory.getClient("3")
    const users = await graphClient
        .api('users')
        .version("v1.0")
        .select("city,id,mail")
        .top(999)
        .filter("city ge '!'")
        .get()
    const regex = new RegExp('[0-9][0-9]\/' + currentMonth)
    const currentMonthUsers = users.value.filter((x: any) => regex.test(x.city));
    return await graph.groups.getById('83e14a22-ee33-429b-a240-86ea11f224af').members()
        .then(bdays => {
            var birthdaysAD: any[] = [];
            currentMonthUsers.forEach((value: any) => {
                var actualUser = bdays.filter((x: any) => x.id === value.id)[0]
                if (actualUser) {
                    birthdaysAD.push(actualUser);
                    birthdaysAD[birthdaysAD.length - 1].date = value.city.split('/')[1] + '/' + value.city.split('/')[0];
                }
            });
            return sp.web.lists.getById(eventsListId).items
                .select('Title', 'Email', 'UserId', 'User/Title', 'User/EMail', 'User/UserName', 'User/Name', 'CustomText', 'Type/Icon', 'Type/Text', 'Type/TodayIcon', 'Type/Text1', 'Date')
                .expand('User', 'Type')
                .filter(`(IsHidden eq 0) and (Date ge datetime'${monthStart}' and Date le datetime'${monthEnd}')`)()
                .then(items => {
                    let pdays: IDay[] = items.map(x => {
                        const date = new Date(x.Date);
                        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                        const isToday = isSameDay(now, date);
                        const icon = (isToday ? x.Type.TodayIcon : x.Type?.Icon) || x.Type?.Icon || 'BirthdayCake';
                        const date1 = new Date(date.getTime() - userTimezoneOffset)
                        return {
                            name: x.Title || x.User.Title,
                            date,
                            notificationText: (x.Type?.Text1 || '').replaceAll(' // ', '\n'),
                            text: x.CustomText || x.Type?.Text,
                            time: date1.getTime(),
                            day: format(date1, 'dd.MM'),
                            email: x.Email || x.User?.EMail,
                            profileImage: '/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(x.User?.Name || ''),
                            icon,
                            isToday,
                            isLinkUrl: icon.startsWith('/') || icon.startsWith('http'),
                            key: x.Id,
                            type: 'personalEvent'
                        }
                    })
                    let counter = 0;
                    let result: IDay[] = [];
                    let eventsTwoAfter: IDay[] = [];
                    pdays.forEach(value => {
                        if (counter < 2 && isAfter(new Date(parseInt(format(value.date, 'yyyy')), parseInt(value.day.split(".")[1]) - 1, parseInt(value.day.split(".")[0])), todayStart)) {
                            eventsTwoAfter.push(value);
                            counter++;
                        }
                    });
                    const birthdays: IDay[] = birthdaysAD.map((x) => {
                        const date = new Date(x.date + '/' + format(new Date(), 'yyyy'));
                        const isToday = isSameDay(now, date);
                        const icon = (isToday ? 'https://moriah1.sharepoint.com/sites/Home/Images1/Icons/icons8-birthday-64.png' :
                            'https://moriah1.sharepoint.com/sites/Home/Images1/Icons/icons8-birthday-64-gray.png');
                        return {
                            name: x.displayName,
                            email: x.mail,
                            day: format(new Date(x.date + '/' + format(new Date(), 'yyyy')), 'dd.MM'),
                            date: new Date(x.date + '/' + format(new Date(), 'yyyy')),
                            icon,
                            text: 'חוגג/ת יום הולדת',
                            notificationText: 'יומודלת שמח!',
                            isLinkUrl: icon.startsWith('/') || icon.startsWith('http'),
                            profileImage: '/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(x.userPrincipalName || ''),
                            key: parseInt(x.id),
                            time: date.getTime(),
                            isToday,
                            type: 'birthday',
                        }
                    });
                    let list = pdays.concat(birthdays);
                    eventsTwoAfter.sort((x1, x2) => x2.time - x1.time);
                    list.sort((x1, x2) => x2.time - x1.time);
                    let daysAfter: IDay[] = [];
                    let daysBefore: IDay[] = [];
                    let daysToday: IDay[] = [];
                    list.forEach((value) => {
                        value.isToday ? daysToday.push(value) : null;
                        isAfter(value.date, todayStart) && !value.isToday ? daysAfter.push(value) : daysBefore.push(value);
                    })
                    daysAfter.sort((x1, x2) => x2.time - x1.time);
                    result = eventsTwoAfter.concat(daysToday).concat(daysBefore).concat(daysAfter);
                    let unique: IDay[] = [];
                    for (const item of result) {
                        const isDuplicate = unique.find((obj) => obj.name === item.name && obj.day === item.day);
                        if (!isDuplicate) {
                            unique.push(item);
                        }
                    }
                    return [...unique]
                })
                .catch((e) => { console.error("Could not get anniversary/birthday data", e); return [] });
        })
}

export const getAnniversaries = (sp: SPFI, birthdaysListId: string, eventsListId: string): Promise<IDay[]> => {
    const now = new Date();
    // const todayStart = startOfToday();
    const todayStart = startOfToday();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd') + 'T00:00:00Z';
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd') + 'T23:59:59Z';
    return sp.web.lists.getById(birthdaysListId).items
        .select('Title', 'Email', 'UserId', 'User/Title', 'User/EMail', 'User/UserName', 'User/Name', 'CustomText', 'Type/Icon', 'Type/Text', 'Type/TodayIcon', 'Type/Text1', 'Date')
        .expand('User', 'Type')
        .filter(`(IsHidden eq 0) and (Date ge datetime'${monthStart}' and Date le datetime'${monthEnd}')`)()
        .then(items => {
            let days: IDay[] = items.map(x => {
                const date = new Date(x.Date);
                const isToday = isSameDay(now, addDays(date, 1));
                const icon = (isToday ? x.Type.TodayIcon : x.Type?.Icon) || x.Type?.Icon || 'BirthdayCake';
                return {
                    name: x.Title || x.User.Title,
                    date,
                    notificationText: (x.Type?.Text1 || '').replaceAll(' // ', '\n'),
                    text: x.CustomText || x.Type?.Text,
                    time: date.getTime(),
                    day: format(date, 'dd.MM'),
                    email: x.Email || x.User?.EMail,
                    profileImage: '/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(x.User?.Name || ''),
                    icon,
                    isToday,
                    isLinkUrl: icon.startsWith('/') || icon.startsWith('http'),
                    key: x.Id,
                    type: 'birthday',
                }
            })
            return [...days]
        }).then(bdays => {
            return sp.web.lists.getById(eventsListId).items
                .select('Title', 'Email', 'UserId', 'User/Title', 'User/EMail', 'User/UserName', 'User/Name', 'CustomText', 'Type/Icon', 'Type/Text', 'Type/TodayIcon', 'Type/Text1', 'Date')
                .expand('User', 'Type')
                .filter(`(IsHidden eq 0) and (Date ge datetime'${monthStart}' and Date le datetime'${monthEnd}')`)()
                .then(items => {
                    let pdays: IDay[] = items.map(x => {
                        const date = new Date(x.Date);
                        const isToday = isSameDay(now, addDays(date, 1));
                        const icon = (isToday ? x.Type.TodayIcon : x.Type?.Icon) || x.Type?.Icon || 'BirthdayCake';
                        return {
                            name: x.Title || x.User.Title,
                            date,
                            notificationText: (x.Type?.Text1 || '').replaceAll(' // ', '\n'),
                            text: x.CustomText || x.Type?.Text,
                            time: date.getTime(),
                            day: format(date, 'dd.MM'),
                            email: x.Email || x.User?.EMail,
                            profileImage: '/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(x.User?.Name || ''),
                            icon,
                            isToday,
                            isLinkUrl: icon.startsWith('/') || icon.startsWith('http'),
                            key: x.Id,
                            type: 'personalEvent'
                        }
                    })
                    let counter = 0;
                    let result: IDay[] = [];
                    let eventsTwoAfter: IDay[] = [];
                    pdays.forEach(value => {
                        if (counter < 2 && isAfter(new Date(parseInt(format(value.date, 'yyyy')), parseInt(value.day.split(".")[1]) - 1, parseInt(value.day.split(".")[0])), todayStart)) {
                            eventsTwoAfter.push(value);
                            counter++;
                        }
                    });

                    let list = pdays.concat(bdays);
                    eventsTwoAfter.sort((x1, x2) => x2.time - x1.time);
                    list.sort((x1, x2) => x2.time - x1.time);
                    let daysAfter: IDay[] = [];
                    let daysBefore: IDay[] = [];
                    let daysToday: IDay[] = [];
                    list.forEach((value) => {
                        value.isToday ? daysToday.push(value) : null;
                        isAfter(value.date, todayStart) && !value.isToday ? daysAfter.push(value) : daysBefore.push(value);
                    })
                    daysAfter.sort((x1, x2) => x2.time - x1.time);
                    result = eventsTwoAfter.concat(daysToday).concat(daysBefore).concat(daysAfter);
                    let unique: IDay[] = [];
                    for (const item of result) {
                        const isDuplicate = unique.find((obj) => obj.name === item.name && obj.day === item.day);
                        if (!isDuplicate) {
                            unique.push(item);
                        }
                    }
                    return [...unique]
                })
                .catch((e) => { console.error("Could not get anniversary/birthday data", e); return [] });
        })
}

export interface IMSGraphInterface {
    getCurrentUserId(): Promise<any>;
    getUserId(userEmail: string): Promise<any>;
    createUsersChat(requesterId: string, birthdayPersonId: string): Promise<any>;
    sendMessage(chatId: string, chatMessage: string): Promise<any>;
}

export const getUpcomingPerson = (sp: SPFI, upcomingPersonListId: string): Promise<IUpcomingPerson> => {
    return sp.web.lists.getById(upcomingPersonListId).items
        .select('shortDescription1', 'shortDescription2', 'shortDescription3', 'userId', 'user/Title', 'user/UserName', 'user/Name', 'LongDescription', 'MeetThePersonImage')
        .expand('user')
        .top(1)()
        .then(items => {
            let upcoming: IUpcomingPerson = {
                title: items[0]?.user[0]?.Title,
                shortDescription1: items[0]?.shortDescription1,
                shortDescription2: items[0]?.shortDescription2,
                shortDescription3: items[0]?.shortDescription3,
                longDescription: items[0]?.LongDescription,
                profileImage: items[0].MeetThePersonImage ?
                    JSON.parse(items[0].MeetThePersonImage).serverRelativeUrl :
                    '/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(items[0]?.user[0]?.Name || '')
            }
            return upcoming;
        })
        .catch((e) => { console.error("Could not get upcoming person data", e); return null });
}

export async function useMsGraphProvider(msGraphClientFactory: MSGraphClientFactory): Promise<IMSGraphInterface> {
    const msGraphClient = await msGraphClientFactory.getClient('3');

    //GET https://graph.microsoft.com/beta/users/{id}
    const getUserId = async (userEmail: string) => {
        let resultGraph = await msGraphClient.api(`/users/${userEmail}`).get();
        return resultGraph.id;
    };

    const getCurrentUserId = async () => {
        let resultGraph = await msGraphClient.api(`me`).get();
        return resultGraph.id;
    };

    const createUsersChat = async (requesterId: string, birthdayPersonId: string) => {
        let body: any = {
            "chatType": "oneOnOne",
            "members": [
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "roles": ["owner"],
                    "user@odata.bind": `https://graph.microsoft.com/beta/users('${requesterId}')`
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "roles": ["owner"],
                    "user@odata.bind": `https://graph.microsoft.com/beta/users('${birthdayPersonId}')`
                }
            ]
        };
        let resultGraph = await msGraphClient.api(`chats`).version("beta").post(body);
        return resultGraph.id;
    };

    const sendMessage = async (chatId: string, chatMessage: string) => {
        let body = {
            "body": {
                "contentType": "html",
                "content": chatMessage
            }
        };
        let resultGraph = await msGraphClient.api(`chats/${chatId}/messages`).version("beta").post(body);
        return resultGraph;
    };

    return {
        getUserId,
        sendMessage,
        createUsersChat,
        getCurrentUserId
    };
}