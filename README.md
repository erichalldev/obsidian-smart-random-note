![Downloads](https://img.shields.io/github/downloads/erichalldev/obsidian-smart-random-note/total.svg)

# Smart Random Note Obsidian Plugin
This plugin enhances opening random notes.

Three commands are available:
- Open Random Note from Search: opens a random note from the list of search results.
- Open Tagged Random Note: opens a random note that has a selected tag.
- Open Random Note: behaves similarly to the core random note plugin.

![Screenshot](https://raw.githubusercontent.com/erichalldev/obsidian-smart-random-note/master/screenshot.gif)

## Future Plans
- Remember which notes have been seen for a given search string. 
  - Don't show the same note again until all have been seen or a certain amount of time has elapsed.

## Installation

### From within Obsidian
From Obsidian 0.9.8, you can activate this plugin within Obsidian by doing the following:
- Open Settings > Third-party plugin
- Make sure Safe mode is **off**
- Click Browse community plugins
- Search for "Smart Random Note"
- Click Install
- Once installed, close the community plugins window and activate the plugin

## Compatibility
Custom plugins are officially supported in Obsidian version 0.9.7. This plugin currently targets API version 0.9.15 but should be compatible with version 0.9.7 or higher.

## Version History
### 0.1.0
- Add command for opening a random note from the current search results
- Add setting to add a button to the ribbon for opening a random note from the current search results
- Add setting to open the random note in the active leaf or a new leaf

### 0.0.5
- Initial Release
- Add command for opening a random note from all notes
- Add command for opening a random note given a tag
