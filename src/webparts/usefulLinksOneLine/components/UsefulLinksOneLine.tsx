import * as React from 'react';
import styles from './UsefulLinksOneLine.module.scss';
import { IUsefulLinksOneLineProps } from './IUsefulLinksOneLineProps';
import commonStyles from '../../../common.module.scss';
import Slider, { Settings } from "react-slick";
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { FontIcon } from '@fluentui/react/lib/Icon';


import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { applyCachedOrder, cashUserLink } from '../../../helpers/common';

export interface ILink {
  title: string;
  description: string;
  fabricIcon: string;
  linkUrl: string;
  iconUrl: string;
  key: number;
}

const NextArrow = (props:any):JSX.Element => (
  <div className={props.className} style={{...props.style, top:'calc(50% - 28px)'}} onClick={props.onClick}>
    <img src={require('../../../assets/arrow_left_primary.svg')}/>,
  </div>
);
const PrevArrow = (props:any):JSX.Element => (
  <div className={props.className} style={{...props.style, top:'calc(50% - 28px)'}} onClick={props.onClick}>
    <img src={require('../../../assets/arrow_right_primary.svg')}/>,
  </div>
)

const UsefulLinksOneLine:React.FC<IUsefulLinksOneLineProps> = (props)  => {
  const storageKey =  props.listId + props.context.pageContext.user.displayName.replaceAll(' ', '');
    const initialSettings: Settings = {
    dots: false,
    infinite: true,
    slidesToShow: props.slidesToShow || 5,
    initialSlide: 0,
    slidesToScroll: 1,
    autoplay: props.autoPlay,
    pauseOnHover: true,
    rtl:false,
    speed: props.speed || 1000,
    autoplaySpeed: props.autoplaySpeed || 4500,
    cssEase: "linear",
    nextArrow: <NextArrow/>,
    prevArrow: <PrevArrow/>,
    // centerMode: false,
    // nextArrow: ()=>
    responsive: [
      // { breakpoint: 1024, settings: {slidesToShow: 5}},
      { breakpoint: 760, settings: {slidesToShow: 4}},
    ]
  };
  const [settings, setSettings] = React.useState<Settings>(initialSettings);
  const [links, setLinks] = React.useState<ILink[]>([]);
  
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    sp.web.lists.getById(props.listId).items.select('Title','Description','UIFabricIcon','LinkUrl','IconUrl','Id')
      .filter('IsActive eq 1').orderBy('Order0')().then(items => {
        initialSettings.initialSlide = (3*items.length - 2*props.slidesToShow) % items.length;
        setSettings(initialSettings);
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
    index=links.length-index-1;
    if (!props.disableOrderCaching && index) {
      cashUserLink(storageKey, key);
      const newLinks = [...links];
      newLinks.unshift(...newLinks.splice(index,1));
      setLinks(newLinks);
    }
    window.open(url, '_blank')
  }
  
  return (
    <div className={commonStyles.container}>   
      <div className={commonStyles.container_header}>   
        <img src={require('../../../assets/icon_link.svg')} alt="Useful Links"/>
        <div>{props.title}</div>
      </div>
      <div className={styles.linksBody} style={{direction:'ltr'}}>
        {links.length>0 && 
          <div style={{minHeight:props.height || 130}}>
            <Slider {...settings}>
              {links.map((x, index)=>(
                <div className={styles.link_wrap} key={x.key}>
                <TooltipHost 
                content={x.description}
                id={'usefull-link-'+x.key}
                key={x.key} 
                calloutProps={{calloutMaxWidth:props.height}}
              >
              <div className={styles.link} onClick={()=>openLink(x.linkUrl, x.key, index)} 
                style={{width: props.imageHeight, height: props.imageHeight}}>
                <div className={styles.link_icon}>
                  {x.fabricIcon 
                    ? <FontIcon aria-label={x.fabricIcon} iconName={x.fabricIcon} />
                    : <img src={x.iconUrl} alt="img" /> }
                </div>
                <p className={styles.link_label}>{x.title}</p>
              </div>
            </TooltipHost>
                </div>
            ))}
            </Slider>
          </div>
        }
      </div>            
    </div>
  );
  }

export default UsefulLinksOneLine