import fs from 'node:fs/promises';
const images = {
  hero: 'photo-1611652022419-a9419f74343d',
  earrings: 'photo-1535632066927-ab7c9ab60908',
  rings: 'photo-1605100804763-247f67b3557e',
  necklace: 'photo-1599643477877-530eb83abc8e',
  bracelet: 'photo-1611591437281-460bfbe1220a',
  gold: 'photo-1617038260897-41a1f14a8ca0'
};
await Promise.all(Object.entries(images).map(async ([name,id])=>{
 try {const r=await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${name==='hero'?1600:800}&q=85`); if(!r.ok)throw Error(r.status); await fs.writeFile(`public/images/${name}.jpg`,new Uint8Array(await r.arrayBuffer())); console.log(name,'downloaded');}catch(e){console.log(name,String(e));}
}));
