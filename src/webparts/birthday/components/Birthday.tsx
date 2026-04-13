// we have list with anniversaries and birthdays, list is updated every day (once a day by flow?)
// Generate all users with data. Get all user form list. Compare data: search by userName (Id). if new Date exist and is different, update item. I no user exist add item. Update upcoming anniversary. 
import * as React from 'react';
import { spfi, SPFx } from "@pnp/sp";
// import commonStyles from '../../../common.module.scss';
import styles from './Birthday.module.scss';

import { IBirthdayProps } from './IBirthdayProps';
import { checkAdmin, /*getAnniversaries,*/ getBirthdays, getUpcomingPerson } from './service';
import Days from './Days';
import Upcoming from "./Upcoming";
// import 'font-awesome/css/font-awesome.min.css';
import { FontIcon } from '@fluentui/react/lib/Icon';


export interface IDay {
  name: string;
  email: string;
  day: string;
  date: Date;
  icon: string;
  text: string;
  notificationText: string;
  isLinkUrl: boolean;
  profileImage: string;
  key: number;
  time: number;
  isToday: boolean;
  type: string;
}

export interface IUpcomingPerson {
  title: string;
  shortDescription1: string;
  shortDescription2: string;
  shortDescription3: string;
  longDescription: any;
  profileImage: string;
}

const Birthday: React.FC<IBirthdayProps> = (props) => {
  const [birthdays, setBirthdays] = React.useState<IDay[]>([]);
  const [person, setPerson] = React.useState<IUpcomingPerson>({ title: '', longDescription: '', shortDescription1: '', shortDescription2: '', shortDescription3: '', profileImage: '' });
  const [links, getLinks] = React.useState<any[]>([]);
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    getBirthdays(sp, props.eventsListId, props.context).then(setBirthdays).catch(e => console.error(e));
    //getAnniversaries(sp, props.birthdayListId, props.eventsListId).then(setBirthdays).catch(e => console.error(e));
    getUpcomingPerson(sp, props.upcomingPersonListId).then(setPerson).catch(e => console.error(e));
    checkAdmin(sp, /*props.birthdayListId,*/ props.eventsListId, props.upcomingPersonListId).then(getLinks).catch(e => console.error(e));
    // getAnniversaries(sp, props.eventsListId).then(setEvents).catch(e=>console.error(e));


  }, []);
  return (
    <div className={styles.gears}>
      {links.length == 2 &&
        <span>
          {/* <a target='_blank' className={styles.links} href={links[0]} data-interception="off">
            <FontIcon aria-label="Settings" iconName="Settings" title="Open Birthday list" style={{marginTop: 8}} />
          </a> */}
          <a target='_blank' className={styles.links} href={links[0]} data-interception="off">
            {/* <i title="Open Personal Events list" className="fa fa-solid fa-gear"></i> */}
            <FontIcon aria-label="Settings" title="Open Personal Events list" iconName="Settings" style={{ marginTop: 8 }} />
          </a>
          <a target='_blank' className={styles.links_last} href={links[1]} data-interception="off">
            {/* <i title="Open Upcoming Person list" className="fa fa-solid fa-gear"></i> */}
            <FontIcon aria-label="Settings" iconName="Settings" title="Open Upcoming Person list" style={{ marginTop: 8 }} />
          </a>
        </span>
      }
      <div className={`${styles.birthdaysContainer} ${styles.container}`}>

        {links.length == 2 && <Days days={birthdays} title={props.birthdayTitle} height={props.height - 16} icon={require('../../../assets/icon_birthday.svg')} isRight={true} context={props.context} />}
        {links.length != 2 && <Days days={birthdays} title={props.birthdayTitle} height={props.height} icon={require('../../../assets/icon_birthday.svg')} isRight={true} context={props.context} />}
        {links.length == 2 && props.upcomingPersonListId && <Upcoming person={person} title={props.eventsTitle} height={props.height - 198} icon={require('../../../assets/badge.svg')} isRight={false} context={props.context} />}
        {links.length != 2 && props.upcomingPersonListId && <Upcoming person={person} title={props.eventsTitle} height={props.height - 170} icon={require('../../../assets/badge.svg')} isRight={false} context={props.context} />}
      </div>
    </div >
  );
}

export default Birthday