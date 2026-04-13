import * as React from 'react';
import { IFormsProps } from './IFormsProps';

import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import styles from './Forms.module.scss';
import commonStyles from '../../../common.module.scss';
import { Scrollbar } from "react-scrollbars-custom";
import { applyCachedOrder, cashUserLink } from '../../../helpers/common';

export interface IForm {
  title: string;
  linkUrl: string;
  key: number;
}

const Forms:React.FC<IFormsProps> = (props)  => {
  const [forms, setForms] = React.useState<IForm[]>([]);
  const storageKey =  props.listId + props.context.pageContext.user.displayName.replaceAll(' ', '')
  
  const openLink = (url:string, key:number, index: number):void => {
    if (!props.disableOrderCaching && index) {
      cashUserLink(storageKey, key);
      const newForms = [...forms];
      newForms.unshift(...newForms.splice(index,1));
      setForms(newForms)
    }
    window.open(url, '_blank')
  }

  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    sp.web.lists.getById(props.listId).items.select('Title','LinkUrl','Id')
      .filter('IsActive eq 1').orderBy('Order0')().then(items=> {
        const _forms = items.map((x, index) => {
          return {
            title:x.Title, 
            linkUrl: x.LinkUrl, 
            key: x.Id
          }
        });
        setForms(props.disableOrderCaching ? _forms : applyCachedOrder(storageKey, _forms));
    })
    .catch((e) => console.error("Could not get forms data", e));
  }, []);
    return (
      <div className={commonStyles.container} >   
        <div className={commonStyles.container_header}>   
          <img src={require('../../../assets/icon_list2.svg')} alt="Forms/Updates"/>
          <div>{props.title}</div>
        </div>
        <div className={commonStyles.container_body}>
          <Scrollbar rtl={false}  style={{ height:props.height || 300}}>
            <ul className={styles.forms}>
              {forms.map((x, index)=>(<li key={x.key} onClick={()=>openLink(x.linkUrl, x.key, index)}>
                <img src={require('../../../assets/icon_list_xs.svg')} alt="img" />
                {x.title}
                </li>))}
            </ul>
          </Scrollbar>
        </div>            
      </div>
    );
  }

export default Forms