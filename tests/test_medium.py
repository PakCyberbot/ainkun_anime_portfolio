import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('refresh_medium', Path(__file__).resolve().parents[1] / 'scripts' / 'refresh_medium.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class MediumParserTests(unittest.TestCase):
    def test_rss_metadata_and_plain_text_excerpt(self):
        xml = b'''<rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item>
        <title>Research &amp; notes</title><link>https://ainkun.medium.com/research?source=rss</link>
        <pubDate>Wed, 06 Sep 2023 00:10:29 GMT</pubDate><category>security</category>
        <content:encoded><![CDATA[<h1>Research &amp; notes</h1><p>Hello <b>world</b>.</p><script>bad()</script><img src="https://cdn-images-1.medium.com/test.png">]]></content:encoded>
        </item></channel></rss>'''
        post = module.parse_feed(xml)[0]
        self.assertEqual(post['title'], 'Research & notes')
        self.assertEqual(post['url'], 'https://ainkun.medium.com/research')
        self.assertEqual(post['excerpt'], 'Hello world')
        self.assertEqual(post['tags'], ['security'])
        self.assertEqual(post['image'], 'https://cdn-images-1.medium.com/test.png')

    def test_empty_feed_is_valid(self):
        self.assertEqual(module.parse_feed(b'<rss><channel/></rss>'), [])

    def test_wrong_response_does_not_become_empty_success(self):
        with self.assertRaises(ValueError):
            module.parse_feed(b'<html><body>Server unavailable</body></html>')

    def test_bad_urls_and_duplicate_articles_are_ignored(self):
        items = ''.join(f'<item><title>A</title><link>{link}</link></item>' for link in [
            'https://medium.com.evil.test/post', 'javascript:alert(1)', 'https://ainkun.medium.com/post', 'https://ainkun.medium.com/post?source=rss'])
        posts = module.parse_feed(f'<rss><channel>{items}</channel></rss>'.encode())
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0]['publishedAt'], '')


if __name__ == '__main__':
    unittest.main()
