import * as React from 'react';
import styles from './Navigation.module.scss';
import Scrollbar from 'react-scrollbars-custom';
import * as strings from 'HomeNavigationApplicationCustomizerStrings';
import { CONTACT_PAGE, IUser } from './Navigation';


const SearchUser: React.FC<{ value: string, users: IUser[], /*externalUsers: IUser[],*/ setSearchUser: any }> = 
  ({ value = '', users = [], /*externalUsers = [],*/ setSearchUser }) => {
  const filteredItems: IUser[] = [...users, /*...externalUsers*/].filter((x: IUser) => ((x.name + x.email + x.department + x.phones.join(' ')) || '').toLowerCase().includes(value))
  let searchHeight = 240;
//accountEnabled

  const FilteredItems = filteredItems.map(x => (
    <div className={styles.userItem} data-is-focusable={true} onDoubleClick={() => { window.open(CONTACT_PAGE + '?search=' + x.name + '&ext=' + (x.isExternal ? 1 : 0), '_blank'); setSearchUser('') }}>
      <div className={styles.userItem_img} onClick={() => window.open(CONTACT_PAGE + '?search=' + x.name + '&ext=' + (x.isExternal ? 1 : 0), '_blank')}>
        <img src={x.imageUrl} alt={x.name} />
      </div>
      <div>
        <h4>{x.name}</h4>
        {!!x.jobTitle && <h5>{x.jobTitle}</h5>}
        {!!x.department && <h5>{x.department}</h5>}
        <a href={`mailto:${x.email}`}>{x.email}</a>
        {!!x.phones?.length && <p>
          {x.phones.map(phone => <a href={`tel:${phone}`} style={{ marginLeft: 8 }}>{phone}</a>)}
        </p>}
      </div>
    </div>
  ))

  if (users.length > 0) return (
    <div className={styles.homeItemContainer} data-is-scrollable>
      {filteredItems.length > 0
        ? filteredItems.length > 3
          ? <Scrollbar style={{ height: `${searchHeight}px` }} rtl={false}>
            {FilteredItems}
          </Scrollbar>
          :  FilteredItems
        : <p>{strings.SearchNotFound}</p>}
    </div>
  )
  else return <div />
}

export default SearchUser