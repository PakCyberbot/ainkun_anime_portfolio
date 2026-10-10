"""Stage public files for GitHub Pages, without publishing repository metadata."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
output = root / '_site'
output.mkdir(exist_ok=True)
for pattern in ('*.html', '*.css', '*.js'):
    for source in root.glob(pattern):
        shutil.copy2(source, output / source.name)
for name in ('assets', 'data'):
    shutil.copytree(root / name, output / name, dirs_exist_ok=True)
for name in ('mainimage.png', 'card-main-image.jpeg', 'card-top-left-small.jpeg', '.nojekyll'):
    shutil.copy2(root / name, output / name)
print('Static site staged in _site/')
