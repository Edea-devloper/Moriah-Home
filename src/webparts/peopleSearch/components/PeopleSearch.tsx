import { FontIcon } from '@fluentui/react/lib/Icon';
import * as React from 'react';
// import styles from './PeopleSearch.module.scss';
import { IPeopleSearchProps } from './IPeopleSearchProps';
import styles from './PeopleSearch.module.scss';
import { getExternalUsers, getInternalUsers, getInternalUsersDepartment } from './service';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';

export interface IUser {
  phones: string[];
  name: string
  accountName: string; //userPrincipalName
  email: string;
  id: string;
  letter: string;
  department: string;
  jobTitle: string;
  isMember?: boolean;
  accountEnabled: boolean;

}

const options: IChoiceGroupOption[] = [
  {
    key: 'Member',
    iconProps: { iconName: 'People' },
    imageSize: { width: 32, height: 32 },
    text: 'משתמשים פנימיים',
  },
  // {
  //   key: 'Guest',
  //   iconProps: { iconName: 'ExternalUser' },
  //   imageSize: { width: 32, height: 32 },
  //   text: 'משתמשים חיצוניים',
  // },
];

const optionsSort: IChoiceGroupOption[] = [
  {
    key: 'Alphabet',
    // iconProps: { iconName: 'People' },
    // imageSize: { width: 16, height: 16 },
    text: 'אלפבית',
  },
  {
    key: 'Department',
    // iconProps: { iconName: 'ExternalUser' },
    // imageSize: { width: 16, height: 16 },
    text: 'חטיבה',
    disabled: true,
  },
];


const PeopleSearch: React.FC<IPeopleSearchProps> = (props) => {
  const [members, setMembers] = React.useState<IUser[]>([]);
  const [guests, setGuests] = React.useState<IUser[]>([]);
  const [groupState, setGroupState] = React.useState<'Member' | 'Guest'>('Member');
  const [sortState, setSortState] = React.useState<'Alphabet' | 'Department'>('Alphabet');
  const [alphabetUsers, setAlphabetUsers] = React.useState<IUser[][]>([]);
  // const [departmentUsers, setDepartmentUsers] = React.useState<IUser[][]>([]);
  const [searchText, setSearchText] = React.useState<string>('');

  const handleUsers = (users: IUser[]): IUser[][] => {
    const handled: IUser[][] = [];
    // if (sortState === 'Alphabet') {
    const letters = new Set(users.map((x: IUser) => x.letter))
    letters.forEach(letter => handled.push(users.filter((x: IUser) => x.letter === letter)));
    handled.forEach(sorted =>
      sorted.sort((a: IUser, b: IUser) => (a.name > b.name ? 1 : -1)))
    return handled;
    // }
    // else {
    //   const letters = new Set(users.map((x: IUser) => x.department))
    //   letters.forEach(department => handled.push(users.filter((x: IUser) => x.department === department)));
    //   handled.forEach(sorted =>
    //     sorted.sort((a: IUser, b: IUser) => (a.department > b.department ? 1 : -1)))
    //   return handled;
    // }
  }
  const onGroupSelectChange = (ev: React.FormEvent<HTMLInputElement>, option: any): void => {
    setGroupState(option.key);
    filterUsers(option.key)
  }
  const onSortSelectChange = (ev: React.FormEvent<HTMLInputElement>, option: any): void => {
    setSortState(option.key);
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    const loadedGroupState = urlParams.get('ext') == "1" ? 'Guest' : 'Member';
    if (option.key === 'Alphabet') {
      getInternalUsers(props.context, props.cachingHours)
        .then(loadedMembers => {
          setMembers(loadedMembers);
          if (search) {
            if (loadedGroupState === 'Member') {
              filterUsers(loadedGroupState, search, loadedMembers);
            }
          }
          else setAlphabetUsers(handleUsers(loadedMembers));
        })
        .catch(console.error);
    }
    else {
      getInternalUsersDepartment(props.context, props.cachingHours)
        .then(loadedMembers => {
          setMembers(loadedMembers);
          if (search) {
            if (loadedGroupState === 'Member') {
              filterUsers(loadedGroupState, search, loadedMembers);
            }
          }
          else setAlphabetUsers(handleUsers(loadedMembers));
        })
        .catch(console.error);
    }
  }
  const filterUsers = (state = groupState, searchTextToFilter = searchText, fUsers: IUser[] = null): void => {

    // state = state || groupState;
    let users = fUsers || (state === 'Member' ? members : guests);
    users.forEach(user => {
      if (!user.phones) console.log('no phones ', user)
    })
    if (searchTextToFilter) users = users.filter(x => ((x.name + x.email + x.department + x.phones.join(' ')) || '').toLowerCase().includes(searchTextToFilter.toLowerCase()))
    setAlphabetUsers(handleUsers(users))
  }
  const onSearchKeyPressed = (ev: React.KeyboardEvent): void => {
    if (ev.key === 'Enter') filterUsers(groupState);
    if (ev.key === 'Escape') clearSearch();
  }
  const clearSearch = () => {
    setSearchText('');
    filterUsers(groupState, '')
  }
  const choiceGroupStyles = {
    flexContainer: [
      {
        selectors: {
          "div.ms-ChoiceField, label.ms-ChoiceField-field": {
            color: "#afafaf",
            background: "transparent",
            border: "transparent",
          },
          ".ms-ChoiceField-wrapper": {
            background: "transparent",
            border: "transparent",
          },
          "label.ms-ChoiceField-field.is-checked": {
            color: "#005976",
            background: "#f4fdff",
            borderRadius: "3px",
            boxShadow: "2px 2px 2px #00597624"
          },
          "label.ms-ChoiceField-field:hover": {
            color: "#005976",
            background: "#f4fdff",
            borderRadius: "3px",
            boxShadow: "3px 3px 3px #00597624"
          },
          "label.ms-ChoiceField-field:hover .ms-ChoiceFieldLabel": {
            color: "#005976",
          }
        }
      }
    ]
  };

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    const loadedGroupState = urlParams.get('ext') == "1" ? 'Guest' : 'Member';
    setGroupState(loadedGroupState);

    getInternalUsers(props.context, props.cachingHours)
      .then(loadedMembers => {
        // let activeInternalEmployees=loadedMembers.filter(x => x.accountEnabled == true);
        setMembers(loadedMembers);
        if (search) {
          if (loadedGroupState === 'Member') {
            filterUsers(loadedGroupState, search, loadedMembers);
          }
        }
        else setAlphabetUsers(handleUsers(loadedMembers));
      })
      .catch(console.error);

    getExternalUsers(props.context, props.cachingHours)
      .then(loadedUsers => {
        // let ActiveExternal=loadedUsers.filter(x => x.accountEnabled == true);
        setGuests(loadedUsers);
        if (search && loadedGroupState === 'Guest') {
          setSearchText(search);
          filterUsers(loadedGroupState, search, loadedUsers);
        }
      })
      .catch(console.error)
  }, []);

  return (
    <>
      <div className={styles.search}>
        <div className={styles.search_select}>
          <ChoiceGroup selectedKey={groupState} options={options} onChange={onGroupSelectChange} styles={choiceGroupStyles} />
        </div>
        <div className={styles.search_box}>
          {!!searchText && <FontIcon aria-label="Search" iconName="Clear" className={styles.clearSearch} onClick={() => clearSearch()} />}
          <input type="text" placeholder="חיפוש" onChange={e => { setSearchText(e.target.value); filterUsers(groupState, e.target.value) }}
            onKeyDown={onSearchKeyPressed} value={searchText} />
          <FontIcon aria-label="Search" iconName="Search" className={styles.search_box_icon} onClick={() => filterUsers(null)} />
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.container_title}>{props.title}</div>

        <div className={styles.container_wrapper}>
          <ChoiceGroup selectedKey={sortState} options={optionsSort} onChange={onSortSelectChange} styles={choiceGroupStyles} />
          {alphabetUsers.length > 0 && alphabetUsers.map(l => (
            <ul key={l[0].letter} className={styles.users}>
              <div className={styles.users_letter}>{l[0].letter}</div>
              {l.map(x => (
                <li className={styles.user} key={x.id}>
                  <div className={styles.user_image}>
                    <img src={'/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(x.accountName)} alt="img" />
                  </div>
                  <div className={styles.user_info}>
                    <h4>
                      <span>{x.name}</span>
                      <a href={`https://teams.microsoft.com/l/chat/0/0?users=${x.accountName}`} rel='noreferrer' target="_blank">
                        <img src={require('../../../assets/teamviewer.svg')} alt="img" />
                      </a>
                    </h4>
                    {x.jobTitle && <p>{x.jobTitle}</p>}
                    {x.department && <p>{x.department}</p>}
                    {!!x.phones?.length && <p>
                      {x.phones.map(phone => <a href={`tel:${phone}`} style={{ marginLeft: 8 }}>{phone}</a>)}
                    </p>}
                    {!!x.email && <p><a href={`mailto:${x.email}`}>{x.email}</a></p>}
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </>
  );
};

export default PeopleSearch;