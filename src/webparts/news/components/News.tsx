import * as React from "react";
import { INewsProps } from "./INewsProps";

import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import { format } from "date-fns";
import commonStyles from "../../../common.module.scss";
import styles from "./News.module.scss";

export interface INews {
  description: string;
  date: string;
  time: number;
  key: number;
}
const News: React.FC<INewsProps> = (props) => {
  const [news, setNews] = React.useState<INews[]>([]);
  const [contentHeight, setContentHeight] = React.useState<string>("0px");
  const marqueeRef = React.useRef<HTMLUListElement>();
  const onResize = (): void => {
    if (marqueeRef.current) {
      setContentHeight(`-${window.getComputedStyle(marqueeRef.current).height}`);
    }
  };
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    sp.web.lists
      .getById(props.listId)
      .items.filter("IsActive eq 1")()
      .then((items) => {
        const _news = items.map((x) => {
          const date = new Date(x.Date || x.Created);
          return {
            description: x.Description,
            time: date.getTime(),
            date: `(${format(date, "d/M/yyyy")})`,
            key: x.Id,
          };
        });
        setNews(_news.sort((x1, x2) => x2.time - x1.time));        
        onResize();
      })
      .catch((e) => console.error("Could not get news/updates", e));
    
    window.addEventListener("resize", onResize); 
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <div className={commonStyles.container} style={{margin:'0px'}}>
      <div className={commonStyles.container_header}>
        <img src={require("../../../assets/icon_list.svg")} alt="News/Updates" />
        <div>{props.title}</div>
      </div>
      <div className={commonStyles.container_body}>
        <div className={styles.marquee}>
          {/* <Scrollbar className={styles.marquee_block} style={{ height: props.height }} rtl={false}> */}
          <div className={styles.marquee_block} style={{ height: props.height }}>
            <div className={styles.marquee_inner} 
                style={{ "--contentHeight": contentHeight, animationDuration:props.animationDuration } as unknown}>
              <ul ref={marqueeRef}>
                {news.map((x) => (
                  <li key={x.key}>
                    {x.description} {x.date}
                  </li>
                ))}
              </ul>
              <ul>
                {news.map((x) => (
                  <li key={x.key}>
                    {x.description} {x.date}
                  </li>
                ))}
              </ul>
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
};

export default News;

