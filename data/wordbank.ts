export const wordBank: Record<string, string[][]> = {
  animals: [
    ["cat", "dog", "lion", "zebra", "tiger", "fox", "bear", "wolf", "rhino", "giraffe"],
    ["elephant", "owl", "falcon", "hawk", "goat", "sheep", "deer", "leopard", "whale", "bat"],
    ["rabbit", "mouse", "rat", "horse", "donkey", "camel", "monkey", "panda", "koala", "otter"],
  ],
  fruits: [
    ["apple", "pear", "grape", "plum", "fig", "kiwi", "melon", "peach", "mango", "berry"],
    ["banana", "orange", "lemon", "lime", "apricot", "date", "guava", "papaya", "cherry", "olive"],
    ["coconut", "lychee", "durian", "jackfruit", "nectarine", "persimmon", "quince", "starfruit", "tamarind", "currant"],
  ],
  space: [
    ["planet", "star", "comet", "asteroid", "galaxy", "nebula", "rocket", "orbit", "meteor", "saturn"],
    ["venus", "mars", "jupiter", "uranus", "pluto", "eclipse", "cosmos", "apollo", "crater", "lunar"],
    ["solstice", "gravity", "launch", "module", "probe", "signal", "system", "universe", "voyager", "zenith"],
  ],
  mixed: []
};

// Fill mixed with all sets from all categories
wordBank.mixed = [
  ...wordBank.animals,
  ...wordBank.fruits,
  ...wordBank.space,
]; 