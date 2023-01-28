import express, { Request, Response } from 'express';
import { User } from '../models/user-model';
import { Image } from '../models/image-model';
import { findOneUser, getUsers, newUser } from '../helpers/user-helpers';
import { jwtSecret } from '..';
import { verifyToken } from '../helpers/jwtVerify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000,
  },
});

//List users
router.get('/api/user/:username?', async (req: Request, res: Response) => {
  try {
    if (!req.params.username) {
      const data = await getUsers(20);
      res.status(200).send(data);
    } else {
      // Filter to find only parameters
      const user = await findOneUser(req.params.username);
      if (!user) {
        return res.status(404).send({
          message: 'User does not exist',
        });
      }
      res.status(200).send({
        id: user._id,
        avatar: user.avatar,
        name: user.name,
        username: user.username,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        tagline: user.tagline,
        banner: user.banner,
        location: user.location,
        biography: user.biography,
        quacks: user.quacks,
        reQuacks: user.reQuacks,
        likedQuacks: user.likedQuacks,
        following: user.following,
        followers: user.followers,
        usersBlocked: user.usersBlocked,
      });
    }
  } catch (error) {
    res.status(404).send({
      message: 'No Users found',
      error,
    });
  }
});

/* Add a user to the database
 * @requiresAuth: false
 */
router.post('/api/user', async (req: Request, res: Response) => {
  const { name, username, email, dateOfBirth } = req.body;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const user = await newUser({
      name,
      username,
      password: hashedPassword,
      email,
      dateOfBirth,
    });
    res.status(201).send({ success: true, user });
  } catch (error) {
    res.status(409).send({
      success: false,
      message: 'Username already exists',
      error,
    });
  }
});

/* Edit a user's details
 * @requiresAuth: true
 */
router.patch(
  '/api/user/:username',
  upload.single('image'),
  async (req: Request, res: Response) => {
    //Check jwt token
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).send({
        message: 'No token provided.',
      });
    }
    try {
      verifyToken(token);
    } catch (error) {
      return res.status(401).send({
        message: 'Token invalid.',
      });
    }
    try {
      if (req.body.option === 'avatar' || req.body.option === 'banner') {
        if (!req.file) {
          return res.status(400).send('File is too large');
        }
        const filename = req.file?.originalname;
        const image = new Image({
          name: filename,
          data: req.file?.buffer,
          contentType: req.file?.mimetype,
        });
        image.save();
        await User.findOneAndUpdate(
          { username: req.params.username },
          {
            [req.body.option]: image,
          },
        );
        fs.unlink(`./uploads/${filename}`, (err) => console.log(err));
        res.status(200).send({
          success: true,
          message: 'User successfully updated',
        });
      } else if (
        req.body.option === 'name' ||
        req.body.option === 'tagline' ||
        req.body.option === 'location' ||
        req.body.option === 'biography'
      ) {
        await User.findOneAndUpdate(
          { username: req.params.username },
          {
            [req.body.option]: req.body.setting,
          },
        );
        res.status(200).send({
          success: true,
          message: 'User successfully updated',
        });
      } else {
        res.status(404).send({
          message: 'Incorrect patch option',
        });
      }
    } catch (error) {
      res.status(404).send({
        message: 'Failed to update user data',
        error,
      });
    }
  },
);

//Login
router.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (user) {
    const match = await bcrypt.compare(password, user.password as string);
    if (match) {
      const token = jwt.sign(req.body, jwtSecret as string, {
        expiresIn: 1800,
      });
      res.status(200).send({
        success: true,
        message: 'Successfully logged in',
        data: {
          id: user._id,
          avatar: user.avatar,
          name: user.name,
          username: user.username,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          createdAt: user.createdAt,
          tagline: user.tagline,
          banner: user.banner,
          location: user.location,
          biography: user.biography,
          quacks: user.quacks,
          reQuacks: user.reQuacks,
          likedQuacks: user.likedQuacks,
          following: user.following,
          followers: user.followers,
          usersBlocked: user.usersBlocked,
        },
        token,
      });
      return;
    }
    return res.status(401).send({
      success: false,
      message: 'Password incorrect',
    });
  }
  return res.status(404).send({
    success: false,
    message: 'User does not exist',
  });
});

//Delete a user
router.delete('/api/user/:id', async (req: Request, res: Response) => {
  try {
    // await deleteUsersQuacks(req.params.id);
    await User.findOneAndRemove({ _id: req.params.id });
    res.status(200).send({
      success: true,
      message: 'User successfully deleted',
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: 'User not found',
      error,
    });
  }
});

export { router as userRouter };
