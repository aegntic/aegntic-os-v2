"""Render original schematic social artwork; not a screenshot or a live-run claim.
Run with a local Python environment providing Pillow. No packages are installed.
"""
from pathlib import Path
import argparse


def render(output, width, height, font_dir):
    from PIL import Image, ImageDraw, ImageFont
    scale = width / 1200
    image = Image.new('RGB', (width, height), '#f0eee7')
    draw = ImageDraw.Draw(image)
    def font(name, size):
        return ImageFont.truetype(str(font_dir / name), round(size * scale))
    def point(x, y):
        return round(x * scale), round(y * scale)
    def line(points, fill, size=1):
        draw.line([point(x,y) for x,y in points], fill=fill, width=max(1,round(size*scale)))
    draw.text(point(60,42), 'AEGNTIC / THE WORKING DRAFT', fill='#273b38', font=font('LiberationSans-Regular.ttf',17))
    line([(60,82),(1140,82)],'#c8ccc0')
    square = height >= width
    y = 150 if not square else 170
    draw.text(point(56,y), 'Good ideas.', fill='#20332f', font=font('LiberationSans-Regular.ttf',88))
    draw.text(point(54,y+91), 'Useful work.', fill='#20332f', font=font('LiberationSerif-Italic.ttf',96))
    draw.text(point(61,y+224), 'Brief. Review. Refine.', fill='#59665c', font=font('LiberationSans-Regular.ttf',25))
    cx,cy = (900,300) if not square else (610,700)
    # An isometric exploded stack expresses the same assembly metaphor as the model.
    for layer in range(3):
        yy=cy+95-layer*85
        top=[(cx-180,yy),(cx,yy-73),(cx+180,yy),(cx,yy+73)]
        front=[top[0],top[3],(cx,yy+88),(cx-180,yy+15)]
        side=[top[3],top[2],(cx+180,yy+15),(cx,yy+88)]
        draw.polygon([point(*p) for p in front],fill='#a0afac')
        draw.polygon([point(*p) for p in side],fill='#4b6460')
        draw.polygon([point(*p) for p in top],fill='#dbe3dd',outline='#7c9890',width=max(1,round(scale)))
        inner=[(cx-145,yy),(cx,yy-55),(cx+145,yy),(cx,yy+55)]
        draw.polygon([point(*p) for p in inner],fill='#294740' if layer==1 else '#bed0c8')
        line([(cx-140,yy+7),(cx,yy+61),(cx+140,yy+7)],'#749f90',2)
    bottom=height/scale-94
    line([(60,bottom-25),(1140,bottom-25)],'#c8ccc0')
    draw.text(point(60,bottom), 'FOLLOW THE BUILD',fill='#273b38',font=font('LiberationSans-Regular.ttf',18))
    draw.text(point(790,bottom), 'build.aegntic.ai',fill='#273b38',font=font('LiberationSans-Regular.ttf',22))
    image.save(output, optimize=True)


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--font-dir',type=Path,default=Path('/usr/share/fonts/liberation'))
    args=parser.parse_args()
    destination=Path(__file__).resolve().parents[1]/'launch-site/public/social'
    render(destination/'pavilion-landscape.png',1200,630,args.font_dir)
    render(destination/'pavilion-square.png',1080,1080,args.font_dir)
