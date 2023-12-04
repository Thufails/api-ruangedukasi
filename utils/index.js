const bcrypt = require("bcrypt");
const ImageKit = require("imagekit");

const encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(5);

    return bcrypt.hash(password, salt);
};

const encryptEmail = async() => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomText = "";

    for (let i = 0; i < 15; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomText += characters.charAt(randomIndex);
    }

    return randomText;
};

const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

const encryptOrder = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderTrx = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderTrx += characters.charAt(randomIndex);
  }

  return orderTrx;
};

const dummyAccountNumber = async () => {
  const generate = Math.floor(100000000000 + Math.random() * 900000000000);

  return generate.toString();
};

module.exports = {
<<<<<<< HEAD
    encryptPassword,
    encryptEmail,
    imageKit,
};
=======
  encryptPassword,
  encryptEmail,
  encryptOrder,
  dummyAccountNumber,
  imageKit,
};
>>>>>>> 68d9ebed9be340e7d081e8b0a647fe597b555f38
