import * as React from 'react';
import commonStyles from '../../../common.module.scss';
import styles from './DailyTip.module.scss';
import { IDailyTipProps } from './IDailyTipProps';
import { spfi, SPFx} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getWeeklyTip } from './service';



const DailyTip:React.FC<IDailyTipProps> = (props)  => {
  const [tip, setTip] = React.useState<string>(null);
  // const today = format(new Date(),'yyyy-MM-dd')+'T23:59:59Z'
  React.useEffect(() => {
    const sp = spfi().using(SPFx(props.context));
    getWeeklyTip(sp, props.listId)
      .then(setTip)
      .catch((e) => console.error("Could not get daily tips", e));
  }, []);
    return (
      <div className={`${commonStyles.container} ${commonStyles.bg_logo} ${commonStyles.bg_logo_tip}`}>   
        <div className={commonStyles.container_header}>   
          <img src={require('../../../assets/icon_bulb.svg')} alt="DailyTip"/>
          <div>{props.title}</div>
        </div>
        <div className={commonStyles.container_body} style={{minHeight:  props.height}}>
            <div className={styles.dailyTip}>
              {tip}
            </div>
        </div>            
      </div>
    )
  }

export default DailyTip