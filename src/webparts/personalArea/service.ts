import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { ISettings, IForm } from "./components/PersonalArea";
import { format } from 'date-fns';
import { Web } from "@pnp/sp/webs";
import { graphfi, SPFx as graphSPFx } from '@pnp/graph';
import "@pnp/graph/users";
import "@pnp/graph/groups";
import "@pnp/graph/members";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IVacation } from "./components/PersonalArea";

const userListId = "92c73bd5-7e40-4376-a0b1-913af826c305";



export const getFormSettings = (sp: SPFI, listId: string): Promise<ISettings[]> => {
    return sp.web.lists.getById(listId).items
        .select('Id', 'Title', 'ListId', 'FormUrl', 'SiteUrl', 'ListTitle', 'StatusValues', 'CompleteStatusValues', 'SecondTitle')()
        .catch((e) => { console.error("Could not get form settings", e); return [] });
}

// export const getCurrentUser = (sp: SPFI, email:string, name:string): Promise<IVacation> => {
//     const vacation: IVacation = {
//         EmpNumber: null,
//         ArgTotalHours: '',
//         PayCode300: '',
//         PayCode900: '',
//         OT_Quota: '',
//         OT_Amount_125: '',
//         OT_Amount_150: '',
//     };

//     return sp.web.lists.getById(userListId).items
//     .select('Id','EmpNumber','EmpName','ArgTotalHours','PayCode300','PayCode900','OT_Amount_125','OT_Amount_150')
//     .filter(`userPrincipalName eq '${email}' or Title eq '${name}'`)()
//     .then(items => {
//         if (!items.length) return vacation;
//         const x=items[0];
//         return ({
//             EmpNumber: x.EmpNumber,
//             ArgTotalHours: x.ArgTotalHours,
//             PayCode300: x.PayCode300,
//             PayCode900: x.PayCode900,
//             OT_Amount_125: x.OT_Amount_125,
//             OT_Amount_150: x.OT_Amount_150,
//         })
//     })
//     .catch((e) => {console.error("Could not get form settings", e); return vacation});
// }

export const getCurrentUserEmail = async (userEmail: string, context: WebPartContext): Promise<boolean> => {
    const graph = graphfi().using(graphSPFx(context));
    const groups = await graph.groups.getById('4c87e160-dfa2-41e4-8b5f-b237cf66a681').members();
    const isUserContains = groups.some((x: any) => x.mail === userEmail);
    return isUserContains;
}

export const getWorkerNumber = async (context: WebPartContext): Promise<string> => {
    const graph = graphfi().using(graphSPFx(context));
    // const me = await graph.users.getById('6b7ebb94-df42-4d7f-ba4f-b507b3450471').select('streetAddress')();
    const me = await graph.me.select('streetAddress')();
    return me?.streetAddress;
}

export const getCurrentUserNumber = (sp: SPFI, email: string, name: string): Promise<string> => sp.web.lists.getById(userListId).items
    .select('EmpNumber')
    .filter(`userPrincipalName eq '${email}' or Title eq '${name}'`)()
    .then(items => items.length ? items[0]?.EmpNumber : null)
    .catch((e) => { console.error("Could not get form settings", e); return null });

export const getMyTasks = (sp: SPFI, settings: ISettings[], userName: string, userMail: string, userDisplayName: string): Promise<IForm[]> => {
    const allPromises = settings.map((x: ISettings): Promise<(IForm[] | null)> => {
        const spWeb = Web([sp.web, x.SiteUrl]);
        const statusFilters = x.StatusValues.includes(',')
            ? x.StatusValues.split(',').map(value => `Status eq '${value}'`).join(' or ')
            : `Status eq '${x.StatusValues}'`;
        const completeStatusFilters = x.CompleteStatusValues.includes(',')
            ? x.CompleteStatusValues.split(',').map(value => `Status eq '${value}'`).join(' or ')
            : `Status eq '${x.CompleteStatusValues}'`;
        const date = new Date();
        const approvalDate = format(new Date(date.setMonth(date.getMonth() - 1)), 'MM.dd.yyyy');
        const approvalCheck = `LastApprovalDate ge '${approvalDate}' and (${completeStatusFilters})`;
        // userDisplayName = 'אריאל טובול';
        // userName = 'אריאל טובול';
        if (x.ListTitle === 'EmployeeTransition') {
            return spWeb.lists.getById(x.ListId).items
                // .select('Id','LastApprovalDate')
                .select('Id', 'TaskManagersInProcess/Title', 'TaskManagersInProcess/Id', 'Author/Title', 'Tasks', 'Title', 'LastApprovalDate', 'Status', 'EmployeeName', 'finalExeption', '*')
                .expand('TaskManagersInProcess', 'Author')
                .filter(`(${statusFilters}) or (${approvalCheck})`)()
                .then((r: any) => {
                    if (!r || r.length === 0) return null
                    var checkIns: any[] = [];
                    r.forEach((value: any) => {
                        JSON.parse(value.Tasks).some((x: { IsDone: any; Responsible: { email: string; }; }) => !x.IsDone && x.Responsible.email.toLowerCase() === userMail.toLowerCase()) ?
                            checkIns.push(value) : null;
                        if (value?.TaskManagersInProcess?.length) {
                            value.TaskManagersInProcess.forEach((t: any) => {
                                if (t.Title === userDisplayName && checkIns.filter(c => c.Id === t.Id).length === 0) {
                                    checkIns.push(value);
                                }
                            })
                        }
                        // if (value?.CurrentResponsible) {
                        //     if (!checkIns.includes(value) && value?.CurrentResponsible[0]?.Title === userDisplayName && !value?.finalExeption) {
                        //         checkIns.push(value);
                        //     }
                        // }
                    });
                    const forms: IForm[] = checkIns.map((item: any) => ({
                        date: item.LastApprovalDate ? format(new Date(item.LastApprovalDate), 'dd-MM-yyyy') : "הטופס טרם אושר",
                        title: `${item.ProcessType} (${item.EmployeeName})`,
                        linkUrl: x.FormUrl + item.Id
                    }))
                    const uniqueArray = forms.filter((o, index, arr) =>
                        arr.findIndex(item => JSON.stringify(item) === JSON.stringify(o)) === index
                    );
                    return uniqueArray
                })
                .catch((e) => {
                    console.error("Could get tasks from the form ", x, e);
                    return null
                });
        }
        else if (x.ListTitle === 'NewSupplier') {
            return spWeb.lists.getById(x.ListId).items
                .select('Id', 'SupplierName', 'LastApprovalDate', 'Status', 'Author/Title')
                .expand('Author')
                .filter(`NextApprover eq '${userName}' and (${statusFilters}) or (NextApprover eq '${userName}' and ${approvalCheck})`)()
                .then((r: any) => {
                    if (!r || r.length === 0) return null
                    const forms: IForm[] = r.map((item: any) => ({
                        date: item.LastApprovalDate ? format(new Date(item.LastApprovalDate), 'dd-MM-yyyy') : "הטופס טרם אושר",
                        title: `${x.Title} (${item.Author.Title})`,
                        linkUrl: x.FormUrl + item.Id
                    }))
                    return forms
                })
                .catch((e) => {
                    console.error("Could get tasks from the form ", x, e);
                    return null
                });
        }
        else if (x.ListTitle === 'ProjectsRating') {
            return spWeb.lists.getById(x.ListId).items
                .select('Id', 'CurrentResponsible/Title', 'Status', 'Author/Title', 'projectType', 'project')
                .expand('CurrentResponsible', 'Author')
                .filter(`CurrentResponsible/Title eq '${userDisplayName}' and (${statusFilters})`)()
                //.filter(`CurrentResponsible/Title eq 'חנן אלכסנדר' and (${statusFilters})`)()
                //חנן אלכסנדר
                .then((r: any) => {
                    if (!r || r.length === 0) return null
                    const forms: IForm[] = r.map((item: any) => ({
                        date: item.LastApprovalDate ? format(new Date(item.LastApprovalDate), 'dd-MM-yyyy') : "הטופס טרם אושר",
                        title: `${x.SecondTitle} (${item.project.split("(")[0].trim()} - ${item.project.split("(")[1].trim().split(")")[0]}) - ${x.Title}`,
                        // title: `${x.Title} (${item.Author.Title})`,
                        linkUrl: x.FormUrl + item.Id
                    }))
                    return forms
                })
                .catch((e) => {
                    console.error("Could get tasks from the form ", x, e);
                    return null
                });
        }
        else if (x.ListTitle === 'ContractorPenaltyRecommendation') {
            return spWeb.lists.getById(x.ListId).items
                .select('Id', 'CurrentResponsible/Title', 'Status', 'Author/Title')
                .expand('CurrentResponsible', 'Author')
                .filter(`CurrentResponsible/Title eq '${userDisplayName}' and (${statusFilters})`)()
                .then((r: any) => {
                    if (!r || r.length === 0) return null
                    const forms: IForm[] = r.map((item: any) => ({
                        date: item.LastApprovalDate ? format(new Date(item.LastApprovalDate), 'dd-MM-yyyy') : "הטופס טרם אושר",
                        title: `${x.SecondTitle} (${item.project.split("(")[0].trim()} - ${item.project.split("(")[1].trim().split(")")[0]}) - ${x.Title}`,
                        linkUrl: x.FormUrl + item.Id
                    }))
                    return forms
                })
                .catch((e) => {
                    console.error("Could get tasks from the form ", x, e);
                    return null
                });
        }
        else {
            return spWeb.lists.getById(x.ListId).items
                .select('Id', 'CurrentResponsible/Title', 'LastApprovalDate', 'Status', 'Author/Title')
                .expand('CurrentResponsible', 'Author')
                .filter(`NextApprover eq '${userName}' and (${statusFilters}) or (NextApprover eq '${userName}' and ${approvalCheck})`)()
                .then((r: any) => {
                    if (!r || r.length === 0) return null
                    const forms: IForm[] = r.map((item: any) => ({
                        date: item.LastApprovalDate ? format(new Date(item.LastApprovalDate), 'dd-MM-yyyy') : "הטופס טרם אושר",
                        title: `${x.Title} (${item.Author.Title})`,
                        linkUrl: x.FormUrl + item.Id
                    }))
                    return forms
                })
                .catch((e) => {
                    console.error("Could get tasks from the form ", x, e);
                    return null
                });
        }
    })

    return Promise.allSettled(allPromises).then(r => {
        let tasks: IForm[] = [];
        for (const list of r) {
            if (list.status === 'fulfilled' && list?.value?.length) {
                tasks.push(...list.value)
            }
        }
        // const fulfilled = r.filter(x => x.status === 'fulfilled' && x.value && x.value.length) as PromiseFulfilledResult<any>[]
        return tasks;
    });

}

export const getMyForms = (sp: SPFI, settings: ISettings[], userName: string, formsNumber: number, userDisplayName: string): Promise<IForm[]> => {
    const allPromises = settings.map((x: ISettings): Promise<(IForm[] | null)> => {
        const spWeb = Web([sp.web, x.SiteUrl]);
        const statusFilters = x.StatusValues.includes(',')
            ? x.StatusValues.split(',').map(value => `Status eq '${value}'`).join(' or ')
            : `Status eq '${x.StatusValues}'`;
        const completeStatusFilters = x.CompleteStatusValues.includes(',')
            ? x.CompleteStatusValues.split(',').map(value => `Status eq '${value}'`).join(' or ')
            : `Status eq '${x.CompleteStatusValues}'`;
        // const completeStatusFiltersArray = x.CompleteStatusValues.includes(',')
        //     ? x.CompleteStatusValues.split(',').map(value => value)
        //     : [x.CompleteStatusValues];
        const date = new Date();
        const approvalDate = format(new Date(date.setMonth(date.getMonth() - 1)), 'MM.dd.yyyy');
        const approvalCheck = `LastApprovalDate ge '${approvalDate}' and Author/Title eq '${userName}' and (${completeStatusFilters})`;
        // const approvalCheck = `LastApprovalDate ge '${approvalDate}' and Author/Title eq 'שי פרידמן' and (${completeStatusFilters})`;
        // userDisplayName = 'אריאל טובול';
        // userName = 'אריאל טובול';
        switch (x.ListTitle) {
            case 'NewSupplier':
                return spWeb.lists.getById(x.ListId).items
                    .select('Id', 'Created', 'Status', 'Author/Title', 'Modified', 'SupplierName', 'LastApprovalDate', 'Approvers')
                    .expand('Author')
                    .orderBy('Modified', false)
                    .filter(`(Author/Title eq '${userName}' and ${statusFilters}) or (${approvalCheck})`)
                    .top(formsNumber)()
                    .then((r: any) => {
                        if (!r || r.length === 0) return null
                        const forms: IForm[] = r.map((item: any) => ({
                            date: format(new Date(item.Created), 'dd-MM-yyyy'),
                            status: item.Status,
                            // title: `${x.Title} (${item.SupplierName ?
                            //     item.SupplierName :
                            //     completeStatusFiltersArray.length > 1 ?
                            //         JSON.parse(item.Approvers).findLast((y: any) => y.status === completeStatusFiltersArray[0] || y.status === completeStatusFiltersArray[1]).user.name
                            //         : JSON.parse(item.Approvers).findLast((y: any) => y.status === completeStatusFiltersArray[0]).user.name})`,
                            title: `${x.Title} - ${item.Status}`,
                            linkUrl: x.FormUrl + item.Id,
                            modified: new Date(item.Modified).getTime()
                        }))
                        return forms
                    })
                    .catch((e) => {
                        console.error("Could get tasks from the form ", x, e);
                        return null
                    });
            case 'ContractorPenaltyRecommendation':
                return spWeb.lists.getById(x.ListId).items
                    .select('Id', 'Created', 'Modified', 'CurrentResponsible/Title', 'Status', 'Author/Title')
                    .expand('CurrentResponsible', 'Author')
                    .orderBy('Modified', false)
                    .filter(`CurrentResponsible/Title eq '${userDisplayName}' and (${statusFilters})`)()
                    .then((r: any) => {
                        if (!r || r.length === 0) return null
                        const forms: IForm[] = r.map((item: any) => ({
                            date: format(new Date(item.Created), 'dd-MM-yyyy'),
                            status: item.Status,
                            title: `${x.Title} - ${item.Status}`,
                            linkUrl: x.FormUrl + item.Id,
                            modified: new Date(item.Modified).getTime()
                        }))
                        return forms
                    })
                    .catch((e) => {
                        console.error("Could get tasks from the form ", x, e);
                        return null
                    });
            case 'ProjectsRating':
                return spWeb.lists.getById(x.ListId).items
                    .select('Id', 'Created', 'Status', 'Author/Title', 'Modified', 'CurrentResponsible/Title', 'projectType', 'project')
                    .expand('Author', 'CurrentResponsible')
                    .orderBy('Modified', false)
                    .filter(`(Author/Title eq '${userDisplayName}' and ${statusFilters})`)
                    //.filter(`(Author/Title eq 'אלרואי אברהם' and ${statusFilters})`)
                    .top(formsNumber)()
                    .then((r: any) => {
                        if (!r || r.length === 0) return null
                        const forms: IForm[] = r.map((item: any) => ({
                            date: format(new Date(item.Created), 'dd-MM-yyyy'),
                            status: item.Status,
                            title: `${x.SecondTitle} (${item.project.split("(")[0].trim()} - ${item.project.split("(")[1].trim().split(")")[0]}) - ${x.Title}`,
                            // title: `${x.Title} - ${item.Status}`,
                            linkUrl: x.FormUrl + item.Id,
                            modified: new Date(item.Modified).getTime()
                        }))
                        return forms
                    })
                    .catch((e) => {
                        console.error("Could get tasks from the form ", x, e);
                        return null
                    });
            case 'EmployeeTransition':
                return spWeb.lists.getById(x.ListId).items
                    .select('Id', 'Created', 'Status', 'Author/Title', 'Modified', 'EmployeeName', 'ProcessType', 'LastApprovalDate')
                    .expand('Author')
                    .orderBy('Modified', false)
                    .filter(`(Author/Title eq '${userName}' and ${statusFilters}) or (${approvalCheck})`)
                    .top(formsNumber)()
                    .then((r: any) => {
                        if (!r || r.length === 0) return null
                        const forms: IForm[] = r.map((item: any) => ({
                            date: format(new Date(item.Created), 'dd-MM-yyyy'),
                            status: item.Status,
                            title: `${item.ProcessType} - ${item.Status}`,
                            linkUrl: x.FormUrl + item.Id,
                            modified: new Date(item.Modified).getTime()
                        }))
                        return forms
                    })
                    .catch((e) => {
                        console.error("Could get tasks from the form ", x, e);
                        return null
                    });
            default:
                // case 'FundRequest':
                // case 'CourseApplication':
                // case 'ProcurementRequest':
                // case 'VacationRequest':
                // case 'CreditCard':
                // case 'Form1':
                // case 'VehicleModification':
                // case 'VehicleModificationTest':
                return spWeb.lists.getById(x.ListId).items
                    .select('Id', 'Created', 'Status', 'Author/Title', 'Modified', 'CurrentResponsible/Title', 'LastApprovalDate', 'Approvers')
                    .expand('Author', 'CurrentResponsible')
                    .orderBy('Modified', false)
                    .filter(`(Author/Title eq '${userName}' and ${statusFilters}) or (${approvalCheck})`)
                    .top(formsNumber)()
                    .then((r: any) => {
                        if (!r || r.length === 0) return null
                        const forms: IForm[] = r.map((item: any) => ({
                            date: format(new Date(item.Created), 'dd-MM-yyyy'),
                            status: item.Status,
                            title: `${x.Title} - ${item.Status}`,
                            linkUrl: x.FormUrl + item.Id,
                            modified: new Date(item.Modified).getTime()
                        }))
                        return forms
                    })
                    .catch((e) => {
                        console.error("Could get tasks from the form ", x, e);
                        return null
                    });
                return null;
        }

    })

    return Promise.allSettled(allPromises).then(r => {
        let myForms: IForm[] = [];
        for (const list of r) {
            if (list.status === 'fulfilled' && list?.value?.length) {
                myForms.push(...list.value)
            }
        }
        // const fulfilled = r.filter(x => x.status === 'fulfilled' && x.value && x.value.length) as PromiseFulfilledResult<any>[]
        const myOrderedForms = myForms.sort((a, b) => b.modified - a.modified)
        return myOrderedForms.slice(0, formsNumber);
    });

}



// import {  format, startOfToday, startOfMonth, endOfMonth, isSameDay, isAfter} from 'date-fns';


// import { HttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http'; 

// const httpClientOptions: IHttpClientOptions = {  
//     headers: new Headers({  
//         "x-rapidapi-host": "covid-19-data.p.rapidapi.com",  
//         "x-rapidapi-key": "<REPLACE WHIT WITH YOUR APIKEY>"  
//     }),  
//     method: "POST",  
//     mode: "cors" 
// }

// export const getSinelData = async (httpClient: HttpClient): Promise<void> => {
//     httpClient
//         .get("https://covid-19-data.p.rapidapi.com/totals", HttpClient.configurations.v1, httpClientOptions)
//         .then(response => {
//             console.log(response);  
//             return response.json();          
//         })

// }




// import { SPFI } from "@pnp/sp";
// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// // import {  format, startOfToday, startOfMonth, endOfMonth, isSameDay, isAfter} from 'date-fns';

// export const getVacations = (sp: SPFI, listId:string):Promise<IDay[]> => {
//     const now = new Date();

//     return sp.web.lists.getById(listId).items
//         .select('Title','Email','UserId','User/Title','User/EMail','User/UserName','User/Name','CustomText','Type/Icon','Type/Text','Type/TodayIcon','Date')
//         .expand('User','Type')
//         .filter(`(IsHidden eq 0) and (Date ge datetime'${monthStart}' and Date le datetime'${monthEnd}')`)()
//         .then(items=> {
//         let days:IDay[] = items.map(x=>{
//             const date=new Date(x.Date);
//             const isToday = isSameDay(now, date);
//             const icon = (isToday ? x.Type.TodayIcon : x.Type?.Icon) || x.Type?.Icon || 'cake';
//             return {
//                 name:x.Title || x.User.Title, 
//                 date,
//                 text: x.CustomText || x.Type?.Text,
//                 time:date.getTime(),
//                 day:format(date,'dd.MM'),
//                 email:x.Email || x.User?.EMail,
//                 profileImage: '/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(x.User?.Name || ''),
//                 icon,
//                 isToday,
//                 isLinkUrl: icon.startsWith('/') || icon.startsWith('http'),
//                 key: x.Id
//             }
//         })
//         return [...days, ...daysPast]

//     })
//     .catch((e) => {console.error("Could not get anniversary/birthday data", e); return []});
// }


const otpRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <LoginOTP xmlns="Synel/Services">
      <ClientID>96066931</ClientID>
      <GUID>22991E8D-2E4E-4518-A212-57C109FB84E8</GUID>
      <User>999</User>
      <Password>9999</Password>
    </LoginOTP>
  </soap12:Body>
</soap12:Envelope>`;

export const fetchOTP = async () => {
    const response = await fetch('https://moriah-synel-api.deno.dev​', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: otpRequest
    })
    // console.log("response.text", response.text());
    let textXml = await response.text()
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textXml, "text/xml");
    const code = xmlDoc.getElementsByTagName("LoginOTPResult")[0].childNodes[0].nodeValue;

    console.log("await response.text", code);
    return code;
};

// <sql>dbo.usp_custWS_GetEmpPeriodTotal_Moriah</sql>
const getBody = (otpCode: string, userNumber: string) => `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <GetData xmlns="Synel/Services">
      <TOTP>${otpCode}</TOTP>
      <ClientID>96066931</ClientID>
      <sql>dbo.usp_custWS_GetEmpPeriodTotal_Moriah @pEmpNo=${userNumber}</sql>
      <DType>xml</DType>
      <SType>sql</SType>
      <paramsXML>''</paramsXML>
    </GetData>
  </soap12:Body>
</soap12:Envelope>`

export const fetchData = async (otpCode: string, userNumber: string) => {
    const response = await fetch('https://moriah-synel-api.deno.dev​', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
            'Host': 'harmony1.synel.co.il'
        },
        body: getBody(otpCode, userNumber)
    })
    let textXml = await response.text()
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textXml, "text/xml");
    const dataParser = new DOMParser();
    if (!xmlDoc.getElementsByTagName("GetDataResult")[0]) {
        console.error("User is not found in Synel");
        return null;
    }
    const dataXmlDoc = dataParser.parseFromString(xmlDoc.getElementsByTagName("GetDataResult")[0].childNodes[0].nodeValue, "text/xml");
    const vacation: IVacation = {
        EmpNumber: dataXmlDoc.getElementsByTagName("Emp_no")[0]?.childNodes[0]?.nodeValue,
        ArgTotalHours: dataXmlDoc.getElementsByTagName("AgrTotal_H")[0]?.childNodes[0]?.nodeValue,
        PayCode300: dataXmlDoc.getElementsByTagName("NormalHours_PayCode300")[0]?.childNodes[0]?.nodeValue,
        PayCode900: dataXmlDoc.getElementsByTagName("MissingHours_PayCode900")[0]?.childNodes[0]?.nodeValue,
        OT_Quota: dataXmlDoc.getElementsByTagName("OT_Quota")[0]?.childNodes[0]?.nodeValue,
        OT_Amount_125: dataXmlDoc.getElementsByTagName("OT_Amount_125")[0]?.childNodes[0]?.nodeValue,
        OT_Amount_150: dataXmlDoc.getElementsByTagName("OT_Amount_150")[0]?.childNodes[0]?.nodeValue,
        QuotaVacationDays: dataXmlDoc.getElementsByTagName("QuotaVacationDays")[0]?.childNodes[0]?.nodeValue,
        QuotaSicknessDays: dataXmlDoc.getElementsByTagName("QuotaSicknessDays")[0]?.childNodes[0]?.nodeValue,
        BalanceVacationDays: dataXmlDoc.getElementsByTagName("BalanceVacationDays")[0]?.childNodes[0]?.nodeValue,
        BalanceSicknessDays: dataXmlDoc.getElementsByTagName("BalanceSicknessDays")[0]?.childNodes[0]?.nodeValue,
    }
    console.log("🚀 ~ file: service.ts:80 ~ fetchData ~ vacation:", vacation)
    return vacation;
};


export const openLink = (link: string) => {
    window.open(link, "_blank");
    return false;
}