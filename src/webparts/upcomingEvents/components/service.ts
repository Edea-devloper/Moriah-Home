import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { SPFI } from "@pnp/sp";
import { IEvent } from "./UpcomingEvents";
import { format, addMinutes, isSameDay, isPast } from 'date-fns';
import he from 'date-fns/locale/he'

// const now = new Date();
// const todayStart = format(startOfToday(),'yyyy-MM-dd')+'T00:00:00Z';
// const monthEnd = format(endOfMonth(now),'yyyy-MM-dd')+'T23:59:59Z';

const getViewXml = (max: number): string => {
    return `<View>
                <ViewFields>
                    <FieldRef Name='ID'/>    
                    <FieldRef Name='Title'/>
                    <FieldRef Name='Description'/>
                    <FieldRef Name='Location'/>
                    <FieldRef Name='EndDate'/>
                    <FieldRef Name='EventDate'/>                    
                    <FieldRef Name='fAllDayEvent'/>                    
                </ViewFields>
                <Query>
                    <Where>
                        <Gt>
                            <FieldRef Name='EndDate' />
                            <Value IncludeTimeValue='TRUE' Type='DateTime'><Today/></Value>                            
                        </Gt>
                    </Where>
                    <OrderBy>
                        <FieldRef Ascending = "TRUE" Name = "EventDate" />
                    </OrderBy>
                </Query>
                <RowLimit Paged="FALSE">${max}</RowLimit>
            </View>`;
}

export const getEvents = (sp: SPFI, listId: string, top: number, offSet: number): Promise<IEvent[]> =>
    sp.web.lists.getById(listId).renderListDataAsStream({
        DatesInUtc: true,
        ViewXml: getViewXml(top)
    })
        .then(result => {
            (window as any).result = result;
            const today = addMinutes(new Date(), offSet);
            const events: IEvent[] = result.Row.map(x => {
                const isWholeDay = x.fAllDayEvent === 'כן';
                const eventDate = isWholeDay ? new Date(x.EventDate.substring(0, 10)) : addMinutes(new Date(x.EventDate), offSet);
                const endDate = isWholeDay ? new Date(x.EndDate.substring(0, 10)) : addMinutes(new Date(x.EndDate), offSet);
                const element = new DOMParser().parseFromString(x.Description, 'text/html');
                const event: IEvent = {
                    id: x.ID,
                    title: htmlDecode(x.Title),
                    description: element.body.textContent || "",
                    eventDate,
                    eventDay: format(eventDate, 'dd'),
                    eventMonth: format(eventDate, 'MMMM', { locale: he }),
                    eventTime: format(eventDate, 'HH:mm'),
                    endDay: format(endDate, 'dd'),
                    endMonth: format(endDate, 'MMMM', { locale: he }),
                    endTime: format(endDate, 'HH:mm'),
                    place: x.Location,
                    // time:format(date,'HH:mm') + isSameDay(date, endDate) ? ` - ${format(endDate,'HH:mm')}`:'',
                    isSameDate: isSameDay(eventDate, endDate),
                    isWholeDay: x.fAllDayEvent === 'כן',
                    isToday: isSameDay(eventDate, today) || isPast(eventDate),
                }
                return event
            });
            return events.sort((x1, x2) => x1.eventDate.getTime() - x2.eventDate.getTime());
        })
        .catch(e => { console.error(e); return [] })

export const htmlDecode = (input: string): string => {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}