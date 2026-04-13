import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { SPFI } from "@pnp/sp";
import { INews } from "./NewsSlider";

export const getNews = (sp: SPFI, listId:string):Promise<INews[]> => sp.web.lists.getById(listId).items
.select('Title','Description0','Order0','File/ServerRelativeUrl','Url', 'Id')
.expand('File')
.filter('IsActive eq 1').orderBy('Order0', false)().then(items=> {  
    const news:INews[] = items.map(x=>({
        imageUrl: x.File.ServerRelativeUrl,
        title: x.Title,
        description: x.Description0,
        newsUrl: x.Url,      
        key: x.Id,      
        }))
    return news
})
.catch((e) => {console.error("Could not get news/updates", e); return []});