# 🧱 Jenga Choices

An interactive web application built with React, Vite, and TypeScript, designed to serve as a digital prompt deck for a customized Jenga party game. This tool replaces traditional written prompts on physical blocks with instant-action party challenges, perfectly tailored to a standard 54-block tower.

🔗 **Live Demo:** [https://bng94.github.io/jenga-choices/](https://bng94.github.io/jenga-choices/)

## The Inspiration & What It Does

As a frontend developer and tabletop game hobbyist, Jenga is a staple at game nights with friends and family. We always ran into the same friction points: wasted playtime debating prompts on the spot, or memorized written decks that killed the surprise.

I built Jenga Choices as a passion project to solve this. It acts as a digital companion that sits on your phone while the physical tower sits on the table. You still play with real blocks, but the app handles the prompts.

When a player successfully pulls a block, they tap the app to reveal an instant, randomized challenge. No more writing on blocks or accidentally repeating ideas. The app ships with three default prompt lists and includes a built-in list editor so you can create your own decks from scratch.

## Prompt Types

Every item in a list is one of two types:

**Single** — one prompt, shown directly when revealed.
> *"Do your best celebrity impression"*

**Truth or Dare** — the player picks Truth or Dare first, then sees their prompt.
> Truth: *"What is the most embarrassing phase you went through?"*

> Dare: *"Find a photo from that phase on your phone and show the group"*

Both types support an optional **Spicy** version — a more daring alternative to the regular prompt. When Spicy mode is on, any prompt that has a spicier version will ask the player if they want it before revealing.

## Default Lists

| List | Type | Best for |
|---|---|---|
| **Singles** | Single prompts | Any group, quick and fun |
| **Truth or Dare** | TD pairs | Groups who want more personal challenges |
| **Valentine's Day** | Mixed | Friends, family on a special occasion |

All three lists are family-friendly and work with kids and teens. You can also create your own fully custom lists with the built-in list editor.

## Custom Lists

The built-in list editor lets you create your own prompt lists with up to 54 items.
* Each item can be a single prompt, a truth/dare pair, or either of those with a spicy variant.
* Items can be reordered by dragging, and you can drag truth/dare halves between rows independently.
* Lists are saved in your browser's local storage — no account or backend needed.

You can create any type of list and only you can see it on your browser.

### Import & Export

Lists can be exported as a JSON file and imported back on any device — useful for backing up your lists or sharing them with someone else.

- Open any list and tap **Export** to download it as a file.
- Tap **Import** in the Lists screen to load a list from a file someone shared with you or one you previously exported.

The exported file uses plain readable field names so you can open it in any text editor and understand what's in it.



## How to Play

1. **Build your tower** — set up a standard 54-block Jenga tower as normal.
2. **Open the app** — choose your prompt list from the Lists tab.
3. **Choose your block type** on the setup screen:
   - **Blank Blocks** — the app picks a random prompt each turn.
   - **Numbered Blocks** — if the blocks are numbered or you want to write numbers 1–54 on your blocks.
4. **Take turns pulling blocks** — whenever a player successfully pulls a block, tap **Reveal Prompt** or enter the block number if using numbered mode and do the challenge before placing it on top.
5. **Refuse a challenge?** — If a player refuses to do a prompt, they must perform a penalty according to your house rules before passing the turn.
6. **Tower falls? Game over.** Make your own house rules for consequences.

###### You can make up your own house rules, like forcing them to **pull an extra block**, **do 10 jumping jacks**, or **take a shot**!

### Optional: Spicy Mode

If your list has spicy versions of prompts, a 🔥 toggle appears during the game. Turn it on and if the item has a spicier version then the app will ask before each reveal whether you want the regular or spicier version of that prompt.

### View Last Prompt

Dismissed the reveal too fast? Tap **View Last Prompt** at any time to see what was just shown including which version was chosen.

***
*Built for the physical table. No installs, no accounts, no backend — just pull a block.*
***

#### Running Locally

```bash
git clone https://github.com/bng94/jenga-choices.git
cd jenga-choices
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see it in the browser.