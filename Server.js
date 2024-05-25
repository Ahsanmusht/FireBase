const express = require('express');
const multer  = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./fir-authentication-class-9f941-firebase-adminsdk-q7fd8-8e3e7e090b.json');
const bodyParser = require('body-parser');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://fir-authentication-class-9f941.appspot.com',
});

const app = express();
app.use(bodyParser.json())
const db = admin.firestore();
const bucket = admin.storage().bucket();

const upload = multer({ dest: 'uploads/' });

app.post('/register', upload.single('image'), async (req, res) => {
  try {
    
    const image = req.file.path;
    console.log(image);
    const { name, email, password, mobile } = req.body;

    const destination = `Images/${ Date.now()}_${ req.file.originalname }`;

    await bucket.upload(image, {
      destination:destination
    })

    const folder = 'Images%';

   // const Url = `https://firebasestorage.googleapis.com/${bucket.name}/${destination}`

    const user = db.collection('Users').add({
        name,
        email,
        password,
        mobile, 
        image:destination  
    })

    res.send({message:"Success"})

  } catch (error) {
    console.log(error);
  }
})

app.get('/users', async (req, res) => {
  try {
    const user = await db.collection("Users").get();
    const UsersArry = [];
    user.forEach((doc) => {
      UsersArry.push(doc.data())
    })
    res.send(UsersArry)
  } catch (error) {
    console.log(error);
  }
})

app.put('/update-user/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const {name, email, password, mobile} = req.body;

    const user = db.collection("Users").doc(id);

    await user.update({
      name,
      email,
      password,
      mobile
    })

    res.send({message:"Updated SuccessFully!"})

  } catch (error) {
    console.error(error);
  }
})

app.delete('/delete-user/:id', async(req, res) => {
  try {
    const id = req.params.id;

    const user = db.collection("Users").doc(id);

    await user.delete();

    res.send({message:"Deleted Successfully!"})


  } catch (error) {
    console.error(error);
  }
})


const PORT = 3000; // Replace with your preferred port number
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
