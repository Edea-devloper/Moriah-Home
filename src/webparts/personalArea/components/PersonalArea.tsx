import * as React from 'react';
import styles from './PersonalArea.module.scss';
import { theme } from '../../../helpers/constants'
import { spfi, SPFx } from "@pnp/sp";
import { IPersonalAreaProps } from './IPersonalAreaProps';
import * as ReactDOM from 'react-dom';
import { IPanelStyleProps, Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { getCurrentUserEmail, getFormSettings, getMyForms, getMyTasks, getWorkerNumber } from '../service';
import { Scrollbar } from "react-scrollbars-custom";
import { fetchData, fetchOTP, openLink } from '../service';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';

export interface IForm {
  date: string;
  title: string;
  linkUrl: string;
  status?: string;
  modified?: number;
}
export interface ISettings {
  SiteUrl: string;
  ListId: string;
  ListTitle: string;
  Title: string;
  FormUrl: string;
  StatusValues: string;
  CompleteStatusValues: string;
  SecondTitle: string;
}

export interface IVacation {
  // Id: number;
  EmpNumber: string;
  ArgTotalHours: string;
  PayCode300: string;
  PayCode900: string;
  OT_Quota?: string;
  OT_Amount_125: string;
  OT_Amount_150: string;
  QuotaVacationDays?: string;
  QuotaSicknessDays?: string;
  BalanceVacationDays?: string;
  BalanceSicknessDays?: string;
}

const PersonalArea: React.FC<IPersonalAreaProps> = (props) => {
  const [myForms, setMyForms] = React.useState<IForm[]>([]);
  const [myTasks, setMyTasks] = React.useState<IForm[]>([]);
  const [myVacations, setMyVacations] = React.useState<IVacation>(null);

  const [isTasksLoading, setIsTasksLoading] = React.useState<boolean>(false);
  const [isFormsLoading, setIsFormsLoading] = React.useState<boolean>(false);
  const [isSinelLoading, setIsSinelLoading] = React.useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = React.useState<boolean>(false);
  const [isCurrentUserHR, setHR] = React.useState<boolean>(false);

  const keyMyForms = 'MY_FORMS_' + props.context.pageContext.user.displayName;
  const keyMyTasks = 'MY_TASKS_' + props.context.pageContext.user.displayName;
  const keySinel = 'SINEL_' + props.context.pageContext.user.displayName;

  const [isPanelOpen, setPanelVisibility] = React.useState<boolean>(false);

  React.useEffect(() => {
    const localSinel = localStorage.getItem(keySinel);
    // const localForms = localStorage.getItem(keyMyForms);
    // const localTasks = localStorage.getItem(keyMyTasks);
    if (localSinel) setMyVacations(JSON.parse(localSinel));
    // if (localForms) setMyForms(JSON.parse(localForms));
    // if (localTasks) setMyTasks(JSON.parse(localTasks));
  }, [])

  React.useEffect(() => {
    if (isPanelOpen && !isDataLoaded) {
      setIsTasksLoading(true);
      setIsFormsLoading(true);
      setIsSinelLoading(true);
      setIsDataLoaded(true);
      const sp = spfi().using(SPFx(props.context));
      const userName = props.context.pageContext.user.email.substring(0, props.context.pageContext.user.email.indexOf('@')).toLowerCase();
      const userMail = props.context.pageContext.user.email;

      getCurrentUserEmail(props.context.pageContext.user.email, props.context)
        .then((isHR: boolean) => {
          if (isHR) setHR(true);
        })

      // getCurrentUserNumber(sp, props.context.pageContext.user.email, props.context.pageContext.user.displayName)
      getWorkerNumber(props.context)
        .then((userNumber: string) => {
          if (!userNumber) {
            setIsSinelLoading(false);
            setMyVacations(null);
            localStorage.setItem(keySinel, '');
            return;
          };
          fetchOTP()
            .then(code => {
              fetchData(code, userNumber)
                .then(vacation => {
                  console.log("Sinel Data Dound:", vacation)
                  setMyVacations(vacation);
                  localStorage.setItem(keySinel, JSON.stringify(vacation));
                  setIsSinelLoading(false);
                })
                .catch(e => {
                  console.error('Getting Sinel Data failure ', e);
                  setIsSinelLoading(false);
                });
            })
            .catch(e => {
              console.error('Sinel OPTAuthorization failure ', e);
              setIsSinelLoading(false);
            });
        })
        .catch(e => {
          console.error('Could not get user number', e);
          setIsSinelLoading(false);
        })

      if (!props.formSettingsListId) return;

      getFormSettings(sp, props.formSettingsListId).then((settings: ISettings[]) => {
        getMyTasks(sp, settings, userName, userMail, props.context.pageContext.user.displayName)
          .then(tasks => {
            setMyTasks(tasks);
            localStorage.setItem(keyMyTasks, JSON.stringify(tasks));
            setIsFormsLoading(false);
          })
          .catch(e => {
            console.error('Could not get user number', e);
            setIsFormsLoading(false);
          })
        getMyForms(sp, settings, props.context.pageContext.user.displayName, props.formsNumber, props.context.pageContext.user.displayName)
          .then(forms => {
            setMyForms(forms);
            localStorage.setItem(keyMyForms, JSON.stringify(forms));
            setIsTasksLoading(false);
          })
          .catch(e => {
            console.error('Could not get user number', e);
            setIsTasksLoading(false);
          })
      })
    }

  }, [isPanelOpen])

  const loginName = props.context.pageContext.user.loginName;
  const displayName = props.context.pageContext.user.displayName;

  const PersonalArea = (props: any): React.ReactPortal => {
    return ReactDOM.createPortal(
      <div className={styles.personalArea}> {props.children} </div>,
      document.body
    );
  };
  const panelStyles: IPanelStyleProps = {
    theme,
    isOnRightSide: true
  }

  return (
    <>
      <PersonalArea>
        <button type="button" className={styles.personalArea_button} onClick={() => setPanelVisibility(!isPanelOpen)}>
          <span> אזור אישי </span>
        </button>
      </PersonalArea>
      <Panel
        isLightDismiss
        isOpen={isPanelOpen}
        onDismiss={() => setPanelVisibility(false)}
        headerText='אזור אישי'
        closeButtonAriaLabel="סגור"
        type={PanelType.customNear}
        customWidth='380px'
        styles={{ root: panelStyles, main: { background: theme.themePrimary, color: '#fff' }, headerText: { color: '#fff' } }}
        className={styles.panel}
      >
        <Scrollbar style={{ height: window.innerHeight - 52 }} rtl={false}>
          <ul className={styles.panel_content}>
            <li className={styles.panel_header}>
              <div className={styles.panel_header_image}>
                <img src={'/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(loginName)} alt="user" />
              </div>
              <h4>שלום {displayName}</h4>
            </li>
            {isCurrentUserHR && <li>
              <div className={styles.section_content}>
                {/* <a href="https://moriah1.sharepoint.com/sites/Home/Forms/SitePages/EmployeeTransitionForms.aspx" target="_blank" rel='noreferrer'>טופס טיולים קליטת / עזיבת עובדים</a> */}
                <a onClick={() => openLink('https://moriah1.sharepoint.com/sites/Home/Forms/SitePages/EmployeeTransitionForms.aspx')}>טופס טיולים קליטת / עזיבת עובדים</a>
              </div>
            </li>}
            {/* Vacations */}
            <p className={styles.section_title} style={{ position: 'relative' }}>
              {isSinelLoading && <Spinner size={SpinnerSize.large} style={{ left: 0, position: 'absolute' }} />}
            </p>
            {myVacations && <li>
              <div>
                <span className={styles.vacation_title}>מספר עובד:</span>
                <span>{myVacations.EmpNumber}</span>
              </div>
              <div>
                <span className={styles.vacation_title}>נוכחות מצטברת:</span>
                <span>{myVacations.ArgTotalHours}</span>
              </div>
              {/* <div>
                <span className={styles.vacation_title}>סה"כ נוכחות:</span>
                <span>{myVacations.PayCode300}</span>
              </div>
              <div>
                <span className={styles.vacation_title}>שעות חוסר:</span>
                <span>{myVacations.PayCode900}</span>
              </div>
              <div>
                <span className={styles.vacation_title}>ש.נ 125%:</span>
                <span>{myVacations.OT_Amount_125}</span>
              </div>
              <div>
                <span className={styles.vacation_title}>ש.נ 150%:</span>
                <span>{myVacations.OT_Amount_150}</span>
              </div> */}
              {/* <div>
                <span className={styles.vacation_title}>מכסת ש.נ:</span>
                <span>{myVacations.OT_Quota}</span>
              </div> */}
            </li>}

            {/* My Tasks */}
            <li>
              <p className={styles.section_title}>
                <span>הבקשות שלי </span>
                {isFormsLoading && <Spinner size={SpinnerSize.large} style={{ marginRight: 10 }} />}
              </p>
              <div className={styles.section_content}>
                {myForms.map(x => (
                  <div>
                    {/* <a href={x.linkUrl} target="_blank" rel='noreferrer'> {x.title} - {x.date} ({x.status})</a> */}
                    {/* <a href={x.linkUrl} target="_blank" rel='noreferrer'> {x.title}</a> */}
                    <a onClick={() => openLink(x.linkUrl)}> {x.title}</a>
                  </div>
                ))}
              </div>
            </li>

            {/* My Forms*/}
            <li>
              <p className={styles.section_title}>
                <span>בקשות לאישור  </span>
                {isTasksLoading && <Spinner size={SpinnerSize.large} style={{ marginRight: 10 }} />}
              </p>
              <div className={styles.section_content}>
                {myTasks.map(x => (
                  <div>
                    {/* <a href={x.linkUrl} target="_blank" rel='noreferrer'> {x.title} - {x.date}</a> */}
                    {/* <a href={x.linkUrl} target="_blank" rel='noreferrer'> {x.title}</a> */}
                    <a onClick={() => openLink(x.linkUrl)}> {x.title}</a>
                  </div>
                ))}
              </div>
            </li>
          </ul>
        </Scrollbar>
      </Panel>
    </>
  );
}

export default PersonalArea


