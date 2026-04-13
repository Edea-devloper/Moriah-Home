import * as React from 'react';
import styles from './UpcomingEvents.module.scss';
import { IUpcomingEventsProps } from './IUpcomingEventsProps';
import commonStyles from '../../../common.module.scss';
import { SPFI, spfi, SPFx} from "@pnp/sp";
import { getEvents } from './service';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { iconClass } from '../../../helpers/constants';
import Day from './Day';


export interface IEvent {
  title: string;
  description: string;
  eventDate: Date;
  eventDay: string;
  eventMonth: string;
  eventTime: string;
  endDay: string;
  endMonth: string;
  endTime: string;
  place: string;
  id: number;
  isSameDate: boolean;
  isWholeDay: boolean;
  isToday:boolean;  
}

const Events:React.FC<IUpcomingEventsProps> = (props)  => {
  const offSet = new Date().getTimezoneOffset()-((props.context.pageContext.web as any).timeZoneInfo?.offset - 60 || 0);  
  const source = encodeURI(window.location.href);

  const [events, setEvents] = React.useState<IEvent[]>([]);
  React.useEffect(() => {
    const sp:SPFI = spfi().using(SPFx(props.context));
    getEvents(sp, props.listId, props.top, offSet).then(setEvents).catch(console.error);
  }, []);
  return (
    <div className={commonStyles.container}>   
      <div className={commonStyles.container_header}>   
        <img src={require('../../../assets/icon_list.svg')} alt="Events"/>
        <div>{props.title}</div>
      </div>
      <div className={commonStyles.container_body} style={{minHeight: props.height || 242}}>
          <ul style={{marginTop:"-17px"}}>
            {events.map(x=>(
            <li key={x.id} className={styles.event} onClick={()=>window.open(props.listUrl+`/DispForm.aspx?ID=${x.id}&Source=${source}`, '_blank')}>
              <div className={styles.event_dates}>
              {x.isSameDate 
                ? <>
                <Day 
                    month={x.eventMonth} 
                    day={x.eventDay} 
                    time={x.isWholeDay?'יום שלם': x.eventTime} 
                    isToday={x.isToday} 
                    endTime={x.isWholeDay?'': x.endTime}/>
                <Day month="" day="" time="" isToday={false}  endTime=""/>
                </>
                : <>
                    <Day month={x.eventMonth} day={x.eventDay} time={x.isWholeDay?'יום שלם': x.eventTime} isToday={x.isToday} endTime=""/>
                    <FontIcon aria-label="ChevronRight" iconName="ChevronRight" className={styles.event_dateIcon} />
                    <Day month={x.endMonth} day={x.endDay} time={x.isWholeDay?'יום שלם': x.endTime} isToday={x.isToday}  endTime=""/>
                  </>}              

              </div>
              <div className={styles.event_info}>
                <h5 className={styles.event_info_title}>{x.title}</h5>
                <p className={styles.event_bold}>{x.description.length>props.descriptionLength?(x.description.substring(0,props.descriptionLength||120)+'...'):x.description}</p>
                <p className={styles.event_bold}>{x.place}</p>
              </div>
            </li>))}
          </ul>
      </div>
      <div className={commonStyles.linkToAll} onClick={()=>window.open(props.listUrl+`?Source=${source}`, '_blank')}>
        <span>{props.seeAllTitle}</span>
        <FontIcon aria-label="ChevronLeft" iconName="ChevronLeft" className={iconClass} />
      </div>
    </div>
  );
  }

export default Events
