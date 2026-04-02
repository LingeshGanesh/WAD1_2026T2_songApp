# Lowkify
Lowkify is a song and playlist manager for all music lovers. We are definitely not copying other similar application; it is purely coincidental. 😉

## Installation
1. Download zip or clone this repository
2. Open the terminal in the app folder and type the following
```
npm install
```
3. Create a file called `config.env` and type the following
```
DB=mongodb+srv://[USERNAME][PASSWORD].mongodb.net/[DATABASE]?retryWrites=true&w=majority
SECRET=[RANDOM_HASH_STRING]
```
Explanation:
- `DB` is your MongoDB connection string, including the parameters `?retryWrites=true&w=majority`.
- `SECRET` is a random hash string. Generate it with a **random hash generator**.

## Load Test Data
