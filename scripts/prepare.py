"""Prepare an optimized, self-contained GitHub Pages gallery."""
from pathlib import Path
from PIL import Image, ImageOps
import json, concurrent.futures, hashlib

SITE=Path(__file__).resolve().parents[1]
ROOT=SITE.parent
records=json.loads((ROOT/'_collection/manifest.json').read_text(encoding='utf-8'))
for sub in ['thumbs','pictures']:(SITE/'assets'/sub).mkdir(exist_ok=True)

def prepare(pair):
    n,r=pair
    ident=hashlib.sha256(r['file'].encode()).hexdigest()[:14]
    dest=SITE/'assets'/'pictures'/(ident+'.webp')
    thumb=SITE/'assets'/'thumbs'/(ident+'.webp')
    if not dest.exists() or not thumb.exists():
        with Image.open(ROOT/r['file']) as im:
            im=ImageOps.exif_transpose(im).convert('RGBA')
            large=im.copy()
            large.thumbnail((1200,1200),Image.Resampling.LANCZOS)
            large.save(dest,'WEBP',quality=92,method=0)
            small=im.copy()
            small.thumbnail((320,320),Image.Resampling.LANCZOS)
            small.save(thumb,'WEBP',quality=84,method=0)
    with Image.open(dest) as im:w,h=im.size
    out={'id':ident,'name':r['name'],'platform':r['platform'],'category':r['category'],'width':w,'height':h}
    if r.get('generation'):out['generation']=r['generation']
    return out

with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
    out=[]
    for row in pool.map(prepare,enumerate(records)):
        out.append(row)
        if len(out)%5000==0:print('Prepared',len(out),'of',len(records),flush=True)
(SITE/'assets/catalog.js').write_text('window.AVATARS='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
print('Prepared',len(out),'avatars;',round(sum(p.stat().st_size for p in (SITE/'assets').rglob('*') if p.is_file())/1024**2,1),'MB',flush=True)
