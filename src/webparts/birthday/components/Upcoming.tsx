// we have list with anniversaries and birthdays, list is updated every day (once a day by flow?)
// Generate all users with data. Get all user form list. Compare data: search by userName (Id). if new Date exist and is different, update item. I no user exist add item. Update upcoming anniversary. 
import * as React from 'react';
import styles from './Birthday.module.scss';
import commonStyles from '../../../common.module.scss';
import { Scrollbar } from "react-scrollbars-custom";
import { } from '@fluentui/react/lib/Button';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IUpcomingPerson } from './Birthday';
// import { Textarea } from '@fluentui/react-textarea';

export interface IUpcomingPersonProps {
    person: IUpcomingPerson;
    title: string;
    height: number;
    icon: string;
    isRight: boolean;
    context: WebPartContext;
}

const Upcoming: React.FC<IUpcomingPersonProps> = (props) => {
    // const isScroll = props.height > 1/*document.getElementsByClassName(styles.upcoming)[0].scrollHeight*/ ? false : true;
    // const [isScroll, setScroll] = React.useState<boolean>(false);
    // React.useEffect(() => {
    //     window.addEventListener("DOMContentLoaded", () => {
    //         console.log('loaded')
    //         setScroll(props.height < document.getElementsByClassName(styles.upcoming)[0].scrollHeight);
    //     }, false);
    // }, []);
    return (<div className={styles.container_element} >
        <div className={styles.container_header}>
            <img src={props.icon} alt="Forms/Updates" />
            <div>{props.title}</div>
        </div>
        <div className={commonStyles.container_body} style={{ paddingLeft: props.isRight ? '1rem' : 0, borderLeft: props.isRight ? '1px solid #E5E5E5' : 'none' }}>
            <div className={styles.upcoming_header}>
                <div className={styles.upcoming_column}>
                    <div className={styles.upcoming_title_first}><b>{props.person?.title}</b></div>
                    <div className={styles.upcoming_title}>{props.person?.shortDescription1}</div>
                    <div className={styles.upcoming_title}>{props.person?.shortDescription2}</div>
                    <div className={styles.upcoming_title}>{props.person?.shortDescription3}</div>
                </div>
                <div className={styles.upcoming_column}>
                    <img className={styles.upcoming_img} src={props.person?.profileImage} />
                </div>
            </div>
            <Scrollbar className={styles.upcomingWithoutScroll} style={{ height: props.height || 200 }} rtl={false}>
                <div className={styles.upcoming} dangerouslySetInnerHTML={{ __html: props.person?.longDescription }} />
            </Scrollbar>
        </div>
    </div>)
}

export default Upcoming