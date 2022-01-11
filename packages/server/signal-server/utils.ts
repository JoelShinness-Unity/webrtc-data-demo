const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function makeId():string{
  let output = '';
  for(let i = 0; i < 16; i++){
    const letterIndex = Math.floor(Math.random() * alphabet.length);
    output += alphabet[letterIndex];
  }
  return output;
}