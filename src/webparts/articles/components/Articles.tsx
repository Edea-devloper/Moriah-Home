import * as React from 'react';
import styles from './Articles.module.scss';
import { IArticlesProps } from './IArticlesProps';
import commonStyles from '../../../common.module.scss';
import { Scrollbar } from "react-scrollbars-custom";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields/list";
import { PermissionKind } from "@pnp/sp/security";
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { iconClass } from '../../../helpers/constants';

export interface IArticle {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  linkUrl: string;
  imageUrl: string;
  key: number;
}

const Articles: React.FC<IArticlesProps> = (props) => {
  const [articles, setArticles] = React.useState<IArticle[]>([]);
  const [links, getLinks] = React.useState<any[]>([]);
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    checkAdmin(sp, props.listId).then(getLinks).catch(e => console.error(e));
    sp.web.lists.getById(props.listId).items
      .select('Id', 'Title', 'Description', 'File/ServerRelativeUrl', 'BannerImageUrl', 'CanvasContent1')
      .filter('PromotedState eq 2')
      .expand('File')
      .orderBy('Order0')
      .top(props.count || 10)
      ().then(items => {
        const _articles = items.map(x => {
          const titleLen = props.titleLength == 10 ? x.Title.length > 16 ? 31 : 16 : props.titleLength;
          const descriptionLen = props.descriptionLength == 10 ?
            props.titleLength == 10 ? titleLen == 31 ? 31 : 52 : 62 - x.Title.length : props.descriptionLength;
          return {
            title: x.Title,
            titleLength: titleLen,
            description: x.Description,
            descriptionLength: descriptionLen,
            linkUrl: x.File?.ServerRelativeUrl || '',
            imageUrl: x.BannerImageUrl?.Url || '',
            key: x.Id
          }
        });
        setArticles(_articles);
      })
      .catch((e) => console.error("Could not get forms data", e));
  }, []);

  const checkAdmin = async (sp: SPFI, eventsListId: string): Promise<any[]> => {
    const perms = await sp.web.getCurrentUserEffectivePermissions();
    if (!sp.web.hasPermissions(perms, PermissionKind.AddAndCustomizePages)) return [];
    const eventsTitle = await sp.web.lists.getById(eventsListId).fields();
    return [eventsTitle[0].Scope];
  }

  return (
    <div className={styles.gears}>
      {links.length != 0 &&
        <span>
          <a target='_blank' className={styles.links} href={links[0]} data-interception="off">
            <FontIcon aria-label="Settings" title="Open Personal Events list" iconName="Settings" style={{ marginTop: 8 }} />
          </a>
        </span>
      }
      <div className={styles.articleContainer} style={{ maxHeight: "295px" }}>
        <div className={commonStyles.container_header}>
          <img src={require('../../../assets/icon_article.svg')} alt="Articles" />
          <div>{props.title}</div>
        </div>
        <div className={commonStyles.container_body}>
          <Scrollbar style={{ maxHeight: "205px", minHeight: "205px" }} rtl={false}>
            <ul className={styles.articles}>
              {articles.map(x => (
                <li key={x.key} onClick={() => window.open(x.linkUrl, '_blank')}>
                  <div className={styles.articles_image} style={{ flexBasis: props.imageWidth }}>
                    <img src={x.imageUrl} alt="img" height={props.imageHeight} width="100%" />
                  </div>
                  <div className={styles.articles_text}>
                    <p className={styles.articles_title}>{x.title && x.title.length > x.titleLength ? (x.title.substring(0, x.titleLength || 80) + '...') : x.title}</p>
                    <p className={styles.articles_description}>{x.description && x.description.length > x.descriptionLength ? (x.description.substring(0, x.descriptionLength || 120) + '...') : x.description}</p>
                  </div>
                </li>))}
            </ul>
          </Scrollbar>
        </div>
        {props.listUrl && <div className={commonStyles.linkToAll} onClick={() => window.open(props.listUrl, '_blank')}>
          <span>{props.seeAllTitle}</span>
          <FontIcon aria-label="ChevronLeft" iconName="ChevronLeft" className={iconClass} />
        </div>}
      </div>
    </div>
  );
}

export default Articles