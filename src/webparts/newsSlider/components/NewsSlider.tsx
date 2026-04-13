import * as React from 'react';
import styles from './NewsSlider.module.scss';
import { INewsSliderProps } from './INewsSliderProps';
import { spfi, SPFx} from "@pnp/sp";
import Slider, { Settings } from "react-slick";


import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getNews } from './service';

export interface INews {
  imageUrl: string;
  title: string;
  description:  string;
  newsUrl: string;
  key: number;
}

const NextArrow = (props:any):JSX.Element => (
  <div className={props.className} style={{...props.style, top: 'calc(50% - 2.5rem)', left: '-10px', zIndex:2}}  onClick={props.onClick}>
    <img src={require('../../../assets/arrow_left_xl.svg')}/>,
  </div>
);
const PrevArrow = (props:any):JSX.Element => (
  <div className={props.className} style={{...props.style, top: 'calc(50% - 2.5rem)', right: '48px', zIndex:2}} onClick={props.onClick}>
    <img src={require('../../../assets/arrow_right_xl.svg')}/>,
  </div>
)

const NewsSlider:React.FC<INewsSliderProps> = (props)  => {
  const [news, setNews] = React.useState<INews[]>([]);
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    getNews(sp, props.listId).then(setNews).catch(console.error); 
  }, []);
  
  const settings: Settings = {
    dots: true,
    infinite: true,
    // initialSlide: 0,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: props.autoPlay,
    pauseOnHover: true,
    rtl:true,
    speed: props.speed || 1000,
    autoplaySpeed: props.autoplaySpeed || 4500,
    cssEase: "linear",
    nextArrow: <NextArrow/>,
    prevArrow: <PrevArrow/>, 
    customPaging: i => (
      <button className="newsButton">
        <div />
      </button>
    )   
  };
    return (
      <div className={styles.container}>           
        <Slider {...settings}>
          {news.map(x=>(
            <div key={x.key}>
              <div style={{ paddingTop: `${props.imageRatio}%` }} className={`${styles.news} ${x.title && x.description ? styles.news_darken : ''}`} >
                <div className={styles.news_box}>
                  <img src={x.imageUrl} alt="img"/>
                  <div className={styles.news_info} onClick={()=>window.open(x.newsUrl,'_blank')}>
                    <h4>{x.title}</h4>
                    <p>{x.description}</p>
                  </div>
                </div>
              </div>
            </div>
        ))}
        </Slider>
      </div>
    );
  }

export default NewsSlider