import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { SPFI } from "@pnp/sp";
import { IImage } from "./PhotoGallery";

export const getImages = (sp: SPFI, listId:string):Promise<IImage[]> => {
    return sp.web.lists.getById(listId).items
    .select('Id','Title','File/ServerRelativeUrl','LinkUrl','IsNewTab','ordering')
    .filter('IsActive eq 1')
    .expand('File')
    .orderBy('ordering')().then(items=> 
        items.map(x=>{        
            return {
                title:x.Title, 
                imageUrl: x.File.ServerRelativeUrl, 
                key:x.Id,
                linkUrl: x.LinkUrl,
                isNewTab: x.IsNewTab,
                ordering:x.ordering
            }
        })
    )
    .catch((e) => {console.error("Could not get news/updates", e); return []});
}