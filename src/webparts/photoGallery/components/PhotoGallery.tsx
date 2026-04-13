import * as React from 'react';
import styles from './PhotoGallery.module.scss';
import { IPhotoGalleryProps } from './IPhotoGalleryProps';
import commonStyles from '../../../common.module.scss';
import Slider, { Settings } from "react-slick";
import { spfi, SPFx} from "@pnp/sp";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImages } from './service';

export interface IImage {
  title: string;
  imageUrl: string;
  key: number;  
  linkUrl: string;  
  isNewTab: boolean; 
  ordering:number
}

const NextArrow = (props:any):JSX.Element => (
  <div className={props.className} style={{...props.style, top: 'calc(50% - 1.5rem)'}} onClick={props.onClick}>
    <img src={require('../../../assets/arrow_left_primary.svg')}/>,
  </div>
);
const PrevArrow = (props:any):JSX.Element => (
  <div className={props.className} style={{...props.style, top: 'calc(50% - 1.5rem)'}} onClick={props.onClick}>
    <img src={require('../../../assets/arrow_right_primary.svg')}/>,
  </div>
)

const PhotoGallery:React.FC<IPhotoGalleryProps> = (props)  => {
  const initialSettings: Settings = {
    dots: false,
    infinite: true,
    slidesToShow: props.slidesToShow || 6,
    slidesToScroll: 1,
    initialSlide:2,
    autoplay:false,// props.autoPlay,
    pauseOnHover: true,
    rtl:false,
    speed: props.speed || 1000,
    autoplaySpeed: props.autoplaySpeed || 4500,
    cssEase: "linear",
    nextArrow: <NextArrow/>,
    prevArrow: <PrevArrow/>,
    // nextArrow: ()=>
    responsive: [
      { breakpoint: 1024, settings: {slidesToShow: 4}},
      { breakpoint: 760, settings: {slidesToShow: 3}},
      { breakpoint: 500, settings: {slidesToShow: 1}},
    ]
  };
  const [gallery, setGallery] = React.useState<IImage[]>([]);
  const [settings, setSettings] = React.useState<Settings>(initialSettings);

  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    getImages(sp, props.listId).then(items => {
    //  initialSettings.initialSlide =(3*items.length - 2*props.slidesToShow) % items.length;
      setSettings(initialSettings);
     let sortedGallery = items.sort((a, b) => {
      return a.ordering - b.ordering;
   });
      setGallery(sortedGallery);
    }).catch(console.error)
  }, []);
  
    return (
      <div className={commonStyles.container} style={{marginTop:"-20px"}}>   
        <div className={commonStyles.container_header}>   
          <img src={require('../../../assets/gallery.svg')} alt="Gallery"/>
          <div>{props.title}</div>
        </div>
        <div className={styles.gallery}>
            <div>
              <Slider {...settings}>
                {gallery.map(x=>(
                  <div key={x.key} >                  
                    <div className={styles.element} onClick={() => x.linkUrl && window.open(x.linkUrl, x.isNewTab ? '_blank' : '_self')} style={{cursor:x.linkUrl?'pointer':'default'}}>
                      <div className={styles.element_image} style={{height:props.height || 200, width:props.width || 280}}>
                        <img src={x.imageUrl} alt="img"/>
                        <div className={styles.element_title}>{x.title }</div>
                      </div>
                    </div>
                  </div>
              ))}
              </Slider>
            </div>
        </div>            
      </div>
    );
  }

export default PhotoGallery