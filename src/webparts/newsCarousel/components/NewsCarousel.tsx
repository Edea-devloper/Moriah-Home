import * as React from 'react';
import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { INewsCarouselProps } from './INewsCarouselProps';
import { Carousel, CarouselIndicatorShape, ICarouselImageProps, CarouselButtonsLocation, CarouselButtonsDisplay } from "@pnp/spfx-controls-react/lib/Carousel";
// import commonStyles from '../../../common.module.scss';
import commonStyles from './NewsCarousel.module.scss';
import { ImageFit } from 'office-ui-fabric-react/lib/Image';

const NewsCarousel:React.FC<INewsCarouselProps> = (props)  => {
    const [news, setNews] = React.useState<ICarouselImageProps[]>([]);
    React.useEffect(() => {
      const sp = spfi().using(SPFx(props.context));
      sp.web.lists.getById(props.listId).items
      .select('Title','Description0','Order0','File/ServerRelativeUrl','Url')
      .expand('File')
      .filter('IsActive eq 1').orderBy('Order0')().then(items=> {
        const _news = items.map(x=>{
          return {
            imageSrc: x.File.ServerRelativeUrl,
            title: x.Title,
            description: x.Description0,
            url: x.Url,
            showDetailsOnHover: false,
            imageFit: ImageFit.cover,
            detailsClassName: commonStyles.carouselDetails,
            titleClassName: commonStyles.carouselTitle,
            descriptionClassName: commonStyles.carouselDescription,
          }
        });
        setNews(_news);
      })
      .catch((e) => console.error("Could not get news/updates", e));
    }, []);
    const height = { "--carousel-height": props.height+5 +'px'} as React.CSSProperties;

      return (
        <div style={height} >
          <Carousel
            buttonsLocation={CarouselButtonsLocation.top}
            // buttonsDisplay={CarouselButtonsDisplay.block}
            buttonsDisplay={CarouselButtonsDisplay.buttonsOnly}
            contentContainerStyles={commonStyles.carouselContent}
            containerButtonsStyles={commonStyles.carouselButtonsContainer}
            rootStyles={commonStyles.carouselRoot}
            isInfinite={true}
            element={news}
            indicators={true}
            indicatorShape={CarouselIndicatorShape.circle}
            pauseOnHover={true}
            />
        </div>
      );
    }
  
  export default NewsCarousel
