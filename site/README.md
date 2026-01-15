Site folder for Hugo-based resume site.

Theme note
----------

This repository does not include a theme by default. To add a theme, install it into `site/themes/<theme-name>` and set `theme = "<theme-name>"` in `site/hugo.toml`.

Example (Porto as a submodule using the repository's preferred name):

	git submodule add https://github.com/hugo-porto/theme site/themes/hugo-porto

Then run the local server from the repository root:

```powershell
hugo server -s site -D
```