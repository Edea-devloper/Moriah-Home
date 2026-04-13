import * as React from 'react';
import styles from './UpcomingEvents.module.scss';
import { FontIcon } from '@fluentui/react/lib/Icon';
import {theme} from '../../../helpers/constants'

export interface IDay {
  month:string;
  day:string;
  time:string;
  endTime:string;
  isToday:boolean;
}

const Day:React.FC<IDay> = ({month, day, time, isToday, endTime}: IDay)  => (
    <div className={styles.event_date} style={{color: isToday ? theme.themePrimary : theme.neutralPrimary}}>
      <p>{month}</p>
      <h4>{day}</h4>
      {!endTime 
          ? <p>{time}</p>
          : <>
              <p className={styles.event_time}>{time}
                <p className={styles.event_time_value}>{time} <FontIcon aria-label="ChevronRight" iconName="ChevronRight" className={styles.event_timeIcon} /> {endTime} </p>              
              </p>
          </>}
    </div>
  );

export default Day
