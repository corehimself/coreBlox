</details>
<p align="center" style="margin: 0;">
  <img src="https://i.imgur.com/KCz7vsy.png" alt="" width="80" height="80">
</p>
<p align="center" style="margin: 0.1;"><strong>coreBlox</strong></p>
<p align="center" style="margin: 0;">A Discord to Roblox utility</p>
<p align="center" style="margin: 0.1;"><a href="">Explore the docs »</a></p>
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
      <li><a href = "#managing-your-roblox-api-key">Managing An API Key</a></li>
      <li><a href="#managing-universes">Managing Universes</a></li>
      <li><a href="#moderation-management">Moderation Management</a></li>
      <li><a href="#logging-management">Logging Management</a></li>
      <li><a href="#appeal-system">Appeal System</a></li>
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

* `BOT_TOKEN`: Your [discord bots token](https://discord.com/developers/applications)
* `MONGODB_URI`: Your [mongo DB connection URL](https://www.mongodb.com/docs/manual/reference/connection-string/) used for starting your bot when connected
* `ENCRYPTION_KEY`: A random secure 16+ character key used for encoding & decoding

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

### Moderation Management
* `/game get-restriction <server> <identifier> <history>`: Returns any restrictions or bans for a specified player from a universe
* `/game warn <server> <player> <reason>`: Warns a user in game with a specified reason
* `/game kick <server> <player> <reason>`: Kicks a user in game
* `/game ban <server> <player> <duration> <length> <display-reason>`: Bans a user using the [Ban API](https://devforum.roblox.com/t/introducing-the-ban-api-and-alt-account-detection/3039740)
* `/game unban <server> <player> <reason>`: Unbans a user using the [Ban API](https://devforum.roblox.com/t/introducing-the-ban-api-and-alt-account-detection/3039740)

### Logging Management
* `/logging enabled <boolean>`: Sets whether actions are logged
* `/logging set <ban-appeals/moderation> <channel>`: Sets the specified channel as the logging channel for the set action (ban-appeals/moderation)
* `/logging remove <channel>`: Removes logging for a specified channel (moderation/results)

### Appeal System
* `/send-application <channel>`: Sends the unban application form to the specified channel

### Bot Configuration
* `/bot-role set <role>`: Sets the specified role as a Bot Executor (overwrites)
* `/bot-role remove`: Removes any configured roles

## Roadmap
* [X] ~~*Complete docs*~~ [2024-08-26]
* [ ] Doc styling *(help images)*
* [ ] Tutorial video
* [ ] API Key verification
* [ ] Prompt multiple users on action lookup
* [ ] Allow developers to configure forms/default embeds

## Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License
coreBlox is distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Contact
* Elijah King - [@xCor_e](https://twitter.com/xCor_e) - corehimself@gmail.com
* Project: https://github.com/corehimself/coreBlox