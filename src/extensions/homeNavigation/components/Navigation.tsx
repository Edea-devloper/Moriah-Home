import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
// import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from '@pnp/sp';
import { format } from 'date-fns';
import { CommandBar, ICommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import * as React from 'react';
import styles from './Navigation.module.scss';
import { getNavItems, getInternalUsers/*, getExternalUsers*/ } from './service';
// import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import SearchUser from './SearchUser';
// import { Icon } from '@fluentui/react/lib/Icon';

// @ts-ignore
import Hebcal from 'hebcal';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
// const NAVIGATION_LIST_ID = '5e4c3d48-08e5-42ac-9963-5328097762ff';
const NAVIGATION_LIST_TITLE = 'TopNavigation';
const SEARCH_PAGE_URL = 'https://moriah1.sharepoint.com/_layouts/15/sharepoint.aspx?v=search&q=';
const SEARCH_USERS_KEY = 'SEARCH_USERS';
// const SEARCH_EXT_USERS_KEY = 'SEARCH_EXT_USERS';
export const CONTACT_PAGE = 'https://moriah1.sharepoint.com/sites/Home/SitePages/Contacts.aspx';

export interface INavigation {
    context: ApplicationCustomizerContext;
}

export interface IUser {
    accountEnabled: boolean;
    name: string;
    // hebrewName: string;
    email: string;
    id: number;
    phones: string[];
    jobTitle: string;
    department: string;
    imageUrl: string;
    isExternal: boolean;

}
export enum MobileSearchType { None, Contacts, General }

export const Navigation: React.FC<any> = (props: INavigation) => {
    const commandBar = React.createRef<ICommandBar>();
    const [navItems, setNavItems] = React.useState<ICommandBarItemProps[]>([]);
    const [navItemsWithSeacrh, setnavItemsWithSearch] = React.useState<ICommandBarItemProps[]>([]);
    const loginName = props.context.pageContext.user.loginName;
    const displayName = props.context.pageContext.user.displayName;
    const date = format(new Date(), 'dd-MM-yyyy');
    const hDate = new Hebcal.HDate().toString('h');
    const [searchText, setSearchText] = React.useState<string>("");
    const [searchUser, setSearchUser] = React.useState<string>('');
    const [users, setUsers] = React.useState<IUser[]>([]);
    // const [externalUsers, setExternalUsers] = React.useState<IUser[]>([]);
    const [windowSize, setWindowSize] = React.useState<number>(1920);
    const [mobileSearchMode, setMobileSearchMode] = React.useState<MobileSearchType>(MobileSearchType.None);
    React.useEffect(() => { setWindowSize(window.innerWidth); });

    // const getAndSetSearchUser = (value:string) => {
    //     if (!users.length) {
    //         const cachedUsers = localStorage.getItem(SEARCH_USERS_KEY);
    //         if (cachedUsers) setUsers (JSON.parse(cachedUsers));
    //         getAllUsers(sp).then(loadedUsers => {
    //             setUsers(loadedUsers);
    //             localStorage.setItem(SEARCH_USERS_KEY, JSON.stringify(loadedUsers));
    //         })
    //     }
    //     setSearchUser(value);
    // }

    const searchBoxStyles = {
        root: {
            border: '1px solid #fff',
            borderRadius: 20,
            background: 'transparent',
            height: 40,
            rootPressed: {
                color: '#fff',
            },
            rootFocused: {
                color: '#fff',
                outline: 0,
            },
            '&:focus': {
                outline: 0,
                color: '#fff',
            },
            '&::after': {
                border: 'none'
            },
            color: '#fff',
            '&:hover': {
                color: '#fff',
                borderColor: '#fff',
                '.ms-SearchBox-iconContainer': {
                    color: '#fff',
                }
            }
        },
        iconContainer: { color: '#fff' },
        field: {
            color: '#fff',
            fontSize: 16,
            '&::placeholder': {
                textOverflow: 'ellipsis !important',
                color: '#fff',
                fontSize: 16
            }
        },
        clearButton: {
            color: '#fff',
            '.ms-Button-icon': {
                color: '#fff',
            },
            '.ms-Button-icon:hover': {
                color: '#fff',
                backgroundColor: 'transparent'
            },
            // '&:hover': {
            //     '.ms-Button': {
            //         color: '#fff',
            //         background: 'transparent'
            //     }
            // },
            clearButtonHovered: {
                '.ms-Button': {
                    color: '#fff',
                    background: 'transparent'
                },
                '.ms-Icon': {
                    color: '#fff',
                    background: 'transparent'
                },

            }
        }
    }

    const getUsersOnFocus = () => {
        if (!users.length) {
            const cachedUsers = localStorage.getItem(SEARCH_USERS_KEY);
            if (cachedUsers) setUsers(JSON.parse(cachedUsers));
            getInternalUsers(props.context).then(loadedUsers => {
                console.log('loadedUsers', loadedUsers);
                // let activeInternalEmployees = loadedUsers.filter(x => x.accountEnabled == true);
                // console.log('activeInternalEmployees', activeInternalEmployees);
                setUsers(loadedUsers);
                localStorage.setItem(SEARCH_USERS_KEY, JSON.stringify(loadedUsers));
            })
            // const cachedExtUsers = localStorage.getItem(SEARCH_EXT_USERS_KEY);
            // if (cachedExtUsers) setExternalUsers(JSON.parse(cachedExtUsers));
            // const sp = spfi().using(SPFx(props.context));
            // getExternalUsers(sp).then(loadedUsers => {
            //     setExternalUsers(loadedUsers);
            //     localStorage.setItem(SEARCH_EXT_USERS_KEY, JSON.stringify(loadedUsers));
            // })
        }
        setSearchText('');
    }
    const onSearchChange = (_: any, searchText: string): void => {
        const value = (searchText || '').toLowerCase();
        setSearchUser(value);
    }
    const openSearchPage = (value: string): void => {
        window.open(SEARCH_PAGE_URL + value, '_blank');
        setSearchText("");
    }
    // const onSearchKeyPressed = (ev:React.KeyboardEvent):void => {
    //     if (ev.key === 'Enter') openSearchPage();
    //     if (ev.key === 'Escape') setSearchText("");
    // }

    // const onUserSearchKeyPressed = (ev:React.KeyboardEvent):void => {
    //     debugger;
    //     if (ev.key === 'Enter') window.open(CONTACT_PAGE + '?search='+ searchUser, '_blank') 
    //     if (ev.key === 'Escape') setSearchUser("");
    // }

    React.useEffect(() => {
        const sp = spfi().using(SPFx(props.context));
        const searchButtons: ICommandBarItemProps[] = [
            {
                key: 'searchContacts', text: 'חיפוש אנשי קשר', iconProps: { iconName: 'Phone' },
                onClick: () => setMobileSearchMode(mobileSearchMode === MobileSearchType.Contacts ? MobileSearchType.None : MobileSearchType.Contacts), split: true
            },
            {
                key: 'searchGeneral', text: 'חיפוש', iconProps: { iconName: 'Search' },
                onClick: () => setMobileSearchMode(mobileSearchMode === MobileSearchType.General ? MobileSearchType.None : MobileSearchType.General), split: true
            },
        ]
        getNavItems(sp, NAVIGATION_LIST_TITLE).then(items => {
            var navigationItems = items.concat(searchButtons);
            setnavItemsWithSearch(navigationItems);
        })
            .catch(e => console.error(e));
        getNavItems(sp, NAVIGATION_LIST_TITLE).then(setNavItems).catch(e => console.error(e));
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.nav}>
                <div className={styles.nav_main}>
                    <div className={styles.nav_main_logo}>
                        <a href={props.context.pageContext.web.absoluteUrl} >
                            <img src={require('../../../assets/logo.svg')} alt="logo" />
                        </a>
                    </div>
                    {windowSize > 521 && <div className={styles.nav_main_items}>
                        <CommandBar
                            componentRef={commandBar}
                            items={navItems}
                            overflowButtonProps={{ ariaLabel: 'GlobalNavButton' }}
                            className="commandBar-NAV"
                        />
                    </div>}
                </div>
                {/* <div className={styles.nav_middle}></div> */}
                <div className={styles.nav_end}>
                    <div className={styles.nav_search_group}>
                        {(windowSize > 521 || mobileSearchMode === MobileSearchType.General) &&
                            <div className={styles.nav_search}>
                                <div className={styles.nav_search_box}>
                                    <div className={styles.nav_search_box}>
                                        <SearchBox
                                            onFocus={() => setSearchUser('')}
                                            placeholder="חיפוש"
                                            onChange={e => setSearchText(e.target.value)}
                                            onSearch={value => openSearchPage(value)}
                                            value={searchText}
                                            disableAnimation
                                            styles={searchBoxStyles}
                                            className={styles.searchBox}
                                        />
                                    </div>
                                </div>
                            </div>}
                        {(windowSize > 521 || mobileSearchMode === MobileSearchType.Contacts) &&
                            <div className={styles.nav_search}>
                                <div className={styles.nav_search_box}>
                                    <SearchBox
                                        onFocus={getUsersOnFocus}
                                        placeholder="חיפוש אנשי קשר"
                                        onChange={onSearchChange}
                                        onSearch={userValue => window.open(CONTACT_PAGE + '?search=' + userValue, '_blank')}
                                        value={searchUser}
                                        disableAnimation
                                        styles={searchBoxStyles}
                                        className={styles.searchBox}
                                        iconProps={{ iconName: 'Phone' }}
                                    />
                                    {searchUser && searchUser.length > 0 && <SearchUser value={searchUser.toLowerCase()} users={users} /*externalUsers={externalUsers}*/ setSearchUser={setSearchUser}></SearchUser>}
                                </div>
                            </div>}
                    </div>
                    <div className={styles.nav_end_image}>
                        <img src={'/_layouts/15/userphoto.aspx?size=M&accountName=' + encodeURIComponent(loginName)} alt="user" />
                    </div>
                    <div className={styles.nav_end_info}>
                        <h4>שלום {displayName}</h4>
                        <p>תאריך: {hDate} | {date}</p>
                    </div>
                </div>
            </div>
            {windowSize <= 521 && <div className={styles.nav_main_items}>
                <CommandBar
                    componentRef={commandBar}
                    items={navItemsWithSeacrh}
                    overflowButtonProps={{ ariaLabel: 'GlobalNavButton' }}
                    className="commandBar-NAV"
                />
            </div>}
            {(mobileSearchMode !== MobileSearchType.None) && <div className={styles.nav_plus} />}
            {windowSize <= 453 && mobileSearchMode === MobileSearchType.None && <div className={styles.nav_between} />}
            {windowSize > 453 && mobileSearchMode === MobileSearchType.None && <div className={styles.nav_minus} />}
        </header>
    )
}

