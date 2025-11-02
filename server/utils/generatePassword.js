const generatePassword = () => {
  const lowers = "abcdefghijklmnopqrstuvwxyz";
  const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specials = "!#$%&*";
  const all = lowers + uppers + digits + specials;

  // לפחות תו אחד מכל סוג חובה
  const pwd = [
    lowers[Math.floor(Math.random() * lowers.length)],
    uppers[Math.floor(Math.random() * uppers.length)],
    specials[Math.floor(Math.random() * specials.length)],
  ];

  // משלימים עד לאורך 8
  while (pwd.length < 8) {
    pwd.push(all[Math.floor(Math.random() * all.length)]);
  }

  // ערבוב – כדי שהתווים לא יהיו תמיד באותו סדר
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }

  return pwd.join("");
};

module.exports={generatePassword}