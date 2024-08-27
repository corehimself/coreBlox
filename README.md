</details>
<p align="center" style="margin: 0;">
  <img src="https://i.imgur.com/KCz7vsy.png" alt="" width="80" height="80">
</p>
<p align="center" style="margin: 0.1;"><strong>coreBlox</strong></p>
<p align="center" style="margin: 0;">A Discord to Roblox utility</p>
<p align="center" style="margin: 0.1;"><a href="URL_OF_YOUR_LINK">Explore the docs »</a></p>
<p align="center" style="margin: 0;">
  <a href="">View Demo</a> · 
  <a href="">Report Bug</a> · 
  <a href="">Request Feature</a>
</p>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">Information</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <ul>
        <li><a href = "#prerequisites">Prerequisites</a></li>
        <li><a href = "#installation">Installation</a></li>
        <li><a href = "#setup">Setup</a></li>
    </ul>
    <li><a href="#usage">Usage</a></li>
    <ul>
      <li><a href = "#managing-your-roblox-api-key">Managing an API key</a></li>
      <li><a href="#managing-universes">Managing universes</a></li>
      <li><a href="#managing-bansunbans">Managing bans/unbans</a></li>
      <li><a href="#bot-configuration">Bot configuration</a></li>
    </ul>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About the Project
There are <strong>tons</strong> of Roblox < - > Discord bots, however I didn't find one that suited my needs so I've created <strong>coreBlox</strong>! I've decided to create this bot, as most bots seemed to lack the simplicity of User verification. As you handle actions on a user, verifications ensuring it's the correct player are ran, and all moderated actions will be logged!

## Getting Started

### Prerequisites
Install the latest version of node applicable
- [node v16+](https://nodejs.org/en/download/package-manager)
```markdown
npm install npm@latest-g
```

### Installation
- Fork the repository / download the latest release
- Install package modules in a preferred terminal of your choice
```markdown
npm install
```
- Install & place the [Roblox Script](coreBlox/Roblox/DTR.server.lua) into **ServerScriptService**

### Setup
- Firstly, head over to your .env file and set your `BOT_TOKEN`, `MONGODB_URI` and `ENCRYPTION_KEY` respectively.

`BOT_TOKEN`: Your discord bots token

`MONGODB_URI`: Your mongo DB connection URL used for starting your bot when connected

`ENCRYPTION_KEY`: A random strong 16+ character key used for encoding & decoding

## Usage
Once your bot is properly configured, running `node .` in the terminal will bring your bot online!

### Managing your Roblox API key
* More information on retrieving your key can be found [here](https://create.roblox.com/docs/cloud/open-cloud/api-keys)
* `/api-key set <YOUR_RETRIEVED_KEY>`: Sets/Overwrites a set API key
* `/api-key remove`: Removes the configured API key

### Managing Universes
* `/universe add <game_name> <universe_id>`: Adds `<game_name>` to the database
* `/universe remove <game_name>`: Removes `<game_name>` from the database
* `/universe list`: Lists all saved universes

### Managing Bans/Unbans

### Bot Configuration
* `/bot-role set <role>`: Sets the specified role as a Bot Executor (overwrites)
* `/bot-role remove`: Removes any configured roles
* `/logging enabled <boolean>`: Sets whether actions are logged
* `/logging remove <channel>`: Removes logging for a specified channel (moderation/results)

## Roadmap
* [ ] Complete docs
* [ ] Video release
* [ ] API Key verification
* [ ] Prompt multiple users on action lookup

## License
coreBlox is distributed under the MIT License.
<details>
  <summary>View License</summary>

```markdown
MIT License

Copyright (c) 2024 Elijah T. K.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```