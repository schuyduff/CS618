import re, urllib.request

LIVE = "https://cs618-frontend-268179805236.us-central1.run.app"

def get(url):
    return urllib.request.urlopen(url, timeout=20).read().decode("utf-8", "replace")

html = get(LIVE + "/")
css_pat = re.compile(r'/assets/index-[A-Za-z0-9_-]+\.css')
css_href = sorted(set(css_pat.findall(html)))[0]
css = get(LIVE + css_href)

print("live css href:", css_href, " bytes:", len(css))
print()
# marker 1 — minified form (no space after ':')
print("live flex-direction:column (has-space=minified)?", css.count("flex-direction:column"))
# marker 2 — selector survives minification (space between compound selectors kept)
print("live '.site-header nav {':", css.count(".site-header nav {"))
# marker 3 — accent var (minifier keeps var tokens, strips only non-essential spaces around braces not inside tokens)
print("live --accent occurrences:", css.count("--accent"))
