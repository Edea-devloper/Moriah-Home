import * as React from 'react';
import styles from './UsefulLinks.module.scss';
import commonStyles from '../../../common.module.scss';
import { IUsefulLinksProps } from './IUsefulLinksProps';
import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { FontIcon } from '@fluentui/react/lib/Icon';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { applyCachedOrder, cashUserLink } from '../../../helpers/common';

export interface ILink {
  title: string;
  description: string;
  fabricIcon: string;
  linkUrl: string;
  iconUrl: string;
  key: number;
}

const UsefulLinks:React.FC<IUsefulLinksProps> = (props)  => {
  const [links, setLinks] = React.useState<ILink[]>([]);
  const storageKey =  props.listId + props.context.pageContext.user.displayName.replaceAll(' ', '')

  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    sp.web.lists.getById(props.listId).items.select('Title','Description','UIFabricIcon','LinkUrl','IconUrl','Id')
      .filter('IsActive eq 1').orderBy('Order0')().then(items=> {
        const _links = items.map(x=>{
          return {
            title:x.Title, 
            description: x.Description, 
            fabricIcon: x.UIFabricIcon, 
            iconUrl: x.IconUrl, 
            linkUrl: x.LinkUrl, 
            key: x.Id
          }
        });
        setLinks(props.disableOrderCaching ? _links : applyCachedOrder(storageKey, _links));
    })
    .catch((e) => console.error("Could not get links data", e));
  }, []);

  const openLink = (url:string, key:number, index: number):void => {
    if (!props.disableOrderCaching && index) {
      cashUserLink(storageKey, key);
      const newLinks = [...links];
      newLinks.unshift(...newLinks.splice(index,1));
      setLinks(newLinks)
    }
    window.open(url, '_blank')
  }
  return (
    <div className={commonStyles.container}>   
      <div className={commonStyles.container_header}>   
        <img src={require('../../../assets/icon_link.svg')} alt="Useful Links"/>
        <div>{props.title}</div>
      </div>
      <div className={commonStyles.container_body}>
          <ul className={styles.usefulLinks} style={{minHeight:props.height}}>
            {links.map((x, index)=>(
              <TooltipHost 
                content={x.description}
                id={'usefull-link-'+x.key}
                style={{marginLeft: 'auto', marginRight: 'auto'}}
                key={x.key} 
                calloutProps={{calloutMaxWidth:props.height}}
              >
              <li className={styles.link} onClick={()=>openLink(x.linkUrl, x.key, index)} 
                style={{margin: props.margin, width: props.imageHeight, height: props.imageHeight}}>
                <div className={styles.link_icon}>
                  {x.fabricIcon 
                    ? <FontIcon aria-label={x.fabricIcon} iconName={x.fabricIcon} />
                    : <img src={x.iconUrl} alt="img" /> }
                </div>
                <p className={styles.link_label}>{x.title}</p>
              </li>
            </TooltipHost>))}
          </ul>
      </div>            
    </div>
  );
}

export default UsefulLinks