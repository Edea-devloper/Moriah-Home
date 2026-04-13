import * as React from 'react';
import styles from './Message.module.scss';
import { IMessageProps } from './IMessageProps';

import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import commonStyles from '../../../common.module.scss';
import { Scrollbar } from "react-scrollbars-custom";

export interface IMessage {
  title: string;
  body: string;
  imageUrl: string;
}

const Forms:React.FC<IMessageProps> = (props)  => {
  const [message, setMessage] = React.useState<IMessage>({title:'', body:'',imageUrl:''});
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    sp.web.lists.getById(props.listId).items.select('Title','SimpleText','RichText','ImageUrl','Id')
      .orderBy('Modified', false).top(1)().then(items=> {
        if (items.length) {          
          const x=items[0]
          const body = x.RichText || x.SimpleText.replaceAll('\n','<br>')
          setMessage({title:x.Title, body, imageUrl:x.ImageUrl});
        }
    })
    .catch((e) => console.error("Could not get message data", e));
  }, []);
    return (
      <div className={commonStyles.container}>   
        <div className={commonStyles.container_header}>   
          <img src={require('../../../assets/icon_horn.svg')} alt="Message"/>
          <div>{message.title}</div>
        </div>
        <div className={commonStyles.container_body}>
          <div className={styles.msg}>
            <div className={styles.msg_body}>
              <Scrollbar style={{height:props.height || 300}} rtl={false}>
                <div dangerouslySetInnerHTML={{__html:message.body}} style={{direction:'rtl'}}/>
              </Scrollbar>
            </div>
            {message.imageUrl && 
              <div className={styles.msg_image}>
                <img src={message.imageUrl} alt="img" style={{borderRadius:props.borderRadius}}/>
              </div>}
          </div>
        </div>            
      </div>
    );
  }

export default Forms