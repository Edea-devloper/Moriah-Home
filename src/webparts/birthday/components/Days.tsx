// we have list with anniversaries and birthdays, list is updated every day (once a day by flow?)
// Generate all users with data. Get all user form list. Compare data: search by userName (Id). if new Date exist and is different, update item. I no user exist add item. Update upcoming anniversary. 
import * as React from 'react';
import styles from './Birthday.module.scss';
import commonStyles from '../../../common.module.scss';
import { Scrollbar } from "react-scrollbars-custom";
import { PrimaryButton, DefaultButton, FontIcon, TextField, Spinner } from 'office-ui-fabric-react';
import { theme } from '../../../helpers/constants'
import { IDay } from './Birthday';
import { } from '@fluentui/react/lib/Button';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useMsGraphProvider, IMSGraphInterface } from './service';
import { useBoolean } from '@fluentui/react-hooks';
import { ContextualMenu, Modal, IDragOptions } from '@fluentui/react';
import { IconButton, IButtonStyles } from '@fluentui/react/lib/Button';
// import { Textarea } from '@fluentui/react-textarea';

const dragOptions: IDragOptions = {
  moveMenuItemText: 'Move',
  closeMenuItemText: 'Close',
  menu: ContextualMenu,
  keepInBounds: true,
  dragHandleSelector: '.ms-Modal-scrollableContent > div:first-child',
};

export interface IDaysProps {
  days: IDay[],
  title: string;
  height: number;
  icon: string;
  isRight: boolean;
  context: WebPartContext;
}

const iconCloseStyles: Partial<IButtonStyles> = {
  root: {
    color: '#fff',
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: '#b9bdc1',
    background: 'transparent',
  },
  rootPressed: {
    color: '#b9bdc1',
    background: 'transparent',
  }
};

const Days: React.FC<IDaysProps> = (props) => {
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [isInfoModalOpen, { setTrue: showInfoModal, setFalse: hideInfoModal }] = useBoolean(false);
  const [isSendingMail, { setTrue: startMailing, setFalse: finishMailing }] = useBoolean(false);
  const [notificationText, setNotificationText] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>(null);
  const [mailTo, setMailTo] = React.useState<string>('');
  const [msGraphProvider, setMSGraphProvider] = React.useState<IMSGraphInterface>();
  const [windowSize, setWindowSize] = React.useState<number>(1920);
  React.useEffect(() => { fetchMsGraphProvider(); }, []);
  React.useEffect(() => { console.log(notificationText) });
  React.useEffect(() => { setWindowSize(window.innerWidth); });

  const fetchMsGraphProvider = async () => { setMSGraphProvider(await useMsGraphProvider(props.context.msGraphClientFactory)); };
  const showError = (msg: string | null) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 8000);
  }

  window.addEventListener('resize', function () {
    setWindowSize(window.innerWidth);
  })

  const sendMail = async (goToChart: boolean) => {
    try {
      if ((props.context.pageContext.user.email || '').toLowerCase() === (mailTo || '').toLowerCase()) {
        showError('אין אפשרות לשלוח מייל עצמי')
        return;
      }
      if (!notificationText) { showError('הודעה אינה יכולה להיות ריקה'); return; }

      startMailing()
      let currentUserId = await msGraphProvider.getCurrentUserId();
      let userIdToSendMessage = await msGraphProvider.getUserId(mailTo);
      let chatOfUser = await msGraphProvider.createUsersChat(userIdToSendMessage, currentUserId);
      let result = await msGraphProvider.sendMessage(chatOfUser, notificationText.replaceAll('\n', '<br>'));
      if (result) {
        finishMailing();
        hideModal();
      }
      if (goToChart) window.open(`https://teams.microsoft.com/l/chat/0/0?users=${mailTo}`, '_blank')
      else showInfoModal()
    }
    catch (e) {
      console.error('Error in sending message occurred', e);
      showError('הודעה לא נשלחה עקב שגיאה')
      finishMailing();
    }
  }

  return (<div className={styles.container_element}>
    <div className={styles.container_header}>
      <img src={props.icon} alt="Forms/Updates" />
      <div>{props.title}</div>
    </div>
    <div className={commonStyles.container_body} style={{ paddingLeft: props.isRight && windowSize > 576 ? '1rem' : 0, borderLeft: props.isRight && windowSize > 576 ? '1px solid #E5E5E5' : 'none' }}>
      <Scrollbar style={{ height: windowSize > 576 && windowSize < 792 ? props.height + 120 : props.height || 300 }} rtl={false}>
        <ul className={styles.days}>
          {props.days.map(x => (
            <li key={x.key} className={styles.day}>
              <div className={styles.day_user}>
                <img src={x.profileImage} alt="img" />
              </div>
              <div className={styles.day_text}>
                <h4>
                  <span>{x.name}</span>
                  <span className={styles.day_mail} onClick={() => { setNotificationText(x.notificationText); setMailTo(x.email); showModal() }}><FontIcon aria-label="EditMail" iconName="EditMail" /></span>
                  {/* <span className={styles.day_icon}><FontIcon aria-label="EditMail" iconName="EditMail" className={mailIconStyles} /></span> */}
                  {/* <a href={`https://teams.microsoft.com/l/chat/0/0?users=${x.email}`} rel='noreferrer' target="_blank">
                  <img src={require('../../../assets/teamviewer.svg')} alt="img"/>
                </a> */}
                </h4>
                <p>{x.text}</p>
              </div>
              <div className={styles.day_icon}>
                {x.isLinkUrl
                  ? <img src={x.icon} alt="img" />
                  : <FontIcon aria-label={x.icon} iconName={x.icon} />}
                {/* {console.log("Bday", x)} */}
                {/* {x.isToday
                ?  <img src={require('../../../assets/icons8-birthday-64.png')} alt="img"/>
                :  <img src={require('../../../assets/icons8-birthday-64-gray.png')} alt="img"/>} */}
                <p style={{ color: x.isToday ? theme.themePrimary : theme.neutralPrimary }}>{x.day}</p>
              </div>
            </li>))}
        </ul>
      </Scrollbar>
    </div>

    <Modal
      titleAriaId='MailCongratulations'
      isOpen={isModalOpen}
      onDismiss={hideModal}
      isBlocking={false}
      containerClassName={styles.modal_container}
      dragOptions={dragOptions}
    >
      <div className={styles.modal_header}>
        <h2 className={styles.modal_heading} id='MailCongratulations'>שלח ברכה בטימס</h2>
        <IconButton
          styles={iconCloseStyles}
          iconProps={{ iconName: 'Cancel' }}
          ariaLabel="Close"
          onClick={hideModal}
        />
      </div>
      <div className={styles.modal_body}>
        <div>
          <TextField
            style={{ borderRadius: 16 }}
            multiline
            autoAdjustHeight
            label="עדכן טקסט במידת הצורך"
            value={notificationText}
            onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => { setNotificationText((event.target as HTMLInputElement).value) }}
          />
        </div>
        <div className={styles.modal_sending}>
          {isSendingMail && <Spinner label="Sending mail..." ariaLive="assertive" labelPosition="right" />}
          {!!errorMessage && <p className={styles.modal_error}>{errorMessage}</p>}
        </div>
        <div className={styles.modal_buttons}>
          <PrimaryButton
            text={'שלח ועבור לצ’אט'}
            iconProps={{ iconName: 'MailForward' }}
            allowDisabledFocus
            className={commonStyles.submitButton}
            onClick={() => sendMail(true)}
            disabled={isSendingMail}
          />
          <PrimaryButton
            text={'שלח וסגור'}
            iconProps={{ iconName: 'MailForward' }}
            allowDisabledFocus
            className={commonStyles.submitButton}
            onClick={() => sendMail(false)}
            disabled={isSendingMail}
          />
          <DefaultButton
            text={`סגור ללא שליחה`}
            iconProps={{ iconName: 'Cancel' }}
            allowDisabledFocus
            className={commonStyles.defaultButton}
            onClick={() => hideModal()}
            disabled={isSendingMail}
          />
        </div>
      </div>
    </Modal>
    <Modal
      titleAriaId='InfoModal'
      isOpen={isInfoModalOpen}
      onDismiss={hideModal}
      isBlocking={false}
      containerClassName={styles.modal_info_container}
      dragOptions={dragOptions}
    >
      <div className={styles.modal_header}>
        <h2 className={styles.modal_heading} id='InfoModal'>שלח ברכה בטימס</h2>
        <IconButton
          styles={iconCloseStyles}
          iconProps={{ iconName: 'Cancel' }}
          ariaLabel="Close"
          onClick={hideModal}
        />
      </div>
      <div className={styles.modal_body}>
        <h3>הודעה נשלחה בהצלחה</h3>
        <div className={styles.modal_buttons}>
          <PrimaryButton
            text={'סגור'}
            iconProps={{ iconName: 'Accept' }}
            allowDisabledFocus
            className={commonStyles.submitButton}
            onClick={hideInfoModal}
          />
        </div>
      </div>
    </Modal>

  </div>)
}

export default Days