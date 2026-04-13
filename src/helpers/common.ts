export const cashUserLink = (storageKey: string, id: number):void => {
    const cachedOrder = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (cachedOrder.length && cachedOrder[0] === id) return;
    const index = cachedOrder.findIndex((x:number)=>x===id);    
    if (index>-1) cachedOrder.splice(index,1);
    cachedOrder.unshift(id);
    localStorage.setItem(storageKey, JSON.stringify(cachedOrder))
} 

export const applyCachedOrder = (storageKey: string, data:any[]): any[] => {
    const cachedOrder = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (!cachedOrder.length) return data;
    const removedItems: number[] = [];
    const userItems: any[]  = [];
    cachedOrder.forEach((id:number, index:number)=> {
        const currentIndex = data.findIndex(x=>x.key === id)
        if (currentIndex === -1) removedItems.unshift(index)
        else userItems.push(...data.splice(currentIndex, 1))
    });
    if (removedItems.length) {
        for (const i  of removedItems) cachedOrder.splice(i, 1);
        localStorage.setItem(storageKey, JSON.stringify(cachedOrder))
    }
    return [...userItems, ...data];
}
