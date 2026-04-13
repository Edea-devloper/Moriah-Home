import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import {  getWeek } from 'date-fns';
import he from 'date-fns/locale/he'

export const getWeeklyTip = async (sp: SPFI, listId:string):Promise<string> => {
    const weekNumber = getWeek(new Date(), {locale: he});
    let dailyTips = await sp.web.lists.getById(listId).items.select('DailyTip').filter(`WeekNumber ge '${weekNumber}'`).orderBy('WeekNumber').top(1)()
    if (!dailyTips?.length) dailyTips = await sp.web.lists.getById(listId).items.select('DailyTip').filter(`WeekNumber le '${weekNumber}'`).orderBy('WeekNumber', false).top(1)()
    return dailyTips.length ? dailyTips[0].DailyTip : null;
}
