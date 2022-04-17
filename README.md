# Plugins Galore

This is an [Obsidian](https://obsidian.md/) plugin to allow easily sideloading other plugins.

## Why Sideload Plugins?

Not every plugin is going to be in the [official plugin directory](https://obsidian.md/plugins). If there's a plugin you want that isn't there, you would have to manually download the files and put them in the `.obsidian/plugins` directory under your vault. What a drag! Plugins Galore allows you to simply paste the full name of a repository and it will automatically install it for you. Since Obsidian presumably doesn't know how to check for updates for these plugins, Plugins Galore also checks for updates, but only when you ask it to.

**DISCLAIMER: It is not recommended to install a plugin made by someone you don't trust, so please make sure you understand the security risks of sideloading plugins before using this**

## How to Use

### Adding a plugin

Paste in the full name of a [GitHub](https://github.com) repo (e.g. `username/the-name-of-the-repo`) and then click "Install". Simple as that. After that, the plugin is installed like any other, and you can enable/disable/remove it just like any other in the regular "Community Plugins" tab in the Obsidian Settings.

### Updating plugins

To update plugins installed through Plugins Galore, click the "Check for updates" button, and then if there are any plugins that can be updated, you can decide which ones (if any) to update.

## Related Plugins

See also [Obsidian42 - BRAT](https://github.com/TfTHacker/obsidian42-brat) which similarly allows sideloading plugins, but is targeted more at beta-testers, whereas this plugin is meant as a way for plugin developers to easily distribute actual releases of their plugins if they don't want to be a part of the official plugin directory.

## Future Features

Tentative Roadmap:
- Allow repositories from [Gitea](https://gitea.io) and [GitLab](https://gitlab.com) instances
- Create a plugin browser to search unofficial plugin directories to find more plugins
