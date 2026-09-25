const seasons=['春季','夏季','秋季','冬季'];
export function queryGifts(data,{villager,item,season}={}) {
  const villagers=data.villagers.filter(v=>(!villager||v.id===villager)&&(!item||v.giftIds.includes(item))&&(!season||v.birthday?.season===season))
    .toSorted((a,b)=>((seasons.indexOf(a.birthday?.season)+4)%4-(seasons.indexOf(b.birthday?.season)+4)%4)||((a.birthday?.day||99)-(b.birthday?.day||99))||a.name.localeCompare(b.name,'zh-CN'));
  return {villagers,gifts:data.gifts,total:villagers.length};
}
