"""Fetch public Medium RSS into a portable, same-origin feed. Standard library only."""
import argparse
import datetime as dt
import email.utils
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
import urllib.request
from urllib.parse import urlsplit, urlunsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
FEED = 'https://ainkun.medium.com/feed'
OUTPUT = ROOT / 'data' / 'medium.json'


class ArticleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.image = ''
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1
        if tag == 'img' and not self.image:
            value = dict(attrs).get('src', '')
            host = urlsplit(value).hostname or ''
            if value.startswith('https://') and host.endswith('.medium.com'):
                self.image = value
        if tag in ('p', 'br', 'h1', 'h2', 'h3', 'li'):
            self.parts.append(' ')

    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.skip:
            self.skip -= 1
        if tag in ('p', 'h1', 'h2', 'h3', 'li'):
            self.parts.append(' ')

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def parse_feed(data):
    root = ET.fromstring(data)
    channel = root.find('channel')
    if channel is None:
        raise ValueError('Response is not an RSS feed')
    posts, seen = [], set()
    for item in channel.findall('item'):
        title = (item.findtext('title') or '').strip()
        url = urlsplit((item.findtext('link') or '').strip())
        host = url.hostname or ''
        if not title or url.scheme != 'https' or not (host == 'medium.com' or host.endswith('.medium.com')):
            continue
        link = urlunsplit((url.scheme, url.netloc, url.path, '', ''))
        if link in seen:
            continue
        seen.add(link)
        parsed = ArticleText()
        parsed.feed(item.findtext('{http://purl.org/rss/1.0/modules/content/}encoded') or item.findtext('description') or '')
        excerpt = re.sub(r'\s+', ' ', ''.join(parsed.parts)).strip()
        if excerpt.startswith(title):
            excerpt = excerpt[len(title):].strip()
        excerpt = excerpt.replace('Continue reading on Medium', '').strip(' .\u00bb')
        if len(excerpt) > 190:
            excerpt = excerpt[:190].rsplit(' ', 1)[0] + '\u2026'
        try:
            date = email.utils.parsedate_to_datetime(item.findtext('pubDate')).astimezone(dt.timezone.utc).isoformat()
        except (TypeError, ValueError, OverflowError):
            date = ''
        posts.append({'title': title, 'url': link, 'publishedAt': date,
                      'excerpt': excerpt, 'image': parsed.image,
                      'tags': [x.text for x in item.findall('category') if x.text][:3]})
    posts.sort(key=lambda post: post['publishedAt'], reverse=True)
    return posts[:10]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--direct', action='store_true', help='Ignore environment proxies for this request')
    parser.add_argument('--allow-stale', action='store_true', help='Retain the bundled feed if Medium is temporarily unavailable')
    args = parser.parse_args()
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({})) if args.direct else urllib.request.build_opener()
        request = urllib.request.Request(FEED, headers={'User-Agent': 'ainkun-portfolio/1.0 (public RSS reader)'})
        with opener.open(request, timeout=25) as response:
            data = response.read(2_000_001)
        if len(data) > 2_000_000:
            raise ValueError('RSS response exceeds 2 MB')
        posts = parse_feed(data)
        payload = {'source': FEED, 'profile': 'https://ainkun.medium.com',
                   'fetchedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'posts': posts}
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        temporary = OUTPUT.with_suffix('.tmp')
        temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        temporary.replace(OUTPUT)
        print(f'Refreshed {len(posts)} Medium articles in data/medium.json')
    except Exception as error:
        if args.allow_stale and OUTPUT.exists():
            existing = json.loads(OUTPUT.read_text(encoding='utf-8'))
            if isinstance(existing.get('posts'), list) and existing.get('source') == FEED:
                print(f'WARNING: Medium refresh failed; keeping feed from {existing.get("fetchedAt")}: {error}', file=sys.stderr)
                return
        raise


if __name__ == '__main__':
    main()
