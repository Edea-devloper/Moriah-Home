import * as React from 'react';
import styles from './LinksSlider.module.scss';
import { ILinksSliderProps } from './ILinksSliderProps';
import commonStyles from '../../../common.module.scss';
import Slider, { Settings } from "react-slick";

import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { applyCachedOrder, cashUserLink } from '../../../helpers/common';


export interface ILink {
  title: string;
  iconUrl: string;
  linkUrl: string;  
  key: number;  
}

const NextArrow = (props:any):JSX.Element => (
  
  <div className={props.className} style={{...props.style, top:'33%'}} onClick={props.onClick}>
    <img src={require('../../../assets/arrow_left_primary.svg')}/>,
  </div>
);
const PrevArrow = (props:any):JSX.Element => (
  <div className={props.className} style={{...props.style, top:'33%'}} onClick={props.onClick}>
    <img src={require('../../../assets/arrow_right_primary.svg')}/>,
  </div>
)

const LinksSlider:React.FC<ILinksSliderProps> = (props)  => {
  const storageKey =  props.listId + props.context.pageContext.user.displayName.replaceAll(' ', '');
  const initialSettings: Settings = {
    dots: false,
    infinite: true,
    slidesToShow: props.slidesToShow || 6,
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
    // adaptiveHeight: true,
    rows: 2,
    responsive: [
      { breakpoint: 760, settings: { slidesToShow: 4 }},
      { breakpoint: 500, settings: { slidesToShow: 3 }},
      { breakpoint: 400, settings: { slidesToShow: 2 }},
    ]
  };
  const [links, setLinks] = React.useState<ILink[]>([]);
  const [settings, setSettings] = React.useState<Settings>(initialSettings);

  
  
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    sp.web.lists.getById(props.listId).items
    .select('Id','Link_Title','LinkUrl', 'File/ServerRelativeUrl',)
    .filter('IsActive eq 1')
    .expand('File')
    .orderBy('Order0')().then(items => {
      initialSettings.initialSlide = (3*items.length - 2*props.slidesToShow) % items.length;
      setSettings(initialSettings);
      const _links = items.map(x=>{        
        return {
          title:x.Link_Title, 
          iconUrl: x.File.ServerRelativeUrl, 
          linkUrl: x.LinkUrl,
          key:x.Id
        }
      });      
      setLinks(props.disableOrderCaching ? _links : applyCachedOrder(storageKey, _links));
    })
    .catch((e) => console.error("Could not get news/updates", e));
  }, []);

  const openLink = (url:string, key:number, index: number):void => {
    index = links.length - index - 1;

    
   // alert(index)
    if (index) {
      cashUserLink(storageKey, key);
      const newLinks = [...links];
      const arrWithnocurrentKey = newLinks.filter(item => item.key!= key);
      const arrWithKey = newLinks.filter(item => item.key== key)[0];
      arrWithnocurrentKey.unshift(arrWithKey);
      setLinks(arrWithnocurrentKey);
      initialSettings.initialSlide = (3*arrWithnocurrentKey.length - 2*props.slidesToShow) % arrWithnocurrentKey.length;
      setSettings(initialSettings);
   }

    window.open(url, '_blank')
  }
  
  return (
    <div className={commonStyles.container} style={{marginTop:"-4px"}}>   
      <div className={commonStyles.container_header}>   
        <img src={require('../../../assets/icon_share.svg')} alt="Links"/>
        <div>{props.title}</div>
      </div>
      <div className={styles.linksBody} style={{ direction:'ltr'} }>
        {links.length >0 && 
          <div style={{minHeight:props.height || 130}}>
            <Slider { ...settings }>
              {links.map((x, index)=>(
                <div key={x.key} >
                  <span className={styles.link} onClick={()=>openLink(x.linkUrl, x.key, index)} >
                    <div className={styles.link_image}>
                      <div className={styles.link_image_wrapper}>
                        <img src={x.iconUrl} alt="img" />
                      </div>
                    </div>
                    <div className={styles.link_label}>{x.title}</div>
                  </span>
                </div>
            ))}
            </Slider>
          </div>
        }
      </div>            
    </div>
  );
  }

export default LinksSlider