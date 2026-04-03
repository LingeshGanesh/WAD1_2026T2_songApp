# 🎶 Lowkify
Lowkify is a web application built for music lovers who want a simple and enjoyable way to manage songs and playlists. In addition to playlist creation and song browsing, the platform also supports albums, reviews, events, and user interaction features, creating a more connected and engaging music-sharing experience.

# 📋 Index
- [⚙️ Installation](#️-installation)
- [📂 Load Test Data](#-load-test-data)
- [🤖 Use of AI](#-use-of-ai)
- [👥 Team](#-team)


# ⚙️ Installation
1. Install npm and nodejs.
2. Download zip or clone this repository
3. Open the terminal in the app folder and type the following
```
npm install
```
4. Create a file called `config.env` and type the following

<details>
<summary>Explanation</summary>

- `DB` is your MongoDB connection string, including the parameters `?retryWrites=true&w=majority`.
- `SECRET` is a random hash string. Generate it with a **random hash generator**.
</details>

```
DB=mongodb+srv://[USERNAME][PASSWORD].mongodb.net/[DATABASE]?retryWrites=true&w=majority
SECRET=[RANDOM_HASH_STRING]
```

5. Run the server, then connect to [localhost:8000](http://localhost:8000/)
```
node server.js
```

# 📂 Load Test Data
1. Run `seed-all.js`.
```
node scripts/seed-all.js
```
2. You can log in as `admin` (no, you are still a normal user)
```
email    : admin@admin.com
password : Admin123!
```

# 🤖 Use of AI
1. Debugging of code
2. Styling and Design of the pages
3. Scripts folder (dummy data) generated


# 👥 Team
| Name | Task |
|------|------|
| Caro | User |
| Eugene | Album |
| Harvin | Playlist |
| Jon | Song |
| Lingesh | Event |
| Maegan | Review |