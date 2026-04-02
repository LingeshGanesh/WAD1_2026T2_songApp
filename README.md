# 🎶 Lowkify
Lowkify is a song and playlist manager for all music lovers. We are definitely not copying other similar application; it is purely coincidental. 😉

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
Run `seed-all.js`.
```
node scripts/seed-all.js
```

# 🤖 Use of AI
...

# 👥 Team
| Name | Task |
|------|------|
| Caro | User |
| Eugene | Album |
| Harvin | Playlist |
| Jon | Song |
| Lingesh | Event |
| Maegan | Review |