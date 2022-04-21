# Plugins Galore

This is an [Obsidian](https://obsidian.md/) plugin to allow easily sideloading other plugins.

## Why Sideload Plugins?

Not every plugin is going to be in the [official plugin directory](https://obsidian.md/plugins). If there's a plugin you want that isn't there, you would have to manually download the files and put them in the `.obsidian/plugins` directory under your vault. What a drag! Plugins Galore allows you to simply paste the url of a repository and it will automatically install it for you. Since Obsidian presumably doesn't know how to check for updates for these plugins, Plugins Galore also checks for updates, but only when you ask it to.

**DISCLAIMER: It is not recommended to install a plugin made by someone you don't trust, so please make sure you understand the security risks of sideloading plugins before using this**

## How to Use

### Adding a plugin

Paste in the url of a plugin repo (e.g. `https://github.com/dylanpizzo/obsidian-plugins-galore`) and then click "Install". Simple as that. After that, the plugin is installed like any other, and you can enable/disable/remove it just like any other in the regular "Community Plugins" tab in the Obsidian Settings. The repo can be installed from [GitHub](https://github.com/) or any [GitLab](https://gitlab.com/) (untested) or [Gitea](https://gitea.io/) instance.

### Updating plugins

To update plugins installed through Plugins Galore, click the "Check for updates" button, and then if there are any plugins that can be updated, you can decide which ones (if any) to update.

## Related Plugins

See also [Obsidian42 - BRAT](https://github.com/TfTHacker/obsidian42-brat) which similarly allows sideloading plugins, but is targeted more at beta-testers, whereas this plugin is meant as a way for plugin developers to easily distribute actual releases of their plugins if they don't want to be a part of the official plugin directory.

## Future Features

Tentative Roadmap:
- Allow users to see the plugins they've installed through Plugins Galore, and view READMEs
- Create a plugin browser to search unofficial plugin directories to find more plugins
- Give the user more control and transparency into the plugins installed
- Allow users to opt to download the source of plugins and transpile plugins themselves

## How it works (under the hood)

This section is mostly irrelevant, even for developers, but for those curious, we store a `.galore` file in any plugin directory of a plugin installed through Plugins Galore. This `.galore` file contains relevant information about where the repo is stored, and what release tag the currently installed version of the plugin is, so we can compare to look for updates.
