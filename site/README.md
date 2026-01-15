Site folder for Hugo-based resume site.

Theme note
----------

This repository does not include a theme by default. To add a theme, install it into `site/themes/<theme-name>` and set `theme = "<theme-name>"` in `site/hugo.toml`.

Example (Porto):

	git clone https://github.com/hugo-porto/theme themes/porto

Then run the local server from the repository root:

```
hugo server -s site -D
```