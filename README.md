
# subtool
A free project made in 5 days for an interview
A collaborative tool to translate subtitles from a language to another, editing the same file in group, through packs locking/unlocking, packs validation, links, pre-translation functionnalities.

Press enter to valid your entry, shift-enter to newline. Use '#' + the number of the subtitle to link in the chat (ex: "need help at #124"). Clic on the project bar on top to go to the selected pack. Add a rule (ex: Darth Vader => Dark Vador) to highlight every occurence of the word and suggest its defined translation when cursor is on. 
Then export it :)

## Project setup
First, be sure to have node and mysql installed, then :
```
./loadAll.sh
```
will create a mysql user (requiring you to logg with root, usual default password : '' or 'OS session password'), install packages, init database and launch dev server.
Then you have to start server :
```
cd server/
npm run start
```
