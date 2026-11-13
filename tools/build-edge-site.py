from pathlib import Path
import shutil
R=Path(__file__).resolve().parents[1];out=R/'_site';out.mkdir(exist_ok=True)
for p in R.iterdir():
 if p.is_file() and (p.suffix in ['.js','.css','.html'] or p.name in ['VERSION.json','README.md','ARTWORK_V08.md','COLLECTION_V09.md','.nojekyll']):shutil.copyfile(p,out/p.name)
shutil.copytree(R/'assets',out/'assets',dirs_exist_ok=True)
print('Prepared static site in _site; cached generation files are excluded')
