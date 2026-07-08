import type { CustomList, StoredSingle, StoredTD } from "@types";
import { DEFAULT_LIST_IDS } from "@constants/storage";

const SINGLES_ITEMS: StoredSingle[] = [
  { v: "Act out an animal and have everyone guess what it is" },
  { v: "Air guitar! Rock out for 30 seconds" },
  {
    v: "Dare! The player to your left chooses your dare. If you refuse, draw another block",
  },
  { v: "Do 10 jumping jacks as fast as you can!" },
  { v: "Do 5 push-ups!" },
  { v: "Do your best celebrity impression. Everyone guesses who" },
  { v: "Do your best dance move" },
  { v: "Do your best superhero landing pose" },
  { v: "Give someone a genuine compliment" },
  {
    v: "Give the player across from you a high five. Don't knock the tower over!",
  },
  {
    v: "Give the player to your right a high five, fist bump, or hug — their pick",
  },
  { v: "Go again! Take another turn" },
  { v: "I am thankful for... Share one thing you are grateful for" },
  { v: "Impersonate someone in the group. Everyone guesses who" },
  {
    v: "Compliment battle! Trade compliments with the next player until someone laughs or runs out",
  },
  { v: "Make someone in the group laugh. You have 30 seconds" },
  { v: "Make up a rule that applies to everyone for the rest of the game" },
  { v: "Mime making and eating the best sandwich ever until your next turn" },
  { v: "Moonwalk across the room!" },
  { v: "Name 7 things that are yellow" },
  {
    v: "Name 10 animals, each starting with a different letter. You have 30 seconds",
  },
  {
    v: "Categories! The group picks a category and you name as many as you can in 30 seconds",
  },
  {
    v: "Pass this block around the group as fast as possible. Whoever holds it last draws another",
  },
  { v: "Place this block back onto the tower with your non-dominant hand" },
  { v: "Do the chicken dance or draw another block" },
  {
    v: "Point to the thing in this room closest to your favorite color",
  },
  { v: "Pull another block from the tower" },
  { v: "Pull your next block with one eye shut" },
  { v: "Reverse! Change the direction of play" },
  { v: "Rub your tummy and pat your head at the same time. Let's see it!" },
  { v: "Safe! You're off the hook this turn" },
  { v: "Say 'Once upon a time...' and continue the story for 30 seconds" },
  { v: "Say something kind about every person at the table" },
  { v: "Share one of your favorite memories. You have 30 seconds" },
  { v: "Share something most people don't know about you" },
  { v: "Sing a line from your favorite song" },
  { v: "Sing Happy Birthday in a completely different music style" },
  {
    v: "Talk like a pirate, robot, or cowboy for the rest of the round. Group picks which",
  },
  { v: "Spin in a circle 5 times, then place this block back onto the tower" },
  { v: "Stand on one leg while placing this block back onto the tower" },
  {
    v: "Name your favorite food and the weirdest food you've ever eaten",
  },
  { v: "Have a staring contest with the next player. If you lose, draw again" },
  { v: "Strike a pose and hold it until the next player takes their turn" },
  {
    v: "If you could have any superpower, which one would you choose and why?",
  },
  {
    v: "Play Rock, Paper, Scissors with the next player. If you lose, draw again",
  },
  {
    v: "Invent a group victory pose. Everyone does it together and holds it for 5 seconds",
  },
  { v: "Talent show! Show off something you are talented at" },
  { v: "Teach everyone a word in another language" },
  { v: "Tell a joke" },
  { v: "Tell 2 truths and 1 lie. Everyone guesses the lie" },
  { v: "Try to say 5 times fast: 'Snap, Crackle, Pop!'" },
  {
    v: "Truth! The player to your left picks a truth. If you refuse, draw another block",
  },
  {
    v: "Whisper something to the person next to you and have them repeat it out loud to the group",
  },
  { v: "Tell everyone something you are looking forward to" },
];

const TD_ITEMS: StoredTD[] = [
  {
    t: "What's the funniest thing that has ever happened to you at school?",
    d: "Act out the funniest school moment you can think of",
  },
  {
    t: "What's the weirdest food combination you secretly enjoy?",
    d: "Describe the most disgusting food combination you can think of in enough detail that someone in the group reacts",
  },
  {
    t: "What's the silliest reason you have ever cried or got upset?",
    d: "Dramatically overreact to something completely trivial. You have 30 seconds",
  },
  {
    t: "What's your most embarrassing moment involving food?",
    d: "Act out the messiest eating fail you can imagine",
  },
  {
    t: "What's the weirdest thing you have ever eaten on a dare?",
    d: "Drink a full glass of water without stopping",
  },
  {
    t: "What's the most ridiculous thing you believed as a kid?",
    d: "Pick something absurd and argue that it is 100% true",
  },
  {
    t: "What animal do you think you would be and why?",
    d: "Pick an animal and be it for 30 seconds. Sounds and movement required",
  },
  {
    t: "What's a talent you have that almost nobody knows about?",
    d: "Show the group a talent almost nobody knows about. Actually do it",
  },
  {
    t: "What's the most embarrassing song you know every word to?",
    d: "Perform 30 seconds of the most embarrassing song you know",
  },
  {
    t: "What song do you dance to when nobody's watching?",
    d: "Put on any song and dance to it alone for 30 seconds",
  },
  {
    t: "What's your go-to karaoke song?",
    d: "Perform 30 seconds of any song like you are on stage in front of thousands",
  },
  {
    t: "What's your best party trick?",
    d: "Show the group your best party trick",
  },
  {
    t: "What's your favorite show or movie right now?",
    d: "Reenact the most dramatic scene you can remember from any show or movie",
  },
  {
    t: "Do you have any weird hobbies or collections?",
    d: "Pitch any hobby like a TV shopping host trying to sell it",
  },
  {
    t: "What's the most childish thing you still secretly do?",
    d: "Do the most childish thing you can think of in front of everyone",
  },
  {
    t: "What's the silliest thing you do when you're bored at home?",
    d: "Do the weirdest thing you can think of for 20 seconds",
  },
  {
    t: "What's the most embarrassing thing you have done in front of your parents?",
    d: "Act out the most cringe-worthy parent-walk-in moment you can imagine",
  },
  {
    t: "What's the most unexpected thing that has ever made you burst out laughing?",
    d: "Recreate that laughing fit for 30 seconds. The group tries to keep a straight face",
  },
  {
    t: "Have you ever laughed at the absolute worst possible moment?",
    d: "Make everyone in the room laugh. You have 30 seconds",
  },
  {
    t: "What's the most embarrassing thing you have said to someone you just met?",
    d: "Introduce yourself to the person next to you as awkwardly as possible",
  },
  {
    t: "What's the most childish argument you have ever had?",
    d: "Argue that your shoe is the most important invention in human history. You have 30 seconds",
  },
  {
    t: "Would you rather be able to fly or be invisible, and what's the first thing you'd do?",
    d: "Act out what flying looks like for 30 seconds",
  },
  {
    t: "Would you rather only be able to whisper or only be able to shout for the rest of your life?",
    d: "Whisper only for the next 3 turns",
  },
  {
    t: "Would you rather eat the same meal every day or never eat your favorite food again?",
    d: "Describe your least favorite food like it is the best thing you have ever eaten",
  },
  {
    t: "Would you rather be the funniest person in the room or the smartest?",
    d: "Tell the funniest joke you know. The group rates it",
  },
  {
    t: "Would you rather only be able to communicate in song or only in mime for the rest of the day?",
    d: "Communicate only in mime for the next 2 turns. No sounds allowed",
  },
  {
    t: "Would you rather have the ability to pause time or rewind it, and what's the first thing you would do?",
    d: "Freeze completely like time has been paused. Hold it until the group counts to 15",
  },
  {
    t: "Would you rather have to sing everything you say for one hour or speak in a different accent all day?",
    d: "Sing everything you say for your next 3 turns",
  },
  {
    t: "What food do you think is totally overrated and why?",
    d: "Eat an imaginary version of the grossest food you can think of and describe every bite",
  },
  {
    t: "If you could add one class to school that doesn't exist, what would it be?",
    d: "Teach the group one thing you actually know how to do. You have 30 seconds",
  },
  {
    t: "What's something you are scared of?",
    d: "Act out the most over-the-top reaction to something totally harmless, like a piece of paper or a spoon",
  },
  {
    t: "What's the laziest thing you have ever done?",
    d: "Be the laziest human alive for 30 seconds",
  },
  {
    t: "What's the weirdest rule at your school?",
    d: "Make up a ridiculous school rule and announce it like a principal over the intercom",
  },
  {
    t: "Who in this room makes you laugh the most and why?",
    d: "Do your best impression of the funniest person you know for 30 seconds",
  },
  {
    t: "Who in this room would survive longest in a zombie apocalypse and why?",
    d: "Act out a zombie apocalypse survival plan for 30 seconds",
  },
  {
    t: "What's the funniest thing a sibling or family member has ever done?",
    d: "Act out the funniest thing a family member has ever done",
  },
  {
    t: "If you could swap personalities with anyone in this room for a day, who would it be?",
    d: "Impersonate the person to your left for 30 seconds",
  },
  {
    t: "What's the most dramatic thing you have ever done over something totally small?",
    d: "Narrate everything happening in this room right now like a nature documentary. You have 30 seconds",
  },
  {
    t: "What was your most embarrassing phase or obsession growing up?",
    d: "Act out your most embarrassing little-kid obsession for 30 seconds",
  },
  {
    t: "If you could have any superpower for one day, what would it be?",
    d: "Act like you have a superpower for 30 seconds. The group guesses what it is",
  },
  {
    t: "What's the weirdest talent you wish you had?",
    d: "Attempt to do that talent right now even if you are terrible at it. You have 30 seconds",
  },
  {
    t: "If you could only eat one food for the rest of your life, what would it be?",
    d: "Convince the group that the most disgusting food combo you can think of is actually delicious",
  },
  {
    t: "What do you think you were like as a toddler?",
    d: "Act like a toddler discovering something new for 30 seconds",
  },
  {
    t: "What's the funniest thing you have ever seen a stranger do in public?",
    d: "Act out the most dramatic public meltdown you can imagine. You have 30 seconds",
  },
  {
    t: "What's the funniest misunderstanding you have ever been part of?",
    d: "Act out a dramatic misunderstanding between two people",
  },
  {
    t: "If you could be any age for one week, what age would you pick and why?",
    d: "Pick an age and act like someone that age for the next 2 turns",
  },
  {
    t: "What's the funniest lie you ever told a younger sibling or cousin?",
    d: "Make up the most ridiculous fake fact and say it with complete confidence",
  },
  {
    t: "If you could rename any animal, what would you call it?",
    d: "Invent a brand new animal. Name it, describe it, and be it for 20 seconds",
  },
  {
    t: "What's the strangest rule your family had growing up?",
    d: "Make up a house rule and announce it to the group like it has always existed",
  },
  {
    t: "What's the silliest thing you are afraid of?",
    d: "Act out being terrified of something completely harmless for 30 seconds",
  },
  {
    t: "What's the funniest prank you have ever pulled on someone?",
    d: "Plan a harmless prank on someone in the room and describe it in full detail",
  },
  {
    t: "What's the funniest thing you have ever done to make a family member laugh?",
    d: "Do your best impression of a family member for 30 seconds",
  },
  {
    t: "If you could switch lives with any cartoon character for a day, who would it be and why?",
    d: "Be that cartoon character for 30 seconds. Voice and movement required",
  },
  {
    t: "If you woke up tomorrow as an animal, which one would you want to be and why?",
    d: "Be that animal for 30 seconds. The group guesses what you are before you tell them",
  },
];

const VALENTINE_ITEMS: (StoredSingle | StoredTD)[] = [
  {
    v: "Describe the last time someone did something kind for you that you will never forget",
  },

  {
    v: "Act out the moment someone you love walks through the door after a long time away",
  },
  {
    v: "Act out the moment you realized someone in your life was truly special to you",
  },

  {
    t: "What's the bravest thing you have ever done for someone you care about?",
    d: "Tell someone at the table something kind that you have been too nervous to say",
  },
  {
    t: "What's a childhood memory involving love or kindness you'll never forget?",
    d: "Act out a childhood memory involving love or kindness and let the group guess what's happening",
  },

  {
    v: "Describe your favorite person at this table without saying their name. The group guesses who",
  },

  { v: "Tell the group about a time someone made you feel truly appreciated" },
  {
    v: "Show the group a gesture or expression you use to show someone you care without words",
  },

  {
    v: "Give everyone at the table one word that describes how they make you feel",
  },

  {
    t: "What does friendship mean to you? Say it in one sentence",
    d: "Give a 30-second toast to the people at this table",
    st: "What does it feel like when you have a crush on someone? One sentence",
    sd: "Give a 30-second honest speech about what you look for in someone you have a crush on",
  },
  {
    t: "What does your ideal celebration look like? Who's there and what are you doing?",
    d: "Pitch your ideal celebration in 30 seconds like a travel agent",
  },
  {
    t: "What food makes you think of feeling loved or at home?",
    d: "Describe a food you associate with feeling at home so well that everyone at the table wants it",
  },
  {
    v: "Give a standing ovation to someone at the table and tell the group exactly why they deserve it",
  },

  { v: "Give everyone a different compliment in 30 seconds" },
  {
    v: "Give someone the most dramatic hug you can",
    s: "Hug the person you feel most comfortable with and you can't let go first",
  },
  { v: "Give the person to your right a nickname based on their best quality" },
  {
    v: "Give the person you know the least at this table a genuine compliment",
  },
  {
    v: "Give the person across from you a genuine compliment",
    s: "Tell the person across from you one thing you find attractive about them",
  },
  {
    t: "How do you show someone you care when words don't feel right?",
    d: "Show someone here you care without saying a word",
  },
  {
    t: "If you could plan the perfect evening for everyone here, what would it look like?",
    d: "Pitch your perfect evening plan to the group like you're hosting a lifestyle show",
  },

  {
    t: "What makes someone a truly good friend?",
    d: "Name someone here who you think is a truly great friend and tell them why",
  },
  {
    t: "Who do you love the most in the room?",
    d: "Tell the person you love the most in this room that you love them",
    st: "What's a small physical gesture from someone that makes you feel cared for, like a hug or a pat on the back?",
    sd: "Ask someone you have a crush on in this room to give you a shoulder massage. If they say no, you fail the dare",
  },
  {
    t: "What's the best compliment you have ever received?",
    d: "Give someone at the table the best compliment you have ever received",
    st: "What's the best compliment you have ever received about how you look?",
    sd: "Give someone you have a crush on in this room a genuine compliment about their appearance. Make it specific",
  },
  {
    t: "What's the kindest thing anyone has ever done for you?",
    d: "Do something kind for someone at the table",
  },
  {
    t: "What's the most heartfelt way you have ever shown someone you care?",
    d: "Give someone at the table a hug and tell them one thing you appreciate about them",
    st: "What's the most romantic gesture you have ever made or wished someone made for you?",
    sd: "Make a romantic gesture toward someone you have a crush on in this room",
  },
  {
    t: "What's the most thoughtful gift you have ever given someone?",
    d: "Give someone an imaginary gift and describe it",
  },
  {
    t: "What's one small thing someone does that always makes you smile?",
    d: "Do a small kind gesture for someone at the table",
  },
  {
    t: "What's one thing you'd like to do more of with the people you care about?",
    d: "Pitch one thing you would love to do more of with the people you care about and get at least one person to commit to doing it with you",
  },
  {
    t: "What's one thing you love about the world right now?",
    d: "Describe something you love about the world like you are trying to make at least one person smile",
  },
  {
    t: "What's something you do to make the people around you feel welcome?",
    d: "Welcome the person to your left to the table like they just arrived at the best party of their life",
  },
  {
    t: "What's something you wish you had said to someone sooner?",
    d: "Tell the person to your left something kind you have never said to them before",
    st: "What's something you've noticed about someone here that you've never said out loud?",
    sd: "Pick someone you have a crush on in this room and tell them something you have noticed about them that you have never said out loud",
  },
  {
    t: "What's a small everyday moment you genuinely treasure?",
    d: "Act out a small everyday moment like it's the most precious thing in the world",
  },
  {
    t: "What's a tradition you have with someone you care about?",
    d: "Propose a new group tradition and get everyone to do it once",
  },
  {
    t: "What's the sweetest thing you have ever done for someone?",
    d: "Write a short kind note to someone here and read it out loud",
    st: "What's the most romantic thing you have ever done for someone?",
    sd: "Tell someone you have a crush on in this room one thing you genuinely love about them",
  },
  {
    t: "What's your favorite memory with someone at this table?",
    d: "Act out a favorite memory you have with someone at this table",
    st: "What's the moment with someone here where you felt most connected to them?",
    sd: "Sit next to someone you like and tell them what you like most about spending time with them",
  },
  {
    t: "What's your favorite thing to do with people you love?",
    d: "Describe your favorite thing to do with people you love and get the group to do a quick version of it",
  },
  {
    t: "What song always makes you think of someone special?",
    d: "Hum or sing the first 15 seconds of any song that reminds you of someone special",
    st: "What song would you dedicate to someone at this table?",
    sd: "Sing or hum a romantic song to someone you have a crush on in this room. They have to hold eye contact the whole time",
  },
  {
    v: "Say something kind about every person at the table",
    s: "Say one thing you find physically attractive about every person at the table",
  },
  {
    v: "Say something kind to someone at the table that you have been meaning to tell them",
  },
  { v: "Say three things you appreciate about the people in this room" },

  {
    v: "Serenade the group with 15 seconds of any song",
    s: "Serenade one person at the table with a love song directly for 15 seconds. Eye contact the whole time",
  },
  { v: "Tell the group one thing you appreciate about being here" },
  {
    t: "What do you like most about the person to your left?",
    d: "Tell the person to your left what you like most about them and look them in the eyes",
    st: "What's one thing you find physically attractive about the person to your left?",
    sd: "Tell the person to the left what you find most physically attractive about them with eye contact the whole time",
  },
  {
    t: "What do you like most about the person to your right?",
    d: "Tell the person to your right what you like most about them and look them in the eyes",
    st: "What's one thing you find physically attractive about the person to your right?",
    sd: "Tell the person to the right what you find most physically attractive about them with eye contact the whole time",
  },
  {
    t: "Who in your life always knows how to cheer you up?",
    d: "Impersonate someone who is really good at cheering people up",
  },
  {
    t: "Who in your life do you not tell 'I appreciate you' to enough?",
    d: "Send someone you have been meaning to check in on a message telling them you were thinking of them",
  },
  {
    v: "Who at this table makes you feel the most comfortable and why?",
    s: "Tell the person you find most attractive in this room why you find them attractive and look them in the eyes while you say it",
  },
  { v: "Make up a rule that applies to everyone for the rest of the game" },
  { v: "Pull another block from the tower" },
  {
    t: "What's something kind someone at this table did recently that you never properly thanked them for?",
    d: "Thank that person right now. Say it out loud and mean it",
  },
];

/**
 * The built-in lists, each a full CustomList (id + name + items) so their
 * identity lives in one place instead of being re-declared wherever a default
 * is referenced. These are read-only: the UI offers "Edit a Copy" rather than
 * mutating them.
 */
export const DEFAULT_LISTS: CustomList[] = [
  {
    id: DEFAULT_LIST_IDS.singles,
    name: "Classic Singles",
    items: SINGLES_ITEMS,
  },
  {
    id: DEFAULT_LIST_IDS.truthDare,
    name: "Truth or Dare",
    items: TD_ITEMS,
  },
  {
    id: DEFAULT_LIST_IDS.valentine,
    name: "Valentine's Day",
    items: VALENTINE_ITEMS,
  },
];
